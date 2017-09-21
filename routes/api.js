const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const router = require('express').Router();
const multer = require('multer');

const { DB_NAME, COLLECTION_NAME, db, UPLOAD_PATH } = require('../config');
const { loadCollection, filter, getLocalAddress } = require('../utils');

const upload = multer({ dest: `${UPLOAD_PATH}/`, fileFilter: filter.videos });

// post new media
router.post('/', upload.array('video', 12), async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const data = req.files.map(file => collection.insert(file));
    db.saveDatabase();
    return res.json({ success: true, message: 'upload successful', data });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.delete('/video/:id', async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const result = collection.get(req.params.id);
    collection.remove(result);
    db.saveDatabase();
    return res.json({ success: true, message: 'delete successful', result });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.get('/video/:id', async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const result = collection.get(req.params.id);
    return result ? (() => {
      const filePath = path.resolve(__dirname, '..', result.path);
      const fileSize = fs.statSync(filePath).size;
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ?
          parseInt(parts[1], 10) :
          fileSize - 1;
        const chunkSize = (end - start) + 1;
        console.log(`Range: ${start} - ${end} = ${chunkSize}`);
        res.writeHead(206, {
          'Content-Range': `bytes ${start} - ${end} / ${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4'
        });
        return fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        console.log(`All: ${fileSize}`);
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4'
        });
        return fs.createReadStream(filePath).pipe(res);
      }
    })() : res.json({ success: false, message: `Video with id ${req.params.id} does not exist.` });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.get('/link/:id', async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const result = collection.get(req.params.id);
    res.writeHead(200, {
      'Content-Type': 'application/m3u',
      'Content-Disposition': `attachment; filename='playlist.vlc'`
    });
    res.write(`#EXTM3U\nhttp://${req.hostname}:3000/api/video/${req.params.id}`);
    res.end();
  } catch (err) {
    return res.json({ sucess: false, message: err.message });
  }
});

// get all media
router.get('/', async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const data = collection.data.map(file => {
      const { $loki, originalname, encoding, mimetype, size } = file;
      return { id: $loki, name: originalname, encoding, mimetype, size, addr: req.hostname };
    });
    return res.json(data);
  } catch (err) {
    return res.json({ sucess: false, message: err.message });
  }
});

module.exports = router;
