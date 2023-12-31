const express = require("express");
const { userLogin } = require("../controllers/user.js");

const router = express.Router();

router.post("/login", userLogin);

module.exports = router;
