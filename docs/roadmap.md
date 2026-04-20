---
title: Product Roadmap
sidebar_position: 1
---

# Product Roadmap

This document captures upcoming features and improvements across Peepul Farm products. Each item includes the problem being solved and the planned solution.

---

## iDhara

### 1. Scheduling

**Problem**
There is no way to automate motor start/stop based on time. Users must manually turn motors on and off, leading to over-irrigation, missed windows, and labour dependency.

**Solution**
Introduce a scheduling engine that allows users to define time-based ON/OFF rules per motor. The scheduler runs on the cloud and dispatches motor control commands at the configured times. Users can configure schedules from the mobile app and admin dashboard.

---

### 2. Multi-Starter Support

**Problem**
The system supports only standalone single-starter devices. A new hardware type — the **multi-starter** — acts simultaneously as a motor controller and as an ESP gateway for linked child nodes. The existing MQTT topic structure, data model, and onboarding flow do not support this topology.

**Solution**

- Extend the `Device` data model with a `type` field (`SINGLE | MULTI`), a `gatewayId` for child nodes, and a `childNodeIds` list for gateway devices.
- Introduce a two-level MQTT topic hierarchy:
  - Gateway own motor: `peepul/<GwID>/cmd` → `peepul/<GwID>/status`
  - Child node commands: `peepul/<GwID>/<NodeID>/cmd`
  - Child node status: `peepul/<GwID>/<NodeID>/status`
- Add a topic resolver utility so all publish/subscribe calls automatically use the correct topic based on device type and role.
- Update the onboarding flow to let users select **Single** or **Multi** starter, and optionally assign child nodes during or after onboarding.
- Update the device list to badge gateway devices and hide child nodes from the top-level list.
- Add a **Nodes** tab on the multi-starter detail screen showing each child node's state, with tap-through to individual motor control.

---

### 3. Device Status & Runtime Logic Update

**Problem**
Motor ON/OFF status and runtime are currently derived from live-data sync intervals. When signal is lost, the next data sync incorrectly continues accumulating runtime. This causes confusion — the displayed status and runtime do not reflect the actual device state when the device goes offline.

**Solution**
Decouple motor ON/OFF status from live-data sync. Introduce explicit online/offline tracking per device and use the last known command state as the displayed status when the device is offline. Runtime accumulation must pause when the device is marked offline and resume only after it comes back online and sends a confirmed status. The logic update spans the backend (status resolution and runtime calculation) and the mobile/admin UI (clear offline indicators with last-known state).

---

## APFC + Soft Starter

### 1. Device Replacement

**Problem**
When a StarterBox device fails in the field, the current process requires adding a brand-new device record and manually re-associating all motors. This is error-prone, loses history, and disrupts ongoing operations.

**Solution**

Introduce a **Replace Device** workflow that swaps the hardware identifiers on an existing device record while preserving all motor associations, historical data, and user assignments.

**Key changes:**

- **New `device_replacements` table** — records every replacement with old and new hardware identifiers (`pcb_number`, `mac_address`, `mcu_serial_no`, `starter_number`), reason, and the user who performed the replacement.
- **New API endpoint** — `PATCH /v1/starter/:id/replace-device` — validates uniqueness of new identifiers, updates the device in a single transaction, creates the replacement record, and appends audit log entries.
- **Replacement reasons** — `DEVICE_FAILURE | PERFORMANCE_ISSUE | UPGRADE | OTHER`.
- **UI — Replace Device modal** — shown from the device detail view; displays current identifiers and motor count, collects new identifiers and reason, previews changes before confirming.
- **UI — Replacement history** — a history section on the device detail view shows a timeline of past replacements with old-vs-new identifiers, reason, replaced-by user, and motors preserved count.
- **Search compatibility** — old identifiers remain searchable for a configurable period, with a badge indicating the current active identifiers.

No existing device update flow is changed; the replacement endpoint is fully additive.

---

*Last updated: April 2026*
