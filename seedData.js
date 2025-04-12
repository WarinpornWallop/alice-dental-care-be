const fs = require("fs");
const path = require("path");
const Expertise = require("./models/Expertise");

async function seedExpertises() {
  const count = await Expertise.countDocuments();
  if (count === 0) {
    const rawData = fs.readFileSync(
      path.join(__dirname, "data/masterExpertises.json")
    );
    const expertises = JSON.parse(rawData);

    await Expertise.insertMany(expertises);
    console.log("Expertises seeded.");
  } else {
    console.log("Expertises already exist. Not seeding again.");
  }
}

module.exports = {
  seedExpertises,
};
