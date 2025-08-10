import mongoose from "mongoose";

export const movieSchema = new mongoose.Schema({
  _id: String,
  title: String,
  genre: String,
  releaseYear: Number,
  durationMins: Number,
});

export const userSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  joinedAt: Date,
});

export const bookingSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  movieId: String,
  bookingDate: Date,
  seats: Number,
  status: String, // "Booked", "Cancelled"
});

export const Movie = mongoose.model("Movie", movieSchema);
export const User = mongoose.model("User", userSchema);
export const Booking = mongoose.model("Booking", bookingSchema);
