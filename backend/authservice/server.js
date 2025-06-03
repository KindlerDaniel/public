const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(express.json());

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

// User-Model (Beispiel)
const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true },
  passwordHash: { type: DataTypes.STRING },
  isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Rolle-Model
const Role = sequelize.define("Role", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, unique: true },
});

// Junction-Tabelle User↔Role
User.belongsToMany(Role, { through: "UserRoles" });
Role.belongsToMany(User, { through: "UserRoles" });

// DB-Sync beim Start (nur dev, in prod eher Migrationen nutzen)
sequelize.sync();

// 1) Neuer Nutzer anlegen
app.post("/users", async (req, res) => {
  const { email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, passwordHash });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(400).json({ error: "E-Mail schon vergeben?" });
  }
});

// 2) Nutzer löschen
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  const deleted = await User.destroy({ where: { id } });
  if (deleted) res.sendStatus(204);
  else res.sendStatus(404);
});

// 3) Nutzer blockieren/unblockieren
app.patch("/users/:id/block", async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.sendStatus(404);
  user.isBlocked = true;
  await user.save();
  res.json({ id: user.id, isBlocked: user.isBlocked });
});

// 4) Rollen zurückgeben (alle oder zu einem User)
app.get("/roles", async (req, res) => {
  const roles = await Role.findAll();
  res.json(roles);
});
app.get("/users/:id/roles", async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id, { include: Role });
  if (!user) return res.sendStatus(404);
  res.json(user.Roles);
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth-Service läuft auf Port ${PORT}`);
});
