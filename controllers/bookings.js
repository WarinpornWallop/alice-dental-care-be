const Dentist = require("../models/Dentist");
const Booking = require("../models/Booking");

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Private
exports.getBookings = async (req, res, next) => {
  let query;

  //General users can see only their booking!
  if (req.user.role !== "admin") {
    query = Booking.find({ user: req.user.id }).populate({
      path: "dentist",
      select: "name gender yearOfExp expertises",
    });
  } else {
    if (req.params.dentistId) {
      console.log("Dentist ID: ", req.params.dentistId);
      query = Booking.find({ dentist: req.params.dentistId });
      // .populate({ //Comment out for the Postman test case
      //   path: "dentist",
      //   select: "name gender expertises",
      // });
    } else {
      query = Booking.find().populate({
        path: "dentist",
        select: "name gender yearOfExp expertises",
      });
    }
  }

  try {
    const bookings = await query;
    res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access   Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "dentist",
      select: "name gender yearOfExp expertises",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the ID of ${req.params.id}`,
      });
    }

    //Make sure user is the owner of the booking
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to get this booking`,
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc     Add booking
//@route    POST /api/v1/dentists/:dentistId/bookings
//@access   Private
exports.addBooking = async (req, res, next) => {
  try {
    req.body.dentist = req.params.dentistId; //To keep the dentist ID in the body

    const dentist = await Dentist.findById(req.params.dentistId);

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: `No dentist with the ID of ${req.params.dentistId}`,
      });
    }

    //Add user to req.body
    req.body.user = req.user.id;

    //Check for existed booking
    const existedBooking = await Booking.find({ user: req.user.id });

    //Registered user can only create 1 booking
    if (existedBooking.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made a booking`,
      });
    }

    const booking = await Booking.create(req.body);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Booking" });
  }
};

//@desc     Update booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the ID of ${req.params.id}`,
      });
    }

    //Make sure user is the owner of the booking
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`,
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Booking" });
  }
};

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the ID of ${req.params.id}`,
      });
    }

    //Make sure user is the owner of the booking
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }

    await booking.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Booking" });
  }
};
