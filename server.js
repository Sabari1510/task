require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Use MongoDB Atlas connection string from environment variable for deployment
const dbUrl = process.env.DATABASE_URL;
mongoose.connect(dbUrl);

const app = express();
const db = mongoose.connection;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Task Management API is running!");
});
db.on("error",(err)=>console.log(err));
db.on("open",()=>console.log("DATABASE CONNECTED"));

const tasRouter = require("./routes/tasks");
app.use("/api/tasks",tasRouter)





const port = process.env.PORT || 3001;
app.listen(port,()=>console.log(`server is listening at port ${port}`));