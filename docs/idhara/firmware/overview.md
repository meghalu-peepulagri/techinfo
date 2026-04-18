---
title: Firmware Overview
sidebar_position: 1
---

# iDhara Firmware Overview

The iDhara field node runs an embedded firmware built on **FreeRTOS** targeting the ESP32-S3 SoC.

## Architecture

```
┌─────────────────────────────────────┐
│          Application Layer          │
│  (Sensor sampling, alert logic)     │
├─────────────────────────────────────┤
│         Communication Layer         │
│  (LoRa uplink, MQTT, OTA)          │
├─────────────────────────────────────┤
│           HAL / Drivers             │
│  (I2C sensors, GPIO, ADC)          │
├─────────────────────────────────────┤
│            FreeRTOS                 │
└─────────────────────────────────────┘
```

## OTA Updates

OTA (Over-The-Air) firmware updates are delivered via DemeterCloud. The device polls for updates every 6 hours. Updates are cryptographically signed and verified before applying.

## Build & Flash

See the internal Firmware repository for build instructions (`idhara-firmware`).

```bash
idf.py build
idf.py -p /dev/ttyUSB0 flash monitor
```

## Sensor Sampling Intervals

| Sensor | Default Interval |
|--------|-----------------|
| Soil Moisture | 15 min |
| Soil Temperature | 15 min |
| EC (Electrical Conductivity) | 30 min |
| Battery Voltage | 1 hour |
