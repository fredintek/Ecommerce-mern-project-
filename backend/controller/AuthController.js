const User = require("../model/UserModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

// protect routes
exports.isAuthenticated = catchAsync(async (req, res, next) => {
  // console.log(req.cookies);
  const { token } = req.cookies;

  if (!token)
    return next(new AppError("Please login to access this page", 400));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  // check if user still exists after login
  if (!currentUser) return next(new AppError("user does not exist", 401));

  // check if user still exists after login
  if (!currentUser) return next(new AppError("user does not exist", 401));

  // check if user change password after login
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError(
        "user recently chaged their password! please login again",
        401
      )
    );

  // grant user access to protected routes
  req.user = currentUser;
  next();
});

// restrict regular users from accessing admin-only routes
exports.restrictUser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("You are not an admin", 401));

    next();
  };
};
