import express from "express";
import { protect } from "../middleware/autMiddleware.js";

const router = express.Router();

router.post("/suggest-resolution", protect, async (req, res) => {
  const { title, description } = req.body;

  // temporary response
  res.json({
    suggestion: `Check logs and restart service for issue: ${title}`
  });
});

export default router;
