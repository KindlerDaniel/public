// backend/authservice/server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(cors());
app.use(express.json());

// JWT-Geheimnis (in Produktion aus ENV laden)
const JWT_SECRET = process.env.JWT_SECRET || "geheimeschluessel";

// DB-Verbindung
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: "postgres" }
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

// Token-Generator
function generateToken(user, roles = []) {
  const payload = { userId: user.id, email: user.email, roles: roles.map(r => r.name) };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// Router für Auth-Endpunkte (ohne Präfix)
const authRouter = express.Router();

// Registrierung
authRouter.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "E-Mail und Passwort erforderlich." });
  try {
    if (await User.findOne({ where: { email } })) {
      return res.status(409).json({ message: "E-Mail ist bereits vergeben." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    let role = await Role.findOne({ where: { name: "user" } });
    if (!role) role = await Role.create({ name: "user" });
    await user.addRole(role);
    const token = generateToken(user, [role]);
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Register-Fehler:", err);
    res.status(500).json({ message: "Registrierung fehlgeschlagen." });
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "E-Mail und Passwort erforderlich." });
  try {
    const user = await User.findOne({ where: { email }, include: Role });
    if (!user || user.isBlocked || !(await bcrypt.compare(password, user.passwordHash))) {
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

// Aktueller Nutzer
authRouter.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "Kein Token angegeben." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId, { include: Role });
    if (!user || user.isBlocked) return res.status(user ? 403 : 404).json({ message: user ? "Nutzer ist blockiert." : "Nutzer nicht gefunden." });
    const roles = await user.getRoles();
    res.json({ user: { id: user.id, email: user.email, roles: roles.map(r => r.name) } });
  } catch (err) {
    console.error("Me-Fehler:", err);
    res.status(401).json({ message: "Ungültiges Token." });
  }
});

// Mounting: unterstützt sowohl root- als auch /api/auth-Pfade
app.use("/", authRouter);
app.use("/api/auth", authRouter);

// Serverstart
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth-Service läuft auf Port ${PORT}`));
