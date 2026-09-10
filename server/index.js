const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("node:path");

const authRoutes = require("./routes/auth").router;
const appRoutes = require("./routes/app");
const adminRoutes = require("./routes/admin");
const personalTasksRoutes = require("./routes/personalTasks").router;
const personalTasksAdminRoutes = require("./routes/personalTasksAdmin");

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "..", "dist");

app.use(express.json({ limit: "6mb" })); // allows base64-encoded product photo uploads
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api", appRoutes);
app.use("/api", personalTasksRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", personalTasksAdminRoutes);

// Serve the built frontend (production).
app.use(express.static(distPath));

// SPA fallback — anything not matched above (and not /api/*) serves index.html.
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Sales Quest API + frontend listening on port ${port}`);
});
