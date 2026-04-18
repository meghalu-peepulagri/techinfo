---
title: API Overview
sidebar_position: 1
---

# ORC API Overview

The ORC API provides access to sensor data, dosing schedules, and actuator control through DemeterCloud.

## Base URL

```
https://api.demetercloud.peepul.farm/v1/orc
```

## Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/devices` | List all ORC nodes |
| `GET` | `/devices/{id}/readings` | Latest pH, EC, flow readings |
| `GET` | `/devices/{id}/schedules` | List dosing schedules |
| `POST` | `/devices/{id}/dose` | Trigger a manual dose |

> Full API reference coming soon.
