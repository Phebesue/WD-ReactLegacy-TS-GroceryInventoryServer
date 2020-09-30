const router = require("express").Router();
const User = require("../db").import("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let validateSession = require("../middleware/validate-session");

// Endpoints
// POST:  http://localhost:3020/user/signup
// POST:  http://localhost:3020/user/login
// PUT :  http://localhost:3020/user/
// DEL :  http://localhost:3020/user/
// GET :  http://localhost:3020/user/


// -----  User Signup  -----
// POST:  http://localhost:3020/user/signup
router.post("/signup", (req, res) => {
  User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
	userName: req.body.userName,
    // password: req.body.password
    password: bcrypt.hashSync(req.body.password, 11),
    admin: req.body.admin,
  })
    .then((user) => {
      let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.json({
        user: user,
        message: "User Created!",
        sessionToken: token,
      });
    })
    .catch((err) => res.status(500).json({ error: err }));
});

// -----  User Login  -----
// POST:  http://localhost:3020/user/login
router.post("/login", (req, res) => {
  User.findOne({ where: { userName: req.body.userName} }).then(
    (user) => {
      if (user) {
        bcrypt.compare(req.body.password, user.password, (err, matches) => {
          if (matches) {
            let token = jwt.sign(
              { id: user.id},
              process.env.JWT_SECRET,
              {
                expiresIn: "1d",
              }
            );
            res.status(200).json({
              user: user,
              message: "Successfully logged in!",
              sessionToken: token,
            });
          } else {
            res.status(502).send({ error: "Bad Gateway" });
          }
        });
      } else {
        res.status(500).send({ error: "User does not exist" });
      }
    },
    (err) => res.status(501).send({ error: "Failed to Process" })
  );
});


// -----  Update User  -----
// PUT :  http://localhost:3020/user/
router.put("/", validateSession, (req, res) => {
  let userid = req.user.id;

  	const updateUser={
	  	firstName: req.body.firstName,
	  	lastName: req.body.lastName,
	  	userName: req.body.userName,
	};
	if (req.body.password != ''){
		updateUser.password = bcrypt.hashSync(req.body.password, 11)
		console.log(req.body.password)
	}
  	const query = { where: {id: userid} };
  	User.update(updateUser, query)
    	.then((user) => res.status(201).json({ message: `${user} records updated` }))
    	.catch((err) => res.status(500).json({ error: err }));
	});

// -----  Delete User  -----
// DEL :  http://localhost:3020/user/
router.delete("/", validateSession, function (req, res) {
  if (!req.err && req.user.admin){
  let userid = req.user.id;
  const query = {where: {id: userid}};

  User.destroy(query)
  .then(() => res.status(200).json({ message: "User Deleted"}))
  .catch((err) => res.status(500).json({error:err}));
}else{ 
  return res.status(500).send({ message: "Not Authorized"});
}}
)

// -----  Get User  -----
// GET :  http://localhost:3020/user/
router.get("/", validateSession, (req, res) => {
    
	User.findOne({ where: {id: req.user.id } })
	  .then((user) => res.status(201).json(user))
	  .catch((err) => res.status(500).json({ error: err }));
  });
  // -----  Get All Users -----
// GET:   http://localhost:3020/user/all
router.get("/all",validateSession,(req, res) => {
  if (!req.err && req.user.admin){
    User.findAll()
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).json({ error: err }));
  }else{ 
  return res.status(500).send({ message: "Not Authorized"});
}}
)

module.exports = router;

// Admin
/*
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjAxNDEyNjg4LCJleHAiOjE2MDE0OTkwODh9.Xl8GVCet67c4UfrAu1JRc6i3xn9Ey3OXuQ5Xh9Pi4FI

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjAxNDg3ODc0LCJleHAiOjE2MDE1NzQyNzR9.pxzdUqT5L69CAzziXBWWPdOB_Cyk5Q9_ZhSYf-ek3Bg
*/
// User
/*
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNjAxNDEyNjE1LCJleHAiOjE2MDE0OTkwMTV9.jXCRh8tw9bO4Lsl5d90ZA7QHQsFU7OSY_nr0Z9bXX8
*/

// Null
/*
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNjAxNDEyNjYzLCJleHAiOjE2MDE0OTkwNjN9.3o4IDW5ti4nnBoANoGq7eLbW9ocpFYaafo-t4NdX7IU
*/

// https://whats-for-dinner-server2.herokuapp.com/ git.heroku.com/whats-for-dinner-server2.git
// 