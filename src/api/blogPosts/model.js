import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const blogPostsSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["scifi", "history", "romance", "action", "horror"],
    },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    author: [{ type: Schema.Types.ObjectId, ref: "User" }], //the ref must be the same with the Name of the model created
    content: { type: String, required: true },
    // comments: [
    //   {
    //     username: { type: String, required: true },
    //     text: { type: String, required: true },
    //     rating: Number,
    //     createdAt: Date,
    //     updatedAt: Date,
    //   },
    // ],
    // likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default model("BlogPost", blogPostsSchema);
