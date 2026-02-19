const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");

const register = (req, res) => {
  const { username, password, role } = req.body;

  userModel.findUserByUsername(username)
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      return bcrypt.hash(password, 10)
        .then((hashedPassword) => {
          const newUser = {
            username,
            password: hashedPassword,
            role: role || "user",
          };

          return userModel.createUser(newUser)
            .then(() => {
              res.status(201).json({ message: "User registered successfully" });
            });
        });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

const login = (req, res) => {
  const { username, password } = req.body;

  userModel.findUserByUsername(username)
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      return bcrypt.compare(password, user.password)
        .then((isMatch) => {
          if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
          }

          const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          res.json({ token, role: user.role });
        });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

const getProfile = (req, res) => {
  res.json({ message: `Welcome ${req.user.username}, this is the user profile.` });
};

const getAdminDashboard = (req, res) => {
  res.json({ message: "Welcome Admin, this is the admin dashboard." });
};

module.exports = {
  register,
  login,
  getProfile,
  getAdminDashboard,
};
