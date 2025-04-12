const mongoose = require("mongoose");

const ExpertiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  code: {
    type: String,
    required: [true, "Please add a code"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Expertise", ExpertiseSchema);
