# Kebutuhan REST API

Prefix: `/api/v1`

## Auth

- POST `/auth/login`
- POST `/auth/refresh`
- POST `/auth/logout`
- POST `/auth/logout-all`
- GET `/auth/me`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`

## Teachers

- GET `/teachers`
- POST `/teachers`
- GET `/teachers/:id`
- PATCH `/teachers/:id`
- DELETE `/teachers/:id`
- GET `/teachers/search`
- GET `/teachers/:id/schedules`
- GET `/teachers/:id/attendance-history`

## Classes dan Periods

- CRUD `/classes`
- CRUD `/lesson-periods`
- CRUD `/academic-years`
- CRUD `/semesters`
- CRUD `/school-holidays`

## Schedules

- GET `/schedules`
- POST `/schedules`
- GET `/schedules/today`
- PATCH `/schedules/:id`
- DELETE `/schedules/:id`
- POST `/schedules/import`
- POST `/schedules/validate-import`

## Attendance

- GET `/attendance`
- POST `/attendance`
- POST `/attendance/bulk`
- GET `/attendance/:id`
- POST `/attendance/:id/resend-whatsapp`

## Change Requests

- GET `/attendance-change-requests`
- POST `/attendance-change-requests`
- GET `/attendance-change-requests/:id`
- POST `/attendance-change-requests/:id/approve`
- POST `/attendance-change-requests/:id/reject`

## Portal Publik

- GET `/public/teachers/search`
- GET `/public/teachers/:publicId/attendance`

Jangan gunakan sequential database ID sebagai identifier publik bila dapat memudahkan enumeration.

## Reports

- GET `/reports/daily`
- GET `/reports/monthly`
- GET `/reports/teacher`
- GET `/reports/class`
- GET `/reports/export/excel`
- GET `/reports/export/pdf`

## Response

Gunakan format konsisten:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data tidak valid",
    "details": []
  }
}
```
