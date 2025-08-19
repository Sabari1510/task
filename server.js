require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Use MongoDB Atlas connection string from environment variable for deployment
mongoose.connect(process.env.DATABASE_URL);

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





app.listen(process.env.PORT,()=>console.log(`server is listening at port ${process.env.PORT}`));