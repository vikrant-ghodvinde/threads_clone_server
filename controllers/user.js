const connection = require("../connection/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const { firstName, lastName, userName, email, phone, password } = req.body;
  const userImage = req.file?.path;

  try {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = {
      firstName,
      lastName,
      userName,
      email,
      phone,
      userImage,
      password: passwordHash,
    };

    const sql = "INSERT INTO users SET ?";

    connection.query(sql, newUser, (error, result) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Duplicate entry found" });
        } else {
          return res.status(500).json({ error: error.message });
        }
      } else {
        return res.status(200).json({
          message: `User data inserted successfully ${result.insertId}`,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    connection.query(sql, [email], async (error, result) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      } else if (result.length === 0) {
        return res.status(401).json({ error: "User not found" });
      } else {
        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) {
          return res.status(401).json({ error: "Invalid email and password" });
        } else {
          const token = jwt.sign(
            { userId: user.id, userName: user.userName },
            process.env.JWT_SECRET
          );
          delete user.password;
          console.log({ user, token });
          return res.status(200).json({ user, token });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

module.exports = { createUser, userLogin };
