const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");

const app = express();

// Middlewares
app.use(express.json({ extended: false }));

// Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));

// Connect to Db
mongoose.connect(
  process.env.DB_Connect,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useFindAndModify: false,
  },
  () => {
    console.log("Connected to DB");
  }
);

app.get("/", (req, res) => res.send("Hello API"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening up to http://localhost:${PORT}`));
