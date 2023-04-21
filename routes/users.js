const express = require("express");
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const router = express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const users = await User.all();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username - get detail of user.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureLoggedIn, async function (req, res, next) { 
  try { 
    const user = await User.get(req.params.username); 
    return res.json({ user });
  }catch (err) {
    return next(err);
  }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
  try {
    const messages = await User.messagesTo(req.params.username);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
  try {
    const messages = await User.messagesFrom(req.params.username);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

 

module.exports = router;

// Curl statements: 
// (token is from a current login - will probably have to log in again to check)

// router.get("/", ensureLoggedIn, async function (req, res, next)
// curl -X GET http://localhost:3000/users \
// -H "Content-Type: application/json" \
// -d '{"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjEyIiwiaWF0IjoxNjgxNTAyMTkzfQ._Oh1GTERXkR0b9APrlZj15JiHfSO7WMeGLzVSYOVPhY"}' \
// | jq

// router.get("/:username", ensureLoggedIn, async function (req, res, next)
// curl -X GET http://localhost:3000/users/johndoe \
// -H "Content-Type: application/json" \
// -d '{"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjEyIiwiaWF0IjoxNjgxNTAyMTkzfQ._Oh1GTERXkR0b9APrlZj15JiHfSO7WMeGLzVSYOVPhY"}' \
// | jq

// router.get("/:username/to", ensureCorrectUser, async function (req, res, next)
// Logged in as 33:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjMzIiwiaWF0IjoxNjgxNTQzMTMxfQ.n2rH77xPcijxdeLbxGIoz6X-RPW_mNFybltOo7-jhFY
// curl -X GET http://localhost:3000/users/33/to \
// -H "Content-Type: application/json" \
// -d '{"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjMzIiwiaWF0IjoxNjgxNTQzMTMxfQ.n2rH77xPcijxdeLbxGIoz6X-RPW_mNFybltOo7-jhFY"}'

// router.get("/:username/from", ensureCorrectUser, async function (req, res, next)
// Logged in as 12:
// curl -X GET http://localhost:3000/users/12/from \
// -H "Content-Type: application/json" \
// -d '{"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjEyIiwiaWF0IjoxNjgxNTQzMjUyfQ.QHUjukciI5Mb0OZhoAEvrWhdZC65AH_s1XGC9mfLWtA"}'

