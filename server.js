if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const users = [];
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

/*Connect to DB*/
const mongodb = "mongodb+srv://waelwaleed4799:waelwaleed4799@cluster0.ybxwb.mongodb.net/testDB?retryWrites=true&w=majority"
const mongoose = require('mongoose');
mongoose.connect(mongodb).then(()=>{ console.log("Connected"); }).catch(err=>{ console.log(err); });

const userM = require('./models/userModel');
const doctorM = require('./models/doctorModel');

/*Connect to DB*/

const initializePassport = require('./passport-config');
const passport = require('passport');
// initializePassport(
//     passport,
//     email => users.find(user => user.email === email),
//     id => users.find(user => user.id === id)
//     );

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
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
app.get("/", (req,res)=>{
    // console.log(req.body.name ,req.body.password)
    res.render('index.ejs', { name: req.body.name, password: req.body.password });
});

app.use("/index", (req, res)=>{
    res.render('index.ejs');
})
/***********  EO INDEX  ***********/

/***********  Registeration  ***********/
app.get("/register", (req,res)=>{
    res.render("register.ejs");
});

app.post('/register', async (req,res)=>{

    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new userM({
            id: Date.now().toString(),
            name: req.body.name,
            gender: req.body.gender,
            DOB: req.body.DOB,
            phoneNumber: req.body.lineSwitch + req.body.phoneNumber,
            email: req.body.email,
            password: hashedPassword
        });
        newUser.save().then(()=>{ console.log("new user added") });
        res.redirect('/login');
    }catch{
        console.log("didn't make it");
        res.redirect('/register');
    }

});

app.get('/docRegister', (req, res)=>{
    res.render('Dregister.ejs');
});

app.post('/docRegister', async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        const newDoc = new doctorM({
            id: Date.now().toString(),
            name: req.body.name,
            DOB: req.body.DOB,
            phoneNumber: req.body.lineSwitch + req.body.phoneNumber,
            gender: req.body.gender,
            email: req.body.email,
            password: hashedPassword
        });
        newDoc.save().then(()=>{ console.log("Doctor added successfuly") });
        //newUser.save().then(()=>{ console.log("new user added") });
        res.redirect('/login');
    }catch{
        console.log("Didn't Make it");
        res.redirect('/docRegister');
    }
});
/***********  EO Registeration  ***********/

/***********  Log-in/Out  ***********/
app.get("/login", (req,res)=>{
    res.render("login.ejs");
});

app.post('/login', async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const foundUser = (await userM.find({email: req.body.email}));

        if( hashedPassword === foundUser[0]["password"] ){
            console.log("Right password");
            res.render('index.ejs', { name: foundUser[0]["name"], password: foundUser[0]["password"] })

        }else{
            console.log(hashedPassword);
            console.log(foundUser[0]["password"]);
            console.log("wrong password");
            res.redirect('/login')
        }
        
    }catch(err){
        console.log(err)
        res.redirect('/login')
    }
});

app.delete('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/login')
})
/***********  EO Log-in/Out  ***********/

app.get('/Dregister',(req,res)=>{
    res.render('Dregister.ejs')
});

// app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }));


// app.use('/update', (req, res,)=>{
//     res.render('update.ejs')
// })
app.get('/update', (req, res)=>{
    res.render('update.ejs', { name: req.user.name, email: req.user.email })
})

app.post('/update', async ( req, res,)=>{
    // const user = users.find(req.body.id)
    // console.log(user)
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
    console.log(users)
    res.redirect('/')
})

app.get('/DocList', (req,res,)=>{
    const foundDocs = doctorM.find();
    res.render('DocList.ejs', { docs: foundDocs });
});

// app.post('/update', checkAuthenticated, async (req, res)=>{
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

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next();
}

/**********EOFunctions**************/

app.listen(3000);