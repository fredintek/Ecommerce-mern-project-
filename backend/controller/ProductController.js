const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const Product = require("./../model/ProductModel.js");
const Features = require("./../utils/features");

// get all products
exports.getAllProducts = async (req, res, next) => {
  console.log(req.query);
  const feature = new Features(Product.find(), req.query)
    .search()
    .sort()
    .filter()
    .fields()
    .paginate(4);

  const products = await feature.query;

  res.status(200).json({
    success: true,
    result: products.length,
    products,
  });

  next();
};

// create products -- Admin
exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });

  next();
});

// update Products --Admin
exports.updateProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) return next(new AppError("Product not found", 404));

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });

  next();
});

// delete products -- Admin
exports.deleteProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) return next(new AppError("Product not found", 404));

  await product.remove();

  res.status(204).json({
    success: true,
    message: "product deleted successfully",
  });

  next();
});

// single product details
exports.getProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    success: true,
    product,
  });

  next();
});

// create review or update review
exports.createProductReview = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(req.params.id);

  // check if a particular user has reviewed a particular product
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = Number(rating);
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// get all reviews of a single product --Admin
exports.getSingleProductReviews = catchAsync(async (req, res, next) => {
  // console.log(req.query);
  const product = await Product.findById(req.query.productId);

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// delete review -- Admin
// get all reviews of a single product --Admin
exports.deleteProductReview = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) return next(new AppError("Product not found", 404));

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.reviewId.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;
  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, numOfReviews },
    { new: true, runValidators: true }
  );

  res.status(204).json({
    success: true,
  });
});
