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

app.use(express.static("views"));
app.use(express.static("views/Profile"));
app.use(express.static("views/homepagefinal"));


/***********  INDEX  ***********/
app.get("/", (req,res)=>{
    // console.log(req.body.name ,req.body.password)

    res.render('homepagefinal/home.ejs', { name: req.body.name, password: req.body.password });
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
            lineSwitch: req.body.lineSwitch,
            phoneNumber: req.body.phoneNumber,
            fullNumber: req.body.lineSwitch + req.body.phoneNumber,
            email: req.body.email,
            password: hashedPassword,
            type: "user"
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
            lineSwitch: req.body.lineSwitch,
            phoneNumber: req.body.phoneNumber,
            fullNumber: req.body.lineSwitch + req.body.phoneNumber,
            gender: req.body.gender,
            email: req.body.email,
            password: hashedPassword,
            type: "doctor"
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
                session.type = foundUser[0]["type"];
                session.lineSwitch = foundUser[0]["lineSwitch"];
                session.fullNumber = foundUser[0]["fullNumber"];

                console.log(session.name, session.gender, session.DOB, session.email, session.type )

                res.render('homepagefinal/home.ejs', { name: session.name })
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
                session.lineSwitch = foundUser[0]["lineSwitch"];
                session.fullNumber = foundUser[0]["fullNumber"];
                session.email = foundUser[0]["email"];
                session.About = foundUser[0]["About"];
                session.specializedIn = foundUser[0]["specializedIn"];
                session.type = foundUser[0]["type"];
                session.Salary = foundUser[0]["Salary"];

                console.log(session.name, session.gender, session.DOB, session.email, session.type );

                res.render('homepagefinal/home.ejs', { name: session.name })
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

app.post('/logout', (req, res)=>{
    req.session.destroy();
    res.redirect('/login')
})

/***********  EO Log-in/Out  ***********/

/***********  Update  ***********/

app.get('/update', (req, res)=>{
    const session = req.session;
    if(session.name){
        if(session.type == "doctor"){
            res.render('profile/doctorprofileedit.ejs', {
                name: session.name,
                gender: session.gender,
                email: session.email,
                phoneNumber: session.phoneNumber,
                lineSwitch: session.lineSwitch,
                fullNumber: session.fullNumber,
                DOB: session.DOB,
                About: session.About,
                specializedIn: session.specializedIn,
                Salary: session.Salary,
                type: session.type,
            })
        }else{
            res.render('profile/doctorprofileedit.ejs', {
                name: session.name,
                gender: session.gender,
                email: session.email,
                phoneNumber: session.phoneNumber,
                lineSwitch: session.lineSwitch,
                fullNumber: session.fullNumber,
                DOB: session.DOB,
                type: session.type,
            })
        }
    }else{
        res.redirect('/')
    }
    
})

app.post('/update', async ( req, res,)=>{
    // const user = users.find(req.body.id)
    // console.log(user)
    const session = req.session;
    if(session.type == "doctor"){
        try{
            const foundDoc = await doctorM.findOneAndUpdate({ email: session.email }, {
                name: req.body.userName,
                email: req.body.email,
                lineSwitch: req.body.lineSwitch,
                phoneNumber: req.body.phoneNumber,
                gender: req.body.gender,
                specializedIn: req.body.specializedIn,
                DOB: req.body.DOB,
                Salary: req.body.Salary,
                About: req.body.About,
                fullNumber: req.body.lineSwitch + req.body.phoneNumber
            }).then(result=>{
                doctorM.findOne({ email: session.email }),
                session.name = req.body.name,
                session.email = req.body.email,
                session.lineSwitch = req.body.lineSwitch,
                session.phoneNumber = req.body.phoneNumber,
                session.gender = req.body.gender,
                session.specializedIn = req.body.specializedIn,
                session.DOB = req.body.DOB,
                session.Salary = req.body.Salary,
                session.About = req.body.About,
                session.fullNumber = req.body.fullNumber
            });
            res.redirect('/profile');
    
        }catch(err){
            console.log(err);
            res.render('/profile');
        }
    }else if(session.type == "user"){
        try{
            const foundDoc = await userM.findOneAndUpdate({ email: session.email }, {
                name: req.body.userName,
                email: req.body.email,
                lineSwitch: req.body.lineSwitch,
                phoneNumber: req.body.phoneNumber,
                gender: req.body.gender,
                DOB: req.body.DOB,
                fullNumber: req.body.lineSwitch + req.body.phoneNumber
            }).then(()=>{
                session.name = req.body.name,
                session.email = req.body.email,
                session.lineSwitch = req.body.lineSwitch,
                session.phoneNumber = req.body.phoneNumber,
                session.gender = req.body.gender,
                session.DOB = req.body.DOB,
                session.fullNumber = req.body.fullNumber,
                res.redirect('/profile');
            });
        }catch(err){
            console.log(err);
            res.render('profile.ejs');
        }
    }else{
        console.log("not a doctor nor a user");
    }
})

app.get('/DocList', async (req,res,)=>{
    const foundDocs = await doctorM.find().then(result =>{
        console.log(result );
        res.render('DocList.ejs', { docs: result });
    });
});

/***********  EO Update  ***********/

/***********  Profile  ***********/

app.get('/profile', (req,res)=>{
    const session = req.session;
    if(!session.name){
        res.redirect('/login')
    }else{
        if(session.type == "doctor"){
            console.log("doctor Profile");
            res.render('profile/doctorprofile.ejs', {
                name: session.name,
                gender: session.gender,
                email: session.email,
                phoneNumber: session.phoneNumber,
                DOB: session.DOB,
                About: session.About,
                specializedIn: session.specializedIn,
                fullNumber: session.fullNumber,
                lineSwitch: session.lineSwitch,
                type: session.type,
                Salary: session.Salary,
            })
        }else{
            res.render('profile/doctorprofile.ejs', {
                name: session.name,
                gender: session.gender,
                email: session.email,
                phoneNumber: session.phoneNumber,
                DOB: session.DOB,
                fullNumber: session.fullNumber,
                lineSwitch: session.lineSwitch,
                type: session.type,
            })
            console.log("user profile");
        }
    }
});

/***********  EO Profile  ***********/

/***********  Doctors list  ***********/

app.get('/DocList', (req,res)=>{
    try{
        const ourDocs = doctorM.find();
    }catch(err){
        console.log(err);
    }
})

app.post('/viewProfile', async (req,res)=>{
    try{
        console.log(req.body.email);
        const currentDoc = await doctorM.findOne({ email: req.body.email });
        res.render('viewProfile.ejs', {
            name: currentDoc.name,
            email: currentDoc.email,
            specializedIn: currentDoc.specializedIn,
            fullNumber: currentDoc.fullNumber,
            Salary: currentDoc.Salary,
        })
    }catch(err){
        console.log(req.body.email);
        console.log(err);
        res.redirect('/');
    }
})

/***********  EO Doctors list  ***********/

/***********  TESTING ONLY  ***********/
// app.get('/viewProf', (req,res)=>{
//     res.render('viewProfile.ejs');
// });


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