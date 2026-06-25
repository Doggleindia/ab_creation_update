import AppError from "../utils/AppError.js";

// Centralized error handler so AppErrors (and unexpected errors) always return
// JSON instead of Express's default HTML 500 page.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalize common Mongoose/JWT errors into operational 4xx responses
  if (error.name === "CastError") {
    error = new AppError(`Invalid ${error.path}: ${error.value}`, 400);
  } else if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((e) => e.message)
      .join(", ");
    error = new AppError(message || "Validation failed", 400);
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    error = new AppError(`Duplicate value for ${field}`, 409);
  } else if (error.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401);
  } else if (error.name === "TokenExpiredError") {
    error = new AppError("Token expired", 401);
  } else if (error.name === "MulterError") {
    error = new AppError(error.message, 400);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  // Never leak internal error details/stack for non-operational 5xx errors
  const message =
    error.isOperational || statusCode < 500
      ? error.message
      : "Something went wrong";

  if (statusCode >= 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === "development" && !error.isOperational
      ? { stack: err.stack }
      : {}),
  });
};

export default errorHandler;
