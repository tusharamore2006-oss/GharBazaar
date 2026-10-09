const express = require("express");

const {
  registerUser,
  registerAdmin,
  loginUser,
  loginBroker,
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const protect =
  require("../middleware/authMiddleware");

const router =
  express.Router();


// REGISTER
router.post(
  "/register",
  registerUser
);


// ADMIN REGISTRATION
router.post(
  "/admin-register",
  registerAdmin
);


// LOGIN
router.post(
  "/login",
  loginUser
);


// BROKER / SELLER LOGIN
router.post(
  "/broker-login",
  loginBroker
);


// ADMIN LOGIN (separate from customer login)
router.post(
  "/admin-login",
  loginAdmin
);


// GET PROFILE
router.get(
  "/me",
  protect,
  getProfile
);


// UPDATE PROFILE
router.put(
  "/profile",
  protect,
  updateProfile
);


// CHANGE PASSWORD
router.put(
  "/change-password",
  protect,
  changePassword
);


module.exports = router;