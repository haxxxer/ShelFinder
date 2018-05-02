const mongoose = require('mongoose');
const {Schema} = mongoose;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true, minlength: 6},
  dp: {type: String, default: 'https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/user_male2-512.png'},
  favorieTopics: [{ type:String}]
})


UserSchema.methods.toJSON = function () {
  var user = this;
  return user.toObject();
};

UserSchema.methods.comparePassword = function (pass, cb) {
  bcrypt.compare(pass, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch)

  })
};


UserSchema.pre('save', function (next) {
  console.log('fired')
  var user = this

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) { next(err); }
        user.password = hash;
        console.log('password', user.password)
        next();
      })
    })
});

const User = mongoose.model('User', UserSchema);
module.exports = {User}