const express = require("express");
const { getAllPost } = require("../controllers/post.js");

const router = express.Router();

router.get("/getall", getAllPost);

module.exports = router;
