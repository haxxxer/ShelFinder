require('./config/config'); 
// REQUIRING DEPENDENCIES
const _          = require('lodash'),
      cors       = require('cors'),
      jwt        = require('jsonwebtoken');
      express    = require('express'),
      passport   = require('passport'),
      {ObjectID}    = require('mongodb'),
      bodyParser = require('body-parser');

// DATABASE CONFIGURATIONS
const {mongoose} = require('./db/mongoose');
const {Beacon}     = require('./models/beacon.model');
const {User}     = require('./models/user.model');
const {Book}     = require('./models/book.model');


// App Configuration and Middleware
const app  = express();
      PORT = process.env.PORT || 3000;

app.use(cors())
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
// Add middleware to console log every request
app.use(function (req, res, next) {
  console.log(req.method, req.url);
  next();
});
require('./config/passport')(passport)


// ------------------------------- ROUTING--API's --------------------------

// REGISTER ROUTE << CREATE >> 
app.post('/register', (req, res) => {
  let newUser = new User(req.body);
  newUser.save()
    .then((user) => {
      res.status(201).json({success:true, user: _.pick(user, ["_id", 'name', 'email', 'dp'])});
    }).catch(err => res.status(400).json({success: false, err}))
});
// LOGIN ROUTE << AUTHENTICATE >> 
app.post('/login', (req, res) => {
  const email = req.body.email;
  User.findOne({email})
    .then((user) => {
      if(!user) {
        return res.status(401)
          .json({
            success: false,
            msg: "User/Password is wrong"
          });
      }
     
      user.comparePassword(req.body.password, function(err, isMatch)  {
        if(err) throw err;
        if(isMatch) {
          resUser = _.pick(user, ["_id", 'name', 'email', 'location', 'phone', 'dob', 'dp']);
          const token = jwt.sign({user:resUser}, process.env.JWT_SECRET, {
            expiresIn: 86400
          });
          
          res.status(200)
            .json({
              success: true,
              token: 'JWT ' + token,
              user: resUser
            })
        } 
        else {
          return res.status(401).json({success: false, msg: "User/Password is wrong"})
        }

      })
    })
    .catch((err)=> {
      return res.status(400)
        .json({
          success: false,
          msg: "Something went wrong:" + err
        })
    })
});


// GET USER INFO
app.get('/users/:id', (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send({
        msg: "user not found!",
        success: false
    });
  }
  User.findById(req.params.id).then(
    (user) => {
      if(!user ) return res.status(404).json({success:false, msg: "User was not found!"});
      res.json(user)
    }
  )
})
// UPDATE USER INFO
app.patch('/users/:id', (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send({
        msg: "user not found!",
        success: false
    });
  }
  User.findById(req.params.id).then(user => {
    if(!user) {
      return res.status(404).send({
        msg: "user not found!",
        success: false
    });
    }
    Object.keys(req.body).forEach(key => {
      user[key] = req.body[key]
    });

    user.save().then((user) => {
      res.json({
        success: true,
        user: _.pick(user, ['_id', 'name', 'email', 'dp'])
      })
    })
  })
 // User.findByIdAndUpdate(req.params.id, req.body, {new: true}).then((user) => res.json(user));
})

// GET USERS FAVORITE TOPICS ROUTE
app.get('/users/:id/findTopics', (req, res) => {
  User.findById(req.params.id).then(
    (user) => {
      res.status(200).json(user.favorieTopics);
    }
  )
});





// ADD A NEW BOOK
app.post('/books', (req, res) => {
  Book.create(new Book(req.body)).then(
    (book) => {
      res.status(201).json(book);
    }
  )
})

// GET THE INFO OF A CERTAIN BOOK WITH _id=id
// app.get('/books/:id', (req, res) => {
  
// })
// GET ALL BOOKS PLACED IN A CERTAIN SHELF
app.get('/books/:beaconID', (req, res) => {
  console.log('hey', req.params.beaconID)
  Book.find({beaconID: req.params.beaconID}).then(
    (books) => {
      res.json(books);
    }
  )
}); 




// ADD A NEW BEACON/BOX
app.post('/beacons', (req, res) => {
  Beacon.create(new Beacon(req.body)).then(
    (beacon) => {
      res.status(201).json(beacon);
    }
  )
})


// LAUNCH SERVER ON PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. Press Ctrl+c to terminate...`)
})

// ALL MQTT, PUB/SUB LOGIC
require('./mqtt');

module.exports = { app };