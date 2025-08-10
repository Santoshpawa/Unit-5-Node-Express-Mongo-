const router = require("express").Router();
const mongoose = require("mongoose");
const { Student, Course, Enrollment } = require("./models");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// -------------------- STUDENTS --------------------
router.post("/students", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "Name and Email required" });
    if (await Student.findOne({ email }))
      return res.status(409).json({ error: "Student exists" });
    const student = await Student.create({ name, email });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: "Not found" });
    student.isActive = false;
    await student.save();
    await Enrollment.updateMany(
      { studentId: id },
      { $set: { isActive: false } }
    );
    res.json({ message: "Student soft-deleted & enrollments inactive" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/students/:id/courses", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });
    const student = await Student.findById(id);
    if (!student || !student.isActive)
      return res.status(404).json({ error: "Active student not found" });

    const enrollments = await Enrollment.find({
      studentId: id,
      isActive: true,
    }).populate({
      path: "courseId",
      match: { isActive: true },
    });
    res.json(enrollments.map((e) => e.courseId).filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- COURSES --------------------
router.post("/courses", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });
    const course = await Course.create({ title, description });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: "Not found" });
    course.isActive = false;
    await course.save();
    await Enrollment.updateMany(
      { courseId: id },
      { $set: { isActive: false } }
    );
    res.json({ message: "Course soft-deleted & enrollments inactive" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/courses/:id/students", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });
    const course = await Course.findById(id);
    if (!course || !course.isActive)
      return res.status(404).json({ error: "Active course not found" });

    const enrollments = await Enrollment.find({
      courseId: id,
      isActive: true,
    }).populate({
      path: "studentId",
      match: { isActive: true },
    });
    res.json(enrollments.map((e) => e.studentId).filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- ENROLLMENT --------------------
router.post("/enroll", async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId)
      return res.status(400).json({ error: "studentId & courseId required" });
    if (!isValidId(studentId) || !isValidId(courseId))
      return res.status(400).json({ error: "Invalid IDs" });

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);
    if (!student || !student.isActive)
      return res.status(400).json({ error: "Inactive student" });
    if (!course || !course.isActive)
      return res.status(400).json({ error: "Inactive course" });

    try {
      const enrollment = await Enrollment.create({ studentId, courseId });
      res.status(201).json(enrollment);
    } catch (err) {
      if (err.code === 11000) {
        const existing = await Enrollment.findOne({ studentId, courseId });
        if (existing && !existing.isActive) {
          existing.isActive = true;
          existing.enrolledAt = new Date();
          await existing.save();
          return res.status(200).json(existing);
        }
        return res.status(409).json({ error: "Already enrolled" });
      }
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
