---
title: Firmware Overview
sidebar_position: 1
---

# APFC Firmware Overview

The APFC controller runs firmware on an **STM32** microcontroller handling real-time power metering and capacitor switching logic.

## Responsibilities

- Power factor calculation from CT and PT inputs (sampled at 4 kHz)
- Stage selection algorithm (hunt algorithm / direct switching)
- Modbus RTU slave for local HMI communication
- MQTT uplink to DemeterCloud via 4G co-processor
- OTA firmware updates

## Build

See the internal `apfc-firmware` repository for build and flashing instructions.
