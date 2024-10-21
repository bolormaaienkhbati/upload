const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require("cors");
const crypto = require('crypto');
var bodyParser = require('body-parser')
const app = express();
const port = 4000;
// Add this line to serve our index.html page
app.use(express.static('public'));
// parse application/json
app.use(bodyParser.json())
app.use('/upload', express.static('upload'));
app.use('/image', express.static('image'));
var corsOptions = {
    origin: "*"
};
app.use(cors(corsOptions));
app.use(
    fileUpload({
        limits: {
            fileSize: 100000000, // Around 10MB
        },
        abortOnLimit: true,
    })
);
const dbConfig = require('./config/db.config')

const db = require("./models");
const Video = require('./models/video.model');
db.mongoose
    .connect(`${dbConfig.HOST}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.post('/upload',async (req, res) => {
   
    console.log("upload")
    const { image } = req.files;
    console.log(req.files)
    if (!image) return res.sendStatus(400);
    console.log("after check "+ image.mimetype)
    console.log("check ", /^video/.test(image.mimetype))
    // If does not have image mime type prevent from uploading
    if (/^video/.test(image.mimetype)==false) return res.sendStatus(400);
    console.log("before mv")
    var fileExt = image.name.split('.').pop();
    const realName =  new String(image.name,"UTF-8")
    console.log("realname ", realName)
    image.name = crypto.randomUUID()+'.'+fileExt;
    image.mv(__dirname + '/upload/' + image.name);
    console.log("after mv ", realName)
    
    const duration =300// await getVideoDurationInSeconds(__dirname + '/upload/'+video.name)
    
    const videoDuration = toHoursAndMinutes(duration)
    let vd = `${videoDuration.h}:${videoDuration.m}:${videoDuration.s}`
    console.log("link ", image.name)
    const vid = new Video({
        link:image.name,
        name:realName,
        duration:0,
        status:"uploaded"
    });
    await vid.save();
    res.status(200).json({
        error:false,
        message:"success uploaded",
        data:vid
    });
});
app.post("/updateDuration", async (req, res)=>{
    console.log("req, files ", req.body)
    const {duration, link} = req.body;
    const dur = Math.floor(parseFloat(duration));
    //const { link } = req.files;
    const video = await Video.findOne({link: link});
    video.duration = dur;
    await video.save()
    return res.json({success:false})
})
app.post("/updateVideoStatus", async (req, res)=>{
    console.log("req, files ", req.body)
    const {links, status} = req.body;
    
    const videos = await Video.find({link:{$in:links}})
    for(let i = 0; i<videos.length; i++){
        videos[i].status=status;
        await videos[i].save()
    }
    console.log("vidoes length ", videos.length)
    return res.json({success:false})
})

/* image upload */
app.post('/image', (req, res) => {
    console.log("image for upload")
    const { image } = req.files;
    console.log(req.files)
    if (!image) return res.sendStatus(400);
    console.log("after check "+ image.mimetype)
    console.log("check ", /^image/.test(image.mimetype))
    // If does not have image mime type prevent from uploading
    if (/^image/.test(image.mimetype)==false) return res.sendStatus(400);
    console.log("before mv")
    var fileExt = image.name.split('.').pop();
    image.name = crypto.randomUUID()+'.'+fileExt;
    image.mv(__dirname + '/image/' + image.name);
    console.log("after mv")
    res.status(200).json({
        error:false,
        message:"success uploaded",
        path:image.name
    });
});
const fs = require('fs');
app.get("/remove/image/", (req, res)=>{
    const p = req.query
    console.log("p ", req.query)
    let filePath = __dirname + '/image/'+p.path;
    //filePath = '/uploadImagecopy/image/02b14c36-0416-4c6a-b1c5-ff4d78fe8e0c.jpg'; // Replace with the actual path to your file
    if(p?.path==null|| p?.path==undefined||p?.path=='null'||p?.path==''){
        return  res.json({success:false, message:"Empty path"})
    }
    // Remove the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error removing file: ${err}`);
        return;
      }
    
      console.log(`File ${filePath} has been successfully removed.`);
    });
    res.json({success:true})
})
app.get("/remove/video/", (req, res)=>{
    const p = req.query
    console.log("p ", req.query)
    let filePath = __dirname + '/upload/'+p.path;
    //filePath = '/uploadImagecopy/image/02b14c36-0416-4c6a-b1c5-ff4d78fe8e0c.jpg'; // Replace with the actual path to your file
    if(p?.path==null|| p?.path==undefined||p?.path=='null'||p?.path==''){
        return  res.json({success:false, message:"Empty path"})
    }
    // Remove the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error removing file: ${err}`);
        return;
      }
    
      console.log(`File ${filePath} has been successfully removed.`);
    });
    res.json({success:true})
})
//uploadImagecopy/image/02b14c36-0416-4c6a-b1c5-ff4d78fe8e0c.jpg
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
function toHoursAndMinutes(totalSeconds) {
    const totalMinutes = Math.floor(totalSeconds / 60);
  
    const seconds = totalSeconds % 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let sec = Math.floor(seconds)
  
    return { h: `${hours<10?'0'+hours:hours}`, m: `${minutes<10?'0'+minutes: minutes}`, s: `${sec<10?'0'+sec:sec}` };
  }

//https://pqina.nl/blog/upload-image-with-nodejs/