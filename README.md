 Core Features
👤 For Customers
Seamless Browsing: Filter books by category, search by keywords, and view detailed descriptions.
Modern Cart: Dynamic shopping cart with real-time price calculations.
Secure Checkout: Multi-step checkout process with order history tracking.
Wishlist: Save your favorites and share your reading list with friends.
Premium UI: Smooth animations, dark mode support, and responsive layouts.
🛠️ For Administrators
Analytics Dashboard: Real-time sales statistics and interactive data visualizations.
Catalog Management: Full control over books, categories, and inventory.
Order Handling: Manage customer orders and update tracking statuses instantly.
User Management: Monitor user accounts and manage permissions.
🛠️ Tech Stack
Frontend
Framework: React 19 + Vite
Styling: Tailwind CSS + Framer Motion
State: Context API
Icons: Lucide React
Charts: Recharts
Backend
Node.js: Express + TypeScript
Database: SQLite (via better-sqlite3)
Real-time: Socket.io
Security: JWT + Bcrypt
🚀 Getting Started
Prerequisites
Node.js (v18+)
Java 21 (Optional: only if using the Java backend)
Installation
Clone the repository:

bash
git clone [repository-url]
cd Modern-E-Commerece-for-Books
Install dependencies:

bash
npm install
Configure Environment: Create a 
.env
 file in the root directory:

env
JWT_SECRET=your_secret_key_here
Running the App
To start both the frontend and the Node.js backend simultaneously:

bash
npm run dev
The application will be available at http://localhost:3000.

📁 Project Structure
text
/
├── src/                # React frontend source
│   ├── components/     # UI components
│   ├── pages/          # Page layouts
│   └── context/        # State management
├── backend-java/       # Spring Boot backend source
├── server.ts           # Node.js backend & proxy
├── bookverse.db        # SQLite database
└── start-all.bat       # Production startup script
📄 License
This project is licensed under the MIT License - see the 
LICENSE
 file for details.


