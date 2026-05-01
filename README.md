# Team Task Manager — Full-Stack MERN App

A production-ready team task management web application built with the MERN stack (MongoDB, Express, React, Node.js).

---

## 📁 Folder Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, me
│   │   ├── projectController.js   # CRUD + member management
│   │   ├── taskController.js      # CRUD + my tasks
│   │   └── userController.js      # List all users (admin)
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + adminOnly
│   │   └── errorHandler.js        # Global error handler
│   ├── models/
│   │   ├── User.js                # name, email, password, role
│   │   ├── Project.js             # name, description, members, createdBy
│   │   └── Task.js                # title, description, status, assignedTo, project, dueDate
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance with JWT interceptor
    │   ├── components/
    │   │   ├── Layout.jsx         # Sidebar + nav shell
    │   │   ├── Modal.jsx          # Reusable modal
    │   │   └── TaskCard.jsx       # Task display + inline status update
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state, login, register, logout
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx  # My tasks + stats
    │   │   ├── ProjectsPage.jsx   # Projects list
    │   │   └── ProjectDetailPage.jsx # Tasks kanban + members
    │   ├── App.jsx                # Routes + protected route wrappers
    │   ├── main.jsx
    │   └── index.css              # Tailwind + custom component classes
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** — local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **npm** v8+

---

## 🚀 Setup Instructions

### 1. Clone / unzip the project

```bash
cd team-task-manager
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

> **MongoDB Atlas**: Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster.mongodb.net/team-task-manager`

Start the backend:

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

The Vite dev server proxies `/api/*` to `http://localhost:5000` automatically.

---

## 🔑 First-Time Use

1. Open **http://localhost:3000/register**
2. Create an **Admin** account (select "Admin" in the role dropdown)
3. Create **Member** accounts for your team
4. Log in as Admin → create projects → add members → create tasks

---

## 🌐 REST API Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Current user |

### Projects
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/projects` | Private | List projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Private | Get project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/tasks/my` | Private | My tasks + stats |
| GET | `/api/projects/:projectId/tasks` | Private | Project tasks |
| POST | `/api/projects/:projectId/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Private* | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

> *Members can only update `status` of their own assigned tasks.

### Users
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/users` | Admin | List all users |

---

## 🔒 Role Permissions

| Feature | Admin | Member |
|---------|-------|--------|
| View own projects | ✅ | ✅ (assigned only) |
| Create/edit/delete projects | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Update any task | ✅ | ❌ |
| Update own task status | ✅ | ✅ |
| View all users | ✅ | ❌ |

---

## 📦 Dependencies

### Backend
```
express           — Web framework
mongoose          — MongoDB ODM
bcryptjs          — Password hashing
jsonwebtoken      — JWT auth
express-validator — Input validation
cors              — Cross-origin requests
dotenv            — Environment variables
nodemon           — Dev auto-restart (devDep)
```

### Frontend
```
react             — UI library
react-dom         — DOM rendering
react-router-dom  — Client-side routing
axios             — HTTP client
vite              — Build tool + dev server
tailwindcss       — Utility CSS
autoprefixer      — CSS vendor prefixes
postcss           — CSS processing
```

---

## 🛠 Build for Production

```bash
# Build frontend
cd frontend
npm run build        # outputs to frontend/dist/

# Serve with backend (add static serving to server.js)
cd ../backend
npm start
```

To serve the React build from Express, add to `server.js`:

```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```
