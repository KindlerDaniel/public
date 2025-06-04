// backend/authservice/server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(cors());
app.use(express.json());

// JWT-Geheimnis (in Produktion unbedingt aus env-Variablen laden!)
const JWT_SECRET = process.env.JWT_SECRET || "geheimeschluessel";

// Verbindung zur Postgres-DB
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
  }
);

// Models
const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Role = sequelize.define("Role", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
});

User.belongsToMany(Role, { through: "UserRoles" });
Role.belongsToMany(User, { through: "UserRoles" });

sequelize.sync();

// Hilfsfunktion: erzeugt JWT für einen User
function generateToken(user, roles = []) {
  const payload = {
    userId: user.id,
    email: user.email,
    roles: roles.map(r => r.name),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// Route: Registrierung (Register)
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "E-Mail und Passwort erforderlich." });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "E-Mail ist bereits vergeben." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    // Standard-Rolle „user“ vergeben (falls noch nicht vorhanden)
    let role = await Role.findOne({ where: { name: "user" } });
    if (!role) {
      role = await Role.create({ name: "user" });
    }
    await user.addRole(role);

    const token = generateToken(user, [role]);
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Register-Fehler:", err);
    res.status(500).json({ message: "Registrierung fehlgeschlagen." });
  }
});

// Route: Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "E-Mail und Passwort erforderlich." });
  }

  try {
    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) {
      return res.status(401).json({ message: "Ungültige Anmeldedaten." });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Nutzer ist blockiert." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Ungültige Anmeldedaten." });
    }

    const roles = await user.getRoles();
    const token = generateToken(user, roles);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Login-Fehler:", err);
    res.status(500).json({ message: "Login fehlgeschlagen." });
  }
});

// Route: Aktuellen Nutzer aus Token ermitteln
app.get("/api/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Kein Token angegeben." });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId, { include: Role });
    if (!user) {
      return res.status(404).json({ message: "Nutzer nicht gefunden." });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Nutzer ist blockiert." });
    }
    const roles = await user.getRoles();
    res.json({ user: { id: user.id, email: user.email, roles: roles.map(r => r.name) } });
  } catch (err) {
    console.error("Me-Fehler:", err);
    return res.status(401).json({ message: "Ungültiges Token." });
  }
});

// Bestehende User-/Rollen-Routen (optional, um intern weiterzuverwenden)
app.post("/users", async (req, res) => {
  // ... eventuell nicht mehr nötig, weil /api/auth/register das abdeckt
  res.status(404).json({ message: "Nicht gefunden." });
});

app.delete("/users/:id", async (req, res) => {
  // user löschen logic…
  res.status(404).json({ message: "Nicht gefunden." });
});

app.patch("/users/:id/block", async (req, res) => {
  // user blockieren logic…
  res.status(404).json({ message: "Nicht gefunden." });
});

app.get("/roles", async (req, res) => {
  // alle Rollen zurückgeben…
  const roles = await Role.findAll();
  res.json(roles);
});
app.get("/users/:id/roles", async (req, res) => {
  // Rollen für einen User zurückgeben…
  const user = await User.findByPk(req.params.id, { include: Role });
  if (!user) return res.sendStatus(404);
  res.json(user.Roles);
});

// Server starten
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth-Service läuft auf Port ${PORT}`);
});
