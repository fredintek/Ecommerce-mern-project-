const express = require("express");
const {
  isAuthenticated,
  restrictUser,
} = require("../controller/AuthController");
const {
  createUser,
  loginUser,
  logout,
  userDetails,
  updateUserPassword,
  updateProfile,
  getAllUsers,
  getUserDetails,
  changeUserRole,
  deactivateUser,
} = require("../controller/UserController");

const router = express.Router();

router.route("/registration").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logout);

router.route("/me").get(isAuthenticated, userDetails);
router.route("/me/updatePassword").patch(isAuthenticated, updateUserPassword);
router.route("/updateProfile").patch(isAuthenticated, updateProfile);
router
  .route("/admin/users")
  .get(isAuthenticated, restrictUser("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticated, restrictUser("admin"), getUserDetails);

router
  .route("/admin/user/role/:id")
  .patch(isAuthenticated, restrictUser("admin"), changeUserRole);

router
  .route("/admin/deactivate/:id")
  .patch(isAuthenticated, restrictUser("admin"), deactivateUser);

module.exports = router;
