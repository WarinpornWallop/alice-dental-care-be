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
  expertise: {
    type: [mongoose.Schema.ObjectId],
    ref: "Expertise",
    required: [true, "Please add expertise"],
  },
  profileImage: {
    type: String,
    default: "no-photo.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Dentist", DentistSchema);