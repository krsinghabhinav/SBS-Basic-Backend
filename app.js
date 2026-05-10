const express = require("express");
const app = express();

const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
})
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// File Upload Middleware
app.use(
    fileUpload({
        useTempFiles: true,
        limits: { fileSize: 50 * 1024 * 1024 }, // 10 MB limit
    })
);
// ✅ Routes
const userRoutes = require("./routes/user_routes");
const contactRoutes = require("./routes/contact_routes");
const authRoutes = require("./routes/auth_routes");
app.use(limiter)

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);

// ✅ Test route (debug)
app.get("/", (req, res) => {
    res.send("API is working");
});

module.exports = app;
