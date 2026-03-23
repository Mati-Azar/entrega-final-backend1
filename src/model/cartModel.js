import { Schema, model, Types } from "mongoose";

const cartSchema = new Schema({
  products: {
    type: [
      {
        quantity: Number,
        product: {
          type: Types.ObjectId,
          ref: "product",
        },
      },
    ],
    default: [],
  },
});

cartSchema.pre("findOne", function () {
  this.populate("products.product");
});
export const cartModel = model("cart", cartSchema);
