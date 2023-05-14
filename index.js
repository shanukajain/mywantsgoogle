const express = require("express");
const app = express();
require("dotenv").config();

const { connection } = require("./config/db");
const { UserModel } = require("./models/user.model");

const jwt = require("jsonwebtoken");
const { uuid } = require("uuidv4");

const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

// ---------->>>>>>>> Configure Strategy <<<<<<<<--------- //
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.google_clientID,
      clientSecret: process.env.google_clientSecret,
      callbackURL: "https://mywantsgoogleauth.onrender.com/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      var { email } = profile._json;
      let user;
      try {
        user = await UserModel.findOne({ email });
        if (user) {
          return cb(null, user);
        }
        user = new UserModel({
        name: profile.displayName,
        Username:profile.displayName,
        email: profile._json.email[0],
        role:"user",
        pass: uuid(),
        });
        console.log(UserModel,profile);
        await user.save();
        return cb(null, user);
      } catch (error) {
        console.log(error);
      }
    }
  )
);
// ---------->>>>>>>> Authenticate Requests <<<<<<<<--------- //
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  function (req, res) {
    let user = req.user;
    var token = jwt.sign({ userID: user._id, email: user.email }, "masai", {
      expiresIn: "1d",
    });
    res.redirect(
      `http://127.0.0.1:8000/Frontend/index.html?&email=${user.email}&id=${token}&name=${user.name}`
    );
  }
);


// ---------->>>>>>>> Connection <<<<<<<<--------- //
app.listen(4500, async () => {
    try {
      await connection;
      console.log("Connected to DB");
      console.log(`http://localhost:4500/`);
    } catch (error) {
      console.log("Error in Connecting to DB");
    }
  });