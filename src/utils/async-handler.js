// A helper function to wrap async route handlers and middleware in Express.js (higher-order function that takes a request handler and returns a new function that handles errors)
function asyncHandler(requestHandler) {
    return function (req, res, next) {
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((err) =>next(err));
    };
}

export { asyncHandler };
