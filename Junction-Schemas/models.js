const { Schema, model, Types } = require("mongoose");

// Doctor Schema
const doctorSchema = new Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

// Patient Schema
const patientSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  isActive: { type: Boolean, default: true },
});

// Consultation Schema (Junction)
const consultationSchema = new Schema({
  doctorId: { type: Types.ObjectId, ref: "Doctor", required: true },
  patientId: { type: Types.ObjectId, ref: "Patient", required: true },
  consultedAt: { type: Date, default: Date.now },
  notes: String,
  isActive: { type: Boolean, default: true },
});

consultationSchema.index({ doctorId: 1, patientId: 1, consultedAt: -1 });

const Doctor = model("Doctor", doctorSchema);
const Patient = model("Patient", patientSchema);
const Consultation = model("Consultation", consultationSchema);

module.exports = { Doctor, Patient, Consultation };
