# Stateful Authentication

## Overview

This application is built using Express and implements:

- User registration
- User login & logout
- Session-based authentication
- Role-based authorization
- Admin-only routes
- PostgreSQL database (via Docker)
- Drizzle ORM for database queries

The server runs on:

```

PORT = process.env.PORT ?? 8000

```

---

# Database

PostgreSQL is configured using Docker.

## Docker Service

- Image: `postgres:17.4`
- Container Name: `postgres_db`
- Port: `5432:5432`
- Volume: `db_data:/var/lib/postgresql/data`

## Volume

```

db_data:

````

Docker is used to spin up the PostgreSQL database.

---

# Test Route

## GET `/test-route`

**Response**
```json
{
  "Status": "OK",
  "Message": "All good app is up and running."
}
````

---

# Routes

## User Routes (`/user`)

### POST `/user/auth/register`

Middleware:

* `authenticateUser`

Controller:

* `registerUser`

**Body**

* `firstName` (required)
* `lastName`
* `email` (required)
* `password` (required)

**Responses**

* `400` → Missing Credentials
* `409` → User already exists
* `201` → User created successfully
* `500` → Internal Server Error

---

### POST `/user/auth/login`

Middleware:

* `authenticateUser`

Controller:

* `userLogin`

**Body**

* `email` (required)
* `password` (required)

**Responses**

* `400` → Missing Credentials
* `404` → User not found
* `401` → Invalid password
* `200` → Session created (returns Session Id)
* `500` → Internal Server Error

---

### DELETE `/user/auth/logout`

Middleware:

* `authenticateUser`

Controller:

* `userLogout`

**Headers**

* `session-id`

**Responses**

* `403` → Invalid Session-Id
* `200` → User logged out successfully

---

### GET `/user/auth/me`

Middleware:

* `authenticateUser`

Controller:

* `getMyDetails`

**Headers**

* `session-id`

**Responses**

* `403` → Invalid Session-Id
* `200` → Returns authenticated user data

---

## Authenticated Route

### GET `/profile`

Middleware:

* `authenticateUser`
* `isAuthenticated`

Controller:

* `getUserProfile`

**Body**

* `userId` (required)

**Behavior**

* Returns selected user profile fields.
* If the profile belongs to an `ADMIN`, access is forbidden.

**Responses**

* `400` → Missing Credentials
* `403` → Access Forbidden
* `200` → User profile returned

---

## Admin Routes (`/admin`)

All admin routes require:

* `authenticateUser`
* `isAuthenticated`
* `isAuthorized('ADMIN')`

---

### GET `/admin/users`

Controller:

* `getAllUsers`

**Response**

* `200` → Returns all users (firstName, lastName, email, role)

---

### POST `/admin/create-user`

Controller:

* `createUser`

**Body**

* `firstName` (required)
* `lastName`
* `email` (required)
* `password` (required)

**Responses**

* `400` → Missing Credentials
* `409` → User already exists
* `201` → User created successfully

---

# Middlewares

## `authenticateUser`

* Reads `session-id` from request headers.
* Validates UUID format.
* Fetches session and user information from the database.
* Attaches user data to `req.user`.

**Responses**

* `403` → Invalid Session-ID
* `500` → Internal Server Error

If no `session-id` is provided, the request continues without authentication.

---

## `isAuthenticated`

* Checks if `req.user` exists.

**Response**

* `403` → User Not Logged In

---

## `isAuthorized(role)`

* Compares `req.user.role` with the required role.

**Response**

* `401` → User Not Authorized

---

# Controllers

## User Controller

* `registerUser`
* `userLogin`
* `userLogout`
* `getMyDetails`

Handles:

* Password hashing using `crypto` (HMAC SHA256 with salt)
* Session creation on login
* Session deletion on logout
* Returning authenticated user data

---

## Admin Controller

* `getAllUsers`
* `createUser`

Handles:

* Fetching all users
* Creating users with hashed passwords

---

## Authenticated Controller

* `getUserProfile`

Handles:

* Fetching user profile by `userId`
* Blocking access to admin profiles

---

# Database Models

## `userTable` (users)

Columns:

* `id` (UUID, primary key)
* `firstName`
* `lastName`
* `email` (unique)
* `role` (`ADMIN`, `MODERATOR`, `USER`) — default `USER`
* `password`
* `salt`
* `createAt`
* `updatedAt`

---

## `userSessions` (user sessions)

Columns:

* `id` (UUID, primary key)
* `userId` (references `users.id`)
* `startTime`
* `endTime`

---

# Session Handling

* A session is created on successful login.
* The client must send `session-id` in request headers.
* The session is validated on each protected request.
* The session is deleted on logout.

