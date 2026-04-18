---
id: intro
title: DemeterCloud Overview
sidebar_position: 1
---

# DemeterCloud

DemeterCloud is the central cloud backend platform that powers all Peepul Farm IoT devices (iDhara, APFC, ORC). It provides device management, data ingestion, alerting, analytics, and the API layer consumed by mobile apps and the admin dashboard.

## Architecture Overview

```
┌──────────────┐    MQTT/TLS    ┌──────────────────────┐
│  IoT Devices │ ─────────────► │   Message Broker      │
│ (iDhara,APFC,│                │   (EMQX / HiveMQ)    │
│  ORC nodes)  │                └──────────┬───────────┘
└──────────────┘                           │
                                           ▼
                              ┌─────────────────────────┐
                              │   Ingestion Service      │
                              │  (validates, stores data)│
                              └──────────┬──────────────┘
                                         │
                    ┌────────────────────┼──────────────────┐
                    ▼                    ▼                   ▼
           ┌──────────────┐   ┌──────────────────┐  ┌──────────────┐
           │  Time-Series │   │  Relational DB    │  │  Alert Engine│
           │   Database   │   │  (device metadata)│  │  (rules eval)│
           └──────────────┘   └──────────────────┘  └──────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │     REST API         │
                              │  (mobile, dashboard) │
                              └─────────────────────┘
```

## Documentation Sections

- **[Release Notes](./release-notes/v1.0)** — Platform changelog
- **[API Reference](./api/overview)** — Full REST API documentation
- **[User Manual](./user-manual/getting-started)** — Admin portal guide
