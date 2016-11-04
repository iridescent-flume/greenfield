/*************  FOR FACEBOOK AUTHENTICATION  *************/
var ip = require('./env.js');

module.exports = {
  'facebookAuth': {
    'clientID': '1174473392615797',
    'clientSecret': 'b6f71776c158a48e6f3b04d8f1ebab50',
    'callbackURL': `http://${ip}:3000/auth/facebook/callback`
    //tells fb when it responds, it's secure to send data back to this path
  }
};
