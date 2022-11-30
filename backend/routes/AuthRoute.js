const express = require("express");
const {
  forgotPassword,
  resetPassword,
} = require("../controller/UserController");

const router = express.Router();

router.route("/reset/").post(forgotPassword);
router.route("/reset/:token").patch(resetPassword);

module.exports = router;
