const express = require("express");
const globalErrorHandler = require("./controller/globalErrorHandler");
const cookieParser = require("cookie-parser");

// import Routes
const ProductRoute = require("./routes/ProductRoute");
const UserRoute = require("./routes/UserRoute");
const AuthRoute = require("./routes/AuthRoute");
const OrderRoute = require("./routes/OrderRoute");

const app = express();

// express middlewares
app.use(express.json());
app.use(cookieParser());

// use Routes..
app.use("/api/v1/products", ProductRoute);
app.use("/api/v1/user", UserRoute);
app.use("/api/v1/password", AuthRoute);
app.use("/api/v1/order", OrderRoute);

app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "cannot access requested route, invalid or does not exist",
  });

  next();
});

app.use(globalErrorHandler);

module.exports = app;
