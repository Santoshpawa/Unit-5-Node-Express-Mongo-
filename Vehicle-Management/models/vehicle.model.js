const mongoose = require("mongoose");

// Trip Subdocument Schema
const tripSchema = new mongoose.Schema(
  {
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    distance: {
      type: Number,
      required: true,
      min: [1, "Distance must be greater than 0"],
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { _id: true }
);

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["car", "truck", "bike"],
  },
  model: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  trips: [tripSchema],
});

// Custom Instance Method
vehicleSchema.methods.totalDistance = function () {
  return this.trips.reduce((sum, trip) => sum + trip.distance, 0);
};

module.exports = mongoose.model("Vehicle", vehicleSchema);
