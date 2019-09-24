module.exports.checkToken = function (req, res, callback) {
  var err;
  if (req.cookies.token) {
    client.get('token:'+req.cookies.token, (err, reply) => {
      if (err) {
        res.json({ err: err });
      } else if (!reply) {
        res.json({ err: 'Invalid token' });
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
