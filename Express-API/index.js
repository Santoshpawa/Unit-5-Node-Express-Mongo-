const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

const getStudents = () => {
  const data = fs.readFileSync("./db.json", "utf-8");
  return JSON.parse(data).students;
};

const saveStudents = (students) => {
  fs.writeFileSync("./db.json", JSON.stringify({ students }, null, 2));
};

// Add a student
app.post("/students", (req, res) => {
  const students = getStudents();
  const newStudent = req.body;
  students.push(newStudent);
  saveStudents(students);
  res.status(201).json({ message: "Student added", student: newStudent });
});

// Get all students
app.get("/students", (req, res) => {
  const students = getStudents();
  res.json(students);
});

// Get student by ID
app.get("/students/:id", (req, res) => {
  const students = getStudents();
  const student = students.find((s) => s.id === parseInt(req.params.id));
  if (student) res.json(student);
  else res.status(404).json({ message: "No students found" });
});

// Update student by ID
app.put("/students/:id", (req, res) => {
  let students = getStudents();
  const id = parseInt(req.params.id);
  const index = students.findIndex((s) => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...req.body };
    saveStudents(students);
    res.json({ message: "Student updated", student: students[index] });
  } else {
    res.status(404).json({ message: "No students found" });
  }
});

// Delete student by ID
app.delete("/students/:id", (req, res) => {
  let students = getStudents();
  const initialLength = students.length;
  students = students.filter((s) => s.id !== parseInt(req.params.id));
  if (students.length < initialLength) {
    saveStudents(students);
    res.json({ message: "Student deleted" });
  } else {
    res.status(404).json({ message: "No students found" });
  }
});

// Search students by course
app.get("/students/search", (req, res) => {
  const course = req.query.course?.toLowerCase();
  const students = getStudents();
  const filtered = students.filter((s) =>
    s.course.toLowerCase().includes(course)
  );
  if (filtered.length > 0) res.json(filtered);
  else res.status(404).json({ message: "No students found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
