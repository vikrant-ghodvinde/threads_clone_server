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
          connection.query(
            "SELECT * FROM posts ORDER BY createdAt DESC",
            (error, result) => {
              if (error) {
                return res.status(500).json({ error: error.message });
              }
              const posts = result;
              return res.status(200).json({ posts });
            }
          );
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
      return res.status(200).json({ posts });
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

const likePost = (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  connection.query(
    "SELECT * FROM posts WHERE id = ?",
    [postId],
    (error, result) => {
      if (error) {
        console.error("Error retrieving post:", error);
        return res.status(500).json({ error: "Error retrieving post" });
      } else if (result.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      } else {
        const post = result[0];
        const likes = post.likes ? JSON.parse(post.likes) : [];
        const isLiked = likes.findIndex((like) => like.userId === userId);
        if (isLiked !== -1) {
          likes.splice(isLiked, 1);

          connection.query(
            "UPDATE posts SET likes = ? WHERE id = ?",
            [JSON.stringify(likes), postId],
            (error) => {
              if (error) {
                console.error("Error removing like:", error);
                return res.status(500).json({ error: "Error removing like" });
              }
            }
          );
        } else {
          likes.push({ userId });
          connection.query(
            "UPDATE posts SET likes = ? WHERE id = ?",
            [JSON.stringify(likes), postId],
            (error) => {
              if (error) {
                console.error("Error updating likes:", error);
                return res.status(500).json({ error: "Error updating likes" });
              }
            }
          );
        }
        connection.query(
          "SELECT * FROM posts ORDER BY createdAt DESC",
          (error, result) => {
            if (error) {
              return res.status(500).json({ error: error.message });
            }
            const posts = result;
            return res.status(200).json({ posts });
          }
        );
      }
    }
  );
};

module.exports = { createPost, getAllPost, likePost };
