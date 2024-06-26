const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const inputPath = req.file.path;
  const outputPath = path.join("uploads", `${req.file.filename}.mp3`);

  ffmpeg(inputPath)
    .output(outputPath)
    .on("end", () => {
      fs.unlinkSync(inputPath);
      res.download(outputPath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error occurred during download");
        }
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", (err) => {
      console.error(err);
      res.status(500).send("Error occurred during conversion");
    })
    .run();
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Media server is running on port ${PORT}`);
});
