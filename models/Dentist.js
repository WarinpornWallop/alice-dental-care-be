const mongoose = require("mongoose");

const DentistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  gender: {
    type: String,
    required: [true, "Please add gender"],
  },
  yearOfExp: {
    type: Number,
    required: [true, "Please add year of experience"],
  },
  expertises: [
    {
      type: String,
      required: [true, "Please add expertise"],
    },
  ],
  profileImage: {
    type: String,
    default: "no-photo.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

DentistSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "dentist",
  justOne: false,
});

module.exports = mongoose.model("Dentist", DentistSchema);
