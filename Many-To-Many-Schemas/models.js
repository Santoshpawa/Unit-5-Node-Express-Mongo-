const { Schema, model, Types } = require('mongoose');

// Student Schema
const studentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true }
});

// Course Schema
const courseSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true }
});

// Enrollment Schema (Junction)
const enrollmentSchema = new Schema({
  studentId: { type: Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Student = model('Student', studentSchema);
const Course = model('Course', courseSchema);
const Enrollment = model('Enrollment', enrollmentSchema);

module.exports = { Student, Course, Enrollment };
