const UserController = require("../controllers/UserController");
const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Hello World, are you there?");
});
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/google-login", UserController.googleLogin);

module.exports = router;
