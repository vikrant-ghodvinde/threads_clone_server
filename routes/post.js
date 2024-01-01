const express = require("express");
const { getAllPost, likePost } = require("../controllers/post.js");

const router = express.Router();

router.get("/getall", getAllPost);
router.patch("/:postId/like", likePost);

module.exports = router;
