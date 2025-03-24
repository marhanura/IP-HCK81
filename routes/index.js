const Controller = require("../controllers/controller");
const router = require("express").Router();
const { authentication } = require("../middlewares/authentication");
const { authorization } = require("../middlewares/authorization");

router.get("/", (req, res) => {
  res.send("Welcome to Zehat, your health zolution");
});
router.post("/register", Controller.register);
router.post("/login", Controller.login);
router.post("/google-login", Controller.googleLogin);
router.get("/drugs", Controller.getDrugs);
router.use(authentication);
router.patch(
  "/user/:id/update-status",
  authorization,
  Controller.updateUserStatus
);
router.post("/user/:userId/disease", authorization, Controller.addDisease);
router.delete("/user/:userId", authorization, Controller.deleteUser);
router.get("/diseases", authorization, Controller.getAllDiseases);
router.get("/diseases/:userId", authorization, Controller.getDiseasebyUser);
router.delete("/diseases/:diseaseId", authorization, Controller.deleteDisease);
router.get(
  "/diseases/:diseaseId/:drugId",
  authorization,
  Controller.redeemDrug
);

module.exports = router;
