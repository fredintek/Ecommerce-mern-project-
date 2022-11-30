const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A name is required for this field"],
      trim: true,
      maxLength: [20, "Product name must be at most 15 characters long"],
    },
    description: {
      type: String,
      required: [true, "A description is required for this field"],
      maxLength: [4000, "Description cannot exceed 4000 characters"],
    },
    price: {
      type: Number,
      required: [true, "A price is required for this field"],
      maxLength: [8, "Price cannot exceed 8 characters"],
    },
    discountPrice: {
      type: String,
      maxLength: [4, "Price cannot exceed 4 characters"],
    },
    color: {
      type: String,
    },
    size: {
      type: String,
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, "ratings cannot be less than 0"],
      max: [5, "ratings cannot be greater than 5"],
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    category: {
      type: String,
      required: [true, "A category is required for this field"],
    },
    stock: {
      type: Number,
      required: [true, "A stock is required for this field"],
      maxLength: [4, "Stock cannot exceed 4 characters"],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String },
        time: { type: Date, default: Date.now() },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
