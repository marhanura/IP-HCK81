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
router.get("/diseases/:userId", Controller.getDiseasebyUser);
router.get("/redeem-drugs/:redeemId", Controller.redeemDrug);
router.patch("/redeem-drugs/:redeemId", Controller.redeemDrug);
router.get("/diseases", authorization, Controller.getAllDiseases);
router.delete("/diseases/:diseaseId", authorization, Controller.deleteDisease);
router.delete("/user/:userId", authorization, Controller.deleteUser);
router.post("/user/:userId/disease", authorization, Controller.addDisease);

module.exports = router;
