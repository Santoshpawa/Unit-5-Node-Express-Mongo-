const express = require("express");
const router = express.Router();
const Vehicle = require("../models/vehicle.model");

// ───── VEHICLE CRUD ─────

// Create Vehicle
router.post("/vehicles", async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Vehicles
router.get("/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Vehicle
router.put("/vehicles/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Vehicle
router.delete("/vehicles/:id", async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ───── TRIP OPERATIONS ─────

// Add Trip to Vehicle
router.post("/vehicles/:id/trips", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    vehicle.trips.push(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Trip by index
router.put("/vehicles/:vehicleId/trips/:tripId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const trip = vehicle.trips.id(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    Object.assign(trip, req.body);
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Trip
router.delete("/vehicles/:vehicleId/trips/:tripId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    vehicle.trips.id(req.params.tripId).remove();
    await vehicle.save();
    res.json({ message: "Trip deleted", vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ───── ADVANCED QUERIES ─────

// Vehicles with trip distance > 200 km
router.get("/vehicles/filter/long-trips", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ "trips.distance": { $gt: 200 } });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles with trip starting from specified cities
router.get("/vehicles/filter/cities", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      "trips.startLocation": { $in: ["Delhi", "Mumbai", "Bangalore"] },
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles with trips starting after Jan 1, 2024
router.get("/vehicles/filter/future-trips", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      "trips.startTime": { $gte: new Date("2024-01-01") },
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicles of type 'car' or 'truck'
router.get("/vehicles/filter/types", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ type: { $in: ["car", "truck"] } });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Total Distance (instance method demo)
router.get("/vehicles/:id/total-distance", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const total = vehicle.totalDistance();
    res.json({ vehicle: vehicle.registrationNumber, totalDistance: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
