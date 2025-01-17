const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const cors = require("cors");
const cookieParser = require('cookie-parser');

// Load environment variables from .env file
dotenv.config();

// Middleware

// Create a middleware to check the database connection
const checkDatabaseConnection = (req, res, next) => {
    // Check if the database connection is ready
    if (mongoose.connection.readyState === 1) { // 1 indicates the connection is open
      next(); // Proceed to the next middleware or route handler
    } else {
      res.status(500).json({ error: 'Database connection is not established' });
    }
  };
  
  mongoose.connection.on('connected', () => {
    // Iterate through all models and apply the hook
    mongoose.modelNames().forEach((modelName) => {
      const model = mongoose.model(modelName);
      model.schema.pre('save', function (next) {
        const currentDate = new Date();
      
        if (!this.created_at) {
          this.created_at = currentDate;
        }
      
        this.updated_at = currentDate;
        next();
      });
    });
  });
  
// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173','https://nitjtt.netlify.app'], // Change this to your allowed origins or '*' to allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type',
    credentials: true, // Set to true if you need to allow credentials (e.g., cookies)
  }));
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkDatabaseConnection);

// Routes

const timetableModule = require("./modules/timetableModule/routes/index");
app.use("/timetablemodule", timetableModule);

const uploadModule = require("./modules/uploadModule/upload")
app.use("/upload", uploadModule);

const attendanceModule = require("./modules/attendanceModule/routes/index");
app.use("/attendancemodule", attendanceModule);

const usermanagementModule=require("./modules/usermanagement/routes")
app.use("/auth", usermanagementModule);

app.get('/', (req, res) => {
    res.send("Hello India");
});


// Connect to MongoDB and listen for events
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
        // Start the Express server once connected to MongoDB
        app.listen(8000, () => {
            console.log("Server started on port 8000");
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});
