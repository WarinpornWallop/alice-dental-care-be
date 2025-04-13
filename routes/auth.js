const express = require("express");
const {
  register,
  login,
  getMe,
  editMe,
  googleLogin,
  googleCallback,
  googleSuccess,
  logout,
  requestResetPassword,
} = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/request-reset-password", requestResetPassword);
router.get("/me", protect, getMe).put("/me", protect, editMe);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback, googleSuccess);
router.get("/logout", logout);

module.exports = router;
