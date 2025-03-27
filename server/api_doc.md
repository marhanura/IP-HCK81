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

## Welcome

### GET /

- **Description**: Returns a welcome message.
- **Method**: `GET`
- **URL**: `/`
- **Response**:
  - **200 OK**  
    _Body (text/plain)_:
    ```
    Welcome to Zehat, your health zolution
    ```

---

## User Authentication

### POST /register

- **Description**: Register a new user.
- **Method**: `POST`
- **URL**: `/register`
- **Request Body** (JSON):

  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "string"
  }
  ```

- **Successful Response**:
  - **201 Created**  
    _Body (JSON)_:
    ```json
    {
      "id": 1,
      "email": "user@example.com"
    }
    ```
- **Error Responses**:
  - **400 Bad Request** (e.g., missing fields, invalid email format, duplicate email)
    ```json
    {
      "message": "Email is required"
    }
    ```

---

### POST /login

- **Description**: Log in a user.
- **Method**: `POST`
- **URL**: `/login`
- **Request Body** (JSON):

  ```json
  {
    "email": "user@example.com",
    "password": "string"
  }
  ```

- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_:
    ```json
    {
      "access_token": "jwt-token-string",
      "email": "user@example.com",
      "role": "pasien"
    }
    ```
- **Error Responses**:
  - **400 Bad Request** (e.g., missing email or password)
    ```json
    {
      "message": "Email is required"
    }
    ```
  - **401 Unauthorized** (e.g., user not found or wrong password)
    ```json
    {
      "message": "User not found"
    }
    ```

---

### POST /google-login

- **Description**: Log in via Google OAuth.
- **Method**: `POST`
- **URL**: `/google-login`
- **Request Body** (JSON):

  ```json
  {
    "googleToken": "string"
  }
  ```

- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_:
    ```json
    {
      "access_token": "jwt-token-string",
      "email": "user@example.com"
    }
    ```
- **Error Responses**:
  - **400 Bad Request** (if `googleToken` is missing)
    ```json
    {
      "message": "Google token required"
    }
    ```
  - **500 Internal Server Error** (if token verification fails)

---

## Drug Management

### GET /drugs

- **Description**: Retrieve a list of drugs with optional search and pagination.
- **Method**: `GET`
- **URL**: `/drugs`
- **Query Parameters**:
  - `search` (optional): Search keyword (case-insensitive)
  - `page[size]` (optional): Number of items per page (default: 9)
  - `page[number]` (optional): Page number (default: 1)
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_:
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "Paracetamol",
          "price": 5000,
          "category": "Analgesic"
        },
        ...
      ],
      "totalPages": 1,
      "currentPage": 1,
      "totalData": 10,
      "dataPerPage": 9
    }
    ```

---

### GET /drugs/:drugId

- **Description**: Retrieve details of a drug by its ID.
- **Method**: `GET`
- **URL**: `/drugs/:drugId`
- **Path Parameter**:
  - `drugId`: ID of the drug
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_:
    ```json
    {
      "id": 1,
      "name": "Paracetamol",
      "price": 5000,
      "category": "Analgesic"
    }
    ```
- **Error Response**:
  - **404 Not Found**
    ```json
    {
      "message": "Drug not found"
    }
    ```

---

## Redeem Drugs

### GET /redeem-drugs/:diseaseId

- **Description**: Redeem drugs for a specific disease. This endpoint calculates the total price based on the prescribed drugs and creates or updates a redeem record.
- **Method**: `GET`
- **URL**: `/redeem-drugs/:diseaseId`
- **Path Parameter**:
  - `diseaseId`: ID of the disease for which the drugs are to be redeemed
- **Required Headers**:
  - `Authorization: Bearer <token>`
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_ (example):
    ```json
    {
      "DiseaseId": 1,
      "totalPrice": 15000,
      "midtransToken": "generated-token",
      "paymentStatus": "pending"
    }
    ```
- **Error Responses**:
  - **400 Bad Request** (if no prescribed drugs are found)
    ```json
    {
      "message": "Disease not found or no drug prescribed"
    }
    ```
  - **401 Unauthorized** (if token is missing or invalid)
  - **404 Not Found** (if the disease does not exist)

### PATCH /redeem-drugs/:diseaseId

- **Description**: Update the payment status of a redeemed drug and update the associated disease status.
- **Method**: `PATCH`
- **URL**: `/redeem-drugs/:diseaseId`
- **Path Parameter**:
  - `diseaseId`: ID of the disease whose redeem status is being updated
- **Request Body** (JSON):

  ```json
  {
    "paymentStatus": "paid",
    "status": "redeemed"
  }
  ```

- **Required Headers**:
  - `Authorization: Bearer <token>` (must pass authorization)
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_:
    ```json
    {
      "redeemDrug": {
        "id": 1,
        "DiseaseId": 1,
        "totalPrice": 15000,
        "midtransToken": "generated-token",
        "paymentStatus": "paid"
      },
      "disease": {
        "id": 1,
        "status": "redeemed",
        "symptoms": "...",
        "diagnose": "..."
      }
    }
    ```
- **Error Responses**:
  - **401 Unauthorized**
  - **403 Forbidden** (if the user is not permitted to perform this action)
  - **404 Not Found** (if redeem record or disease is not found)

---

## Disease Management

### GET /diseases

<a name="get-diseases"></a>

- **Description**: Retrieve all diseases. Optionally, filter diseases by status.
- **Method**: `GET`
- **URL**: `/diseases`
- **Query Parameters**:
  - `filter`: (optional) e.g., `?filter=redeemed`
- **Required Headers**:
  - `Authorization: Bearer <token>` (authorization required)
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_: An array of disease objects.
- **Error Responses**:
  - **401 Unauthorized**
  - **403 Forbidden**

---

### GET /diseases/users/:userId

- **Description**: Retrieve diseases associated with a specific user.
- **Method**: `GET`
- **URL**: `/diseases/users/:userId`
- **Path Parameter**:
  - `userId`: ID of the user
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_: A user object including a `Diseases` field (array of diseases). The user’s password is excluded.
- **Error Response**:
  - **404 Not Found**
    ```json
    {
      "message": "Disease not found"
    }
    ```

---

### POST /diseases/add/:userId

- **Description**: Add a new disease record for a user. The endpoint uses an AI-powered service to analyze the provided symptoms and recommend a diagnosis, recommendation, and suggested drugs.
- **Method**: `POST`
- **URL**: `/diseases/add/:userId`
- **Path Parameter**:
  - `userId`: ID of the user for whom the disease is being added
- **Request Body** (JSON):

  ```json
  {
    "symptoms": "string"
  }
  ```

- **Required Headers**:
  - `Authorization: Bearer <token>`
- **Successful Response**:
  - **201 Created**  
    _Body (JSON)_: The newly created disease object, for example:
    ```json
    {
      "id": 3,
      "symptoms": "fever, headache",
      "diagnose": "Common Cold",
      "recommendation": "Rest and drink plenty of fluids.",
      "UserId": 1,
      "status": "not redeemed",
      "createdAt": "2025-03-27T10:00:00.000Z",
      "updatedAt": "2025-03-27T10:00:00.000Z"
    }
    ```
- **Error Responses**:
  - **400 Bad Request** (if `symptoms` is missing or AI returns `"unknown"`)
    ```json
    {
      "message": "Symptoms is required"
    }
    ```
    or
    ```json
    {
      "message": "Please specify the symptoms"
    }
    ```
  - **404 Not Found** (if the user is not found)
    ```json
    {
      "message": "User not found"
    }
    ```

---

### GET /diseases/:diseaseId

- **Description**: Retrieve details of a disease by its ID, including the associated user and prescribed drugs.
- **Method**: `GET`
- **URL**: `/diseases/:diseaseId`
- **Path Parameter**:
  - `diseaseId`: ID of the disease
- **Required Headers**:
  - `Authorization: Bearer <token>`
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_: An array containing the disease object with included User data and DiseaseDrug details. For example:
    ```json
    [
      {
        "id": 1,
        "symptoms": "fever, headache",
        "diagnose": "Common Cold",
        "recommendation": "Rest and drink plenty of fluids.",
        "UserId": 1,
        "status": "not redeemed",
        "User": { "id": 1, "email": "nakes1@mail.com", ... },
        "DiseaseDrugs": [
          {
            "DrugId": 1,
            "Drug": {
              "name": "Paracetamol",
              "price": 5000,
              "category": "Analgesic"
            }
          }
        ]
      }
    ]
    ```
- **Error Response**:
  - **404 Not Found**
    ```json
    {
      "message": "Disease not found"
    }
    ```

---

### DELETE /diseases/:diseaseId

- **Description**: Delete a disease record.
- **Method**: `DELETE`
- **URL**: `/diseases/:diseaseId`
- **Path Parameter**:
  - `diseaseId`: ID of the disease to delete
- **Required Headers**:
  - `Authorization: Bearer <token>`
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_:
    ```json
    {
      "message": "Disease deleted"
    }
    ```
- **Error Response**:
  - **404 Not Found**
    ```json
    {
      "message": "Disease not found"
    }
    ```

---

### POST /diseases/:diseaseId/:drugId

- **Description**: Add a drug to a disease.
- **Method**: `POST`
- **URL**: `/diseases/:diseaseId/:drugId`
- **Path Parameters**:
  - `diseaseId`: ID of the disease
  - `drugId`: ID of the drug to add
- **Required Headers**:
  - `Authorization: Bearer <token>`
- **Successful Response**:
  - **201 Created**  
    _Body (JSON)_: The created DiseaseDrug record.
    ```json
    {
      "id": 10,
      "DiseaseId": 1,
      "DrugId": 1,
      "createdAt": "2025-03-27T10:00:00.000Z",
      "updatedAt": "2025-03-27T10:00:00.000Z"
    }
    ```
- **Error Responses**:
  - **404 Not Found** (if disease or drug is not found)
    ```json
    {
      "message": "Disease not found"
    }
    ```
    or
    ```json
    {
      "message": "Drug not found"
    }
    ```

---

## User Management

### GET /users

<a name="get-users"></a>

- **Description**: Retrieve all users (passwords are excluded).
- **Method**: `GET`
- **URL**: `/users`
- **Required Headers**:
  - `Authorization: Bearer <token>`
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_: An array of user objects.
    ```json
    [
      {
        "id": 1,
        "username": "nakes1",
        "email": "nakes1@mail.com",
        "role": "tenaga kesehatan",
        "createdAt": "...",
        "updatedAt": "..."
      },
      ...
    ]
    ```
- **Error Responses**:
  - **401 Unauthorized**
  - **403 Forbidden**

---

### DELETE /users/:userId

- **Description**: Delete a user by ID.
- **Method**: `DELETE`
- **URL**: `/users/:userId`
- **Path Parameter**:
  - `userId`: ID of the user to delete
- **Required Headers**:
  - `Authorization: Bearer <token>`
- **Successful Response**:
  - **200 OK**  
    _Body (JSON)_:
    ```json
    {
      "message": "User deleted"
    }
    ```
- **Error Responses**:
  - **404 Not Found**
    ```json
    {
      "message": "User not found"
    }
    ```
  - **401 Unauthorized**
  - **403 Forbidden**
