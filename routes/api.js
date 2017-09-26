const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const router = require('express').Router();
const multer = require('multer');

const { DB_NAME, COLLECTION_NAME, db, UPLOAD_PATH } = require('../config');
const { loadCollection, filter, getLocalAddress, deleteFile, requestify } = require('../utils');

const upload = multer({ dest: `${UPLOAD_PATH}/`, fileFilter: filter.videos });

async function getEpisodeDetails(file) {
  const info = file.originalname.split('.').find(x => x.charAt(0) === 'S');
  const show = file.originalname.split('S')[0].replace(/\./g, ' ').trim();
  const [s, e] = [parseInt(info.slice(1, 3)), parseInt(info.slice(4, 6))];
  const { id } = await axios.get('http://api.tvmaze.com/singlesearch/shows?q=' + show).then(r => r.data);
  const episodeInfo = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`).then(r => r.data);
  const { name, season, number, image, summary } = episodeInfo.find(ep => ep.season === s && ep.number === e);
  return { title: show, name, season, number, image: image.original, summary };
}

// post new media
router.post('/', upload.array('video', 12), async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const data = await Promise.all(req.files.map(async file => {
      file.info = await getEpisodeDetails(file);
      collection.insert(file);
      return file;
    }));
    db.saveDatabase();
    return res.json({ success: true, message: 'upload successful', data });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

// delete existing media
router.delete('/video/:id', async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const result = collection.get(req.params.id);
    const deleted = await deleteFile(path.resolve(result.path));
    collection.remove(result);
    db.saveDatabase();
    return res.json({ success: true, message: 'delete successful', result });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.get('/video/transcode/:id', async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const result = collection.get(req.params.id);
    return result ? (() => {
      const filePath = path.resolve(__dirname, '..', result.path);
      const fileSize = fs.statSync(filePath).size;
      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': fileSize,
        'Transfer-Encoding': 'chunked'
      });
      const ffmpeg = spawn('ffmpeg', [
        '-i', filePath,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-movflags', 'faststart+frag_keyframe',
        '-strict', 'experimental',
        '-f', 'mp4',
        'pipe:1'
      ]);
      ffmpeg.on('exit', () => console.log(`ffmpeg exit`));
      ffmpeg.stderr.setEncoding('utf8');
      ffmpeg.stderr.on('data', (data) => console.error(data));
      req.on('close', () => {
        ffmpeg.kill();
      });
      return ffmpeg.stdout.pipe(res);
    })() : res.json({ success: false, message: `Video with id ${req.params.id} does not exist.` });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.get('/video/:id', async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const result = collection.get(req.params.id);
    return result ? (() => {
      const filePath = path.resolve(__dirname, '..', result.path + '.mp4');
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
          'Accept-Ranges': 'bytes',
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
    res.write(`#EXTM3U\n${req.protocol}://${req.hostname}:${process.env.PORT}/api/video/${req.params.id}`);
    res.end();
  } catch (err) {
    return res.json({ sucess: false, message: err.message });
  }
});

const axios = require('axios');

// get all media
router.get('/', async(req, res, next) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db);
    const data = collection.data.map(file => {
      const { $loki, originalname, encoding, mimetype, size, info } = file;
      return { id: $loki, name: originalname, encoding, mimetype, size, addr: `${req.hostname}:${process.env.PORT}`, protocol: req.protocol, info };
    });
    return res.json(data);
  } catch (err) {
    return res.json({ sucess: false, message: err.message });
  }
});

module.exports = router;
