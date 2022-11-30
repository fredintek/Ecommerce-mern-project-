const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Username is required"],
      minLength: [3, "This field requires at least 3 characters"],
      maxLength: [15, "This field is limited to 15 characters"],
      // unique: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [
        function (currEl) {
          return validator.isEmail(currEl);
        },
        "Please enter a valid email",
      ],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "Password should be at least 8 characters"],
      select: false,
    },

    confirmPassword: {
      type: String,
      required: [true, "Please enter confirm password"],
      validate: [
        function (currEl) {
          return this.password === currEl;
        },
        "Confirm password field must be the same with Password field",
      ],
    },

    avatar: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    passwordChangedAt: Date,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// encrypting password before saving user
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

// jwt token
UserSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

// compare user password
UserSchema.methods.compareUserPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// check if user changed their password after the token has been issued
UserSchema.methods.changedPasswordAfter = function (jwtTime) {
  if (this.passwordChangedAt) {
    const passwordTimeChange = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTime < passwordTimeChange;
  }

  return false;
};

// generate password reset token
UserSchema.methods.generatePasswordResetToken = function () {
  // generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // set token expired time @ 10 mins into the future
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// only get users with active field of true --> this is to prevent deleting the user traditionally
UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

module.exports = mongoose.model("User", UserSchema);
