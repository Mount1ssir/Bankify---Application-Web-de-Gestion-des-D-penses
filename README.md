# Bankify - Personal Finance Tracker

Bankify is a full-stack web application designed to help users take control of their finances. It allows users to register personal accounts, track daily income and expenses, manage customized spending categories, and visualize their cash flow using dynamic charts.

---

## 🌟 Key Features

- **Secure User Authentication**: Full user registration and login system. Each user's data is strictly isolated using JSON Web Tokens (JWT).
- **Interactive Dashboard**: Automatically calculates total income, total expenses, and current balance based on historical transactions.
- **Transaction Management**: Add income or expenses and view a chronologically sorted list of recent activity.
- **Custom Categories**: Users can dynamically add or remove their own customized categories for both Income and Expenses via an intuitive modal system.
- **Visual Analytics**: Interactive Donut Charts (spending by category) and Line Charts (cash flow over time) generated using Chart.js.

---

## 🏗️ Architecture & Technologies

The project is structured into two completely separate layers: the Frontend (Client) and the Backend (Server/Database).

### Frontend (Client-Side)
Located in the `/Root` directory. Built with pure, vanilla web technologies for lightning-fast performance without the overhead of heavy frameworks.
- **HTML5 & CSS3**: Custom responsive styling, CSS variables for design tokens, and smooth animations/modal overlays.
- **Vanilla JavaScript**: Handles DOM manipulation, form submissions, and asynchronous `fetch` calls to the API.
- **Chart.js**: Utilized for rendering the analytics charts on the Reports page.

### Backend (Server-Side)
Located in the `/backend` directory. A RESTful API built on the Node.js runtime.
- **Node.js & Express.js**: Handles API routing, middleware processing, and server logic.
- **MongoDB & Mongoose**: NoSQL database used to safely store `Users` and their `Transactions`.
- **Bcrypt.js & JWT**: Used for securely hashing user passwords and verifying session tokens to protect API routes.

---

## 📂 Project Structure

```text
project/
│
├── Root/                         # Frontend Files
│   ├── index.html                # Login and Registration Page
│   ├── dashboard.html            # Main dashboard overview
│   ├── add-transaction.html      # Form to add transactions and manage categories
│   ├── reports.html              # Chart.js visual analytics page
│   ├── style.css                 # Global stylesheets and UI components
│   └── app.js                    # Core frontend logic and API integration
│
└── backend/                      # Backend Files
    ├── package.json              # Node dependencies
    ├── server.js                 # Entry point for the Express server
    ├── models/
    │   ├── User.js               # Mongoose schema for user accounts & custom categories
    │   └── Transaction.js        # Mongoose schema for individual financial records
    └── routes/
        ├── auth.js               # API routes for login/register
        └── transactions.js       # API routes for CRUD operations on transactions
```

---

## 🚀 Setup & Installation

To run this project locally on your machine, you need **Node.js** and **MongoDB Community Server** installed.

### 1. Start the Database & Server
1. Ensure your local MongoDB instance is running (usually runs on port `27017`).
2. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install the required Node dependencies (only needed the first time):
   ```bash
   npm install
   ```
4. Start the Express server:
   ```bash
   node server.js
   ```
   *You should see a console message confirming the server is on port 5000 and MongoDB is connected.*

### 2. Launch the Frontend
1. Keep the terminal running in the background.
2. Navigate to the `Root` folder.
3. Open `index.html` in your web browser (you can double-click the file, or use the VS Code "Live Server" extension for a better experience).
4. Create an account and start tracking your finances!

---

## 🔗 API Routes Overview

**Auth (`/api/auth`)**
- `POST /register`: Create a new user account.
- `POST /login`: Authenticate and receive a JWT.

**Transactions (`/api/transactions`)** *Requires JWT*
- `GET /`: Retrieve all transactions for the logged-in user.
- `POST /`: Add a new transaction.
- `GET /categories`: Retrieve the user's custom income/expense categories.
- `POST /categories`: Add or remove a custom category from the user's account.
