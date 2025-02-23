const express = require("express");
const { hello } = require("../controllers/test");

const router = express.Router();

router.route("/").get(hello);

module.exports = router;
