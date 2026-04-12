import express from "express";
import { protect, requireSuperAdmin } from "../middleware/autMiddleware.js";
import {
  submitAppeal,
  getMyAppeals,
  getAllAppeals,
  reviewAppeal,
} from "../controllers/accountAppealController.js";

const router = express.Router();

// blocked user can submit without login
router.post("/submit", submitAppeal);

// logged in user can see own appeals
router.get("/my", protect, getMyAppeals);

// super admin
router.get("/all", protect, requireSuperAdmin, getAllAppeals);
router.patch("/:id/review", protect, requireSuperAdmin, reviewAppeal);

export default router;