# ZEHAT API Documentation

## Endpoints

- `POST /register `
- `POST /login `
- `POST /google-login`
- `GET /drugs`
- `GET /drugs/:drugId`
- `PUT /redeem-drugs/:diseaseId`
- `GET /diseases`
- `GET /diseases/users/:userId`
- `POST /diseases/users/:userId`
- `GET /diseases/:diseaseId`
- `DELETE /diseases/:diseaseId`
- `POST /diseases/:diseaseId/:drugId`
- `GET /users`
- `PUT /users/:userId`
- `DELETE /users/:userId`

### 1. **POST /register**

- **Description**: Register a new user.
- **Request Body**:

```json
{
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

**400 (Bad Request)**

```json
{
  "message": "Please check your input"
}
```
