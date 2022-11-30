const AppError = require("../utils/appError");

const handleCastErrorDb = function (err) {
  const msg = `you have an invalid ${err.path} with a value of ${err.value}`;
  return new AppError(msg, 400);
};

const handleDuplicateFieldsDb = function () {
  const msg = `Duplicate field detected please use another value`;

  return new AppError(msg, 400);
};

const handleValidationErrorDb = function (error) {
  const check = error.message.split(":");
  const msg = check[check.length - 1];
  return new AppError(msg, 400);
};

const handleJWTError = function () {
  return new AppError("invalid token please log in again", 401);
};

const handleJWTExpireError = function () {
  return new AppError("token session has expired", 401);
};

//for development testing
const devModeErr = (err, req, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stackTrace: err.stack,
  });
};

// for production...
const prodModeErr = (err, req, res) => {
  let error = { ...err };
  error.message = err.message;
  if (err.name === "CastError") error = handleCastErrorDb(error);
  if (err.code === 11000) error = handleDuplicateFieldsDb();
  if (err.name === "ValidationError") error = handleValidationErrorDb(error);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpireError();

  res.status(err.statusCode).json({
    success: false,
    message: error.message || "internal server error",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "something went wrong";

  prodModeErr(err, req, res, next);
};
