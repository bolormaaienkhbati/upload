const mongoose = require("mongoose");

const Video = mongoose.model(
  "Video",
  new mongoose.Schema({
    link: String,
    duration: Number,
    name: String,
    status:String
  })
);

module.exports = Video;