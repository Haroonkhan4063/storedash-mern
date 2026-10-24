# StoreDash - Full-Stack E-Commerce & Analytics Dashboard 

StoreDash is a production-ready, full-stack e-commerce platform featuring a real-time admin analytics dashboard. Built with the MERN stack, it elevates standard e-commerce functionality with atomic stock reservations, advanced data visualizations, and a premium dark glassmorphism UI tailored for enterprise usability.

🌍 **Live Demo:** [https://storedash-mern-aqar.vercel.app/]

## ✨ Features
- **Real-time Analytics Dashboard:** KPI cards, interactive Recharts (line, bar, donut), and sortable data tables fed by complex MongoDB aggregations.
- **Atomic Stock Reservation:** Concurrency control ensures two customers can never buy the last item at the exact same time.
- **Enterprise-Grade Security:** Protected routes, JWT authentication, role-based access (strictly one admin), and an auto-clearing secure guest cart.
- **Dynamic Data Seeding:** Automated script populating 56 unique products (via Pexels API), 32 customers, and 300 historical orders for realistic chart trends.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Recharts, Context API.
- **Backend:** Node.js, Express.js, MongoDB, Mongoose.

## 🚀 How to Run Locally

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file and add your `MONGO_URI`, `JWT_SECRET`, `PORT`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
4. Seed the database with products and dummy orders: `npm run seed`
5. Start the server: `npm run dev`
6. The server will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a separate terminal and navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open the provided localhost link in your browser.

## 👨‍💻 Developer
Developed by **Muhammad Haroon Khan**
