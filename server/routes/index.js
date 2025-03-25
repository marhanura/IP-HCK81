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
router.get("/drugs", Controller.getAllDrugs);
router.get("/drugs/:drugId", Controller.getDrugById);
router.use(authentication);
router.put("/redeem-drugs/:diseaseId", Controller.redeemDrug);
router.get("/diseases/users/:userId", Controller.getDiseasebyUser);
router.get("/diseases", authorization, Controller.getAllDiseases);
router.post("/diseases/users/:userId", authorization, Controller.addDisease);
router.get("/diseases/:diseaseId", authorization, Controller.getDiseaseById);
router.delete("/diseases/:diseaseId", authorization, Controller.deleteDisease);
router.post(
  "/diseases/:diseaseId/:drugId",
  authorization,
  Controller.addDrugToDisease
);
router.get("/users", authorization, Controller.getAllUsers);
router.put("/users/:userId", authorization, Controller.updateUser);
router.delete("/users/:userId", authorization, Controller.deleteUser);

module.exports = router;
