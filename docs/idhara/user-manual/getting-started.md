---
title: Getting Started
sidebar_position: 1
---

# iDhara — Getting Started

## Prerequisites

- iDhara Field Node unit
- LoRa Gateway (or 4G variant)
- Access to the DemeterCloud admin portal
- iDhara Mobile App (iOS / Android)

## Installation Steps

1. **Mount the field node** at the monitoring location (stake into soil or weather-proof enclosure).
2. **Power on** the device — LED will blink blue during boot.
3. **Pair with gateway** — the node auto-discovers the nearest configured gateway via LoRa.
4. **Verify in DemeterCloud** — navigate to _Devices → Field Nodes_ and confirm the node appears online.
5. **Configure alerts** — set threshold alerts for soil moisture and temperature via the mobile app.

## LED Status Codes

| LED Pattern | Meaning |
|-------------|---------|
| Solid green | Connected and transmitting |
| Slow blink blue | Searching for gateway |
| Fast blink red | Sensor error — check connections |
| Solid red | Critical firmware error |
