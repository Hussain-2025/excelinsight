# Excel Insight — Full-Stack AI Enterprise Spreadsheet Analytics Platform

Excel Insight is a modern, enterprise-grade Business Intelligence (BI) and Excel Analytics web application built on the **MERN** stack (MongoDB, Express, Vanilla JS / HTML5, Node.js) with **Google Gemini 3.8 Flash AI** and **Three.js 3D WebGL** visualizations.

## 🚀 Key Features

- **🗣️ Natural Language Query (NLQ) Chat with Data:** Ask plain-English questions about your spreadsheet; Gemini answers and provides one-click visual chart recommendations.
- **🌟 Three.js 3D Column Grid Visualizer:** Interactive WebGL 3D bar scene with dynamic heights, lighting, shadows, and smooth 360° orbital animation.
- **📊 2D Chart Studio:** Bar, Line, Area trends, Doughnut, Pie, Scatter Plots, and Radar Matrix with customizable aggregations (Sum, Avg, Count, Max, Min).
- **🧮 Interactive Formula Bar (x):** Native spreadsheet calculation bar supporting =SUM(), =AVERAGE(), =COUNT(), and custom arithmetic expressions.
- **⚖️ Dual-Sheet & Revision Diff Engine:** Side-by-side comparison engine highlighting added, removed, and modified cells with delta tooltips.
- **🚨 Statistical Machine Learning Outlier Detector:** Automated Z-score ($|Z| \ge 2.0$) and Tukey's Interquartile Range (.5 \times IQR$) detection with boundary clamping.
- **🔐 JWT-Based Authentication & Role Governance:** User and Admin authorization, token persistence, and dedicated Admin Control Panel.
- **📂 Cloud Upload History:** Real-time persistence of parsed datasets in MongoDB Atlas.
- **📥 One-Click PDF Report Export:** Integrated jsPDF + html2canvas generating executive PDF reports with metadata, chart snapshots, and AI insights.
- **✏️ Inline Cell Editing:** Double-click any data grid cell to modify values live with automatic column re-profiling and KPI recalculation.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Modern CSS, Tailwind CSS (CDN), Lucide Icons, SheetJS (xlsx), Chart.js 4, Three.js (r128), jsPDF, html2canvas
- **Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose), JSON Web Tokens (JWT), bcryptjs, CORS, Dotenv
- **AI Engine:** Google Gemini 3.8 Flash API

## 🏃 Quick Start Guide

### 1. Clone the repository
`ash
git clone https://github.com/Hussain-2025/excelinsight.git
cd excelinsight
`

### 2. Configure Backend Environment
Create a .env file in the server directory (reference server/.env.example):
`env
PORT=5050
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=*
`

### 3. Install and Run Backend
`ash
cd server
npm install
node server.js
`
The API server will run at http://localhost:5050.

### 4. Run Frontend
Open index.html directly in your browser or run a local static server:
`ash
npx http-server . -p 8080
`
Visit http://localhost:8080.
