const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('mongoose').model('User');


module.exports = function(passport){
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = process.env.JWT_SECRET;
  passport.use(new JwtStrategy(opts, function (jwt_payload, done) {

    User.findOne({_id: jwt_payload.user._id}).then((user) => {
      // console.log(jwt_payload);
      if(!user) {
        console.log(jwt_payload)
        return done(null, false)
      }

      done(null, user)
    }, (err)=> {
      return done(err, false)
    } )
  }));
}
