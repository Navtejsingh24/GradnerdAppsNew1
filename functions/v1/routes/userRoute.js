const express = require("express");
const router = express.Router()
const { viewFunction } = require("../controller/userController");

router.route("/view").get(viewFunction)


module.exports = router;