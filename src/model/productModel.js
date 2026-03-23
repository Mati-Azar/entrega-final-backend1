import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productShema = new Schema({
  title: String,
  description: String,
  code: { type: String, unique: true, require: true },
  price: Number,
  status: Boolean,
  stock: Number,
  category: { type: String, index: true },
  thumbnails: Array,
});

productShema.plugin(mongoosePaginate);
export const productModel = model("product", productShema);
