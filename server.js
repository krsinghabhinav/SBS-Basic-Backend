// const http = require("http");
// const app = require("./app");
// const mongoose = require("mongoose");
// const server = http.createServer(app);
// const PORT = 8000;
// mongoose
//   .connect(
//     "mongodb+srv://aksingh2000:aksingh2000@contactproject.f400bt3.mongodb.net/CONTACT?retryWrites=true&w=majority&appName=contactproject"


//   )
//   .then(() => {
//     console.log("Connected to MongoDB........Done");
//   })
//   .catch((err) => {
//     console.error("Failed to connect to MongoDB", err);
//   });
// app.listen(PORT, () => {
//   console.log("Server is running on port " + PORT, "http://localhost:" + PORT);
// });

require("dotenv").config();

const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
  });