const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const clipsRoutes = require("./routes/clips");
const verifyJWT = require("./middleware/verifyJWT");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment.");
}

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/clips", verifyJWT, clipsRoutes);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Dashcam API listening on http://localhost:${PORT}`);
});
