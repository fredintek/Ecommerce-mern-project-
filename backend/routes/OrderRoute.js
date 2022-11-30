const express = require("express");
const {
  isAuthenticated,
  restrictUser,
} = require("../controller/AuthController");
const {
  createOrder,
  getSingleOrder,
  getAllOrders,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
} = require("../controller/OrderController");

const router = express.Router();

router.route("/").get(isAuthenticated, restrictUser("admin"), getAllOrders);
router.route("/new").post(isAuthenticated, createOrder);
router
  .route("/:id")
  .get(isAuthenticated, restrictUser("admin"), getSingleOrder)
  .patch(isAuthenticated, restrictUser("admin"), updateOrderStatus)
  .delete(isAuthenticated, restrictUser("admin"), deleteOrder);
router
  .route("/user/:id")
  .get(isAuthenticated, restrictUser("admin"), getOrdersByUser);

module.exports = router;
