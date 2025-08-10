const { Schema, model, Types } = require("mongoose");

/**
 * Mentor Schema
 * - name, expertise (string), isActive flag for soft deletes
 */
const mentorSchema = new Schema(
  {
    name: { type: String, required: true },
    expertise: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Learner Schema
 * - name, email, isActive
 */
const learnerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Session Schema (junction + metadata)
 * - mentorId (ref Mentor)
 * - topic, scheduledAt (Date), notes
 * - attendees: array of { learnerId, status, feedback }
 * - status flags: isActive (for session availability) and isArchived (true when archived)
 *
 * Attendee.status: 'registered' | 'attended' | 'cancelled'
 */
const sessionSchema = new Schema(
  {
    mentorId: { type: Types.ObjectId, ref: "Mentor", required: true },
    topic: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    notes: { type: String, default: "" },
    attendees: [
      {
        learnerId: { type: Types.ObjectId, ref: "Learner", required: true },
        status: {
          type: String,
          enum: ["registered", "attended", "cancelled"],
          default: "registered",
        },
        feedback: { type: String, default: "" },
      },
    ],
    isActive: { type: Boolean, default: true }, // session enabled/disabled
    isArchived: { type: Boolean, default: false }, // archived (excluded from active queries)
  },
  { timestamps: true }
);

// index to help queries by mentor and scheduledAt
sessionSchema.index({ mentorId: 1, scheduledAt: 1 });

const Mentor = model("Mentor", mentorSchema);
const Learner = model("Learner", learnerSchema);
const Session = model("Session", sessionSchema);

module.exports = { Mentor, Learner, Session };
