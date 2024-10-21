const mongoose = require("mongoose");

const Course = mongoose.model(
  "Course",
  new mongoose.Schema({
    title: String,
    briefTitle: String,
    description: String,
    features:[
        {
            type:mongoose.Schema.Types.String
        }
    ],
    image:String,
    active:Boolean,
    buyCount:Number,
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
      }
    ]
  })
);

module.exports = Course;