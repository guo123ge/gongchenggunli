# API Spec

所有 API 返回统一结构：

```json
{ "ok": true, "data": {} }
```

失败时：

```json
{ "ok": false, "error": "错误说明", "details": {} }
```

## 核心路径

- `GET /api/dashboard`
- `GET|POST /api/daily-logs`
- `GET|PATCH|DELETE /api/daily-logs/:id`
- `GET|POST /api/materials`
- `GET|POST /api/materials/stock-in`
- `GET|POST /api/materials/stock-out`
- `GET|POST /api/review`
- `POST /api/upload`
- `POST /api/ai/ocr`
- `POST /api/ai/safety-check`
- `POST /api/ai/transcribe`
- `POST /api/ai/chat`
- `GET /api/reports/daily-log-summary`
- `GET /api/reports/material-ledger`
- `GET /api/export/:type`
- `GET|POST /api/notifications`

## 扩展路径

- `GET|PATCH /api/safety/hazards/:id`
- `GET|PATCH /api/safety/incidents/:id`
- `GET|PATCH|DELETE /api/machinery/:id`
- `GET|POST /api/machinery/:id/maintenance`
- `GET|POST /api/machinery/:id/shifts`
- `GET|PATCH|DELETE /api/archives/:id`
- `GET|POST /api/archives/:id/files`
- `GET|PATCH|DELETE /api/changes/:id`
- `GET|PATCH|DELETE /api/visas/:id`
