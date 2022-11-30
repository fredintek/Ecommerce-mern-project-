const express = require("express");
const {
  isAuthenticated,
  restrictUser,
} = require("../controller/AuthController");

// get controllers
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  createProductReview,
  getSingleProductReviews,
  deleteProductReview,
} = require("../controller/ProductController");

const router = express.Router();

router.route("/").get(getAllProducts);
router
  .route("/new")
  .post(isAuthenticated, restrictUser("admin"), createProduct);
router
  .route("/:id")
  .patch(isAuthenticated, restrictUser("admin"), updateProduct)
  .delete(isAuthenticated, restrictUser("admin"), deleteProduct)
  .get(getProduct);

router.route("/reviews/:id").put(isAuthenticated, createProductReview);

router
  .route("/admin/review")
  .get(getSingleProductReviews)
  .delete(isAuthenticated, restrictUser("admin"), deleteProductReview);

module.exports = router;
