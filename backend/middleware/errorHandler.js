const { validationResult } = require("express-validator");
const ErrorResponse = require("../utils/errorResponse");
const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV === "development") {
    console.error("Error Details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error("Production Error:", {
      message: err.message,
      name: err.name,
      path: req.path,
      method: req.method,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.code === 11000) {
    let message;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    if (field === "email") {
      message = "User with this email already exists";
    } else {
      message = `${field} '${value}' already exists`;
    }

    error = new ErrorResponse(message, 400);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((err) => err.message);
    const message = messages.join(", ");
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Access denied";
    error = new ErrorResponse(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please login again";
    error = new ErrorResponse(message, 401);
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File size too large";
    error = new ErrorResponse(message, 400);
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Too many files or unexpected field name";
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "MongooseError" || err.name === "MongoError") {
    const message = "Database connection error";
    error = new ErrorResponse(message, 500);
  }

  if (err.name === "TooManyRequests") {
    const message = "Too many requests. Please try again later";
    error = new ErrorResponse(message, 429);
  }

  if (err.message && err.message.includes("CORS")) {
    const message = "Cross-origin request blocked";
    error = new ErrorResponse(message, 403);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      error: {
        name: err.name,
        stack: err.stack,
        code: err.code,
      },
    }),
    requestId: req.id,
    timestamp: new Date().toISOString(),
  });
};

const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  const error = new ErrorResponse(message, 404);
  next(error);
};

const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const validationErrorHandler = (validationResult) => {
  return (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
};

const dbErrorLogger = (operation, collection) => {
  return (err, req, res, next) => {
    if (err) {
      console.error(
        `Database Error - Operation: ${operation}, Collection: ${collection}`,
        {
          error: err.message,
          requestId: req.id,
          userId: req.user?.id,
          timestamp: new Date().toISOString(),
        }
      );
    }
    next(err);
  };
};

const securityErrorHandler = (err, req, res, next) => {
  const securityErrors = [
    "JsonWebTokenError",
    "TokenExpiredError",
    "UnauthorizedError",
    "ForbiddenError",
  ];

  if (securityErrors.includes(err.name)) {
    console.warn("Security Error:", {
      error: err.name,
      message: err.message,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });

    if (!req.securityErrorCount) {
      req.securityErrorCount = 1;
    } else {
      req.securityErrorCount++;
    }

    if (req.securityErrorCount > 5) {
      console.warn("Possible attack detected:", {
        ip: req.ip,
        errorCount: req.securityErrorCount,
        requestId: req.id,
      });
    }
  }
  next(err);
};

const fileUploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message;
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File size too large";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files";
        break;
      case "LIMIT_FIELD_KEY":
        message = "Field name too long";
        break;
      case "LIMIT_FIELD_VALUE":
        message = "Field value too long";
        break;
      case "LIMIT_FIELD_COUNT":
        message = "Too many fields";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field";
        break;
      default:
        message = "File upload error";
    }

    return res.status(400).json({
      success: false,
      message,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });
  }

  next(err);
};

const formatErrorResponse = (error, req) => {
  const response = {
    success: false,
    message: error.message || "Internal Server Error",
    requestId: req.id,
    timestamp: new Date().toISOString(),
  };

  if (error.statusCode) {
    response.code = error.statusCode;
  }

  if (error.errors) {
    response.errors = error.errors;
  }

  if (process.env.NODE_ENV === "development") {
    response.debug = {
      name: error.name,
      stack: error.stack,
      path: req.path,
      method: req.method,
    };
  }

  return response;
};

const gracefulErrorRecovery = (err, req, res, next) => {
  if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
    console.warn("Connection error, attempting recovery:", err.message);

    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Please try again.",
      retry: true,
      retryAfter: 5000,
      requestId: req.id,
    });
  }
  next(err);
};

const errorRateLimit = new Map();

const trackErrorRate = (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const windowSize = 60 * 1000;
  const maxErrors = 10;

  if (!errorRateLimit.has(key)) {
    errorRateLimit.set(key, { count: 0, resetTime: now + windowSize });
  }

  const record = errorRateLimit.get(key);

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowSize;
  }

  record.count++;

  if (record.count > maxErrors) {
    return res.status(429).json({
      success: false,
      message: "Too many errors from this IP. Please try again later.",
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    });
  }
  next();
};

module.exports = {
  errorHandler,
  notFound,
  asyncErrorHandler,
  validationErrorHandler,
  dbErrorLogger,
  securityErrorHandler,
  fileUploadErrorHandler,
  formatErrorResponse,
  gracefulErrorRecovery,
  trackErrorRate,
};
