---
title: API Overview
sidebar_position: 1
---

# DemeterCloud API Overview

The DemeterCloud REST API is the single integration point for all Peepul Farm IoT products. It is versioned and consumed by mobile apps, the admin dashboard, and third-party integrations.

## Base URL

```
https://api.demetercloud.peepul.farm/v1
```

## Authentication

```http
Authorization: Bearer <jwt-token>
```

Tokens are obtained via:

```http
POST /auth/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "••••••••"
}
```

## Resource Groups

| Resource Group | Path Prefix | Description |
|----------------|-------------|-------------|
| Auth | `/auth` | Login, token refresh, API keys |
| Organizations | `/orgs` | Multi-tenant org management |
| Farms | `/farms` | Farm and zone configuration |
| Devices | `/devices` | Device CRUD and telemetry |
| iDhara | `/idhara` | Irrigation-specific endpoints |
| APFC | `/apfc` | Power quality endpoints |
| ORC | `/orc` | Dosing and fertigation endpoints |
| Alerts | `/alerts` | Alert rules and notification history |
| Reports | `/reports` | Data export and analytics |
| Users | `/users` | User management |

## Pagination

All list endpoints use cursor-based pagination:

```http
GET /devices?limit=50&cursor=<next_cursor>
```

Response includes `next_cursor` when more results exist.

## Error Format

```json
{
  "error": "device_not_found",
  "message": "No device found with id: abc-123",
  "status": 404
}
```

> Detailed per-endpoint documentation coming soon.
