const Controller = require("../controllers/Controller");
const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Hello World, are you there?");
});
router.post("/register", Controller.register);
router.post("/login", Controller.login);
router.post("/google-login", Controller.googleLogin);
router.patch("/user/:id/update-status", Controller.updateUserStatus);
router.delete("/user/:id", Controller.deleteUser);
router.get("/drugs", Controller.getDrugs);

module.exports = router;
