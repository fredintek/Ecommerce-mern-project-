const User = require("./../model/UserModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const sendCookie = require("../utils/sendCookie");
const sendEmail = require("./../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Register new user
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    avatar: {
      public_id: "http://testingpurposes.com",
      url: "http://testingpurposes.com",
    },
  });

  // Log user in
  sendCookie(user, res, 201);
});

// login user
exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Please provide email and password field", 404));

  const user = await User.findOne({ email }).select("+password");

  // check if user in database and password matches with found user
  if (!user || !(await user.compareUserPassword(password)))
    return next(new AppError("invalid email address or password", 401));

  // Log user in
  sendCookie(user, res, 200);
});

// log out user
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });

  res.status(200).json({
    success: true,
    message: "logged out successfully",
  });
});

// forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Please provide email address", 404));

  const user = await User.findOne({ email });

  if (!user) return next(new AppError("No user found!", 404));

  // get reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // create reset password URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  // create message
  const message = `Your password reset token is as follows:\n\n${resetUrl}\n\nIf you have not requested this email please ignore it`;

  // send email to user
  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery\n\nThis token is valid for only ${process.env.PASSWORD_RESET_TIME} minutes.`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email} successfully`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError(err.message, 500));
  }
});

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gte: Date.now() },
  });

  if (!user) return next(new AppError("Password reset token is expired", 400));

  if (!req.body.password || !req.body.confirmPassword)
    return next(
      new AppError(
        "provide values for password and confirm password fields",
        400
      )
    );

  if (req.body.password !== req.body.confirmPassword)
    return next(new AppError("passwords does not match", 400));

  // setup new password
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save({ validateBeforeSave: false });

  sendCookie(user, res, 200);
});

// get user details
exports.userDetails = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) return next(new AppError("No user found", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

exports.updateUserPassword = catchAsync(async (req, res, next) => {
  // console.log(req.user.id);
  const user = await User.findById({ _id: req.user.id }).select("+password");

  if (!req.body.currentPassword)
    return next(new AppError("Please enter current password field", 400));

  // check if entered current password equal user's database password
  if (!(await bcrypt.compare(req.body.currentPassword, user.password)))
    return next(new AppError("Current password not correct, try again!", 400));

  // check if new password and confirm new password is provided
  if (!req.body.newPassword)
    return next(new AppError("Please enter new password field", 400));
  if (!req.body.confirmNewPassword)
    return next(new AppError("Please enter confirm new password field", 400));

  if (req.body.newPassword !== req.body.confirmNewPassword)
    return next(new AppError("Passwords are not equal, try again", 400));

  user.password = req.body.newPassword;
  await user.save({ validateBeforeSave: false });

  sendCookie(user, res, 200);
});

// update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  // we will add cloudinary later then we will give condition for the avatar

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
});

// get all users -- Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// get single user details -- Admin
exports.getUserDetails = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.params.id });

  if (!user) return next(new AppError("No user found with this id", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

// change user role --Admin
exports.changeUserRole = catchAsync(async (req, res, next) => {
  const userData = {
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// deactivate user
exports.deactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.params.id });

  if (!user) return next(new AppError("No user found with this id", 404));

  await User.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "user deactivated successfully",
  });
});
