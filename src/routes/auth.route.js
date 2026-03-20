import { Router } from "express";
import {registerUser} from "../controllers/auth.controller.js";

const router = Router();

// ================== Auth Routes ==================
/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.route("/register").post(registerUser);


export default router;
