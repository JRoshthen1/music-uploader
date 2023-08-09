require("dotenv").config();
const express = require("express");
const fs = require("fs");
const formidable = require("formidable");
const ffmpeg = require("fluent-ffmpeg");

const app = express();
app.use(express.static("public"));

const PORT = process.env.PORT;
const musicDir = process.env.UPLOAD_DIRECTORY_PATH;

app.get("/", (req, res) => {
  console.log(musicDir);
  res.send("index.html");
});

app.post("/upload", (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Error uploading files" });
    } else {
      const file = files.file_upload[0];

      // Keep all metadata
      if (fields.allMetadataSwitch == "on") {
        keepMetadataAndUploadTrack(file.filepath)
          .then((outputFilename) => {
            res.send(`
        <p>"${outputFilename}" has been written.</p>
        <br>
        <a href='/'>Back to Home</a>`);
          })
          .catch((error) => {
            console.error(error);
            res.send(`<p>${error}</p>
        <br>
        <a href='/'>Back to Home</a>`);
          });
      }
      // Set all metadata
      else {
        setMetadataAndUploadTrack(file.filepath, fields, file.originalFilename)
          .then((outputFilename) => {
            res.send(`
                 <p>"${outputFilename}" has been written.</p>
                 <br>
                 <a href='/'>Back to Home</a>`);
          })
          .catch((error) => {
            console.error(error);
            res.send(`<p>${error}</p>
                 <br>
                 <a href='/'>Back to Home</a>`);
          });
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// upload a single file with setting the metadata manually
function setMetadataAndUploadTrack(inputFilePath, fields, originalFilename) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputFilePath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      // metadata keys can be added according to ffmpeg docs
      const metadata = {
        title:
          fields.titleSwitch == "on"
            ? removeFileExtension(originalFilename)
            : fields.title,
        artist: fields.artist,
        album: fields.album,
        year: fields.year,
        genre: fields.genre,
      };

      // Set file Name
      const outputFilename = musicDir + cleanForFileName(metadata.title) + ".mp3";
      const outputOptions = [];

      console.log(outputFilename);
      // Set the metadata
      for (const key in metadata) {
        if (metadata.hasOwnProperty(key)) {
// THE METADATA DOESNT TAKE WHITESPACES FOR SOME REASON
          outputOptions.push("-metadata", `${key}=${metadata[key]}`);
        }
      }
      const command = ffmpeg()
        .input(inputFilePath)
        .outputOptions(outputOptions)
        .on("end", () => resolve(outputFilename))
        .on("error", (err) => reject(err))
        .save(outputFilename);
    });
  });
}

// upload a single file with keeping all the metadata from the original file
function keepMetadataAndUploadTrack(inputFilePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputFilePath, function (err, metadata) {
      if (err) {
        reject(err);
        return;
      }
      // Grab the original metadata
      const originalMetadata = {
        title: metadata.streams[0].tags.title,
        artist: metadata.streams[0].tags.artist,
        album: metadata.streams[0].tags.album,
        year: metadata.streams[0].tags.year,
        genre: metadata.streams[0].tags.genre,
      };

      const outputOptions = [];

      // Set the metadata
      for (const key in originalMetadata) {
        if (originalMetadata.hasOwnProperty(key)) {
          outputOptions.push(`-metadata ${key}=${originalMetadata[key]}`);
        }
      }
      // clean the title and set it as a name of the file
      const outputFilename = `${musicDir}${cleanForFileName(originalMetadata.title)}.mp3`;
      console.log(outputFilename);

      const command = ffmpeg()
        .input(inputFilePath)
        .outputOptions(outputOptions)
        .on("end", () => resolve(outputFilename))
        .on("error", (err) => reject(err))
        .save(outputFilename);
    });
  });
}

// remove the extension of filename and sanitize it if needed to use as title
function cleanForFileName(x) {
  console.log(x)
  //THIS IS NOT SUPPOSED TO BE AN OBJECT
  x[0].replace(/[:<>"/\\|?*\s]/g, "_");
  var y = removeFileExtension(x)
  return y
}
function removeFileExtension(fileName){
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return fileName.substring(0, lastDotIndex);
  }
  return fileName;
}