# 🛡️ Stateful Authentication API

A secure **Express.js** backend implementing **session-based authentication** with **role-based authorization**, powered by **PostgreSQL (Docker)** and **Drizzle ORM**.

---

## 📌 Overview

This application includes:

* ✅ User registration
* ✅ User login & logout
* ✅ Session-based authentication
* ✅ Role-based authorization
* ✅ Admin-only routes
* ✅ PostgreSQL database (Dockerized)
* ✅ Drizzle ORM for database queries

---

## 🚀 Server Configuration

The server runs on:

```js
PORT = process.env.PORT ?? 8000
```

---

# 🗄️ Database Setup

The application uses **PostgreSQL** running in Docker.

## 🐳 Docker Configuration

* **Image:** `postgres:17.4`
* **Container Name:** `postgres_db`
* **Port Mapping:** `5432:5432`
* **Volume:** `db_data:/var/lib/postgresql/data`

### Volume Definition

```yaml
db_data:
```

Docker is used to spin up and persist the PostgreSQL database.

---

# 🧪 Test Route

## `GET /test-route`

### ✅ Response

```json
{
  "Status": "OK",
  "Message": "All good app is up and running."
}
```

---

# 📂 API Routes

---

## 👤 User Routes (`/user`)

---

### 🔹 `POST /user/auth/register`

**Middleware:**

* `authenticateUser`

**Controller:**

* `registerUser`

#### 📥 Request Body

| Field     | Required |
| --------- | -------- |
| firstName | ✅        |
| lastName  | ❌        |
| email     | ✅        |
| password  | ✅        |

#### 📤 Responses

* `400` → Missing Credentials
* `409` → User already exists
* `201` → User created successfully
* `500` → Internal Server Error

---

### 🔹 `POST /user/auth/login`

**Middleware:**

* `authenticateUser`

**Controller:**

* `userLogin`

#### 📥 Request Body

| Field    | Required |
| -------- | -------- |
| email    | ✅        |
| password | ✅        |

#### 📤 Responses

* `400` → Missing Credentials
* `404` → User not found
* `401` → Invalid password
* `200` → Session created (returns Session ID)
* `500` → Internal Server Error

---

### 🔹 `DELETE /user/auth/logout`

**Middleware:**

* `authenticateUser`

**Controller:**

* `userLogout`

#### 📎 Headers

```
session-id: <UUID>
```

#### 📤 Responses

* `403` → Invalid Session-ID
* `200` → User logged out successfully

---

### 🔹 `GET /user/auth/me`

**Middleware:**

* `authenticateUser`

**Controller:**

* `getMyDetails`

#### 📎 Headers

```
session-id: <UUID>
```

#### 📤 Responses

* `403` → Invalid Session-ID
* `200` → Returns authenticated user data

---

## 🔐 Authenticated Route

---

### 🔹 `GET /profile`

**Middleware:**

* `authenticateUser`
* `isAuthenticated`

**Controller:**

* `getUserProfile`

#### 📥 Request Body

| Field  | Required |
| ------ | -------- |
| userId | ✅        |

#### ⚙️ Behavior

* Returns selected user profile fields
* Access to `ADMIN` profiles is forbidden

#### 📤 Responses

* `400` → Missing Credentials
* `403` → Access Forbidden
* `200` → User profile returned

---

## 👑 Admin Routes (`/admin`)

All admin routes require:

* `authenticateUser`
* `isAuthenticated`
* `isAuthorized('ADMIN')`

---

### 🔹 `GET /admin/users`

**Controller:**

* `getAllUsers`

#### 📤 Response

* `200` → Returns all users (firstName, lastName, email, role)

---

### 🔹 `POST /admin/create-user`

**Controller:**

* `createUser`

#### 📥 Request Body

| Field     | Required |
| --------- | -------- |
| firstName | ✅        |
| lastName  | ❌        |
| email     | ✅        |
| password  | ✅        |

#### 📤 Responses

* `400` → Missing Credentials
* `409` → User already exists
* `201` → User created successfully

---

# 🧩 Middlewares

---

## 🔹 `authenticateUser`

* Reads `session-id` from request headers
* Validates UUID format
* Fetches session + user from database
* Attaches user data to `req.user`

### Responses

* `403` → Invalid Session-ID
* `500` → Internal Server Error

> If no `session-id` is provided, the request continues without authentication.

---

## 🔹 `isAuthenticated`

* Ensures `req.user` exists

**Response:**

* `403` → User Not Logged In

---

## 🔹 `isAuthorized(role)`

* Compares `req.user.role` with required role

**Response:**

* `401` → User Not Authorized

---

# 🎮 Controllers

---

## 👤 User Controller

Functions:

* `registerUser`
* `userLogin`
* `userLogout`
* `getMyDetails`

### Responsibilities

* Password hashing using `crypto` (HMAC SHA256 + salt)
* Session creation on login
* Session deletion on logout
* Returning authenticated user data

---

## 👑 Admin Controller

Functions:

* `getAllUsers`
* `createUser`

### Responsibilities

* Fetching all users
* Creating users with hashed passwords

---

## 🔐 Authenticated Controller

Function:

* `getUserProfile`

### Responsibilities

* Fetching user profile by `userId`
* Blocking access to admin profiles

---

# 🗃️ Database Models

---

## 📄 `userTable` (users)

| Column    | Type / Notes                                   |
| --------- | ---------------------------------------------- |
| id        | UUID (PK)                                      |
| firstName | String                                         |
| lastName  | String                                         |
| email     | Unique                                         |
| role      | `ADMIN`, `MODERATOR`, `USER` (default: `USER`) |
| password  | Hashed                                         |
| salt      | String                                         |
| createAt  | Timestamp                                      |
| updatedAt | Timestamp                                      |

---

## 📄 `userSessions`

| Column    | Type / Notes  |
| --------- | ------------- |
| id        | UUID (PK)     |
| userId    | FK → users.id |
| startTime | Timestamp     |
| endTime   | Timestamp     |

---

# 🔄 Session Handling

* A session is created on successful login
* The client must send `session-id` in request headers
* Session is validated on each protected request
* Session is deleted on logout

---

# 📌 Summary

This project demonstrates a clean and scalable implementation of:

* Stateful authentication
* Role-based access control (RBAC)
* Middleware-driven security
* Dockerized PostgreSQL setup
* Structured controller architecture

---
