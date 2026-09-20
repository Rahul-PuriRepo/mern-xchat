# XChat — MERN Real-Time Chat Application

A full-stack real-time chat application built with the **MERN stack**, **Firebase Realtime Database**, and **JWT authentication**.

## 🚀 Features

- User registration and login
- JWT-based authentication
- HTTP-only authentication cookies
- User search
- One-to-one chat rooms
- Real-time messaging with Firebase Realtime Database
- Real-time typing indicator
- Persistent chat messages
- Logout functionality
- Protected backend APIs
- MongoDB database
- REST APIs with Express.js
- Responsive React frontend

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Firebase Realtime Database

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- Cookie Parser

## 🏗️ Architecture

```text
React + Vite
     │
     │ Axios / REST APIs
     ▼
Node.js + Express
     │
     ├── MongoDB
     │     └── Users & Chat Rooms
     │
     └── JWT Authentication

React
     │
     │ Firebase SDK
     ▼
Firebase Realtime Database
     ├── messages/{roomId}
     └── typing/{roomId}/{userId}
```
🔐 Authentication

Authentication is handled using JWT tokens stored in an HTTP-only cookie.

The backend provides:
```
POST /api/users/register
POST /api/users/login
GET /api/users/me
GET /api/users/logout
GET /api/users/search
```
Protected routes require a valid authentication cookie.

💬 Real-Time Messaging

Messages are stored in Firebase Realtime Database under:
```
messages/{roomId}
```
Each message contains:
```
{
  content,
  senderId,
  timestamp
}
```
The typing indicator is stored under:
```
typing/{roomId}/{userId}
```
Firebase listeners allow messages and typing status to update in real time without refreshing the page.

🧪 Testing

The project includes Cypress end-to-end tests covering both backend and frontend functionality.

Test Results
Backend: 8/8 passing
Frontend: 14/14 passing
Total: 22/22 passing ✅

The tests cover:

Registration
Duplicate registration
Login
Invalid credentials
Profile retrieval
User search
Chat-room initialization
Chat-room retrieval
Logout
Chat layout
User search UI
Sending messages
Message persistence
Receiving messages after login
📁 Project Structure
ME_MERN_XCHAT/
│
├── assessment/
│   └── cypress/
│
├── client/
│   ├── src/
│   ├── .env
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── package.json
│
├── cypress/
│   └── support/
│
├── cypress.config.js
├── .gitignore
└── README.md


⚙️ Running Locally
1. Clone the repository
```
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ME_MERN_XCHAT
```

2. Install backend dependencies
```
cd server
npm install
```
3. Start the backend
```
npm start
```
The backend runs on:
```
http://localhost:5000
```
4. Install frontend dependencies

Open another terminal:
```
cd client
npm install
```
5. Start the frontend
```
npm run dev
```
The frontend runs on:
```
http://localhost:3000
```
🔑 Environment Variables

The project uses environment variables for sensitive configuration.

Server
```
MONGO_URI=
JWT_SECRET=
PORT=
```
Client

Firebase configuration is provided through Vite environment variables:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```
Environment files are excluded from Git using .gitignore.

🎯 Project Highlights

This project demonstrates full-stack development across:

React frontend development
REST API design
Express.js backend development
MongoDB/Mongoose data modeling
JWT authentication
HTTP-only cookies
Firebase Realtime Database
Real-time event listeners
Real-time typing indicators
Cypress end-to-end testing
Frontend/backend integration

Built as part of the Crio Full Stack Advanced Program.
