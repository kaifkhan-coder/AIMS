import express from "express";
import Ticket from "../models/Ticket.js";
import { protect } from "../middleware/autMiddleware.js";

const router = express.Router();
