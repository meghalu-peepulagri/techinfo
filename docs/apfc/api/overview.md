---
title: API Overview
sidebar_position: 1
---

# APFC API Overview

The APFC API provides access to power quality data and device management through DemeterCloud.

## Base URL

```
https://api.demetercloud.peepul.farm/v1/apfc
```

## Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/devices` | List all APFC controllers |
| `GET` | `/devices/{id}/readings` | Latest power quality readings |
| `GET` | `/devices/{id}/events` | Capacitor switching event log |
| `GET` | `/devices/{id}/energy` | Energy consumption summary |

> Full API reference coming soon.
