# Device Replacement Solution - Design Document

## Problem Statement
When a StarterBox device fails, users need to replace it with another device without losing:
- Motor associations (all motors connected to the device)
- Historical data and configurations
- User assignments and location mappings

Currently, the system requires adding a new device and manually migrating motors, which is cumbersome and error-prone.

---

## Solution Architecture

### 1. Database Schema Changes

#### A. New Table: `device_replacements` (Device Replacement History)
Track all device replacements for audit trail and rollback capability.

```sql
CREATE TABLE device_replacements (
  id SERIAL PRIMARY KEY,
  starter_id INTEGER NOT NULL REFERENCES starter_boxes(id),
  
  -- Old device identifiers
  old_pcb_number VARCHAR,
  old_mac_address VARCHAR,
  old_mcu_serial_no VARCHAR,
  old_starter_number VARCHAR,
  
  -- New device identifiers  
  new_pcb_number VARCHAR NOT NULL,
  new_mac_address VARCHAR NOT NULL,
  new_mcu_serial_no VARCHAR NOT NULL,
  new_starter_number VARCHAR NOT NULL,
  
  -- Metadata
  replacement_reason VARCHAR, -- e.g., "DEVICE_FAILURE", "PERFORMANCE_ISSUE"
  replaced_by INTEGER NOT NULL REFERENCES users(id),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX(starter_id),
  INDEX(replaced_by),
  UNIQUE(starter_id, created_at) -- Only one replacement per device per timestamp
);
```

#### B. Update: `audit_logs` (Optional Enhancement)
Add `replacement_id` field to link replacements with audit logs:
```sql
ALTER TABLE audit_logs ADD COLUMN replacement_id INTEGER REFERENCES device_replacements(id);
```

---

### 2. API Endpoint Design

#### Endpoint: `PATCH /v1/starter/:id/replace-device`

**Purpose:** Replace an existing device with new hardware identifiers while preserving all relationships

**Request Body:**
```typescript
{
  // New device hardware identifiers
  new_pcb_number: string,           // Required
  new_mac_address: string,          // Required
  new_mcu_serial_no: string,        // Required
  new_starter_number: string,       // Required
  
  // Optional metadata
  replacement_reason?: "DEVICE_FAILURE" | "PERFORMANCE_ISSUE" | "UPGRADE" | "OTHER",
  notes?: string
}
```

**Response (Success):**
```typescript
{
  success: true,
  message: "Device replaced successfully",
  data: {
    device: {
      id: number,
      // ... updated device details with new identifiers
      pcb_number: "NEW-PCB-001",
      mac_address: "AA:BB:CC:DD:EE:FF",
      mcu_serial_no: "NEW-MCU-123",
      starter_number: "NEW-STARTER-45"
    },
    replacement_record: {
      id: number,
      old_pcb_number: "OLD-PCB-001",
      new_pcb_number: "NEW-PCB-001",
      // ... all old vs new identifiers
      replaced_at: "2026-04-15T10:30:00Z",
      replacement_reason: "DEVICE_FAILURE"
    },
    motors_preserved: number,  // Number of motors still connected
    audit_log_id: number
  }
}
```

**Response (Error):**
```typescript
{
  success: false,
  message: "Device not found" | "New device identifiers already in use" | "Validation error",
  details?: object
}
```

---

### 3. Implementation Details

#### Controller Method: `replaceDevice`

**Location:** `src/controllers/starterBoxController.ts`

**Key Logic:**
```typescript
replaceDevice = async (c: Context) => {
  try {
    const user: User = c.get("user_payload");
    const starterBoxId = +c.req.param("id");
    const reqData = await c.req.json();

    // 1. Validate input
    paramsValidateException.validateId(starterBoxId, "starter box id");
    const validatedReqData = safeParse(vReplaceDeviceValidator, reqData);
    if (!validatedReqData.success) throw validation error;

    // 2. Verify device exists
    const existingDevice = await getSingleRecordByMultipleColumnValues<Device>(
      starterBoxes,
      ["id", "status"],
      [starterBoxId, "ARCHIVED"],
      ["eq", "ne"]
    );
    if (!existingDevice) throw new NotFoundException(STARTER_BOX_NOT_FOUND);

    // 3. Check new identifiers are unique (not in use by other active devices)
    await starterBoxService.checkUniqueColumnsForReplacement({
      db,
      table: starterBoxes,
      uniqueFields: ["mcu_serial_no", "mac_address", "pcb_number", "starter_number"],
      data: validatedReqData.output,
      excludeDeviceId: starterBoxId
    });

    // 4. Transaction: Update device + Create replacement record + Audit logs
    let updatedDevice, replacementRecord, newAuditLogs;
    await db.transaction(async (trx) => {
      // Update device with new identifiers
      updatedDevice = await updateRecordByIdWithTrx<Device>(
        starterBoxes,
        starterBoxId,
        {
          pcb_number: validatedReqData.output.new_pcb_number,
          mac_address: validatedReqData.output.new_mac_address,
          mcu_serial_no: validatedReqData.output.new_mcu_serial_no,
          starter_number: validatedReqData.output.new_starter_number,
          updated_at: new Date()
        },
        trx
      );

      // Create replacement history record
      replacementRecord = await saveSingleRecord<DeviceReplacement>(
        deviceReplacements,
        {
          starter_id: starterBoxId,
          old_pcb_number: existingDevice.pcb_number,
          old_mac_address: existingDevice.mac_address,
          old_mcu_serial_no: existingDevice.mcu_serial_no,
          old_starter_number: existingDevice.starter_number,
          new_pcb_number: validatedReqData.output.new_pcb_number,
          new_mac_address: validatedReqData.output.new_mac_address,
          new_mcu_serial_no: validatedReqData.output.new_mcu_serial_no,
          new_starter_number: validatedReqData.output.new_starter_number,
          replacement_reason: validatedReqData.output.replacement_reason,
          replaced_by: user.id
        },
        trx
      );

      // Create audit logs for each changed field
      const fieldsChanged = [
        { field: "pcb_number", old: existingDevice.pcb_number, new: validatedReqData.output.new_pcb_number },
        { field: "mac_address", old: existingDevice.mac_address, new: validatedReqData.output.new_mac_address },
        { field: "mcu_serial_no", old: existingDevice.mcu_serial_no, new: validatedReqData.output.new_mcu_serial_no },
        { field: "starter_number", old: existingDevice.starter_number, new: validatedReqData.output.new_starter_number }
      ];

      newAuditLogs = fieldsChanged.map(change => ({
        starter_id: starterBoxId,
        field_name: change.field,
        old_value: change.old,
        new_value: change.new,
        audit_type: "DEVICE_REPLACED",
        updated_by: user.id,
        replacement_id: replacementRecord.id
      }));

      if (newAuditLogs.length > 0) {
        await saveRecords<AuditLog>(auditLogs, newAuditLogs, trx);
      }
    });

    // 5. Get count of preserved motors
    const motorsCount = await getRecordsCount(
      motors,
      [eq(motors.starter_id, starterBoxId), ne(motors.status, "ARCHIVED")]
    );

    return sendSuccessResp(c, 200, "DEVICE_REPLACED_SUCCESSFULLY", {
      device: updatedDevice,
      replacement_record: replacementRecord,
      motors_preserved: motorsCount,
      audit_logs: newAuditLogs
    });
  } catch (error: any) {
    console.error("Error at replaceDevice:", error.message);
    throw error;
  }
};
```

#### Service Method Enhancement

**Location:** `src/services/starterBoxService.ts`

```typescript
checkUniqueColumnsForReplacement = async (options: {
  db: DatabaseInstance,
  table: StarterBoxTable,
  uniqueFields: string[],
  data: ReplaceDeviceData,
  excludeDeviceId: number
}) => {
  const { db, table, uniqueFields, data, excludeDeviceId } = options;
  
  for (const field of uniqueFields) {
    const fieldName = `new_${field}` as keyof typeof data;
    const value = data[fieldName];
    
    if (!value) continue;
    
    // Build query to find conflicts (excluding current device)
    const conflicts = await getRecordsConditionally(
      table,
      [
        eq(table[field as keyof typeof table], value),
        ne(table.id, excludeDeviceId),
        ne(table.status, "ARCHIVED")
      ]
    );
    
    if (conflicts.length > 0) {
      throw new ConflictException(
        `${field.replace(/_/g, ' ')} "${value}" is already in use by another active device`
      );
    }
  }
};
```

---

### 4. Route Configuration

**Location:** `src/routes/starterBox.ts`

```typescript
// Add this route (place before ID-based routes)
starterBoxRoute.patch("/:id/replace-device", isAuthorized, starterController.replaceDevice);
```

---

### 5. Validation Schema

**Location:** `src/validations/schemas/vStarterBoxValidator.ts`

```typescript
const vReplaceDeviceValidator = v.object({
  new_pcb_number: pcbNumberValidator,
  new_mac_address: macAddressValidtator,
  new_mcu_serial_no: serialNoValidator,
  new_starter_number: starterNumberValidator,
  
  // Optional
  replacement_reason: v.optional(
    v.union([
      v.literal("DEVICE_FAILURE"),
      v.literal("PERFORMANCE_ISSUE"),
      v.literal("UPGRADE"),
      v.literal("OTHER")
    ])
  ),
  notes: v.optional(v.string())
});
```

---

### 6. Schema TypeScript Definition

**Add to:** `src/schemas/deviceReplacements.ts` (NEW FILE)

```typescript
import { relations, sql } from "drizzle-orm";
import { index, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { starterBoxes } from "./starterBox";
import { users } from "./user";

export const deviceReplacements = pgTable("device_replacements", {
  id: serial("id").primaryKey().notNull(),
  starter_id: integer("starter_id").notNull().references(() => starterBoxes.id),
  
  // Old identifiers
  old_pcb_number: varchar("old_pcb_number"),
  old_mac_address: varchar("old_mac_address"),
  old_mcu_serial_no: varchar("old_mcu_serial_no"),
  old_starter_number: varchar("old_starter_number"),
  
  // New identifiers
  new_pcb_number: varchar("new_pcb_number").notNull(),
  new_mac_address: varchar("new_mac_address").notNull(),
  new_mcu_serial_no: varchar("new_mcu_serial_no").notNull(),
  new_starter_number: varchar("new_starter_number").notNull(),
  
  // Metadata
  replacement_reason: varchar("replacement_reason"),
  replaced_by: integer("replaced_by").notNull().references(() => users.id),
  
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().default(sql`CURRENT_TIMESTAMP`),
}, table => [
  index("deviceReplacementStarterIdx").on(table.starter_id),
  index("deviceReplacementReplacedByIdx").on(table.replaced_by),
]);

export type DeviceReplacement = typeof deviceReplacements.$inferSelect;
export type NewDeviceReplacement = typeof deviceReplacements.$inferInsert;
```

---

## 7. UI/Frontend Implementation

### A. Device Detail View Enhancement

**Current State (Old Device):**
```
PCB Number: OLD-PCB-001
MAC Address: AA:BB:CC:DD:EE:01
MCU Serial: OLD-MCU-123
Status: DEPLOYED
```

**With Replacement History:**
```
PCB Number: NEW-PCB-002 (Replaced on 2026-04-15)
  └─ Previous: OLD-PCB-001 [Show old value with indicator]
  
MAC Address: BB:CC:DD:EE:FF:02 (Replaced on 2026-04-15)
  └─ Previous: AA:BB:CC:DD:EE:01
  
MCU Serial: NEW-MCU-456 (Replaced on 2026-04-15)
  └─ Previous: OLD-MCU-123
```

### B. Device Search & Compare

**Search Results:**
- When searching by new PCB number → Show device with new identifiers
- When searching by old PCB number → Show device with badge "Using new PCB: NEW-PCB-002"
- Support both old and new identifiers in search (for 30 days or configurable period)

### C. Replace Device Modal/Form

```
┌─────────────────────────────────────┐
│  Replace Device                      │
├─────────────────────────────────────┤
│                                      │
│ Current Device Details:              │
│ ├─ PCB: OLD-PCB-001                 │
│ ├─ MAC: AA:BB:CC:DD:EE:01           │
│ ├─ MCU: OLD-MCU-123                 │
│ └─ Motors: 2 (will be preserved)    │
│                                      │
│ New Device Details:                  │
│ ├─ PCB Number:    [________]        │
│ ├─ MAC Address:   [________]        │
│ ├─ MCU Serial:    [________]        │
│ ├─ Starter Box#:  [________]        │
│                                      │
│ Reason for Replacement:              │
│ ├─ ☐ Device Failure                 │
│ ├─ ☐ Performance Issue              │
│ ├─ ☐ Upgrade                        │
│ └─ ☐ Other                          │
│                                      │
│ [Cancel]  [Preview Changes]  [Replace]
└─────────────────────────────────────┘
```

### D. Replacement History View

```
Device Replacement History
├─ 2026-04-15 @ 10:30
│  ├─ Old: OLD-PCB-001 → New: NEW-PCB-002
│  ├─ Old: AA:BB:CC:DD:EE:01 → New: BB:CC:DD:EE:FF:02
│  ├─ Reason: Device Failure
│  ├─ Replaced by: Admin User
│  └─ Motors Preserved: 2
│
└─ 2026-03-20 @ 14:15
   ├─ Old: PREV-PCB-001 → New: OLD-PCB-001
   ├─ ...
```

---

## 8. Implementation Checklist

### Database
- [ ] Create migration for `device_replacements` table
- [ ] Add `replacement_id` field to `audit_logs` (optional)
- [ ] Update schema exports

### Backend
- [ ] Create `deviceReplacements.ts` schema file
- [ ] Create `vReplaceDeviceValidator` validation schema
- [ ] Implement `replaceDevice` controller method
- [ ] Implement `checkUniqueColumnsForReplacement` service method
- [ ] Add route: `PATCH /:id/replace-device`
- [ ] Add new endpoint to routes/starterBox.ts
- [ ] Update message constants with new messages
- [ ] Add transaction handling for atomicity

### Frontend
- [ ] Add "Replace Device" button in device detail view
- [ ] Create replace device modal with form validation
- [ ] Show old device data with indicator badge
- [ ] Display motors that will be preserved
- [ ] Add device replacement history section
- [ ] Update search to support both old/new identifiers
- [ ] Add replacement reason in device timeline

### Testing
- [ ] Test replacing device with unique constraints
- [ ] Test motor preservation after replacement
- [ ] Test audit trail creation
- [ ] Test API error handling (not found, conflict, validation)
- [ ] Test UI flow end-to-end
- [ ] Test search with old identifiers

---

## 9. Error Handling

| Scenario | Status | Message |
|----------|--------|---------|
| Device not found | 404 | "Device not found" |
| New PCB already in use | 409 | "PCB number already in use by another device" |
| New MAC already in use | 409 | "MAC address already in use by another device" |
| Validation error | 422 | Field-specific validation errors |
| Database transaction fails | 500 | "Failed to replace device" |
| Unauthorized | 403 | "Insufficient permissions" |

---

## 10. Security Considerations

- ✅ Validate all new identifiers
- ✅ Check authorization (only authorized users)
- ✅ Log all replacement operations (audit trail)
- ✅ Prevent duplicate identifiers across system
- ✅ Use database transactions for atomicity
- ✅ Preserve motor associations (can't lose connections)
- ✅ Store replacement reason for compliance

---

## 11. Migration Path

**Phase 1 - Immediate:**
- Backend: Device replacement endpoint + database table
- Frontend: Simple "Replace Device" form

**Phase 2 - Enhancement:**
- Show replacement history in UI
- Support old identifier search
- Device comparison view

**Phase 3 - Optional:**
- Bulk device replacement
- Scheduled replacements
- Replacement notifications

---

## 12. Backward Compatibility

✅ No breaking changes - existing device update flow remains unchanged
✅ New endpoint is additive
✅ Old searches still work with current identifiers
✅ Existing motors continue to function

