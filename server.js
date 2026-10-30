const express = require("express");
const path = require("path");
require("dotenv").config();
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/items", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const type = (req.query.type || "").trim();
    let sql = "SELECT * FROM items WHERE (item_name LIKE ? OR location LIKE OR description LIKE ?)";
    // Build safe parameterized query for optional filters.
    const searchLike = `%${search}%`;
    sql = "SELECT * FROM items WHERE (item_name LIKE ? OR location LIKE ? OR description LIKE ?)";
    const params = [searchLike, searchLike, searchLike];

    if (type === "Lost" || type === "Found") {
      sql += " AND item_type = ?";
      params.push(type);
    }
    sql += " ORDER BY created_at DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("GET /api/items:", error.message);
    res.status(500).json({ error: "Could not load items. Check your MySQL setup." });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const { item_name, item_type, location, item_date, description } = req.body;
    if (!item_name?.trim() || !["Lost", "Found"].includes(item_type) || !location?.trim()) {
      return res.status(400).json({ error: "Item name, type, and location are required." });
    }

    const [result] = await db.query(
      `INSERT INTO items (item_name, item_type, location, item_date, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        item_name.trim(),
        item_type,
        location.trim(),
        item_date || null,
        (description || "").trim()
      ]
    );

    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("POST /api/items:", error.message);
    res.status(500).json({ error: "Could not save item. Check your MySQL setup." });
  }
});

app.patch("/api/items/:id/return", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid item ID." });
    }
    const [result] = await db.query(
      "UPDATE items SET status = 'Returned' WHERE id = ?",
      [id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Item not found." });
    }
    res.json({ message: "Item marked as returned." });
  } catch (error) {
    console.error("PATCH /api/items/:id/return:", error.message);
    res.status(500).json({ error: "Could not update item status." });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`College Lost & Found Portal running at http://localhost:${PORT}`);
});