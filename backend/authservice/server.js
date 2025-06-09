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
function generateToken(user, roles = [], isRefreshToken = false) {
  const payload = { 
    userId: user.id, 
    email: user.email, 
    roles: roles.map(r => r.name),
    tokenType: isRefreshToken ? 'refresh' : 'access'
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: isRefreshToken ? '7d' : '7m' 
  });
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
    const refreshToken = generateToken(user, roles, true);
    res.json({ token, refreshToken, user: { id: user.id, email: user.email } });
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

// In-memory token blacklist
const tokenBlacklist = new Set();

// Debug-Log beim Start
console.log('Auth-Service gestartet. Logout-Endpoint unter /logout und /api/auth/logout verfuegbar');

// Logout-Endpoint mit erweitertem Logging
authRouter.post('/logout', async (req, res) => {
  console.log('--- Neuer Logout-Request ---');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    console.log('Kein Token im Header');
    return res.sendStatus(204);
  }
  
  const token = authHeader.split(' ')[1];
  try {
    console.log('Verifiziere Token:', token.substring(0, 10) + '...');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('Fuege Token zur Blacklist hinzu');
    tokenBlacklist.add(token);
    
    if (req.body.refreshToken) {
      console.log('Fuege Refresh-Token zur Blacklist hinzu');
      tokenBlacklist.add(req.body.refreshToken);
    }
    
    console.log('Blacklist Groesse:', tokenBlacklist.size);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(200).json({ success: true });
  }
  
  console.log('--- Logout abgeschlossen ---');
});

// Refresh token endpoint
authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.tokenType !== 'refresh') {
      return res.status(403).json({ message: "Invalid token type" });
    }
    
    // Check if user still exists
    const user = await User.findByPk(decoded.userId, { include: Role });
    if (!user || user.isBlocked) {
      return res.status(401).json({ message: "User not found or blocked" });
    }
    
    // Generate new tokens (token rotation)
    const roles = await user.getRoles();
    const newAccessToken = generateToken(user, roles);
    const newRefreshToken = generateToken(user, roles, true);
    
    // Invalidate old refresh token
    tokenBlacklist.add(refreshToken);
    
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
    
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  
  const token = authHeader.split(' ')[1];
  try {
    if (tokenBlacklist.has(token)) return res.status(401).json({ message: "Token invalidated" });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Use verifyToken middleware for all routes except login and register
authRouter.use(verifyToken);

// Mounting: unterstützt sowohl root- als auch /api/auth-Pfade
app.use("/", authRouter);
app.use("/api/auth", authRouter);

// Serverstart
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth-Service läuft auf Port ${PORT}`));
