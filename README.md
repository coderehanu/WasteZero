# WasteZero — Enterprise Inventory Waste Prevention Platform

> **AI-Powered Inventory Optimization & Perishable Waste Reduction System**  
> *Transforming retail supply chains from reactive discard to proactive markdown, redistribution, and recovery.*

---

## 🌟 Overview

**WasteZero** is an enterprise-grade web platform engineered to eliminate retail and warehouse perishable waste through proactive lifecycle management. By continuously monitoring product shelf-life, batch velocities, and regional demand variances, WasteZero transforms perishable shrink into recovered revenue.

The system follows a strict **5-Phase Operational Pipeline**:
```
┌───────────┐      ┌───────────┐      ┌─────────────┐      ┌─────────┐      ┌───────────┐
│  DETECT   │ ───► │  ANALYZE  │ ───► │  RECOMMEND  │ ───► │   ACT   │ ───► │  MEASURE  │
│ Expiry &  │      │ Velocity  │      │ Markdowns & │      │ Dispatch│      │ ESG & P&L │
│ Inventory │      │ Risk Score│      │ Transfers   │      │ Orders  │      │ Analytics │
└───────────┘      └───────────┘      └─────────────┘      └─────────┘      └───────────┘
```

---

## 🚀 Key Modules & Capabilities

1. **Inventory Command Center**
   - Live KPI overview: Total SKUs Monitored, Critical Expiry Batches, Value at Risk, and Waste Diverted %.
   - Interactive visual analytics (Recharts) covering risk score distributions, expiry timelines, and category stock volume.

2. **Product & SKU Master**
   - Comprehensive catalog of retail SKUs spanning Fresh Dairy, Produce, Bakery, Meat & Seafood, and Pantry.
   - Real-time search, category filtering, unit economics (cost vs. retail price), and threshold settings.

3. **Batch Lifecycle & Expiry Tracking**
   - Precise batch-level traceability tracking manufactured dates, expiration dates, days remaining, and quantity on hand.
   - Dynamic badge color coding: Critical (≤ 7 days), At-Risk (8–15 days), Stable (> 15 days).

4. **Algorithmic Risk Engine**
   - Automated risk scoring engine evaluating shelf-life remaining against historical daily sales velocity.
   - Batch risk recalculation endpoint (`POST /api/risk-scores/calculate-all`) prioritizing immediate intervention.

5. **Inter-Warehouse Transfer Coordination**
   - Automated rebalancing recommendations moving inventory from slow-moving stores to high-demand hubs.
   - Status lifecycle workflow: `PENDING` ➔ `APPROVED` ➔ `IN_TRANSIT` ➔ `COMPLETED`.

6. **Dynamic Markdown Campaigns**
   - Algorithmic clearance discount schedules (10% to 50%) initiated ahead of expiration to maximize sell-through.
   - Campaign tracking from launch to conclusion with recovered margin metrics.

7. **Proactive Alerts & Notifications**
   - High-priority threshold alerts notifying inventory teams of impending batch write-offs.
   - Real-time resolution acknowledgment and audit trails.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router |
| **Styling & UI** | Luxury Dark Obsidian/Emerald Theme, Light Mode switcher, Custom Micro-interactions |
| **Backend** | Spring Boot 3.x, Java 17+, Spring Data JPA, Hibernate, Maven Wrapper |
| **Database** | MySQL 8.0, InnoDB relational schema with foreign key integrity |
| **APIs** | RESTful JSON endpoints with global CORS Filter and Vite reverse proxy |

---

## 📂 Repository Structure

```
├── backend/                     # Spring Boot Application
│   ├── src/main/java/com/wastezero/wastezero/
│   │   ├── controller/          # REST API Controllers (Products, Batches, Risks, Transfers, etc.)
│   │   ├── model/               # JPA Entities
│   │   ├── repository/          # Spring Data Repositories
│   │   ├── service/             # Business Logic & Risk Calculation
│   │   └── CorsConfig.java      # Global CORS configuration
│   ├── src/main/resources/      # application.properties
│   ├── mvnw / mvnw.cmd          # Maven Wrapper scripts
│   └── pom.xml                  # Maven dependencies
│
├── frontend/                    # React + Vite Application
│   ├── src/
│   │   ├── api/api.js           # Centralized Axios API client
│   │   ├── components/          # Enterprise UI Views & Navigation
│   │   ├── App.jsx              # Application Shell & Tab Router
│   │   ├── App.css              # Obsidian Emerald Theme & Glassmorphism styles
│   │   └── main.jsx             # Entry point wrapped in BrowserRouter
│   ├── package.json             # NPM package scripts & dependencies
│   └── vite.config.js           # Vite dev server with /api proxy
│
├── database/                    # SQL Schema & Seed Data
│   └── schema_and_seed.sql      # Complete database dump with sample products, batches, and records
│
├── .gitignore                   # Standard Git exclusions for Java and Node
└── README.md                    # Project documentation
```

---

## ⚙️ Quick Start & Setup Guide

### 1. Database Setup (MySQL)
1. Ensure MySQL Server 8.0+ is running.
2. Create the database:
   ```sql
   CREATE DATABASE wastezero;
   ```
3. Import the complete schema and seed data:
   ```bash
   mysql -u root -p wastezero < database/schema_and_seed.sql
   ```

### 2. Backend Setup (Spring Boot)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Verify MySQL credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/wastezero?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=root
   ```
3. Run the backend service:
   ```bash
   # Windows
   .\mvnw.cmd spring-boot:run

   # Linux/macOS
   ./mvnw spring-boot:run
   ```
   *The backend will be live at `http://localhost:8080`.*

### 3. Frontend Setup (React + Vite)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web client will be live at `http://localhost:5173`.*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve all master SKUs and categories |
| `POST` | `/api/products` | Create a new product SKU |
| `GET` | `/api/batches` | List inventory batches with expiration metadata |
| `POST` | `/api/batches` | Register a new batch |
| `GET` | `/api/risk-scores` | Fetch calculated risk scores for all batches |
| `POST` | `/api/risk-scores/calculate-all` | Trigger bulk algorithmic risk evaluation |
| `GET` | `/api/warehouses` | List warehouses and storage facilities |
| `GET` | `/api/warehouse-transfers` | List inter-warehouse transfers |
| `PUT` | `/api/warehouse-transfers/{id}/status` | Update transfer state (`PENDING` -> `APPROVED` -> `COMPLETED`) |
| `GET` | `/api/markdown-campaigns` | List active markdown discount campaigns |
| `POST` | `/api/markdown-campaigns` | Launch a new discount campaign |
| `GET` | `/api/alerts` | Retrieve active expiry alerts |

---

## 👥 Authors & Acknowledgments

- **Lead Developer**: [codrehanu](https://github.com/codrehanu)
- Developed with Spring Boot, React, and MySQL.
