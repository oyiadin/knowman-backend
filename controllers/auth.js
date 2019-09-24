const models = require('../models');

const express = require('express');
var router = express.Router();

const config = require('../config.json');
const utils = require('../utils');
var client = require('redis').createClient(config.redis);


// Register
router.put('/', (req, res) => {
  models.User.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      res.json({ err: err });
    } else if (user) {
      res.json({ err: 'User already existed' });
    } else {
      const newUser = {
        username: req.body.username,
        hashedPassword: req.body.hashedPassword,
      };
      models.User.create(newUser, (err, user) => {
        if (err) {
          res.json({ err: err });
        } else {
          res.json({ msg: 'OK' });
        }
      });
    }
  });
});


// Login
router.post('/', (req, res) => {
  data = {
    username: req.body.username,
    hashedPassword: req.body.hashedPassword
  };
  models.User.findOne(data, (err, user) => {
    if (err) {
      res.json({ err: err });
    } else if (!user) {
      res.json({ err: 'No such user' });
    } else {
      (function check() {
        var id = utils.rdnString(58);
        client.get('token:'+id, (err, reply) => {
          if (reply === null) {
            client.set('token:'+id, user._id.toString(), 'EX', 60*60*24*7+60);
            res.cookie('token', id, { maxAge: 1000*60*60*24*7 });  // 7 days
            res.json({ token: id });
          } else {
            check();
          }
        })
      })();
    }
  });
});


// Logout
router.delete('/', (req, res) => {
  console.log(req.body.token);
  client.del('token:'+req.body.token, (err, reply) => {
    res.clearCookie('token');
    res.json({ message: "OK" });
  })
});


// User information
router.get('/userInfo', (req, res) => {
  utils.checkToken(req, res, (userId) => {
    models.User.findOne({ _id: userId }, (err, user) => {
      if (err) {
        res.json({ err: err });
      } else {
        res.json({
          user: {
            username: user.username
          }
        });
      }
      res.end();
    })
  });
});


module.exports.registerTo = (app) => {
  app.use('/auth', router);
};
