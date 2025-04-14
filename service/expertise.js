const expertiseData = [
  {
    name: "General Dentistry",
    code: "GENL",
    description:
      "Basic dental care including checkups, cleanings, and fillings.",
  },
  {
    name: "Orthodontics",
    code: "ORTH",
    description: "Diagnosis and treatment of crooked teeth and jaw alignment.",
  },
  {
    name: "Periodontics",
    code: "PERI",
    description:
      "Specialized care for gums and supporting structures of teeth.",
  },
  {
    name: "Endodontics",
    code: "ENDO",
    description: "Treatment of dental pulp and root canals.",
  },
  {
    name: "Prosthodontics",
    code: "PROS",
    description: "Design and fitting of artificial replacements for teeth.",
  },
  {
    name: "Pediatric Dentistry",
    code: "PEDI",
    description: "Dental care for children from infancy through adolescence.",
  },
  {
    name: "Oral Surgery",
    code: "ORAL",
    description: "Surgical treatment of diseases and injuries in the mouth.",
  },
  {
    name: "Oral Pathology",
    code: "PATH",
    description: "Diagnosis and study of oral diseases through lab analysis.",
  },
  {
    name: "Public Health Dentistry",
    code: "PUBH",
    description:
      "Focuses on prevention and promotion of oral health in communities.",
  },
  {
    name: "Oral Radiology",
    code: "RADO",
    description: "Use of imaging technologies to diagnose dental problems.",
  },
];

function verifyExpertises(expertises) {
  const validCodes = new Set(expertiseData.map((expertise) => expertise.code));
  const invalidCodes = expertises.filter((code) => !validCodes.has(code));

  if (invalidCodes.length === 0) {
    return true;
  }

  const errMsg = `Invalid expertise codes provided: ${invalidCodes.join(", ")}`;
  console.error(errMsg);
  throw new Error(errMsg);
}

module.exports = {
  verifyExpertises,
};
