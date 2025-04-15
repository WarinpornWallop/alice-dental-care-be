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
    // const token = user.getSignedJwtToken();
    // res.status(200).json({ success: true, token });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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

// @desc    Redirect to Google Login
// @route   GET /api/v1/auth/google
exports.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// @desc    Handle Google OAuth Callback
// @route   GET /api/v1/auth/google/callback
exports.googleCallback = passport.authenticate("google", {
  failureRedirect: "/",
});

// @desc    Send token after successful login
exports.googleSuccess = (req, res) => {
  sendTokenResponse(req.user, 200, res);
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
    await sendEmail(
      user.email,
      "Your Password Reset Link from Alice Dental Care",
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
