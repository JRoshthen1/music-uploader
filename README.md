# Music Uploader and Metadata Setter

This is a small JavaScript application that simplifies the process of uploading your music files to a remote server while also allowing you to set metadata for the uploaded tracks. It utilizes the following libraries:

- `fluent-ffmpeg`: A popular library for handling multimedia files in Node.js.
- `formidable`: A module for parsing form data, including file uploads.
- `express`: A fast and minimalistic web framework for Node.js.
- `nodemon`: A utility that helps in automatically restarting the server during development.

## Getting Started

1. Clone this repository to your local machine.
2. Navigate to the project directory.

### Installing Dependencies

Run the following command to install the required dependencies:

`npm install`


### Running the Development Server

To start the development server with nodemon (auto-restart on code changes), use:

`npm start`

The server will be accessible at 'http://localhost:$PORT'.

### Usage

Open your web browser and navigate to http://localhost:3000.
Use the provided interface to select music files from your local machine.
Fill in the metadata fields for each track, such as title, artist, album, etc.
Click the "Submit" button to initiate the upload process.
The server will handle the file upload and metadata setting, providing relevant feedback.

### Notes

This application is a basic example and may require further customization for production use.
Make sure you have Node.js@18 and npm@9 (Node Package Manager) installed on your machine before getting started.
The remote server setup for storing the uploaded music files is not covered in this README.

Happy uploading and enjoy the convenience of managing your music collection!
