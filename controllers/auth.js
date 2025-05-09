const crypto = require("crypto");
const passport = require("passport");

const User = require("../models/User");
const ResetPasswordToken = require("../models/ResetPasswordToken");
const { sendEmail, getResetPasswordEmailBody } = require("../service/email");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, telNumber, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      telNumber,
      role,
    });

    //Create token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, msg: messages });
    }

    console.error(err.stack);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide email and password" });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res
      .status(401)
      .json({
        success: false,
        msg: "Cannot convert email or password to strings",
      });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    // .cookie('token', token, options)
    .json({
      success: true,
      //add for frontend
      _id: user._id,
      name: user.name,
      email: user.email,
      telNumber: user.telNumber,
      role: user.role,
      //end for frontend
      token,
    });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

// @desc    Edit current logged in user
// @route   PUT /api/v1/auth/me
// @access  Private
exports.editMe = async (req, res, next) => {
  //allow user to update only name and telNumber
  const fieldsToUpdate = {
    name: req.body.name,
    telNumber: req.body.telNumber,
  };
  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
// @desc    Google OAuth login  
// @route   GET /api/v1/auth/google
exports.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});


// @desc    Handle Google OAuth callback
// @route   GET /api/v1/auth/google/callback
exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { failureRedirect: "/login" }, (err, user) => {
    if (err || !user) {
      return res.redirect("http://localhost:5173/login?error=authentication_failed");
    }

    // สร้าง JWT Token
    const token = user.getSignedJwtToken(); // สมมติว่ามีฟังก์ชันนี้ใน model User

    // Redirect ไปยัง frontend พร้อมข้อมูล
    res.redirect(`http://localhost:5173/googlecallback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
  })(req, res, next);
};

// @desc    Logout user
// @route   GET /api/v1/auth/logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
};

// @desc    Request password reset
// @route   POST /api/v1/auth/request-reset-password
// @access  Public
exports.requestResetPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, msg: "Please provide email" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const resetToken = await ResetPasswordToken.create({
      user: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    const emailBody = getResetPasswordEmailBody(resetToken.token);
    const emailTitle = "Your Password Reset Link from Alice Dental Care";
    await sendEmail(
      user.email,
      emailTitle,
      emailBody
    );

    res
      .status(200)
      .json({ success: true, msg: "Reset password link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password) {
    return res
      .status(400)
      .json({ success: false, msg: "Please provide new password" });
  }

  try {
    const resetToken = await ResetPasswordToken.findOne({ token });

    if (!resetToken) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid or expired token" });
    }

    const user = await User.findById(resetToken.user);

    user.password = password;
    await user.save();

    await ResetPasswordToken.deleteOne({ _id: resetToken._id });

    res.status(200).json({ success: true, msg: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
