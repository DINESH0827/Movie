import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB connection

const uri = process.env.MONGO_URI;

mongoose.connect(uri,) .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// Define schema and model
const movieSchema = new mongoose.Schema({
  moviename: { type: String, required: true },
  description: { type: String, required: true }, // Fixed typo and type
  image: { type: String, required: true },
});

const Movie = mongoose.model("Movie", movieSchema); // Use consistent naming

// Routes

// Create a new movie
app.post("/api/movie", async (req, res) => {
  try {
    const { moviename, description, image } = req.body;

    // Validate inputs
    if (!moviename || !description || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMovie = new Movie({ moviename, description, image });
    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all movies
app.get("/api/movie", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 0;
    const movies = await Movie.find().limit(limit);
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get movie by ID
app.get("/api/movie/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a movie by ID
app.put("/api/movie/:id", async (req, res) => {
  try {
    const { moviename, description, image } = req.body;

    // Validate inputs
    if (!moviename || !description || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { moviename, description, image },
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a movie by ID
app.delete("/api/movie/:id", async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
