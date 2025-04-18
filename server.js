const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require("express-session");
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

//Route files
const auth = require('./routes/auth');
const dentist = require("./routes/dentists");
const booking = require("./routes/bookings");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();

require('./config/passport');


//Initialize express
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

//Body parser
app.use(express.json());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

// Cookie parser
app.use(cookieParser());


app.use(session({
  secret: process.env.SESSION_SECRET || "mysecret", // ควรใช้ค่าใน .env
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // ❗ถ้าใช้ HTTPS ให้เปลี่ยนเป็น `true`
}));
app.use(passport.initialize());
app.use(passport.session());

//Mount routers
app.use('/api/v1/auth', auth);
app.use("/api/v1/dentists", dentist);
app.use("/api/v1/bookings", booking);

const PORT = process.env.PORT || 5003;
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //Close server and exit process
  server.close(() => process.exit(1));
});
