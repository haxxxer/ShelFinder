

const expect = require('expect');
const request = require('supertest');
const { app } = require('./../app');
const User = require('mongoose').model('User')

const _ = require('lodash');
const { ObjectID } = require('mongodb')



let token = "";
const theUsers = [
  {
    _id: new ObjectID(),
    name: "Ali Alhaddad",
    email: "ali@gmail.com",
    password: "123123",
    dp: "https://upload.wikimedia.org/wikipedia/commons/7/71/Tom_Cruise_avp_2014_4.jpg",
  },
  {
    _id: new ObjectID(),
    name: "Abdalla Alnoman",
    email: "abdalla@gmail.com",
    password: "123123",
    dp: "https://upload.wikimedia.org/wikipedia/commons/7/71/Tom_Cruise_avp_2014_4.jpg",

  }
]


beforeEach((done) => {
  User.remove({}).then(() => {
    return new User(theUsers[0]).save()
  }).then(() => {
    return new User(theUsers[1]).save()
  }).then(() => done())
})

describe('POST /register ', () => {

  it('should create a new user', (done) => {
    let user = {
      _id: new ObjectID(),
      name: "Ahmed Saif",
      email: "ahmed@gmail.com",
      password: "123123",
      dp: "https://upload.wikimedia.org/wikipedia/commons/7/71/Tom_Cruise_avp_2014_4.jpg",
      
    }

    request(app)
      .post('/register')
      .send(user)
      .expect(201)
      .expect((res) => {
        expect(res.body.user).toInclude(_.pick(user, ["_id", 'name', 'email', 'dp']));
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find().then((users) => {
          expect(users.length).toBe(2);
          expect(users[2].name).toBe(user.name);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a new user with invalid body data', (done) => {


    request(app)
      .post('/users/register')
      .send({})
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find().then((users) => {
          expect(users.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  })
})

describe("POST /login", done => {
  const url = "/login";
  it("should login user with the correct credintials", done => {
    const email = theUsers[0].email;
    const password = theUsers[0].password;
    request(app)
      .post(url)
      .send({ email, password })
      .expect(200)
      .expect(res => {
        if (res.body.success) token = res.body.token;
        expect(res.body.success).toBeTruthy();
        expect(res.body.user.email).toBe(email);
      })
      .end(done);
  });

  it("should NOT login user with invalid credintials", (done) => {
    request(app)
      .post(url)
      .send({})
      .expect(401)
      .expect((res) => {
        expect(res.body.success).toBeFalsy();
      })
      .end(done)
  })
});

describe('GET /users/:id', () => {
  const url = '/users/' + theUsers[0]._id.toHexString();
  it('should return user info', (done) => {
    request(app)
      .get(url)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(theUsers[0].name);
      })
      .end(done);
  });

  it('should return 404 if user not found', (done) => {
    request(app)
      .get('/users/' + new ObjectID().toHexString())
      .expect(404)
      .end(done)
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .get('/users/123')
      .set('Authorization', token)
      .expect(404)
      .end(done)
  });


})

describe('PATCH /users/:id', () => {
  const url = '/users/' + theUsers[0]._id.toHexString();
  const aUser = { name: "7moodi 7sain" }
  xit('should return 401 if proper auth token was not provided', (done) => {
    request(app)
      .patch(url)
      .send(aUser)
      .expect(401)
      .end(done)
  });
  xit('should update user information with valid token was provided', (done) => {
    request(app)
      .patch(url)
      .send(aUser)
      .set("Authorization", token)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.user.name).toBe(aUser.name);
      })
      .end(done);
  });

  xit('should return 404 if user not found', (done) => {
    request(app)
      .patch('/users/' + new ObjectID().toHexString())
      .send(aUser)
      .set('Authorization', token)
      .expect(404)
      .end(done)
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .patch('/users/123')
      .send(aUser)
   
      .expect(404)
      .end(done)
  });


})



