# Device Replacement - Detailed Implementation
## Focus: Comprehensive Logging & Historical Data Highlighting

---

## 1. DATABASE SCHEMA - Complete Replacement & Logging Strategy

### A. Main Table: `device_replacements` (Replacement History)

```sql
CREATE TABLE device_replacements (
  id SERIAL PRIMARY KEY,
  starter_id INTEGER NOT NULL REFERENCES starter_boxes(id),
  
  -- Old device snapshot (before replacement)
  old_pcb_number VARCHAR NOT NULL,
  old_mac_address VARCHAR NOT NULL,
  old_mcu_serial_no VARCHAR NOT NULL,
  old_starter_number VARCHAR NOT NULL,
  
  -- New device identifiers (after replacement)
  new_pcb_number VARCHAR NOT NULL,
  new_mac_address VARCHAR NOT NULL,
  new_mcu_serial_no VARCHAR NOT NULL,
  new_starter_number VARCHAR NOT NULL,
  
  -- Metadata for tracking
  replacement_reason VARCHAR,
  notes TEXT,
  replaced_by INTEGER NOT NULL REFERENCES users(id),
  
  -- Counters for reporting
  motors_count_at_replacement INTEGER,
  ponds_count_at_replacement INTEGER,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX(starter_id),
  INDEX(replaced_by),
  INDEX(created_at),
  UNIQUE(starter_id, created_at)
);
```

### B. Enhancement: `device_status_logs` (Tag with Device Generation)

Add fields to track which "version" of the device produced the log:

```sql
ALTER TABLE device_status_logs ADD COLUMN device_replacement_id INTEGER REFERENCES device_replacements(id);
ALTER TABLE device_status_logs ADD COLUMN device_generation INTEGER DEFAULT 0; -- 0=original, 1,2,3... for each replacement

-- Index for faster queries
CREATE INDEX device_status_logs_replacement_idx ON device_status_logs(device_replacement_id);
CREATE INDEX device_status_logs_generation_idx ON device_status_logs(device_generation);
```

### C. Enhancement: `alert_faults` (Tag with Device Generation)

```sql
ALTER TABLE alerts_faults ADD COLUMN device_replacement_id INTEGER REFERENCES device_replacements(id);
ALTER TABLE alerts_faults ADD COLUMN device_generation INTEGER DEFAULT 0;

CREATE INDEX alerts_faults_replacement_idx ON alerts_faults(device_replacement_id);
```

### D. TypeScript Schema

Create: `src/schemas/deviceReplacements.ts`

```typescript
import { relations, sql } from "drizzle-orm";
import { index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { starterBoxes } from "./starterBox";
import { users } from "./user";

export const deviceReplacements = pgTable("device_replacements", {
  id: serial("id").primaryKey().notNull(),
  starter_id: integer("starter_id").notNull().references(() => starterBoxes.id),
  
  // Old device snapshot
  old_pcb_number: varchar("old_pcb_number").notNull(),
  old_mac_address: varchar("old_mac_address").notNull(),
  old_mcu_serial_no: varchar("old_mcu_serial_no").notNull(),
  old_starter_number: varchar("old_starter_number").notNull(),
  
  // New device identifiers
  new_pcb_number: varchar("new_pcb_number").notNull(),
  new_mac_address: varchar("new_mac_address").notNull(),
  new_mcu_serial_no: varchar("new_mcu_serial_no").notNull(),
  new_starter_number: varchar("new_starter_number").notNull(),
  
  // Metadata
  replacement_reason: varchar("replacement_reason"),
  notes: text("notes"),
  replaced_by: integer("replaced_by").notNull().references(() => users.id),
  
  // Counters
  motors_count_at_replacement: integer("motors_count_at_replacement"),
  ponds_count_at_replacement: integer("ponds_count_at_replacement"),
  
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().default(sql`CURRENT_TIMESTAMP`),
}, table => [
  index("deviceReplacementStarterIdx").on(table.starter_id),
  index("deviceReplacementReplacedByIdx").on(table.replaced_by),
  index("deviceReplacementDateIdx").on(table.created_at),
]);

export type DeviceReplacement = typeof deviceReplacements.$inferSelect;
export type NewDeviceReplacement = typeof deviceReplacements.$inferInsert;
```

---

## 2. BACKEND IMPLEMENTATION

### A. Replacement Tracker Service

Create: `src/services/deviceReplacementService.ts`

```typescript
import { eq, desc } from "drizzle-orm";
import type { Device, Motor, Pond } from "../schemas";
import { deviceReplacements } from "../schemas/deviceReplacements";
import { motors } from "../schemas/motor";
import { ponds } from "../schemas/pond";
import { db } from "../lib/db";
import { getSingleRecordByAColumnValue, getRecordsConditionally } from "./db/baseDbService";

export class DeviceReplacementService {
  /**
   * Get current device generation (how many times has this device been replaced)
   * Generation 0 = original device
   * Generation 1 = first replacement
   * Generation 2 = second replacement, etc.
   */
  async getDeviceGeneration(starterId: number): Promise<number> {
    const replacements = await getRecordsConditionally(
      deviceReplacements,
      [eq(deviceReplacements.starter_id, starterId)]
    );
    return replacements.length; // Count = generation number
  }

  /**
   * Get all replacements for a device in chronological order
   */
  async getReplacementHistory(starterId: number): Promise<DeviceReplacement[]> {
    const result = await db.query.deviceReplacements.findMany({
      where: eq(deviceReplacements.starter_id, starterId),
      orderBy: desc(deviceReplacements.created_at),
    });
    return result;
  }

  /**
   * Get which device version was active at a specific date
   * Returns: { pcb_number, mac_address, mcu_serial_no, starter_number, generation }
   */
  async getDeviceIdentifiersAtDate(
    starterId: number,
    dateTime: Date
  ): Promise<{
    pcb_number: string;
    mac_address: string;
    mcu_serial_no: string;
    starter_number: string;
    generation: number;
    replacement_id?: number;
  } | null> {
    // Get current device (active identifiers)
    const currentDevice = await getSingleRecordByAColumnValue(
      starterBoxes,
      "id",
      starterId
    );

    // Find which replacement happened closest to this date
    const replacements = await db.query.deviceReplacements.findMany({
      where: eq(deviceReplacements.starter_id, starterId),
      orderBy: desc(deviceReplacements.created_at),
    });

    // Find the replacement that happened AFTER this date
    const futureReplacement = replacements.find(r => new Date(r.created_at) > dateTime);

    if (!futureReplacement) {
      // No replacement after this date = current device was active
      return {
        pcb_number: currentDevice.pcb_number,
        mac_address: currentDevice.mac_address,
        mcu_serial_no: currentDevice.mcu_serial_no,
        starter_number: currentDevice.starter_number,
        generation: replacements.length,
      };
    }

    // Return the old device info from the replacement record
    return {
      pcb_number: futureReplacement.old_pcb_number,
      mac_address: futureReplacement.old_mac_address,
      mcu_serial_no: futureReplacement.old_mcu_serial_no,
      starter_number: futureReplacement.old_starter_number,
      generation: replacements.length - replacements.indexOf(futureReplacement),
      replacement_id: futureReplacement.id,
    };
  }

  /**
   * Determine which device version created a log entry based on timestamp
   */
  async getLogDeviceGeneration(
    starterId: number,
    logCreatedAt: Date
  ): Promise<{
    generation: number;
    is_from_old_device: boolean;
    old_device_identifiers?: {
      pcb_number: string;
      mac_address: string;
    };
    replacement_info?: {
      replacement_id: number;
      replaced_on: Date;
      replaced_by_user: string;
    };
  }> {
    const currentGeneration = await this.getDeviceGeneration(starterId);
    const deviceAtLogTime = await this.getDeviceIdentifiersAtDate(starterId, logCreatedAt);

    // If current generation is same as at log time = same device
    const isFromOldDevice = deviceAtLogTime?.generation !== currentGeneration;

    const result: any = {
      generation: deviceAtLogTime?.generation || 0,
      is_from_old_device: isFromOldDevice,
    };

    if (isFromOldDevice && deviceAtLogTime) {
      result.old_device_identifiers = {
        pcb_number: deviceAtLogTime.pcb_number,
        mac_address: deviceAtLogTime.mac_address,
      };

      if (deviceAtLogTime.replacement_id) {
        const replacement = await getSingleRecordByAColumnValue(
          deviceReplacements,
          "id",
          deviceAtLogTime.replacement_id
        );
        if (replacement) {
          result.replacement_info = {
            replacement_id: replacement.id,
            replaced_on: replacement.created_at,
            replaced_by_user: replacement.replaced_by, // Will be joined in API
          };
        }
      }
    }

    return result;
  }

  /**
   * Get all status logs with device generation info
   */
  async getDeviceStatusLogsWithGeneration(
    starterId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Array<{
    id: number;
    device_status: string;
    created_at: Date;
    generation: number;
    is_from_old_device: boolean;
    old_device_pcb?: string;
    replacement_date?: Date;
  }>> {
    // Fetch status logs
    const logs = await db.query.deviceStatusLogs.findMany({
      where: eq(deviceStatusLogs.starter_id, starterId),
      orderBy: desc(deviceStatusLogs.created_at),
      limit,
      offset,
    });

    // Enrich each log with generation info
    return await Promise.all(
      logs.map(async (log) => {
        const genInfo = await this.getLogDeviceGeneration(starterId, log.created_at);
        return {
          id: log.id,
          device_status: log.device_status,
          created_at: log.created_at,
          generation: genInfo.generation,
          is_from_old_device: genInfo.is_from_old_device,
          old_device_pcb: genInfo.old_device_identifiers?.pcb_number,
          replacement_date: genInfo.replacement_info?.replaced_on,
        };
      })
    );
  }

  /**
   * Get alerts/faults with generation info
   */
  async getAlertsWithGeneration(
    starterId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Array<{
    id: number;
    alert_type: string;
    severity: string;
    created_at: Date;
    generation: number;
    is_from_old_device: boolean;
    old_device_info?: {
      pcb_number: string;
      replacement_date: Date;
    };
  }>> {
    const alerts = await db.query.alertsFaults.findMany({
      where: eq(alertsFaults.starter_id, starterId),
      orderBy: desc(alertsFaults.created_at),
      limit,
      offset,
    });

    return await Promise.all(
      alerts.map(async (alert) => {
        const genInfo = await this.getLogDeviceGeneration(starterId, alert.created_at);
        const result: any = {
          id: alert.id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          created_at: alert.created_at,
          generation: genInfo.generation,
          is_from_old_device: genInfo.is_from_old_device,
        };

        if (genInfo.is_from_old_device) {
          result.old_device_info = {
            pcb_number: genInfo.old_device_identifiers?.pcb_number,
            replacement_date: genInfo.replacement_info?.replaced_on,
          };
        }

        return result;
      })
    );
  }

  /**
   * Get replacement statistics
   */
  async getReplacementStats(starterId: number): Promise<{
    total_replacements: number;
    current_generation: number;
    first_device_deployed_date?: Date;
    last_replacement_date?: Date;
    last_replacement_reason?: string;
    total_motors_affected: number;
  }> {
    const replacements = await getRecordsConditionally(
      deviceReplacements,
      [eq(deviceReplacements.starter_id, starterId)]
    );

    const firstLog = await db.query.deviceStatusLogs.findFirst({
      where: eq(deviceStatusLogs.starter_id, starterId),
      orderBy: [sql`created_at ASC`],
    });

    return {
      total_replacements: replacements.length,
      current_generation: replacements.length,
      first_device_deployed_date: firstLog?.created_at,
      last_replacement_date: replacements[0]?.created_at,
      last_replacement_reason: replacements[0]?.replacement_reason,
      total_motors_affected: replacements.reduce((sum, r) => sum + (r.motors_count_at_replacement || 0), 0),
    };
  }
}
```

### B. Updated Controller Method

Update: `src/controllers/starterBoxController.ts`

```typescript
import { DeviceReplacementService } from "../services/deviceReplacementService";

const deviceReplacementService = new DeviceReplacementService();

// Get status logs with device generation highlighting
getStarterBoxStatusLogs = async (c: Context) => {
  try {
    const starterId = +c.req.param("id");
    const query = c.req.query();
    const page = +(query.page) || 1;
    const limit = +(query.limit) || 20;
    const offset = (page - 1) * limit;

    paramsValidateException.validateId(starterId, "starter id");

    const existedStarter = await getSingleRecordByMultipleColumnValues<Device>(
      starterBoxes,
      ["id", "status"],
      [starterId, "ARCHIVED"],
      ["eq", "ne"],
      ["id"]
    );
    if (!existedStarter) {
      throw new NotFoundException(STARTER_BOX_NOT_FOUND);
    }

    // Get logs WITH generation info
    const logsWithGeneration = await deviceReplacementService.getDeviceStatusLogsWithGeneration(
      starterId,
      limit,
      offset
    );

    // Get replacement stats for header info
    const replacementStats = await deviceReplacementService.getReplacementStats(starterId);

    const paginationInfo = getPaginationData(page, limit, logsWithGeneration.length);

    return sendSuccessResp(c, 200, "DEVICE_STATUS_LOGS_FETCHED", {
      pagination: paginationInfo,
      replacement_info: {
        total_replacements: replacementStats.total_replacements,
        current_generation: replacementStats.current_generation,
        last_replacement_date: replacementStats.last_replacement_date,
      },
      records: logsWithGeneration,
    });
  } catch (error: any) {
    console.error("Error fetching device status logs:", error.message);
    throw error;
  }
};

// Get alerts/faults with device generation highlighting
getAlertsFaults = async (c: Context) => {
  try {
    const starterId = +c.req.param("id");
    const query = c.req.query();
    const page = +(query.page) || 1;
    const limit = +(query.limit) || 20;
    const offset = (page - 1) * limit;

    const existedStarter = await getSingleRecordByMultipleColumnValues<Device>(
      starterBoxes,
      ["id", "status"],
      [starterId, "ARCHIVED"],
      ["eq", "ne"],
      ["id"]
    );
    if (!existedStarter) {
      throw new NotFoundException(STARTER_BOX_NOT_FOUND);
    }

    // Get alerts WITH generation info
    const alertsWithGeneration = await deviceReplacementService.getAlertsWithGeneration(
      starterId,
      limit,
      offset
    );

    const replacementStats = await deviceReplacementService.getReplacementStats(starterId);

    return sendSuccessResp(c, 200, "ALERTS_FAULTS_FETCHED", {
      replacement_summary: replacementStats,
      records: alertsWithGeneration,
    });
  } catch (error: any) {
    console.error("Error fetching alerts/faults:", error.message);
    throw error;
  }
};

// Get device replacement history
getDeviceReplacementHistory = async (c: Context) => {
  try {
    const starterId = +c.req.param("id");
    paramsValidateException.validateId(starterId, "starter id");

    const existedStarter = await getSingleRecordByMultipleColumnValues<Device>(
      starterBoxes,
      ["id", "status"],
      [starterId, "ARCHIVED"],
      ["eq", "ne"],
      ["id"]
    );
    if (!existedStarter) {
      throw new NotFoundException(STARTER_BOX_NOT_FOUND);
    }

    // Get replacement history with user info
    const history = await db.select({
      id: deviceReplacements.id,
      generation: sql`row_number() OVER (ORDER BY ${deviceReplacements.created_at} ASC)`,
      old_pcb_number: deviceReplacements.old_pcb_number,
      old_mac_address: deviceReplacements.old_mac_address,
      old_mcu_serial_no: deviceReplacements.old_mcu_serial_no,
      old_starter_number: deviceReplacements.old_starter_number,
      new_pcb_number: deviceReplacements.new_pcb_number,
      new_mac_address: deviceReplacements.new_mac_address,
      new_mcu_serial_no: deviceReplacements.new_mcu_serial_no,
      new_starter_number: deviceReplacements.new_starter_number,
      replacement_reason: deviceReplacements.replacement_reason,
      notes: deviceReplacements.notes,
      motors_count_at_replacement: deviceReplacements.motors_count_at_replacement,
      ponds_count_at_replacement: deviceReplacements.ponds_count_at_replacement,
      replaced_by_user: users.username,
      replaced_at: deviceReplacements.created_at,
    })
      .from(deviceReplacements)
      .leftJoin(users, eq(deviceReplacements.replaced_by, users.id))
      .where(eq(deviceReplacements.starter_id, starterId))
      .orderBy(desc(deviceReplacements.created_at));

    return sendSuccessResp(c, 200, "DEVICE_REPLACEMENT_HISTORY_FETCHED", {
      total_replacements: history.length,
      records: history,
    });
  } catch (error: any) {
    console.error("Error fetching replacement history:", error.message);
    throw error;
  }
};
```

### C. Replace Device Endpoint (Enhanced)

```typescript
replaceDevice = async (c: Context) => {
  try {
    const user: User = c.get("user_payload");
    const starterBoxId = +c.req.param("id");
    const reqData = await c.req.json();

    paramsValidateException.validateId(starterBoxId, "starter box id");

    const validatedReqData = safeParse(vReplaceDeviceValidator, reqData);
    if (!validatedReqData.success) {
      throw new UnprocessableContentException(VALIDATION_ERROR, validationErrors(validatedReqData.issues));
    }

    // Get existing device
    const existingDevice = await getSingleRecordByMultipleColumnValues<Device>(
      starterBoxes,
      ["id", "status"],
      [starterBoxId, "ARCHIVED"],
      ["eq", "ne"]
    );
    if (!existingDevice) {
      throw new NotFoundException(STARTER_BOX_NOT_FOUND);
    }

    // Check unique constraints on new identifiers
    await starterBoxService.checkUniqueColumnsForReplacement({
      db,
      table: starterBoxes,
      uniqueFields: ["mcu_serial_no", "mac_address", "pcb_number", "starter_number"],
      data: validatedReqData.output,
      excludeDeviceId: starterBoxId,
    });

    // Count motors and ponds for tracking
    const motorsCount = await getRecordsCount(
      motors,
      [eq(motors.starter_id, starterBoxId), ne(motors.status, "ARCHIVED")]
    );
    const pondsSet = new Set<number>();
    const deviceMotors = await getRecordsConditionally(motors, [
      eq(motors.starter_id, starterBoxId),
      ne(motors.status, "ARCHIVED"),
    ]);
    deviceMotors.forEach(m => m.pond_id && pondsSet.add(m.pond_id));

    // Transaction: Update device + Create replacement record
    let updatedDevice, replacementRecord;
    await db.transaction(async (trx) => {
      updatedDevice = await updateRecordByIdWithTrx<Device>(
        starterBoxes,
        starterBoxId,
        {
          pcb_number: validatedReqData.output.new_pcb_number,
          mac_address: validatedReqData.output.new_mac_address,
          mcu_serial_no: validatedReqData.output.new_mcu_serial_no,
          starter_number: validatedReqData.output.new_starter_number,
          updated_at: new Date(),
        },
        trx
      );

      // Create replacement record with counters
      replacementRecord = await saveSingleRecord<DeviceReplacement>(
        deviceReplacements,
        {
          starter_id: starterBoxId,
          old_pcb_number: existingDevice.pcb_number || "",
          old_mac_address: existingDevice.mac_address || "",
          old_mcu_serial_no: existingDevice.mcu_serial_no || "",
          old_starter_number: existingDevice.starter_number || "",
          new_pcb_number: validatedReqData.output.new_pcb_number,
          new_mac_address: validatedReqData.output.new_mac_address,
          new_mcu_serial_no: validatedReqData.output.new_mcu_serial_no,
          new_starter_number: validatedReqData.output.new_starter_number,
          replacement_reason: validatedReqData.output.replacement_reason || "OTHER",
          notes: validatedReqData.output.notes,
          replaced_by: user.id,
          motors_count_at_replacement: motorsCount,
          ponds_count_at_replacement: pondsSet.size,
        },
        trx
      );

      // Create audit logs
      const fieldsChanged = [
        { field: "pcb_number", old: existingDevice.pcb_number, new: validatedReqData.output.new_pcb_number },
        { field: "mac_address", old: existingDevice.mac_address, new: validatedReqData.output.new_mac_address },
        { field: "mcu_serial_no", old: existingDevice.mcu_serial_no, new: validatedReqData.output.new_mcu_serial_no },
        { field: "starter_number", old: existingDevice.starter_number, new: validatedReqData.output.new_starter_number },
      ];

      const auditLogs = fieldsChanged.map(change => ({
        starter_id: starterBoxId,
        field_name: change.field,
        old_value: change.old,
        new_value: change.new,
        audit_type: "DEVICE_REPLACED",
        updated_by: user.id,
        replacement_id: replacementRecord.id,
      }));

      if (auditLogs.length > 0) {
        await saveRecords<AuditLog>(auditLogs, auditLogs, trx);
      }
    });

    const currentGeneration = await deviceReplacementService.getDeviceGeneration(starterBoxId);

    return sendSuccessResp(c, 200, "DEVICE_REPLACED_SUCCESSFULLY", {
      device: updatedDevice,
      replacement: {
        id: replacementRecord.id,
        generation: currentGeneration,
        old_device: {
          pcb_number: replacementRecord.old_pcb_number,
          mac_address: replacementRecord.old_mac_address,
          mcu_serial_no: replacementRecord.old_mcu_serial_no,
          starter_number: replacementRecord.old_starter_number,
        },
        new_device: {
          pcb_number: replacementRecord.new_pcb_number,
          mac_address: replacementRecord.new_mac_address,
          mcu_serial_no: replacementRecord.new_mcu_serial_no,
          starter_number: replacementRecord.new_starter_number,
        },
        metadata: {
          motors_preserved: motorsCount,
          ponds_affected: pondsSet.size,
          reason: replacementRecord.replacement_reason,
          replaced_by: user.username,
          replaced_at: replacementRecord.created_at,
        },
      },
    });
  } catch (error: any) {
    console.error("Error at replaceDevice:", error.message);
    throw error;
  }
};
```

---

## 3. NEW ROUTES

Add to: `src/routes/starterBox.ts`

```typescript
// Device replacement endpoints
starterBoxRoute.patch("/:id/replace-device", isAuthorized, starterController.replaceDevice);
starterBoxRoute.get("/:id/replacement-history", isAuthorized, starterController.getDeviceReplacementHistory);
starterBoxRoute.get("/:id/status-logs-with-generation", isAuthorized, starterController.getStarterBoxStatusLogs); // Updated
starterBoxRoute.get("/:id/alerts-faults-with-generation", isAuthorized, isAdmin, starterController.getAlertsFaults); // Updated
```

---

## 4. UI IMPLEMENTATION - Visual Highlighting Strategy

### A. Device Detail Header - Show Replacement Timeline

```jsx
// Components/DeviceHeader.tsx
export const DeviceHeader = ({ device, replacementStats }) => {
  return (
    <div className="device-header">
      <div className="device-info">
        <h1>{device.title}</h1>
        
        {/* Replacement badge */}
        {replacementStats?.total_replacements > 0 && (
          <ReplacementBadge 
            totalReplacements={replacementStats.total_replacements}
            currentGeneration={replacementStats.current_generation}
            lastReplacementDate={replacementStats.last_replacement_date}
          />
        )}
      </div>

      {/* Current device identifiers with indicator */}
      <div className="device-identifiers">
        <IdentifierField 
          label="PCB Number" 
          value={device.pcb_number}
          hasBeenReplaced={replacementStats?.total_replacements > 0}
          tooltip={replacementStats?.total_replacements > 0 ? "Click to see history" : undefined}
        />
        <IdentifierField 
          label="MAC Address" 
          value={device.mac_address}
          hasBeenReplaced={replacementStats?.total_replacements > 0}
        />
      </div>
    </div>
  );
};

// Reusable component
const IdentifierField = ({ label, value, hasBeenReplaced, tooltip }) => (
  <div className="identifier-field">
    <label>{label}</label>
    <div className={`identifier-value ${hasBeenReplaced ? 'has-been-replaced' : ''}`}>
      {value}
      {hasBeenReplaced && (
        <span className="replacement-indicator" title={tooltip}>
          ⭐ Replaced Device
        </span>
      )}
    </div>
  </div>
);
```

### B. Device Status Logs - Highlight Old Device Logs

```jsx
// Components/DeviceStatusLogs.tsx
export const DeviceStatusLogs = ({ logs, replacementInfo }) => {
  return (
    <div className="status-logs">
      {/* Replacement timeline header */}
      {replacementInfo?.total_replacements > 0 && (
        <ReplacementTimeline replacements={replacementInfo} />
      )}

      {/* Status log table with highlighting */}
      <table className="status-logs-table">
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>Status</th>
            <th>Device Info</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <StatusLogRow 
              key={log.id} 
              log={log} 
              isFromOldDevice={log.is_from_old_device}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StatusLogRow = ({ log, isFromOldDevice }) => (
  <tr className={isFromOldDevice ? 'old-device-log' : ''}>
    <td>{new Date(log.created_at).toLocaleString()}</td>
    <td>{log.device_status}</td>
    <td>
      {isFromOldDevice && (
        <OldDeviceIndicator 
          pcb={log.old_device_pcb}
          replacedOn={log.replacement_date}
        />
      )}
    </td>
    <td>
      <span className={isFromOldDevice ? 'badge-old-device' : 'badge-current'}>
        {isFromOldDevice ? '⚠️ Old Device' : '✅ Current Device'}
      </span>
    </td>
  </tr>
);

const OldDeviceIndicator = ({ pcb, replacedOn }) => (
  <div className="old-device-indicator">
    <span className="pcb-label">Old PCB: {pcb}</span>
    <span className="replacement-date">Replaced: {new Date(replacedOn).toLocaleDateString()}</span>
  </div>
);

// Timeline component
const ReplacementTimeline = ({ replacements }) => (
  <div className="replacement-timeline">
    <h4>Device Replacement History</h4>
    <div className="timeline">
      {/* Visual timeline of replacements */}
      {replacements.map((r, idx) => (
        <div key={r.id} className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <span className="generation">Gen {idx}</span>
            <span className="date">{new Date(r.replaced_at).toLocaleDateString()}</span>
            <span className="reason">{r.replacement_reason}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

### C. Alerts & Faults - Color Coding

```jsx
// Components/AlertsFaults.tsx
export const AlertsFaultsList = ({ alerts, replacementSummary }) => {
  return (
    <div className="alerts-faults">
      <div className="summary-card">
        <h3>Device History Summary</h3>
        <div className="summary-stats">
          <Stat label="Total Replacements" value={replacementSummary?.total_replacements || 0} />
          <Stat label="Current Generation" value={`Gen ${replacementSummary?.current_generation || 0}`} />
          <Stat label="Last Replacement" value={replacementSummary?.last_replacement_date ? new Date(replacementSummary.last_replacement_date).toLocaleDateString() : 'Never'} />
        </div>
      </div>

      {/* Alerts table with visual distinction */}
      <table className="alerts-table">
        <tbody>
          {alerts.map((alert) => (
            <AlertRow 
              key={alert.id} 
              alert={alert}
              isFromOldDevice={alert.is_from_old_device}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AlertRow = ({ alert, isFromOldDevice }) => (
  <tr className={`alert-row ${isFromOldDevice ? 'from-old-device' : 'from-current'}`}>
    <td>
      <span className={`severity severity-${alert.severity.toLowerCase()}`}>
        {alert.severity}
      </span>
    </td>
    <td>{alert.alert_type}</td>
    <td>{new Date(alert.created_at).toLocaleString()}</td>
    <td>
      {isFromOldDevice ? (
        <div className="old-device-badge">
          <span className="icon">⚠️</span>
          <span className="text">Old Device (PCB: {alert.old_device_info.pcb_number})</span>
          <span className="sub-text">Replaced: {new Date(alert.old_device_info.replacement_date).toLocaleDateString()}</span>
        </div>
      ) : (
        <span className="current-device-badge">✅ Current Device</span>
      )}
    </td>
  </tr>
);
```

### D. CSS Styling

```css
/* Device identifier highlighting */
.identifier-value.has-been-replaced {
  position: relative;
  padding-right: 120px;
}

.replacement-indicator {
  position: absolute;
  right: 0;
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  cursor: help;
}

/* Status log table styling */
.status-logs-table tbody tr.old-device-log {
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
}

.badge-old-device {
  background: #ffe0b2;
  color: #e65100;
  padding: 4px 8px;
  border-radius: 3px;
  font-weight: bold;
}

.badge-current {
  background: #c8e6c9;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 3px;
  font-weight: bold;
}

/* Old device indicator */
.old-device-indicator {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #fff3e0;
  border-radius: 4px;
  border-left: 3px solid #ff9800;
}

.pcb-label {
  font-weight: bold;
  color: #e65100;
}

.replacement-date {
  font-size: 12px;
  color: #666;
}

/* Replacement timeline */
.replacement-timeline {
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
}

.timeline-item {
  display: flex;
  gap: 15px;
  position: relative;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  background: #1976d2;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.generation {
  font-weight: bold;
  color: #1976d2;
}

.date {
  font-size: 12px;
  color: #999;
}

.reason {
  color: #666;
}

/* Alerts table styling */
.alert-row.from-old-device {
  background-color: #fff3e0 !important;
}

.alert-row.from-current {
  background-color: #f1f8e9 !important;
}

.old-device-badge {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #ffe0b2;
  border-radius: 4px;
  border-left: 3px solid #ff6f00;
}

.old-device-badge .icon {
  font-size: 16px;
}

.old-device-badge .text {
  font-weight: bold;
  color: #e65100;
}

.old-device-badge .sub-text {
  font-size: 12px;
  color: #d84315;
}

.current-device-badge {
  display: inline-block;
  background: #a5d6a7;
  color: #1b5e20;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

/* Replacement summary card */
.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.summary-card .stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.summary-card .stat-value {
  font-size: 24px;
  font-weight: bold;
}
```

---

## 5. QUERY REFERENCE - How to Use Generation Info

### Get all logs for device with old device indicator
```typescript
// API call
GET /v1/starter/:id/status-logs-with-generation?page=1&limit=20

// Response includes:
{
  "data": [
    {
      "id": 123,
      "device_status": "ACTIVE",
      "created_at": "2026-04-10T10:00:00Z",
      "generation": 1,
      "is_from_old_device": true,
      "old_device_pcb": "OLD-PCB-001",
      "replacement_date": "2026-04-15T09:00:00Z"
    },
    {
      "id": 124,
      "device_status": "ACTIVE",
      "created_at": "2026-04-15T15:00:00Z",
      "generation": 1,
      "is_from_old_device": false,
      "old_device_pcb": null,
      "replacement_date": null
    }
  ]
}
```

### Get replacement history
```typescript
// API call
GET /v1/starter/:id/replacement-history

// Response:
{
  "total_replacements": 2,
  "records": [
    {
      "id": 1,
      "generation": 1,
      "old_pcb_number": "PREV-PCB-001",
      "new_pcb_number": "OLD-PCB-001",
      "old_mac_address": "AA:AA:AA:AA:AA:AA",
      "new_mac_address": "AA:BB:CC:DD:EE:01",
      "motors_count_at_replacement": 2,
      "ponds_count_at_replacement": 1,
      "replacement_reason": "DEVICE_FAILURE",
      "replaced_by_user": "Admin User",
      "replaced_at": "2026-03-20T10:00:00Z"
    },
    {
      "id": 2,
      "generation": 2,
      "old_pcb_number": "OLD-PCB-001",
      "new_pcb_number": "NEW-PCB-002",
      "old_mac_address": "AA:BB:CC:DD:EE:01",
      "new_mac_address": "BB:CC:DD:EE:FF:02",
      "motors_count_at_replacement": 2,
      "ponds_count_at_replacement": 1,
      "replacement_reason": "PERFORMANCE_ISSUE",
      "replaced_by_user": "Manager User",
      "replaced_at": "2026-04-15T09:00:00Z"
    }
  ]
}
```

---

## 6. TRACKING SUMMARY

Every time a device is replaced, the system automatically:

✅ **Logs Created:**
- Device replacement record with old & new identifiers
- 4 audit logs (one per identifier field)
- Replacement stats (motors count, ponds count)

✅ **Data Captured:**
- When replacement happened
- Who performed replacement
- Why it was replaced (reason)
- How many motors affected
- How many ponds affected

✅ **UI Indicators:**
- Old device logs highlighted in YELLOW
- Current device logs highlighted in GREEN
- Replacement timeline showing all replacements
- Old PCB number displayed on historical data
- Badge showing "Gen 0" → "Gen 1" → "Gen 2" evolution

