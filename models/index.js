const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.course = require("./course.model");
db.video = require("./video.model");

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;