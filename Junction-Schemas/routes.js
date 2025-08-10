const router = require("express").Router();
const mongoose = require("mongoose");
const { Doctor, Patient, Consultation } = require("./models");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// -------------------- CREATE --------------------
router.post("/doctors", async (req, res) => {
  try {
    const { name, specialization } = req.body;
    if (!name || !specialization)
      return res.status(400).json({ error: "Name & specialization required" });
    const doctor = await Doctor.create({ name, specialization });
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/patients", async (req, res) => {
  try {
    const { name, age, gender } = req.body;
    if (!name || !age || !gender)
      return res.status(400).json({ error: "Name, age & gender required" });
    const patient = await Patient.create({ name, age, gender });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/consultations", async (req, res) => {
  try {
    const { doctorId, patientId, notes } = req.body;
    if (!doctorId || !patientId)
      return res.status(400).json({ error: "doctorId & patientId required" });
    if (!isValidId(doctorId) || !isValidId(patientId))
      return res.status(400).json({ error: "Invalid IDs" });

    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);
    if (!doctor || !doctor.isActive)
      return res.status(400).json({ error: "Inactive doctor" });
    if (!patient || !patient.isActive)
      return res.status(400).json({ error: "Inactive patient" });

    const consultation = await Consultation.create({
      doctorId,
      patientId,
      notes,
    });
    res.status(201).json(consultation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- READ --------------------
router.get("/doctors/:id/patients", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid doctorId" });

    const consultations = await Consultation.find({
      doctorId: id,
      isActive: true,
    })
      .populate({
        path: "patientId",
        select: "name age gender",
        match: { isActive: true },
      })
      .sort({ consultedAt: -1 })
      .limit(5);

    res.json(consultations.map((c) => c.patientId).filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/patients/:id/doctors", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid patientId" });

    const consultations = await Consultation.find({
      patientId: id,
      isActive: true,
    }).populate({
      path: "doctorId",
      select: "name specialization",
      match: { isActive: true },
    });

    res.json(consultations.map((c) => c.doctorId).filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/doctors/:id/consultations/count", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid doctorId" });

    const count = await Consultation.countDocuments({
      doctorId: id,
      isActive: true,
    });
    res.json({ doctorId: id, totalConsultations: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/patients", async (req, res) => {
  try {
    const { gender } = req.query;
    const patients = await Patient.find({ gender, isActive: true });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/consultations/recent", async (req, res) => {
  try {
    const consultations = await Consultation.find({ isActive: true })
      .sort({ consultedAt: -1 })
      .limit(5)
      .populate("doctorId", "name specialization")
      .populate("patientId", "name age gender");
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- SOFT DELETE --------------------
router.delete("/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid doctorId" });
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    doctor.isActive = false;
    await doctor.save();
    await Consultation.updateMany(
      { doctorId: id },
      { $set: { isActive: false } }
    );

    res.json({ message: "Doctor and related consultations deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid patientId" });
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    patient.isActive = false;
    await patient.save();
    await Consultation.updateMany(
      { patientId: id },
      { $set: { isActive: false } }
    );

    res.json({ message: "Patient and related consultations deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
