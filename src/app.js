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
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <title>Music Upload</title>
  </head>
  <body>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file_upload" />

      <div class="checkbox-container">
        <input type="checkbox" name="switch">
        <label for="switch">Use file name as title?</label>
      </div>
      
      <label for="title">Title</label>
      <input type="text" name="title" />
      <label for="artist">Artist</label>
      <input type="text" name="artist" />
      <label for="album">Album</label>
      <input type="text" name="album" />
      <label for="genre">Genre</label>
      <input type="text" name="genre" />
      <input type="submit" value="Submit" />
    </form>
  </body>

  <script>
  document.addEventListener('DOMContentLoaded', function() {
    const checkboxElement = document.querySelector("input[name='switch']");
    checkboxElement.checked = false;
  });
  const switchInput = document.querySelector("input[name='switch']");
  const titleInputElement = document.querySelector("input[name='title']");
  switchInput.addEventListener("change", function() {
    if (switchInput.checked) {
      titleInputElement.disabled = true;
    } else {
      titleInputElement.disabled = false;
    }
  });
  </script>

<style>
body {
  width: 100%;
  display: flex;
  justify-content: center;    }
input[type="text"] {
  padding: 6px;
  margin: 4px 0;
}
label {
  margin: 12px 0 0 0;
}
form {
  width: 50%;
  display: flex;
  flex-direction: column;
}
input[type="submit"] {
  margin: 16px 0;
  padding: 10px 0;
  border: solid 1px rgb(0, 44, 97);
  background-color: rgb(0, 108, 241);
  color: white;
}
input[type="file"] {
  border: 1px solid #8f8f9d;
  padding: 10px;
}
.checkbox-container{
  margin: 16px 0;
}
</style>
</html>
`);
});

app.post("/upload", (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Error uploading files" });
    } else {
      const file = files.file_upload[0];

      // metadata keys can be added according to ffmpeg docs
      const metadata = {
        title:
          fields.switch == "on"
            ? cleanFileNameForTitle(file.originalFilename)
            : fields.title,
        artist: fields.artist,
        album: fields.album,
        year: fields.year,
        genre: fields.genre,
      };

      setVideoMetadata(file.filepath, metadata)
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
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function setVideoMetadata(inputPath, metadata) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadataInfo) => {
      if (err) {
        reject(err);
        return;
      }
      // Set file Name
      const outputFilename = musicDir + metadata.title + ".mp3";
      const outputOptions = [];

      // Set the metadata
      for (const key in metadata) {
        if (metadata.hasOwnProperty(key)) {
          outputOptions.push("-metadata", `${key}=${metadata[key]}`);
        }
      }
      const command = ffmpeg()
        .input(inputPath)
        .outputOptions(outputOptions)
        .on("end", () => resolve(outputFilename))
        .on("error", (err) => reject(err))
        .save(outputFilename);
    });
  });
}

// remove the extension of filename and sanitize it if needed to use as title
function cleanFileNameForTitle(fileName) {
  cleanFileName = fileName.replace(/[:<>"/\\|?*\s]/g, "_");
  const lastDotIndex = cleanFileName.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return cleanFileName.substring(0, lastDotIndex);
  }
  return cleanFileName;
}
