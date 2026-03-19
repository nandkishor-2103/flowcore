import { ApiResponse } from "../utils/api-response.js";

// A simple health check controller to verify that the server is running
/*
async function healthCheck(req, res, next) {
    try {
        res.status(200).json(
            new ApiResponse(200, { message: "Server is running" }),
        );
    } catch (error) {
        next(error);
    }
}
*/

// =============OR==============

// =============HEALTH CHECK CONTROLLER ==============
import { asyncHandler } from "../utils/async-handler.js";

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { message: "Server is running" }),
    );
});

export { healthCheck };
