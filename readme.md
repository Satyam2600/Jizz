# JIZZ - Journey to Inspire, Connect, Zoom, and Zeal

JIZZ is a **college-exclusive social media platform** designed to enhance student interaction through a feature-rich and engaging experience. It provides a space for students to **connect, share, and grow** within their college community.

## 🚀 Features

### 🔹 **Core Functionalities**
- **User Authentication**: Secure login/signup with college email & OAuth.
- **Dynamic Home Feed**: Posts, likes, comments, and reactions.
- **User Profiles**: Customizable profiles with activity history.
- **Real-Time Messaging**: Chat system with WebSockets.
- **Groups & Events**: Create and join student groups & events.
- **Confession Box**: Anonymous sharing for students.
- **Gamification System**: Badges for participation & achievements.
- **Admin Moderation**: Reports, content management, and user control.
- **Dark Mode**: Toggle for better user experience.
- **Real-Time Notifications**: Instant updates on interactions.

## 🛠️ Tech Stack

### 🌐 **Frontend**
- **HTML, CSS, Bootstrap** → Responsive UI & styling.


### 🔙 **Backend**
- **Node.js & Express** → REST API development.
- **MongoDB** → Data storage (users, posts, messages, etc.).
- **WebSockets** → Real-time messaging & notifications.
- **OAuth & JWT** → Secure authentication.

### ☁️ **Deployment**
- **Frontend** → Vercel / Netlify.
- **Backend** → Render / AWS.
- **Database** → MongoDB Atlas.

## 📂 Project Structure

```plaintext
JIZZ/
│── backend/          # Node.js & Express server
│   ├── models/       # Database models (User, Post, Chat, etc.)
│   ├── routes/       # API endpoints
│   ├── controllers/  # Business logic
│   ├── config/       # Database & authentication config
│── frontend/         # React.js UI
│   ├── components/   # Reusable UI components
│   ├── pages/        # Main pages (Home, Profile, Chat, etc.)
│── public/           # Static assets
│── .env              # Environment variables
│── README.md         # Documentation
```

## ⚡ Installation & Setup

### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/yourusername/jizz.git
cd jizz
```

### 2️⃣ **Backend Setup**
```sh
cd backend
npm install
npm start
```

### 3️⃣ **Frontend Setup**
```sh
cd frontend
npm install
npm start
```

### 4️⃣ **Environment Variables** (`.env`)
```plaintext
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OAUTH_CLIENT_ID=your_oauth_client_id
```



---
🚀 **JIZZ: A social media platform built for students, by students.**
