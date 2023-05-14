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
      callbackURL: "http://localhost:4500/auth/google/callback",
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
          first_name: profile.displayName,
          last_name: profile.name.familyName || profile.displayName,
          mobile: profile._json.email,
          email: profile._json.email,
          password: uuid(),
        });
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
      `http://127.0.0.1:8000/Frontend/index.html?&email=${user.email}&id=${token}&first_name=${user.first_name}&last_name=${user.last_name}`
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