const express = require("express");

const {
  getStats,
  getUsers,
  deleteUser,
  getProperties,
  updateProperty,
  deleteProperty,
} = require("../controllers/adminController");

const protect =
  require("../middleware/authMiddleware");

const adminOnly =
  require("../middleware/adminMiddleware");

const router =
  express.Router();


// ========================================
// ALL ADMIN ROUTES REQUIRE:
// 1. A valid login (protect)
// 2. The Admin role (adminOnly)
// ========================================

router.use(protect, adminOnly);


// DASHBOARD STATS
router.get(
  "/stats",
  getStats
);


// USERS
router.get(
  "/users",
  getUsers
);

router.delete(
  "/users/:id",
  deleteUser
);


// PROPERTIES
router.get(
  "/properties",
  getProperties
);

router.put(
  "/properties/:id",
  updateProperty
);

router.delete(
  "/properties/:id",
  deleteProperty
);


module.exports = router;