const Order = require("./../model/OrderModel");
const Product = require("./../model/ProductModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

// create order
exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

//get single order
exports.getSingleOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) return next(new AppError("Order not found", 404));

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmt = 0;

  orders.forEach((order) => {
    totalAmt += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmt,
    orders,
  });
});

exports.getOrdersByUser = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.params.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new AppError("Order not found", 404));

  if (order.orderStatus === "Delivered")
    return next(new AppError("Tou have already delivered this order", 400));

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (item) => {
      await updateStock(item.product, item.quantity);
    });
  }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// update stock function...
async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete order for unsuccessful payments
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new AppError("Order not found", 404));

  await order.remove();

  res.status(204).json({
    success: true,
  });
});
