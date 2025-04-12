const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require("express-session");
const cors = require('cors');



//Route files
const test = require("./routes/test");
const dentist = require("./routes/dentists");
const booking = require("./routes/bookings");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();

require('./config/passport');

//Route files

const auth = require('./routes/auth');

//Initialize express
const app = express();

app.use(cors());

//Body parser
app.use(express.json());


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
app.use("/api/v1/test", test);
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
