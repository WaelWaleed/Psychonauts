if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const users = [];
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const http = require('http');
const methodOverride = require('method-override');
const server = http.createServer(app);

/************ Connect to DB **************/
const mongodb = "mongodb+srv://waelwaleed4799:waelwaleed4799@cluster0.ybxwb.mongodb.net/testDB?retryWrites=true&w=majority"
const mongoose = require('mongoose');
mongoose.connect(mongodb).then(()=>{ console.log("Connected to DB"); }).catch(err=>{ console.log(err); });

const userM = require('./models/userModel');
const doctorM = require('./models/doctorModel');
const appointmentM = require('./models/appointmentModel');
const resultM = require('./models/testResultModel');

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
const { Socket } = require('socket.io');
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
app.use(express.static("views/nav"));
app.use(express.static("views/chat"));
app.use(express.static("views/therapists-list"));
app.use(express.static("views/test"));


/***********  INDEX  ***********/
app.get("/", async (req,res)=>{
    const session = req.session;
    await doctorM.find().then(doctors=>{
        userM.find().then(users=>{
            appointmentM.find().then(apps=>{
                res.render('homepagefinal/home.ejs', { name: session.name, docs: doctors, users: users, apps: apps});
            })
        })
    })
});

app.use("/index", (req, res)=>{
    const session = req.session;
    res.render('index.ejs', { name: session.name });
})
/***********  EO INDEX  ***********/

/***********  Registeration  ***********/


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
        newDoc.save().then(()=>{ 
            console.log("Doctor added successfuly");
            makeAvailableAppointments(req.body.email); 
        });
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

                res.redirect('/');
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

                res.redirect('/');
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

app.get('/logout', (req, res)=>{
    req.session.destroy();
    res.redirect('/login')
})

/***********  EO Log-in/Out  ***********/

/***********  Update  ***********/

app.get('/update', async (req, res)=>{
    const session = req.session;
    if(session.name){
        if(session.type == "doctor"){
            await appointmentM.find({ patient: session.email }).then((result)=>{
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
                    apps: result,
                })
            })
        }else{
            await appointmentM.find({ patient: session.email }).then((result)=>{
                res.render('profile/doctorprofileedit.ejs', {
                    name: session.name,
                    gender: session.gender,
                    email: session.email,
                    phoneNumber: session.phoneNumber,
                    lineSwitch: session.lineSwitch,
                    fullNumber: session.fullNumber,
                    DOB: session.DOB,
                    type: session.type,
                    apps: result,
                })
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

/***********  EO Update  ***********/

/***********  Profile  ***********/

app.get('/profile', async (req,res)=>{
    const session = req.session;
    if(!session.name){
        res.redirect('/login')
    }else{
        if(session.type == "doctor"){
            console.log("doctor Profile");
            await appointmentM.find({ patient: session.email }).then((result)=>{
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
                    apps: result,
                })
            })
            
        }else{
            console.log("user Profile");
            await appointmentM.find({ patient: session.email }).then((result)=>{
                res.render('profile/doctorprofile.ejs', {
                    name: session.name,
                    gender: session.gender,
                    email: session.email,
                    phoneNumber: session.phoneNumber,
                    DOB: session.DOB,
                    fullNumber: session.fullNumber,
                    lineSwitch: session.lineSwitch,
                    type: session.type,
                    apps: result,
                })
            })
            
            console.log("user profile");
        }
    }
});

/***********  EO Profile  ***********/

/***********  Doctors list  ***********/

app.get('/DocList', async (req,res,)=>{
    const foundDocs = await doctorM.find().then(result =>{
        //console.log(result );
        res.render('therapists-list/DocList.ejs', { docs: result });
    });
});

//global variable to find a doctor for appointments and viewProfile;
var doctorEmail = '';

app.post('/viewProfile', async (req, res)=>{
    try{
        //console.log("req.body.email: " + req.body.email);
        doctorEmail = req.body.email;
        //console.log("doctorEmail: " + doctorEmail);

        await doctorM.findOne({ email: doctorEmail }).then( result => {
            appointmentM.find({ doctor: doctorEmail }).then( appointments => {
                //console.log(appointments);
                res.render('therapists-list/viewprofile.ejs', {
                    name: result.name,
                    email: result.email,
                    specializedIn: result.specializedIn,
                    fullNumber: result.fullNumber,
                    Salary: result.Salary,
                    apps: appointments,
                });
            })
            //console.log( "current doc: " + result);
        });
        // console.log("currentDoc: " + doctorEmail);
        
    }catch(err){
        console.log(req.body.email);
        console.log(err);
        res.redirect('/');
    }
});

/***********  EO Doctors list  ***********/

/***********  Appointments  ***********/

app.post('/reserve', async (req,res)=>{
    const session = req.session;
    console.log("doctor email: " + doctorEmail);
    // console.log("from " + req.body.from);
    // console.log("to " + req.body.to);
    try{
        if(session.name){
            //console.log(doctorEmail);
            const userFilter = { patient: session.email, day: req.body.day, from: req.body.from, to: req.body.to};
            const available = await appointmentM.findOne(userFilter);
            console.log("available: " + available);
            if(!available) {
                const New = {patient: session.email, reserved: true};
                const filter = { doctor: doctorEmail, day: req.body.day, from: req.body.from, to: req.body.to }
                console.log(filter["doctor"] + " " + filter["from"] + " " + filter["day"] + " " + filter["to"]);
                //console.log("patient: " + New);
                await appointmentM.findOneAndUpdate(filter, New).then((result)=>{
                    console.log(result["reserved"] + " " + result["patient"] + " " + result["doctor"]);
                    console.log("appointment reserved");
                });
                res.redirect('/profile');
            }
            else{
                console.log("Not available");
                res.redirect('/docList');
            }
        }
        else{
            res.redirect('/login');
        }
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
})

app.get('/deleteRecords', async (req,res)=>{
    await appointmentM.deleteMany({ doctor: "b@b.com" });
    res.redirect('/viewProfile');
})

app.get('/appointments', (req,res)=>{
    const session = req.session;
    try{
        const appointments = appointmentM.find({ patient: session.email }).then(result =>{
            //console.log(result);
            res.render('appointments.ejs', { apps: result });
        })
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
})


app.post('/deleteAppointment', async (req,res) => {
    const session = req.session;

    try{
        var filter = { patient: session.email, day: req.body.day, doctor: req.body.doctor, from: req.body.from };
        //console.log(filter);
        const New = { patient: "None", reserved: false };
        const currentAppointment = await appointmentM.findOneAndUpdate(filter, New).then(result=>{
            console.log("appointment Deleted");
            console.log(result);
            res.redirect('/profile');
        });
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
})
/***********  EO Appointments  ***********/

/***********  Chat  ***********/

const socketio = require('socket.io');
const io = socketio(server);

io.on('connection', socket => {
    console.log("new socket connected: " + socket.id);
    socket.emit('message', 'welcome here');

    socket.broadcast.emit('message','a user has connected');

    // socket.on('urmsg', (msg) => {
    //     io.emit('message', msg);
    // })
    socket.on('sent', (msg) => {
        io.emit('sent', msg);
    })

    socket.on('disconnect', () => {
        io.emit('message', 'someone disconnected');
    })
})

app.get('/chat', (req,res) => {
    const session = req.session;
    if(!session.name){
        res.redirect('/login');
    }else{
        res.render('chat/chat.ejs', {
            name: session.name,
        });
    }
})


/***********  EO Chat  ***********/

/***********  FeedBack  ***********/

const feedbackM = require('./models/feedback');

app.post('/feedback', (req, res)=>{
    try{
        const feedback = new feedbackM({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            Service: req.body.category,
            message: req.body.message
        });
        feedback.save().then(()=>{ console.log("feedback collected") });
        res.redirect('/');
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
});



/***********  EO FeedBack  ***********/

/***********  TESTS  ***********/

app.get('/test', (req,res)=>{
    res.render('test/testhomepage.ejs');
})


app.get('/Insomniatest', (req,res)=>{
    const session = req.session;
    if(!session.email){
        res.redirect('/login');
    }else{
        res.render('test/Insomniatest.ejs');
    }
})

app.get('/Anxietytest', (req,res)=>{
    const session = req.session;
    if(!session.email){
        res.redirect('/login');
    }else{
        res.render('test/Anxietytest.ejs');
    }
})

app.get('/Depressiontest', (req,res)=>{
    const session = req.session;
    if(!session.email){
        res.redirect('/login');
    }else{
        res.render('test/Depressiontest.ejs');
    }
})

/***********  EO TESTS  ***********/



app.post('/saveResult', async (req,res)=>{
    const session = req.session;
    try{
        const resultt = req.body.result;
        var advc = "";
        if(req.body.testName == "Deppression" || req.body.testName == "Anxiety"){
            switch(true) {
                case ((resultt >= 0) && (resultt <= 4)):
                    if(req.body.testName == "Deppression"){
                        advc = `Your psychological state in terms of  Depression is very good and there is no need to be afraid, all you have to do is relax and take a rest. If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }else if(req.body.testName == "Anxiety"){
                        advc = `Your psychological state in terms of Anxiety is very good and there is no need to be afraid, all you have to do is relax and take a rest.If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
    
                    }
                    break;
                case ((resultt >= 5) && (resultt <= 9)): {
                    if(req.body.testName == "Deppression"){
                        advc = `Your result of your test in terms of  Depression is good, and not in a dangerous situation, you can just get comfortable and get away from any source of pressure around you so that you can lead a normal life. If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.
                      `;
                    }else if(req.body.testName == "Anxiety"){
                        advc = `Your result of your test in terms of anxiety is good, and not in a dangerous situation, you can just get comfortable and get away from any source of pressure around you so that you can lead a normal life.If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }
                    break;
                }
                case ((resultt >= 10) && (resultt <= 14)): {
                    if(req.body.testName == "Deppression"){
                        advc = `The result of your psychological test in terms of  Depression is considered moderate, not dangerous, but it must be treated before it increases. We advise you to refer to a psychotherapist who specializes in Depression, and you should take a sufficient amount of rest and stay away from everything that causes you inconvenience as soon as possible. If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }else if(req.body.testName == "Anxiety"){
                        advc = `The result of your psychological test in terms of anxiety is considered moderate, not dangerous, but it must be treated before it increases. We advise you to refer to a psychotherapist who specializes in anxiety disorders, and you should take a sufficient amount of rest and stay away from everything that causes you inconvenience as soon as possible.If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }
                    break;
                }
                case ((resultt >= 15) && (resultt <= 19)): {
                    if(req.body.testName == "Deppression"){
                        advc = `The result of your psychological test in terms of  Depression is considered moderately severe, not dangerous, but it must be treated before it increases. We advise you to refer to a psychotherapist who specializes in Depression, and you should take a sufficient amount of rest and stay away from everything that causes you inconvenience as soon as possible. If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }else if(req.body.testName == "Anxiety"){
                        advc = `The result of your psychological test in terms of anxiety is considered severe, you should see a psychotherapist specializing in anxiety disorders as soon as possible, and you must take a sufficient amount of rest and stay away from everything that causes you inconvenience while continuing the psychological sessions to get psychological comfort away from anxiety.If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }
                    break;
                }
                case ((resultt >= 20) && (resultt <= 27)): {
                    if(req.body.testName == "Deppression"){
                        advc = `The result of your psychological test in terms of Depression is considered severe , you should see a psychotherapist specializing in Depression disorders as soon as possible, and you must take a sufficient amount of rest and stay away from everything that causes you inconvenience while continuing the psychological sessions to get psychological comfort away from pressure. If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }else if(req.body.testName == "Anxiety"){
                        advc = `The result of your psychological test in terms of anxiety is considered severe, you should see a psychotherapist specializing in anxiety disorders as soon as possible, and you must take a sufficient amount of rest and stay away from everything that causes you inconvenience while continuing the psychological sessions to get psychological comfort away from anxiety.If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }
                    break;
                }
            }
        }else if(req.body.testName == "Insomnia") {
            console.log(req.body.testName);
            switch(true) {
                case ((resultt >= 0) && (resultt <= 7)):
                    if(req.body.testName == "Insomnia"){
                        advc = `Your psychological state in terms of  Insomnia is very good and there is no need to be afraid, all you have to do is relax and take a rest.If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }
                    break;
                case ((resultt >= 8) && (resultt <= 14)): {
                    if(req.body.testName == "Insomnia"){
                        advc = `Your result of your test in terms of  Insomnia is good, and not in a dangerous situation, you can just get comfortable and get away from any source of pressure around you so that you can lead a normal life.If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }
                    break;
                }
                case ((resultt >= 15) && (resultt <= 21)): {
                    if(req.body.testName == "Insomnia"){
                        advc = `The result of your psychological test in terms of  Insomnia is considered moderate, not dangerous, but it must be treated before it increases. We advise you to refer to a psychotherapist who specializes in Insomnia, and you should take a sufficient amount of rest and stay away from everything that causes you inconvenience as soon as possible.If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }
                    break;
                }
                case ((resultt >= 22) && (resultt <= 28)): {
                    if(req.body.testName == "Insomnia"){
                        advc = `The result of your psychological test in terms of Insomnia is considered severe , you should see a psychotherapist specializing in Insomnia disorders as soon as possible, and you must take a sufficient amount of rest and stay away from everything that causes you inconvenience while continuing the psychological sessions to get psychological comfort away from pressure. If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }
                    break;
                }
                case ((resultt >= 20) && (resultt <= 27)): {
                    if(req.body.testName == "Insomnia"){
                        advc = `The result of your psychological test in terms of Depression is considered severe , you should see a psychotherapist specializing in Depression disorders as soon as possible, and you must take a sufficient amount of rest and stay away from everything that causes you inconvenience while continuing the psychological sessions to get psychological comfort away from pressure. If you want to be sure, you can contact a specialist therapist through our website to better diagnose your condition.`;
                    }
                    break;
                }
            }
        }
        
        console.log("advice: " + advc);
        const finalResult = new resultM({
            id: Date.now().toString(),
            patient: session.name,
            email: session.email,
            testName: req.body.testName,
            result: resultt,
            advice: advc,
        });
        await finalResult.save().then(()=>{
            if(req.body.testName == "Deppression"){
                console.log("result of test: " + req.body.testName + " with score: " + resultt );
                res.render('test/depressionresult.ejs', {
                    result: resultt,
                    advice: advc,
                });
            }else if(req.body.testName == "Anxiety"){
                console.log("result of test: " + req.body.testName + " with score: " + resultt );
                res.render('test/Anxietyresult.ejs', {
                    result: resultt,
                    advice: advc,
                });
            }else if(req.body.testName == "Insomnia"){
                console.log("result of test: " + req.body.testName + " with score: " + resultt );
                res.render('test/insomniaresult.ejs', {
                    result: resultt,
                    advice: advc,
                });
            }
            
        })
    }
    catch(err){
        console.log(err);
        res.redirect('/');
    }
});


/***********  TESTING ONLY  ***********/



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

async function makeAvailableAppointments(DocEmail){
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
    const from = ["9:00", "10:00", "11:00", "12:00", "13:00"];
    const to = ["10:00", "11:00", "12:00", "13:00", "14:00"];

    console.log("available for: " + DocEmail);
    const doctor = DocEmail;
    console.log("with email: " + doctor);
    
    for(var i=0; i<5; i++) {
        const day = days[i];
        console.log("day: " + day);
        for(var j=0; j<5; j++){
            const start = from[j];
            console.log("start: " + start);
            const end = to[j];
            console.log("end: " + end);
            const newAppointment = new appointmentM({
                id: Date.now().toString(),
                patient: "None",
                doctor: doctor,
                day: day,
                from: start,
                to: end,
                reserved: false,
            });
            await newAppointment.save().then(()=>{ console.log("Available Appointment") });
        }
        if(day == "THURSDAY"){
            break;
        }
    }
}

async function DeleteAppointment(pat, days, start) {
    console.log( pat + " " + days + " " + start );
    
    // await appointmentM.find({ , day: filter["day"], from: filter["from"] }).then(result => {
    //     console.log(result);
    // });
    // await appointmentM.findOne({ patient: pat, day:  }).then( result => {
    //     console.log(result);
    // });
}

/**********EOFunctions**************/

server.listen(3000);
// app.listen(3000);