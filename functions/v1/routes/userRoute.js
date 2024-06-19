const express = require("express");
const router = express.Router()
const { saveUserData, goldRate } = require("../controller/userController");

router.route("/create-user").post(saveUserData)
router.route("/getCityData/:city").get(goldRate)
// router.route("/view").get(viewFunction)


module.exports = router;