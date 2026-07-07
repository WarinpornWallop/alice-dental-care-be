# Alice Dental Care

Backend API for the Alice Dental Care booking system, built with Express and MongoDB (Mongoose). It provides authentication (including Google OAuth), dentist management, and appointment booking.

## Tech Stack

- Node.js / Express 4
- MongoDB with Mongoose
- Passport (Google OAuth 2.0) + JWT for authentication
- Nodemailer for transactional email (password reset)
- Security middleware: Helmet, express-mongo-sanitize, express-xss-sanitizer, hpp, express-rate-limit

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB instance (local or Atlas)

### Installation

```bash
npm install
```

### Configuration

Create a `config/config.env` file with the following variables:

```
PORT=5003
NODE_ENV=development

MONGO_URI=<your MongoDB connection string>

JWT_SECRET=<your JWT secret>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

GOOGLE_CLIENT_ID=<Google OAuth client id>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
GOOGLE_CALLBACK_URL=<Google OAuth callback URL>

GMAIL_USER=<gmail address used to send emails>
GMAIL_PASSWORD=<gmail app password>

RESET_PASSWORD_URL=<frontend URL that handles password reset links>
```

### Running the server

```bash
npm run dev
```

The API will start on `http://localhost:<PORT>` (default `5003`).

## API Overview

Base URL: `/api/v1`

### Auth (`/auth`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Log in with email/password | Public |
| POST | `/request-reset-password` | Request a password reset email | Public |
| POST | `/reset-password/:token` | Reset password using emailed token | Public |
| GET | `/me` | Get current user profile | Authenticated |
| PUT | `/me` | Update current user profile | Authenticated |
| GET | `/google` | Start Google OAuth login | Public |
| GET | `/google/callback` | Google OAuth callback | Public |
| GET | `/logout` | Log out current user | Public |

### Dentists (`/dentists`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/` | List all dentists | Public |
| POST | `/` | Create a dentist | Admin |
| GET | `/:id` | Get a single dentist | Public |
| PUT | `/:id` | Update a dentist | Admin |
| DELETE | `/:id` | Delete a dentist | Admin |
| GET/POST | `/:dentistId/bookings` | Bookings for a specific dentist | Authenticated |

### Bookings (`/bookings`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/` | List bookings | Authenticated |
| POST | `/` | Create a booking | Admin, User |
| GET | `/:id` | Get a single booking | Authenticated |
| PUT | `/:id` | Update a booking | Admin, User |
| DELETE | `/:id` | Delete a booking | Admin, User |

## Project Structure

```
config/       Environment config, database connection, passport strategy
controllers/  Route handler logic (auth, dentists, bookings)
middleware/   Auth/authorization middleware (JWT verification, role checks)
models/       Mongoose schemas (User, Dentist, Booking, ResetPasswordToken)
routes/       Express routers
service/      Supporting services (email sending, expertise helpers)
server.js     Application entry point
```

## Authentication

Most protected routes require a valid JWT, issued at login/registration and verified via the `protect` middleware. Role-based access (`admin` / `user`) is enforced with the `authorize` middleware. Google OAuth login is also supported via Passport.
