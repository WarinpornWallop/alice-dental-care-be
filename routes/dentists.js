const express = require("express");
const {
  getDentists,
  getDentist,
  createDentist,
  updateDentist,
  deleteDentist,
} = require("../controllers/dentists");
const { protect, authorize } = require("../middleware/auth");
const bookingRouter = require("./bookings"); //Include other resource routers

const router = express.Router();

router
  .route("/")
  .get(getDentists)
  .post(protect, authorize("admin"), createDentist);
router
  .route("/:id")
  .get(getDentist)
  .put(protect, authorize("admin"), updateDentist)
  .delete(protect, authorize("admin"), deleteDentist);
router.use("/:dentistId/bookings", bookingRouter); //Re-route into other resource routers

//Export the router
module.exports = router;
