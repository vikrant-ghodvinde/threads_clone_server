const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const connection = require("./connection/db.js");
const { createUser } = require("./controllers/user.js");
const userRoutes = require("./routes/user.js");

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
const PORT = process.env.PORT || 6000;

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/users/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const postStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/posts/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const userUpload = multer({ storage: userStorage });
const postUpload = multer({ storage: postStorage });

app.post("/user/create", userUpload.single("userImage"), createUser);
app.use("/user", userRoutes);

connection.connect((error) => {
  if (error) {
    throw error;
  }
  console.log(`Connected to mysql Id: ${connection.threadId}`);
  app.listen(PORT, () => console.log(`PORT ${PORT}`));
});
