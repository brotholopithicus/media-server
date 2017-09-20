const path = require('path');

const Loki = require('lokijs');
const { loadCollection } = require('../utils');

const DB_NAME = 'video.json';
const COLLECTION_NAME = 'video';
const UPLOAD_PATH = path.resolve(__dirname, '..', 'media/video');
const THUMB_PATH = path.resolve(__dirname, '..', 'media/images');

const dbOptions = {
  autoload: true,
  autoloadCallback: () => loadCollection(COLLECTION_NAME, db),
  autosave: true,
  autosaveInterval: 4000
};

const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, dbOptions);

module.exports = { DB_NAME, COLLECTION_NAME, db, UPLOAD_PATH, THUMB_PATH };
