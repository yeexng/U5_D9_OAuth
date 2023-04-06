import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import {
  forbiddenErrorHandler,
  genericErrorHandler,
  notFoundErrorHandler,
  unauthorizedErrorHandler,
} from "./errorHandlers.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import authorsRouter from "./api/authors/index.js";
import usersRouter from "./api/user/index.js";
import googleStrategy from "./lib/auth/googleOauth.js";

const server = Express();
const port = process.env.PORT || 3005;

passport.use("google", googleStrategy); // Do not forget to inform Passport that we want to use Google Strategy!

// ************************************* MIDDLEWARES **********************************
server.use(cors());
server.use(Express.json());
server.use(passport.initialize()); // Do not forget to inform Express that we are using Passport!

// ************************************** ENDPOINTS ***********************************
server.use("/blogPosts", blogPostsRouter);
server.use("/authors", authorsRouter);
server.use("/users", usersRouter);

// ************************************* ERROR HANDLERS *******************************
server.use(unauthorizedErrorHandler);
server.use(forbiddenErrorHandler);
server.use(notFoundErrorHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log(`✅ Successfully connected to Mongo!`);
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
