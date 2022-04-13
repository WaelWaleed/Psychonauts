if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const users = [];
const bcrypt = require('bcrypt');
const flash = require('express-flash');

const methodOverride = require('method-override');

/************ Connect to DB **************/
const mongodb = "mongodb+srv://waelwaleed4799:waelwaleed4799@cluster0.ybxwb.mongodb.net/testDB?retryWrites=true&w=majority"
const mongoose = require('mongoose');
mongoose.connect(mongodb).then(()=>{ console.log("Connected"); }).catch(err=>{ console.log(err); });

const userM = require('./models/userModel');
const doctorM = require('./models/doctorModel');

/************ EO Connect to DB ************/

/************ Session ************/

const session = require('express-session');
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "thisismysecretkeywersdf4799",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

/************ EO Session ************/


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
    const session = req.session;
    res.render('index.ejs', { name: session.name });
})
/***********  EO INDEX  ***********/

/***********  Registeration  ***********/

// app.get('/Dregister',(req,res)=>{
//     res.render('Dregister.ejs')
// });

app.get("/register", (req,res)=>{
    res.render("register.ejs");
});

app.post('/register', async (req,res)=>{

    try{
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
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
        res.redirect('/docRegister');
    }

});

app.get('/docRegister', (req, res)=>{
    res.render('Dregister.ejs');
});

app.post('/docRegister', async (req, res) => {
    try{
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
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
        if(await userM.findOne({email: req.body.email})){
            const foundUser = await userM.find({email: req.body.email});
            console.log("found in users")

            const rightPassword = await bcrypt.compare(req.body.password, foundUser[0]["password"])
            if(rightPassword){ 
                console.log("Right password");

                const session = req.session;
                session.name = foundUser[0]["name"];
                session.gender = foundUser[0]["gender"];
                session.DOB = foundUser[0]["DOB"];
                session.phoneNumber = foundUser[0]["phoneNumber"];
                session.email = foundUser[0]["email"];
                console.log(session.name, session.gender, session.DOB, session.email)

                res.render('index.ejs', { name: session.name })
            } else { 
                console.log("wrong password"); 
            }
        }else if(await doctorM.findOne({email: req.body.email})){
            const foundUser = await doctorM.find({email: req.body.email});
            console.log("found in doctors")

            const rightPassword = await bcrypt.compare(req.body.password, foundUser[0]["password"])
            if(rightPassword){ 
                console.log("Right password");

                const session = req.session;
                session.name = foundUser[0]["name"];
                session.gender = foundUser[0]["gender"];
                session.DOB = foundUser[0]["DOB"];
                session.phoneNumber = foundUser[0]["phoneNumber"];
                session.email = foundUser[0]["email"];
                session.About = foundUser[0]["About"];
                session.specifiedIn = foundUser[0]["specifiedIn"];
                console.log(session.name, session.gender, session.DOB, session.email)

                res.render('index.ejs', { name: session.name })
            } else { 
                console.log("wrong password"); 
            }
        }else{
            console.log("not found");
        }
        
    }catch(err){
        console.log(err)
        res.redirect('/login')
    }
});

app.delete('/logout', (req, res)=>{
    req.session.destroy();
    res.redirect('/login')
})
/***********  EO Log-in/Out  ***********/

// app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }));

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

app.get('/DocList', async (req,res,)=>{
    const foundDocs = await doctorM.find().then(result =>{
        console.log(result );
        res.render('DocList.ejs', { docs: result });
    });
});

/***********  Profile  ***********/

app.get('/profile', (req,res)=>{
    const session = req.session;

    // session.About = foundUser[0]["About"];
    // session.specifiedIn = foundUser[0]["specifiedIn"];

    if(session.About || session.specifiedIn){
        res.render('profile.ejs', {
            name: session.name,
            gender: session.gender,
            email: session.email,
            phoneNumber: session.phoneNumber,
            DOB: session.DOB,
            About: session.About,
            specifics: session.specifiedIn
        })
    }else{
        res.render('profile.ejs', {
            name: session.name,
            gender: session.gender,
            email: session.email,
            phoneNumber: session.phoneNumber,
            DOB: session.DOB
        })
    }
});

/***********  EO Profile  ***********/

/***********  Doctors list  ***********/

app.get('/DocList', async (req,res)=>{
    try{
        const ourDocs = doctorM.find().then()
    }catch{}
})

/***********  EO Doctors list  ***********/

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