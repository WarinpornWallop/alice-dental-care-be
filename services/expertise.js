const Expertise = require("../models/Expertise"); // Adjust the path if needed

async function mapExpertiseCodesToObjectIds(expertiseCodes) {
  if (!Array.isArray(expertiseCodes)) {
    throw new Error("Expertise codes must be an array.");
  }

  const expertises = await Expertise.find({
    code: { $in: expertiseCodes },
  }).select("_id");

  if (expertises.length !== expertiseCodes.length) {
    throw new Error("Some expertise codes are invalid or not found.");
  }

  return expertises.map((expertise) => expertise._id);
}

module.exports = {
  mapExpertiseCodesToObjectIds,
};
