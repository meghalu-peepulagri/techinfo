---
title: Getting Started
sidebar_position: 1
---

# APFC — Getting Started

## Prerequisites

- APFC Controller unit
- 3-phase power supply (415V AC)
- Capacitor bank panel (pre-wired to APFC relay outputs)
- DemeterCloud account

## Installation Steps

1. **Mount** the APFC controller inside the main distribution board.
2. **Wire CT clamps** around the incoming phase conductors for current measurement.
3. **Connect relay outputs** to capacitor bank contactors (Stage 1–6).
4. **Power on** — the controller performs a self-test and LED turns solid green.
5. **Configure via DemeterCloud** — set target power factor and capacitor bank step sizes.
6. **Verify switching** — monitor switching events in the DemeterCloud dashboard.

## Default Settings

| Parameter | Default |
|-----------|---------|
| Target Power Factor | 0.98 lag |
| Switching Delay | 30 seconds |
| Alarm Threshold | PF < 0.85 |
