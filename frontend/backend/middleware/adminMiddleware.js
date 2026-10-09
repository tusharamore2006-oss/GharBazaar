// ========================================
// ADMIN ONLY MIDDLEWARE
// ========================================
// Use AFTER the protect middleware so
// req.user (decoded JWT) is available.

const adminOnly = (
  req,
  res,
  next
) => {

  if (
    !req.user ||
    req.user.role !== "Admin"
  ) {

    return res.status(403).json({
      message:
        "Admin access only",
    });

  }

  next();
};


module.exports =
  adminOnly;