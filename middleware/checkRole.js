const checkRole = (role) => (req, res, next) => {
  const userRole = req.session.user.role;
  if (userRole === role) {
    next();
  } else {
    res.redirect("/auth/login");
  }
};

module.exports = checkRole;