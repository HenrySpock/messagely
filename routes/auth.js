const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = new express.Router(); 
const { SECRET_KEY } = require('../config');


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function(req, res, next) {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    const user = await User.register({ username, password, first_name, last_name, phone });
    const token = jwt.sign({ username }, SECRET_KEY);

    // Update user's last login timestamp
    await User.updateLoginTimestamp(username);

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const { isValid, user } = await User.authenticate(username, password);

    if (isValid) {
      await User.updateLoginTimestamp(user.username);
      const token = jwt.sign({ username: user.username }, SECRET_KEY);
      return res.json({ token });
    } else {
      throw new Error("Invalid username/password");
    }
  } catch (err) {
    return next(err);
  }
});


/** POST /logout - logout user, update last_login_at
 * added for my own sanity 
 *
 * authorization: Bearer token => {username}
 * 
 **/

router.post("/logout", async function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, SECRET_KEY);
    const user = await User.get(payload.username); 
    res.json({ message: "Logged out" });
  } catch (err) {
    return next(err);
  }
}); 

module.exports = router; 

// Curl statements:

// router.post("/register", async function(req, res, next)
// curl -X POST http://localhost:3000/auth/register \
// -H "Content-Type: application/json" \
// -d '{"username":"33", "password":"33", "first_name":"33", "last_name":"33", "phone":"123-456-7890"}'
// token:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjMzIiwiaWF0IjoxNjgxNDk5NDQxfQ.W-5Q3VMW617g9oy0g14kXUBlBbnQ7DVQPOqOP66mcyc

// router.post("/login", async function (req, res, next) 
// curl -X POST http://localhost:3000/auth/login \
//   -H "Content-Type: application/json" \
//   -d '{"username": "33", "password": "33"}'
// token:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjMzIiwiaWF0IjoxNjgxNTM0NTEyfQ.kK17LGfcKSeEOGeIKDaESs8JQG-vWkIrxqNJ-LTJAb0

// router.post("/logout", async function (req, res, next) 
// curl -X POST http://localhost:3000/auth/logout \
//   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjMzIiwiaWF0IjoxNjgxNTM0NTEyfQ.kK17LGfcKSeEOGeIKDaESs8JQG-vWkIrxqNJ-LTJAb0" \
//   -H "Content-Type: application/json"