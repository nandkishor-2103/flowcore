import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router = Router();

// ==============HEALTH CHECK ROUTES ==============
/**
 * @route GET /api/v1/healthcheck
 * @desc Check if the server is running
 * @access Public
 */
router.route("/").get(healthCheck);

export default router;
