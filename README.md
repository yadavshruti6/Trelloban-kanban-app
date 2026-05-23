# 🚀 Trelloban — Modern Kanban Workspace

<div align="center">

![Trelloban Banner](https://img.shields.io/badge/Trelloban-Kanban%20Workspace-0f172a?style=for-the-badge)

A production-grade Trello-style Kanban workspace built with modern full-stack technologies.

### ⚡ Built for productivity, scalability, and recruiter-grade presentation.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-000000?style=for-the-badge)](https://clinquant-starship-7b9d1d.netlify.app)
[![Backend API](https://img.shields.io/badge/⚙️_Backend_API-1f2937?style=for-the-badge)](https://trelloban-api.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/📦_GitHub_Repository-181717?style=for-the-badge\&logo=github)](https://github.com/yadavshruti6/Trelloban-kanban-app)

</div>

---

# ✨ Overview

**Trelloban** is a modern Trello-inspired Kanban project management platform designed with a production-grade architecture and responsive UI.

It provides a seamless drag-and-drop task management experience with persistent MySQL storage, smooth animations, optimistic updates, and scalable monorepo architecture.

---

# 🎯 Recruiter Highlights

✅ Full-stack production-ready application
✅ Monorepo architecture using workspaces
✅ Modern Next.js 14 App Router architecture
✅ Prisma ORM + MySQL persistence
✅ Real-time-feeling optimistic UI updates
✅ Drag-and-drop Kanban interactions
✅ Responsive professional UI
✅ Backend API deployment on Render
✅ Frontend deployment on Netlify
✅ State management using Zustand
✅ Type-safe TypeScript codebase

---

# 🛠️ Tech Stack

## Frontend

* Next.js 14
* TypeScript
* Tailwind CSS
* Framer Motion
* Zustand
* dnd-kit

## Backend

* Express.js
* Prisma ORM
* MySQL
* REST API Architecture

## Deployment

* Netlify (Frontend)
* Render (Backend API)

---

# 📸 Screenshots

## Kanban Board
![Kanban Board](./assets/kanban-board.png)

## Drag & Drop
![Drag and Drop](./assets/drag-drop.png)

## Card Details
![Card Details](./assets/card-details.png)

## Responsive UI
![Responsive UI](./assets/responsive-ui.png)

## Search & Filter
![Search Filter](./assets/search-filter.png)

# 🌐 Live Deployment

## Frontend

🔗 [https://clinquant-starship-7b9d1d.netlify.app](https://clinquant-starship-7b9d1d.netlify.app)

## Backend API

🔗 [https://trelloban-api.onrender.com](https://trelloban-api.onrender.com)

## GitHub Repository

🔗 [https://github.com/yadavshruti6/Trelloban-kanban-app](https://github.com/yadavshruti6/Trelloban-kanban-app)

---

# ⚡ Features

## ✅ Workspace Management

* Create and manage boards
* Multiple lists support
* Dynamic card organization

## ✅ Drag & Drop System

* Smooth Kanban interactions
* Real-time-feeling optimistic updates
* dnd-kit powered drag-and-drop

## ✅ Card Management

* Add/Edit/Delete cards
* Labels support
* Members assignment
* Attachments
* Comments
* Activity tracking

## ✅ Checklist System

* Task checklist items
* Progress tracking

## ✅ Persistent Database

* MySQL-backed persistence
* Prisma ORM integration
* Board hydration from API

## ✅ Responsive Design

* Mobile-friendly layout
* Tablet optimization
* Modern desktop experience

---

# 🧠 Why Trelloban?

Trelloban was built to simulate a real-world scalable Kanban collaboration platform while showcasing modern full-stack engineering practices.

This project demonstrates:

* Monorepo scalability
* Backend API architecture
* Database modeling
* State synchronization
* Advanced frontend interactions
* Production deployment workflows

---

# 🏗️ Monorepo Architecture

```txt
Trelloban/
│
├── apps/
│   ├── web/        → Next.js Frontend
│   └── api/        → Express Backend API
│
├── netlify.toml
├── package.json
├── tsconfig.base.json
└── README.md
```

---

# ⚙️ System Architecture

```txt
┌────────────────────┐
│   Next.js Frontend │
│  (Netlify Deploy)  │
└─────────┬──────────┘
          │ REST API Calls
          ▼
┌────────────────────┐
│   Express Backend  │
│   (Render Deploy)  │
└─────────┬──────────┘
          │ Prisma ORM
          ▼
┌────────────────────┐
│      MySQL DB      │
└────────────────────┘
```

---

# 🗄️ Database Schema Overview

The application persists the complete board graph including:

* Boards
* Lists
* Cards
* Labels
* Members
* Card-Member Relations
* Checklist Items
* Attachments
* Comments
* Activities

Prisma manages schema generation and database migrations.

---

# 📂 Folder Structure

```txt
apps/
├── api/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── prisma/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│
├── web/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   └── utils/
```

---

# 🚀 Local Development Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yadavshruti6/Trelloban-kanban-app.git

cd Trelloban-kanban-app
```

---

# 📦 Install Dependencies

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file in the root directory.

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/trelloban"

NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

# 🛢️ Prisma Setup

## Generate Prisma Client

```bash
npm run prisma:generate --workspace apps/api
```

## Run Migrations

```bash
npm run prisma:migrate --workspace apps/api
```

## Seed Database

```bash
npm run seed
```

---

# ▶️ Start Development Servers

```bash
npm run dev
```

This runs:

* Frontend → Next.js
* Backend → Express API

simultaneously.

---

# 🔎 Verification

```bash
npx tsc -p apps/web/tsconfig.json --noEmit --ignoreDeprecations 5.0

npm run build --workspace apps/api
```

---

# ☁️ Deployment

## Frontend Deployment

Deployed using **Netlify**.

### Production URL

[https://clinquant-starship-7b9d1d.netlify.app](https://clinquant-starship-7b9d1d.netlify.app)

---

## Backend Deployment

Deployed using **Render**.

### API URL

[https://trelloban-api.onrender.com](https://trelloban-api.onrender.com)

---

# 🔌 API Architecture

The backend follows a service-based modular architecture.

## Structure

```txt
Controller → Service → Prisma → MySQL
```

## API Responsibilities

* Board hydration
* CRUD operations
* Drag-drop synchronization
* Checklist updates
* Member assignment
* Activity logging

---

# 📈 Future Improvements

* Real-time collaboration using WebSockets
* Team workspaces
* Notifications system
* Calendar integration
* File storage optimization
* Role-based permissions
* Dark mode improvements
* AI-powered productivity tools

---

# 🤝 Contributing

Contributions are welcome.

## Steps

1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to your branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

## Shruti Yadav

* GitHub: [https://github.com/yadavshruti6](https://github.com/yadavshruti6)
* Repository: [https://github.com/yadavshruti6/Trelloban-kanban-app](https://github.com/yadavshruti6/Trelloban-kanban-app)

---

# ⭐ Support

If you found this project useful, consider giving it a star on GitHub ⭐

---

<div align="center">

### 🚀 Built with passion, modern engineering practices, and full-stack scalability.

</div>
