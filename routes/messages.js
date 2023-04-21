const Router = require("express").Router;
const router = new Router();

const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");
const ExpresError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function(req, res, next) {
  try {

    let username = req.user.username;
    let msg = await Message.get(req.params.id);
    console.log(username, msg.to_user.username);
    if( msg.to_user.username !== username && msg.from_user.username !== username) {
      throw new ExpresError("cannot read this message", 404)
    }
    return res.json({message: msg})
  } catch (err){
    return next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function(req, res, next) {
  try {
    let msg = await Message.create( {
      from_username: req.user.username,
      to_username: req.body.to_username,
      body: req.body.body
    });

  return res.json({ message: msg})

  } catch (err) {
    return next(err)
  }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

 router.post("/:id/read", ensureLoggedIn, async function(req, res, next) {
   try {
     let username = req.user.username;
     let msg = await Message.get(req.params.id);

     if(msg.to_user.username !== username) {
       throw new ExpresError("Cannot set this message to read", 401)
     }
     let message = await Message.markRead(req.params.id);
     console.log("Message read");
     return res.json({message});
   }
   catch(err) {
     return next(err);
   }
 });

module.exports = router;

// Curl statements: 
// Token is for currently logged in user:
// router.get(":/id", ensureLoggedIn, async function(req, res, next)
// Will throw error as current user is 12:
// curl -X GET http://localhost:3000/messages/1 \
// -H "Content-Type: application/json" \
// -d '{"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjEyIiwiaWF0IjoxNjgxNTM5OTA2fQ.iUIdxOZO2EPcBHUKuAtItn7h1L5rJFaC4WWIUXwWHNI"}'

// Will work as current user is 12:
// curl -X GET http://localhost:3000/messages/3 \
// -H "Content-Type: application/json" \
// -d '{"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjEyIiwiaWF0IjoxNjgxNTM5OTA2fQ.iUIdxOZO2EPcBHUKuAtItn7h1L5rJFaC4WWIUXwWHNI"}'

// router.post("/", ensureLoggedIn, async function(req, res, next)
// curl -X POST http://localhost:3000/messages \
// -H "Content-Type: application/json" \
// -d '{"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjEyIiwiaWF0IjoxNjgxNTM5Mzk1fQ.oER5CId1m7RBgjl9qEFscPv_T8ba3IZNv_OYQt1OqNw", "to_username":"33", "body":"Phlbleh"}'

// router.post("/:id/read", ensureLoggedIn, async function(req, res, next)
// Current tokens:
// User 12:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjEyIiwiaWF0IjoxNjgxNTQxODA3fQ.dqoU9np8sYEn1bXO-TAfS8PhuvltbrFCs2G8JIoL6-c
// Throws error, sender not receiver:
// curl -X POST http://localhost:3000/messages/3/read \
// -H "Content-Type: application/json" \
// -d '{"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjEyIiwiaWF0IjoxNjgxNTQxODA3fQ.dqoU9np8sYEn1bXO-TAfS8PhuvltbrFCs2G8JIoL6-c"}'

// User 33:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjMzIiwiaWF0IjoxNjgxNTQxOTUxfQ.75el1FiPMic8gcknMFQSWcdw4YnEb7kn8xUO5TlqTMc
// Works:
// curl -X POST http://localhost:3000/messages/3/read \
// -H "Content-Type: application/json" \
// -d '{"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjMzIiwiaWF0IjoxNjgxNTQxOTUxfQ.75el1FiPMic8gcknMFQSWcdw4YnEb7kn8xUO5TlqTMc"}' 