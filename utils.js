let config = require('./config.json');
let client = require('redis').createClient(config.redis);

module.exports.checkToken = function (req, res, callback) {
  if (req.cookies.token) {
    client.get('token:'+req.cookies.token, (err, reply) => {
      if (err) {
        res.json({ err: err });
        res.end();
      } else if (!reply) {
        res.json({ err: 'Invalid token' });
        res.end();
      } else {
        callback(reply);
      }
    });
  } else {
    res.json({ err: 'Token required' });
    res.end();
  }
};

module.exports.rdnString = function (length) {
  var result = '';
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  var charsLength = chars.length;
  for (var i = 0; i < length; ++i) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
};
