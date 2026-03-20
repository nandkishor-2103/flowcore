import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// ================== Basic Middleware Configuration ==================
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// ================== CORS Configuration ==================
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.get("/", (req, res) => {
    res.send("Welcome to FlowCore API!");
});

// ================== Route Configuration ==================
import healthCheckRouter from "./routes/healtcheck.route.js";
import authRouter from "./routes/auth.route.js";;


// ================== Health Check Route ==================
app.use("/api/v1/healthcheck", healthCheckRouter);

// ================== Auth Routes ==================
app.use("/api/v1/auth", authRouter);

// ================== Global Error Handling Middleware ==================
app.use(errorHandler);
export default app;
