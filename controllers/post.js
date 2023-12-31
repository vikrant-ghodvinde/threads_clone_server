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
      console.log(posts)
      return res.status(200).json({ posts });
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

module.exports = { createPost, getAllPost };
