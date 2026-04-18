---
title: API Overview
sidebar_position: 1
---

# iDhara API Overview

The iDhara API is part of the DemeterCloud REST API and provides access to sensor readings, device management, and irrigation control for iDhara field nodes.

## Base URL

```
https://api.demetercloud.peepul.farm/v1
```

## Authentication

All requests require a Bearer token:

```http
Authorization: Bearer <your-api-token>
```

Tokens are issued from the DemeterCloud admin portal under _Settings → API Keys_.

## Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/devices` | List all field nodes |
| `GET` | `/devices/{id}/readings` | Get latest sensor readings |
| `GET` | `/devices/{id}/readings/history` | Get historical readings |
| `POST` | `/devices/{id}/irrigate` | Trigger an irrigation command |
| `GET` | `/alerts` | List active alerts |

## Rate Limits

- 1,000 requests / hour per API key
- Bulk history queries limited to 7-day windows

> Full API reference coming soon.
