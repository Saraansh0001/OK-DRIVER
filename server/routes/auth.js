const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const DEMO_USER = {
  id: "demo-user-01",
  email: "demo@okdriver.in",
  password: "12345678",
  fleetId: "fleet-okdriver-demo",
  role: "fleet_admin",
};

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
    return res.status(401).json({ message: "Invalid login credentials." });
  }

  const token = jwt.sign(
    { sub: DEMO_USER.id, email: DEMO_USER.email, role: DEMO_USER.role, fleetId: DEMO_USER.fleetId },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  return res.json({
    token,
    user: {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      role: DEMO_USER.role,
      fleetId: DEMO_USER.fleetId,
    },
  });
});

module.exports = router;
