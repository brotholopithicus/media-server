const Loki = require('lokijs');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalAddress() {
  return os.networkInterfaces().en1.find(interface => interface.family === 'IPv4').address || '0.0.0.0';
}

function deleteFile(file) {
  return new Promise((resolve, reject) => fs.unlink(file, (err) => err ? reject(err) : resolve(null)));
}

function cleanDirectory(dirPath) {
  fs.readdir(dirPath, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      const filePath = path.resolve(dirPath, file);
      fs.unlink(filePath, (err) => {
        if (err) throw err;
      });
    });
  });
  console.log(`Successfully cleaned ${dirPath}`);
}

function loadCollection(collectionName, db) {
  return new Promise((resolve, reject) => {
    const _collection = db.getCollection(collectionName) || db.addCollection(collectionName);
    resolve(_collection);
  });
}

const filter = {
  images(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    return cb(null, true);
  },
  videos(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|mkv)$/)) {
      return cb(new Error('Only video files are allowed!'), false);
    }
    return cb(null, true);
  }
}

function requestify(config, data) {
  if (typeof config === 'string') config = require('url').parse(config);
  return new Promise((resolve, reject) => {
    const protocol = config.protocol === 'https:' ? require('https') : require('http');
    const req = protocol.request(config, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) return reject(new Error(`Request Failed: StatusCode = ${res.statusCode}`));
      const body = [];
      res.on('data', (chunk) => body.push(chunk));
      res.on('end', () => resolve(body.join('')));
    });
    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

module.exports = {
  loadCollection,
  filter,
  cleanDirectory,
  getLocalAddress,
  deleteFile,
  requestify
};
