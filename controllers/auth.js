const User = require('../models/User');
const passport = require('passport');
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
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
    
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({ success: false, msg: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }

    //Create token
    // const token = user.getSignedJwtToken();
    // res.status(200).json({ success: true, token });
    sendTokenResponse(user, 200, res);
}

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode)
    // .cookie('token', token, options)
    .json({
        success: true,
        //add for frontend
        _id:user._id,
        name: user.name,
        email:user.email,
        //end for frontend
        token
    });
}

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
}

// @desc    Redirect to Google Login
// @route   GET /api/v1/auth/google
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// @desc    Handle Google OAuth Callback
// @route   GET /api/v1/auth/google/callback
exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/' }, (err, user) => {
        if (err || !user) {
            return res.redirect('/');
        }

        // สร้าง token
        const token = user.getSignedJwtToken();

        // Redirect ไปยัง frontend พร้อม token และข้อมูล user
        res.redirect(`http://localhost:5173?token=${token}&id=${user._id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
    })(req, res, next);
};
// @desc    Send token after successful login
exports.googleSuccess = (req, res) => {
    sendTokenResponse(req.user, 200, res);
};

// @desc    Logout user
// @route   GET /api/v1/auth/logout
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
};