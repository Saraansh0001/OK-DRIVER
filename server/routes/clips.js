const express = require("express");
const { buildMockClips } = require("../data/mockClips");

const router = express.Router();

router.get("/", (req, res) => {
  const date = req.query.date;
  const clips = buildMockClips(date);
  return res.json({ date: date || "2026-05-08", clips });
});

module.exports = router;
