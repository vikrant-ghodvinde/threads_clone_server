const connection = require("../connection/db.js");

// CREATE POST
const createPost = (req, res) => {
  const { userName, feedText } = req.body;
  const feedImage = req.file?.path;
  try {
    const userSQL = "SELECT * FROM users WHERE userName = ?";
    connection.query(userSQL, [userName], (error, result) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      } else if (result.length === 0) {
        return res.status(401).json({ error: "User not found" });
      } else {
        const user = result[0];

        const postSQL = "INSERT INTO posts SET ?";
        const newPost = {
          userId: user.id,
          userName: user.userName,
          userImage: user.userImage,
          feedText,
          feedImage,
          likes: "",
          comments: "",
        };
        connection.query(postSQL, newPost, (error, result) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          return res.status(200).json({
            message: `Post created successfully ${result.insertId}`,
          });
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// GET ALL POSTS
const getAllPost = (req, res) => {
  try {
    const sql = "SELECT * FROM posts ORDER BY createdAt DESC";
    connection.query(sql, (error, result) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      const posts = result;
      console.log(posts);
      return res.status(200).json({ posts });
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// LIKE POST
const likePost = (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    connection.query(
      "SELECT * FROM post_likes WHERE postId = ? AND userId = ?",
      [postId, userId],
      (error, results) => {
        if (error) {
          console.error("Error checking like:", error);
          return res.status(500).json({ error: "Error checking like" });
        }

        if (results.length > 0) {
          // User has already liked the post, unlike it
          connection.query(
            "DELETE FROM post_likes WHERE postId = ? AND userId = ?",
            [postId, userId],
            (error) => {
              if (error) {
                console.error("Error unliking post:", error);
                return res.status(500).json({ error: "Error unliking post" });
              }
              updateLikesCount(postId, res);
            }
          );
        } else {
          // User has not liked the post, like it
          connection.query(
            "INSERT INTO post_likes (postId, userId) VALUES (?, ?)",
            [postId, userId],
            (error) => {
              if (error) {
                console.error("Error liking post:", error);
                return res.status(500).json({ error: "Error liking post" });
              }
              updateLikesCount(postId, res);
            }
          );
        }
        const updateLikesCount = (postId, res) => {
          connection.query(
            "UPDATE posts SET likes = (SELECT COUNT(*) FROM post_likes WHERE postId = ?) WHERE id = ?",
            [postId, postId],
            (error) => {
              if (error) {
                console.error("Error updating likes count:", error);
                return res
                  .status(500)
                  .json({ error: "Error updating likes count" });
              }
              res.json({ message: "Post liked/unliked successfully" });
            }
          );
        };
      }
    );
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

module.exports = { createPost, getAllPost, likePost };
