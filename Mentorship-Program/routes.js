const express = require("express");
const mongoose = require("mongoose");
const { Mentor, Learner, Session } = require("./models");

const router = express.Router();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================
   CREATE OPERATIONS
   ========================= */

// Create Mentor
// POST /api/mentors  { name, expertise }
router.post("/mentors", async (req, res) => {
  try {
    const { name, expertise } = req.body;
    if (!name || !expertise)
      return res.status(400).json({ error: "name and expertise required" });
    const mentor = await Mentor.create({ name, expertise });
    res.status(201).json(mentor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Learner
// POST /api/learners  { name, email }
router.post("/learners", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "name and email required" });
    const existing = await Learner.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Learner with this email exists" });
    const learner = await Learner.create({ name, email });
    res.status(201).json(learner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Session (registers mentors + learners can be added to attendees separately or included here)
// POST /api/sessions
// body: { mentorId, topic, scheduledAt (ISO), notes, attendees: [{ learnerId, status? }] }
router.post("/sessions", async (req, res) => {
  try {
    const { mentorId, topic, scheduledAt, notes, attendees = [] } = req.body;
    if (!mentorId || !topic || !scheduledAt)
      return res
        .status(400)
        .json({ error: "mentorId, topic, scheduledAt required" });
    if (!isValidId(mentorId))
      return res.status(400).json({ error: "Invalid mentorId" });

    const mentor = await Mentor.findById(mentorId);
    if (!mentor || !mentor.isActive)
      return res.status(400).json({ error: "Mentor not found or inactive" });

    // Validate attendees: ensure learners exist and are active
    for (const a of attendees) {
      if (!isValidId(a.learnerId))
        return res
          .status(400)
          .json({ error: "Invalid learnerId in attendees" });
      const learner = await Learner.findById(a.learnerId);
      if (!learner || !learner.isActive)
        return res
          .status(400)
          .json({ error: `Learner ${a.learnerId} not found or inactive` });
    }

    const session = await Session.create({
      mentorId,
      topic,
      scheduledAt: new Date(scheduledAt),
      notes,
      attendees: attendees.map((a) => ({
        learnerId: a.learnerId,
        status: a.status || "registered",
        feedback: a.feedback || "",
      })),
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   READ / QUERY OPERATIONS
   Use only Mongoose inbuilt query helpers: find, sort, select, populate, countDocuments, limit...
   ========================= */

// Find all active sessions for a given mentor
// GET /api/mentors/:id/sessions
router.get("/mentors/:id/sessions", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid mentor id" });

    // only active & not archived sessions
    const sessions = await Session.find({
      mentorId: id,
      isActive: true,
      isArchived: false,
    })
      .sort({ scheduledAt: 1 })
      .populate("attendees.learnerId", "name email");

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Find all active sessions for a learner
// GET /api/learners/:id/sessions
router.get("/learners/:id/sessions", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid learner id" });

    // Query sessions where attendees include this learner and session active & not archived
    const sessions = await Session.find({
      "attendees.learnerId": id,
      isActive: true,
      isArchived: false,
    })
      .sort({ scheduledAt: 1 })
      .populate("mentorId", "name expertise");

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch recent sessions (active only) sorted by scheduledAt desc, limit 5
// GET /api/sessions/recent
router.get("/sessions/recent", async (req, res) => {
  try {
    const recent = await Session.find({ isActive: true, isArchived: false })
      .sort({ scheduledAt: -1 })
      .limit(5)
      .populate("mentorId", "name expertise")
      .populate("attendees.learnerId", "name email");
    res.json(recent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Count number of learners who attended a particular mentor's sessions
// GET /api/mentors/:id/learners/attended/count
// The count is unique learners with status 'attended' across mentor's sessions
router.get("/mentors/:id/learners/attended/count", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid mentor id" });

    // find sessions for this mentor (active or archived? requirement: count who attended mentor's sessions => include active only)
    const sessions = await Session.find({ mentorId: id, isArchived: false });

    const learnerSet = new Set();
    for (const s of sessions) {
      for (const att of s.attendees) {
        if (att.status === "attended") learnerSet.add(att.learnerId.toString());
      }
    }

    res.json({ mentorId: id, uniqueAttendedLearnersCount: learnerSet.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all mentors a learner has ever interacted with
// GET /api/learners/:id/mentors
router.get("/learners/:id/mentors", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid learner id" });

    // find sessions where this learner participated (any status)
    const sessions = await Session.find({
      "attendees.learnerId": id,
      isArchived: false,
    }).populate("mentorId", "name expertise");

    const mentorsMap = new Map();
    for (const s of sessions) {
      if (s.mentorId && s.mentorId._id)
        mentorsMap.set(s.mentorId._id.toString(), s.mentorId);
    }

    res.json([...mentorsMap.values()]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all learners for a particular session
// GET /api/sessions/:id/learners
router.get("/sessions/:id/learners", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid session id" });

    const session = await Session.findById(id).populate(
      "attendees.learnerId",
      "name email isActive"
    );
    if (!session) return res.status(404).json({ error: "Session not found" });

    // return attendees with learner details + status + feedback
    const attendees = session.attendees.map((a) => ({
      learner: a.learnerId,
      status: a.status,
      feedback: a.feedback,
    }));

    res.json({ sessionId: id, attendees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch mentors with NO active sessions currently scheduled
// GET /api/mentors/no-active
router.get("/mentors/no-active", async (req, res) => {
  try {
    // find active mentors
    const mentors = await Mentor.find({ isActive: true });

    // For each mentor, check if there is any session that is active & not archived
    const result = [];
    for (const m of mentors) {
      const count = await Session.countDocuments({
        mentorId: m._id,
        isActive: true,
        isArchived: false,
      });
      if (count === 0) result.push(m);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Identify learners who have attended more than 3 sessions
// GET /api/learners/highly-engaged?threshold=3
router.get("/learners/highly-engaged", async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold || "3", 10);

    // find sessions (non-archived) and count 'attended' statuses per learner
    const sessions = await Session.find({ isArchived: false });
    const counts = new Map(); // learnerId -> count

    for (const s of sessions) {
      for (const a of s.attendees) {
        if (a.status === "attended") {
          const key = a.learnerId.toString();
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
    }

    const learnerIds = [];
    for (const [id, cnt] of counts.entries())
      if (cnt > threshold) learnerIds.push(id);

    // fetch learner details
    const learners = await Learner.find({ _id: { $in: learnerIds } }).select(
      "name email"
    );
    res.json({ threshold, matchedCount: learners.length, learners });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   SOFT DELETE / CASCADE
   ========================= */

// Soft-delete mentor: disable mentor and disable upcoming sessions
// DELETE /api/mentors/:id
router.delete("/mentors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid mentor id" });

    const mentor = await Mentor.findById(id);
    if (!mentor) return res.status(404).json({ error: "Mentor not found" });
    if (!mentor.isActive)
      return res.status(400).json({ error: "Mentor already inactive" });

    mentor.isActive = false;
    await mentor.save();

    // disable upcoming sessions (scheduledAt in future) - mark isActive false
    const now = new Date();
    await Session.updateMany(
      {
        mentorId: id,
        scheduledAt: { $gt: now },
        isActive: true,
        isArchived: false,
      },
      { $set: { isActive: false } }
    );

    res.json({ message: "Mentor deactivated and upcoming sessions disabled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft-delete learner: deactivate learner and mark their attendance in upcoming sessions as 'cancelled'
// DELETE /api/learners/:id
router.delete("/learners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid learner id" });

    const learner = await Learner.findById(id);
    if (!learner) return res.status(404).json({ error: "Learner not found" });
    if (!learner.isActive)
      return res.status(400).json({ error: "Learner already inactive" });

    learner.isActive = false;
    await learner.save();

    // For upcoming sessions where this learner is registered, mark their attendee.status = 'cancelled'
    const now = new Date();
    // find relevant sessions
    const sessions = await Session.find({
      scheduledAt: { $gt: now },
      "attendees.learnerId": id,
      isArchived: false,
    });

    for (const s of sessions) {
      let updated = false;
      for (const a of s.attendees) {
        if (a.learnerId.toString() === id && a.status === "registered") {
          a.status = "cancelled";
          updated = true;
        }
      }
      if (updated) await s.save();
    }

    res.json({
      message: "Learner deactivated and future attendance cancelled",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft-delete (archive) a session instead of permanent delete
// DELETE /api/sessions/:id  -> sets isArchived=true (and isActive=false)
router.delete("/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid session id" });

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    session.isArchived = true;
    session.isActive = false;
    await session.save();

    res.json({ message: "Session archived (soft-deleted)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UTILITY endpoints (optional)
   ========================= */

// Add a learner to a session (register)
// POST /api/sessions/:id/register  body: { learnerId }
router.post("/sessions/:id/register", async (req, res) => {
  try {
    const { id } = req.params;
    const { learnerId } = req.body;
    if (!isValidId(id) || !isValidId(learnerId))
      return res.status(400).json({ error: "Invalid IDs" });

    const session = await Session.findById(id);
    if (!session || !session.isActive || session.isArchived)
      return res.status(400).json({ error: "Session not available" });

    const learner = await Learner.findById(learnerId);
    if (!learner || !learner.isActive)
      return res.status(400).json({ error: "Learner not found or inactive" });

    // prevent duplicate registration
    const exists = session.attendees.some(
      (a) => a.learnerId.toString() === learnerId
    );
    if (exists)
      return res
        .status(409)
        .json({ error: "Learner already registered for this session" });

    session.attendees.push({ learnerId, status: "registered" });
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark attendance for a learner in session
// POST /api/sessions/:id/mark-attended  body: { learnerId, feedback? }
router.post("/sessions/:id/mark-attended", async (req, res) => {
  try {
    const { id } = req.params;
    const { learnerId, feedback } = req.body;
    if (!isValidId(id) || !isValidId(learnerId))
      return res.status(400).json({ error: "Invalid IDs" });

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const att = session.attendees.find(
      (a) => a.learnerId.toString() === learnerId
    );
    if (!att)
      return res
        .status(404)
        .json({ error: "Learner not registered for this session" });

    att.status = "attended";
    if (feedback) att.feedback = feedback;
    await session.save();

    res.json({ message: "Marked attended", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
