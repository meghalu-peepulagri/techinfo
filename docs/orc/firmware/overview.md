---
title: Firmware Overview
sidebar_position: 1
---

# ORC Firmware Overview

The ORC node firmware runs on **ESP32** with FreeRTOS, handling sensor reading, PID-based dosing control, and cloud connectivity.

## Key Modules

- **Sensor Module** — reads pH (analog), EC (analog), flow (pulse counter)
- **Control Module** — PID loop for dosing pump actuation
- **Comms Module** — MQTT over WiFi/4G to DemeterCloud
- **OTA Module** — secure firmware update via HTTPS

## Build

See the internal `orc-firmware` repository for build and flashing instructions.
