import express from "express";
import { Movie, User, Booking } from "./models.js";

const router = express.Router();

/* ====== CREATE ROUTES ====== */
router.post("/movies", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/bookings", async (req, res) => {
  try {
    const { userId, movieId } = req.body;

    const userExists = await User.findById(userId);
    const movieExists = await Movie.findById(movieId);

    if (!userExists || !movieExists) {
      return res.status(400).json({ error: "User or Movie does not exist" });
    }

    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ====== AGGREGATION ROUTES ====== */

// 1. Total bookings and seats booked per movie
router.get("/analytics/movie-bookings", async (req, res) => {
  const data = await Booking.aggregate([
    {
      $group: {
        _id: "$movieId",
        totalBookings: { $sum: 1 },
        totalSeats: { $sum: "$seats" },
      },
    },
    {
      $lookup: {
        from: "movies",
        localField: "_id",
        foreignField: "_id",
        as: "movie",
      },
    },
    { $unwind: "$movie" },
    {
      $project: {
        _id: 0,
        movieTitle: "$movie.title",
        totalBookings: 1,
        totalSeats: 1,
      },
    },
  ]);
  res.json(data);
});

// 2. Booking history per user with movie titles
router.get("/analytics/user-bookings", async (req, res) => {
  const data = await Booking.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "movies",
        localField: "movieId",
        foreignField: "_id",
        as: "movie",
      },
    },
    { $unwind: "$movie" },
    {
      $project: {
        _id: 0,
        userName: "$user.name",
        movieTitle: "$movie.title",
        bookingDate: 1,
        seats: 1,
        status: 1,
      },
    },
  ]);
  res.json(data);
});

// 3. Top users who booked more than 2 times
router.get("/analytics/top-users", async (req, res) => {
  const data = await Booking.aggregate([
    { $group: { _id: "$userId", totalBookings: { $sum: 1 } } },
    { $match: { totalBookings: { $gt: 2 } } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userName: "$user.name",
        totalBookings: 1,
      },
    },
  ]);
  res.json(data);
});

// 4. Total seats booked per genre
router.get("/analytics/genre-wise-bookings", async (req, res) => {
  const data = await Booking.aggregate([
    {
      $lookup: {
        from: "movies",
        localField: "movieId",
        foreignField: "_id",
        as: "movie",
      },
    },
    { $unwind: "$movie" },
    {
      $group: {
        _id: "$movie.genre",
        totalSeats: { $sum: "$seats" },
      },
    },
    { $project: { _id: 0, genre: "$_id", totalSeats: 1 } },
  ]);
  res.json(data);
});

// 5. Active bookings with movie and user details
router.get("/analytics/active-bookings", async (req, res) => {
  const data = await Booking.aggregate([
    { $match: { status: "Booked" } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "movies",
        localField: "movieId",
        foreignField: "_id",
        as: "movie",
      },
    },
    { $unwind: "$movie" },
    {
      $project: {
        _id: 0,
        userName: "$user.name",
        movieTitle: "$movie.title",
        seats: 1,
        bookingDate: 1,
      },
    },
  ]);
  res.json(data);
});

export default router;
