import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("bookverse.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'USER',
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    description TEXT,
    image_url TEXT,
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_amount REAL,
    status TEXT DEFAULT 'Ordered',
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    book_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
  );
`);

// Seed initial category if empty
const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (catCount.count === 0) {
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Fiction");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Non-Fiction");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Science");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Technology");
}

// Seed admin if empty
const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'").get() as { count: number };
if (adminCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run("Admin", "admin@bookverse.com", hashedPassword, "ADMIN");
}

// Seed sample books if empty
const bookCount = db.prepare("SELECT COUNT(*) as count FROM books").get() as { count: number };
if (bookCount.count === 0) {
  const sampleBooks = [
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 15.99, stock: 10, description: "A classic novel set in the Roaring Twenties.", category_id: 1, image_url: "https://picsum.photos/seed/gatsby/600/800" },
    { title: "1984", author: "George Orwell", price: 12.50, stock: 5, description: "A dystopian social science fiction novel.", category_id: 1, image_url: "https://picsum.photos/seed/1984/600/800" },
    { title: "A Brief History of Time", author: "Stephen Hawking", price: 25.00, stock: 8, description: "A popular-science book on cosmology.", category_id: 3, image_url: "https://picsum.photos/seed/hawking/600/800" },
    { title: "Clean Code", author: "Robert C. Martin", price: 45.00, stock: 12, description: "A handbook of agile software craftsmanship.", category_id: 4, image_url: "https://picsum.photos/seed/cleancode/600/800" },
    { title: "Sapiens", author: "Yuval Noah Harari", price: 20.00, stock: 15, description: "A brief history of humankind.", category_id: 2, image_url: "https://picsum.photos/seed/sapiens/600/800" }
  ];
  const insertBook = db.prepare("INSERT INTO books (title, author, price, stock, description, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
  sampleBooks.forEach(b => insertBook.run(b.title, b.author, b.price, b.stock, b.description, b.category_id, b.image_url));
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  app.use(express.json());

  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

  // Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)").run(name, email, hashedPassword, phone);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  });

  // Books Routes
  app.get("/api/books", (req, res) => {
    const books = db.prepare(`
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id
    `).all();
    res.json(books);
  });

  app.post("/api/books", authenticate, isAdmin, (req, res) => {
    const { title, author, price, stock, description, image_url, category_id } = req.body;
    const result = db.prepare("INSERT INTO books (title, author, price, stock, description, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)").run(title, author, price, stock, description, image_url, category_id);
    io.emit("stock_update", { bookId: result.lastInsertRowid, stock });
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/books/:id", authenticate, isAdmin, (req, res) => {
    const { title, author, price, stock, description, image_url, category_id } = req.body;
    db.prepare("UPDATE books SET title=?, author=?, price=?, stock=?, description=?, image_url=?, category_id=? WHERE id=?").run(title, author, price, stock, description, image_url, category_id, req.params.id);
    io.emit("stock_update", { bookId: req.params.id, stock });
    res.json({ success: true });
  });

  app.delete("/api/books/:id", authenticate, isAdmin, (req, res) => {
    db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Categories
  app.get("/api/categories", (req, res) => {
    res.json(db.prepare("SELECT * FROM categories").all());
  });

  app.post("/api/categories", authenticate, isAdmin, (req, res) => {
    const result = db.prepare("INSERT INTO categories (name) VALUES (?)").run(req.body.name);
    res.json({ id: result.lastInsertRowid });
  });

  // Cart
  app.get("/api/cart", authenticate, (req: any, res) => {
    const items = db.prepare(`
      SELECT c.*, b.title, b.price, b.image_url, b.stock
      FROM cart c
      JOIN books b ON c.book_id = b.id
      WHERE c.user_id = ?
    `).all(req.user.id);
    res.json(items);
  });

  app.post("/api/cart", authenticate, (req: any, res) => {
    const { book_id, quantity } = req.body;
    const existing = db.prepare("SELECT * FROM cart WHERE user_id = ? AND book_id = ?").get(req.user.id, book_id) as any;
    if (existing) {
      db.prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?").run(quantity, existing.id);
    } else {
      db.prepare("INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)").run(req.user.id, book_id, quantity);
    }
    res.json({ success: true });
  });

  app.put("/api/cart/:id", authenticate, (req: any, res) => {
    db.prepare("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?").run(req.body.quantity, req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.delete("/api/cart/:id", authenticate, (req: any, res) => {
    db.prepare("DELETE FROM cart WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // Orders
  app.post("/api/orders", authenticate, (req: any, res) => {
    const { total_amount, payment_method, items } = req.body;
    const transaction = db.transaction(() => {
      const orderResult = db.prepare("INSERT INTO orders (user_id, total_amount, payment_method) VALUES (?, ?, ?)").run(req.user.id, total_amount, payment_method);
      const orderId = orderResult.lastInsertRowid;

      for (const item of items) {
        db.prepare("INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)").run(orderId, item.book_id, item.quantity, item.price);
        db.prepare("UPDATE books SET stock = stock - ? WHERE id = ?").run(item.quantity, item.book_id);

        const newStock = (db.prepare("SELECT stock FROM books WHERE id = ?").get(item.book_id) as any).stock;
        io.emit("stock_update", { bookId: item.book_id, stock: newStock });
      }

      db.prepare("DELETE FROM cart WHERE user_id = ?").run(req.user.id);
      return orderId;
    });

    const orderId = transaction();
    io.emit("new_order", { orderId, userId: req.user.id });
    res.json({ orderId });
  });

  app.get("/api/orders", authenticate, (req: any, res) => {
    let orders;
    if (req.user.role === "ADMIN") {
      orders = db.prepare("SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY created_at DESC").all();
    } else {
      orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    }
    res.json(orders);
  });

  app.get("/api/orders/:id", authenticate, (req: any, res) => {
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id) as any;
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (req.user.role !== "ADMIN" && order.user_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const items = db.prepare(`
      SELECT oi.*, b.title, b.image_url
      FROM order_items oi
      JOIN books b ON oi.book_id = b.id
      WHERE oi.order_id = ?
    `).all(req.params.id);

    res.json({ ...order, items });
  });

  app.put("/api/orders/:id/status", authenticate, isAdmin, (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    const order = db.prepare("SELECT user_id FROM orders WHERE id = ?").get(req.params.id) as any;
    io.emit("order_status_update", { orderId: req.params.id, status, userId: order.user_id });
    res.json({ success: true });
  });

  // Admin Stats
  app.get("/api/admin/stats", authenticate, isAdmin, (req, res) => {
    const totalUsers = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;
    const totalBooks = (db.prepare("SELECT COUNT(*) as count FROM books").get() as any).count;
    const totalOrders = (db.prepare("SELECT COUNT(*) as count FROM orders").get() as any).count;
    const revenue = (db.prepare("SELECT SUM(total_amount) as sum FROM orders").get() as any).sum || 0;
    const lowStock = db.prepare("SELECT * FROM books WHERE stock < 5").all();

    const salesByDay = db.prepare(`
      SELECT date(created_at) as date, SUM(total_amount) as amount 
      FROM orders 
      GROUP BY date(created_at) 
      ORDER BY date LIMIT 7
    `).all();

    res.json({ totalUsers, totalBooks, totalOrders, revenue, lowStock, salesByDay });
  });

  app.put("/api/categories/:id", authenticate, isAdmin, (req, res) => {
    db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(req.body.name, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/categories/:id", authenticate, isAdmin, (req, res) => {
    try {
      db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: "Cannot delete category with associated books" });
    }
  });

  // User Management
  app.get("/api/admin/users", authenticate, isAdmin, (req, res) => {
    res.json(db.prepare("SELECT id, name, email, role, phone, created_at FROM users").all());
  });

  app.put("/api/admin/users/:id/role", authenticate, isAdmin, (req, res) => {
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(req.body.role, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/users/:id", authenticate, isAdmin, (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => console.log("Client disconnected"));
  });
}

startServer();
