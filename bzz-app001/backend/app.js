const express = require("express");
var cors = require("cors");
const path = require("path");
const {promisify} = require("es6-promisify");
const apiRouter = require("./routes/api");
const authApiRouter = require("./routes/authApi");
const loggerApiRouter = require("./routes/loggerApi");
const os = require('os')
const fs = require('fs'); 
var bodyParser = require('body-parser')

const errorHandlers = require("./handlers/errorHandlers");

const { isValidToken } = require("./controllers/authController");
const Socket = require('./socket');
const { exec } = require("child_process");

require("dotenv").config({ path: ".variables.env" });

// create our Express app
const app = express();
// serves up static files from the public folder. Anything in public/ will just be served up as the file it is

app.use(express.static(path.join(__dirname, "public")));

// Takes the raw requests and turns them into usable properties on req.body
app.use(express.json({limit: '900mb'}));
app.use(express.urlencoded({limit: '900mb',  extended: true }));

app.use(bodyParser.json({limit: '900mb'}))
app.use(bodyParser.urlencoded({limit: '900mb',  extended: true }))

app.use(cors())

var http = require('http').Server(app);
var io = require('socket.io')(http, {
  cors: {
    origin: "*"
  }
});
// app.use(helmet());
// pass variables to our templates + all requests
// app.use((req, res, next) => {
//   res.locals.admin = req.admin || null;
//   res.locals.currentPath = req.path;
//   next();
// });

Socket.init(io);


// promisify some callback based APIs
app.use(async (req, res, next) => {
   req.login = promisify(cb => cb(req,login, req));
  next();
});



// Here our API Routes
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Methods", "GET,PATCH,PUT,POST,DELETE");
//   res.header("Access-Control-Expose-Headers", "Content-Length");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Accept, Authorization,x-auth-token, Content-Type, X-Requested-With, Range"
//   );
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   } else {
//     return next();
//   }
// });

app.use("/api", authApiRouter);

app.use("/api", loggerApiRouter);


// for development & production don't use this line app.use("/api", apiRouter); , this is just demo login contoller
// app.use("/api", apiRouter);

//uncomment line below // app.use("/api", isValidToken, apiRouter);
app.use("/api", isValidToken, apiRouter);


app.use("/static",express.static(path.join(__dirname, '/public')));

const dir = path.resolve("/home/node/faxtest");


app.use("/files",express.static(path.resolve("/home/node/faxtest")));

app.use("/", (req,res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get("env") === "development") {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = http;
