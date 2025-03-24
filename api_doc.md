# ZEHAT API Documentation

## Endpoints

- `POST /register `
- `POST /login `
- `POST /google-login`
- `GET /drugs`
- `PATCH /user/:id/update-status`
- `POST /user/:userId/disease`
- `DELETE /users/:userId`
- `GET /diseases`
- `GET /diseases/:userId`
- `DELETE /diseases/:diseaseId`
- `GET /diseases/:diseaseId/:drugId`

### 1. **POST /register**

- **Description**: Register a new user.
- **Request Body**:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

Response:
**201 (Created)**

```json
{
  "id": "number",
  "email": "string"
}
```
