"use strict";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var express = require('express');

var app = express();
var users = [];

var bcrypt = require('bcrypt');

var flash = require('express-flash');

var session = require('express-session');

var methodOverride = require('method-override');
/*Connect to DB*/


var mongodb = "mongodb+srv://waelwaleed4799:waelwaleed4799@cluster0.ybxwb.mongodb.net/testDB?retryWrites=true&w=majority";

var mongoose = require('mongoose');

mongoose.connect(mongodb).then(function () {
  console.log("Connected");
})["catch"](function (err) {
  console.log(err);
});

var userM = require('./models/userModel');

var doctorM = require('./models/doctorModel');
/*Connect to DB*/


var initializePassport = require('./passport-config');

var passport = require('passport'); // initializePassport(
//     passport,
//     email => users.find(user => user.email === email),
//     id => users.find(user => user.id === id)
//     );


app.set('view-engine', 'ejs');
app.use(express.urlencoded({
  extended: true
}));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
/***********  INDEX  ***********/

app.get("/", function (req, res) {
  // console.log(req.body.name ,req.body.password)
  res.render('index.ejs', {
    name: req.body.name,
    password: req.body.password
  });
});
app.use("/index", function (req, res) {
  res.render('index.ejs');
});
/***********  EO INDEX  ***********/

/***********  Registeration  ***********/

app.get("/register", function (req, res) {
  res.render("register.ejs");
});
app.post('/register', function _callee(req, res) {
  var hashedPassword, newUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(bcrypt.hash(req.body.password, 10));

        case 3:
          hashedPassword = _context.sent;
          newUser = new userM({
            id: Date.now().toString(),
            name: req.body.name,
            gender: req.body.gender,
            DOB: req.body.DOB,
            phoneNumber: req.body.lineSwitch + req.body.phoneNumber,
            email: req.body.email,
            password: hashedPassword
          });
          newUser.save().then(function () {
            console.log("new user added");
          });
          res.redirect('/login');
          _context.next = 13;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          console.log("didn't make it");
          res.redirect('/register');

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
});
app.get('/docRegister', function (req, res) {
  res.render('Dregister.ejs');
});
app.post('/docRegister', function _callee2(req, res) {
  var hashedPassword, newDoc;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(bcrypt.hash(req.body.password, 10));

        case 3:
          hashedPassword = _context2.sent;
          newDoc = new doctorM({
            id: Date.now().toString(),
            name: req.body.name,
            DOB: req.body.DOB,
            phoneNumber: req.body.lineSwitch + req.body.phoneNumber,
            gender: req.body.gender,
            email: req.body.email,
            password: hashedPassword
          });
          newDoc.save().then(function () {
            console.log("Doctor added successfuly");
          }); //newUser.save().then(()=>{ console.log("new user added") });

          res.redirect('/login');
          _context2.next = 13;
          break;

        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          console.log("Didn't Make it");
          res.redirect('/docRegister');

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
});
/***********  EO Registeration  ***********/

/***********  Log-in/Out  ***********/

app.get("/login", function (req, res) {
  res.render("login.ejs");
});
app.post('/login', function _callee3(req, res) {
  var hashedPassword, foundUser;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(bcrypt.hash(req.body.password, 10));

        case 3:
          hashedPassword = _context3.sent;
          _context3.next = 6;
          return regeneratorRuntime.awrap(userM.find({
            email: req.body.email
          }));

        case 6:
          foundUser = _context3.sent;

          if (hashedPassword === foundUser[0]["password"]) {
            console.log("Right password");
            res.render('index.ejs', {
              name: foundUser[0]["name"],
              password: foundUser[0]["password"]
            });
          } else {
            console.log(hashedPassword);
            console.log(foundUser[0]["password"]);
            console.log("wrong password");
            res.redirect('/login');
          }

          _context3.next = 14;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          console.log(_context3.t0);
          res.redirect('/login');

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 10]]);
});
app["delete"]('/logout', function (req, res) {
  req.logOut();
  res.redirect('/login');
});
/***********  EO Log-in/Out  ***********/

app.get('/Dregister', function (req, res) {
  res.render('Dregister.ejs');
}); // app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }));
// app.use('/update', (req, res,)=>{
//     res.render('update.ejs')
// })

app.get('/update', function (req, res) {
  res.render('update.ejs', {
    name: req.user.name,
    email: req.user.email
  });
});
app.post('/update', function _callee4(req, res) {
  var hashedPassword;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(bcrypt.hash(req.body.password, 10));

        case 2:
          hashedPassword = _context4.sent;
          users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
          });
          console.log(users);
          res.redirect('/');

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  });
});
app.get('/DocList', function (req, res) {
  var foundDocs = doctorM.find();
  res.render('DocList.ejs', {
    docs: foundDocs
  });
}); // app.post('/update', checkAuthenticated, async (req, res)=>{
//     const oldUser = req.find(email);
//     const hashedPassword = await bcrypt.hash(oldUser.password, 10)
//     users.delete(oldUser.id)
//     users.push({
//         id: oldUser.id,
//         name: oldUser.name,
//         password: hashedPassword
//     })
//     console.log(users[oldUser])
// })

/**********Functions**************/

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  next();
}
/**********EOFunctions**************/


app.listen(3000);