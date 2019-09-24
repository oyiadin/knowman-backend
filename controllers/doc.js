const models = require('../models');

const express = require('express');
var router = express.Router();

const config = require('../config.json');
const utils = require('../utils');

var client = require('redis').createClient(config.redis);

// Create a document
router.put('/', (req, res) => {
  utils.checkToken(req, res, (userId) => {
    const url = utils.rdnString(6);
    const newDoc = {
      url: url,
      title: 'Untitled',
      ownedBy: userId,
      createdAt: Date.now,
      updatedAt: Date.now,
      permission: models._Permissions.pPublic,
      category: null,
      content: ''
    };
    models.Doc.create(newDoc, (err, doc) => {
      if (err) {
        res.json({ err: err });
      } else {
        res.json({ msg: 'OK', newDoc: doc });
      }
    })
  });
});


// Delete a document
router.delete('/:url', (req, res) => {
  utils.checkToken(req, res, (userId) => {
    models.Doc.findOne({ url: req.params.url }, (err, doc) => {
      if (err) {
        res.json({ err: err });
      } else if (!doc) {
        res.json({ err: 'No such document' });
      } else {
        if (doc.ownedBy === userId) {
          models.Doc.deleteOne({ url: req.params.url }, (err) => {
            if (err) {
              res.json({ err: err });
            } else {
              res.json({ msg: 'OK' });
            }
          });
        } else {
          res.json({ err: 'You are not allowed to delete this document' });
        }
      }
    });
  });
});


// Update the permission of a document
router.post('/:url/permission', (req, res) => {
  ;
});


// Fetch the list of history versions
router.get('/:url/history/list', (req, res) => {
  ;
});


// Fetch the info of a specific version
router.get('/:url/history/:ver', (req, res) => {
  ;
});


module.exports.registerTo = (app) => {
  app.use('/doc', router);
};
