import express from "express";
import createError from "http-errors";
import UsersModel from "./model.js";
import passport from "passport";
import { JWTAuthMiddleware } from "../../lib/auth/jwt.js";
import { createAccessToken } from "../../lib/auth/tools.js";

const usersRouter = express.Router();

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    try {
      res.redirect(`${process.env.FE_URL}?accessToken=${req.user.accessToken}`);
      // res.send(req.user.accessToken);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

//JWT registration

usersRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain credentials from req.body
    const { userName, password } = req.body;
    console.log(req.body);
    //when test in postman need to post JSON userName and pw that is already exist in DB => return eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDJkNjE0OTg1YjY3Nzg1NjZlMGY1ZDQiLCJyb2xlIjoiVXNlciIsImlhdCI6MTY4MDY5NjA3MiwiZXhwIjoxNjgxMzAwODcyfQ.o60dN0-MXUY1ZbJXNz0RAVCFY-ExeyIbfMj90TJrUCs

    // 2. Verify the credentials
    const user = await UsersModel.checkCredentials(userName, password);

    console.log(user);

    if (user) {
      // 3.1 If credentials are fine --> create an access token (JWT) and send it back as a response
      const payload = { _id: user._id, role: user.role };
      const accessToken = await createAccessToken(payload);

      res.send({ accessToken });
    } else {
      // 3.2 If they are not --> trigger a 401 error
      next(createError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
