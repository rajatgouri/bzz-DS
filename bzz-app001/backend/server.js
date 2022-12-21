const app = require("./app");

var sql = require("mssql");
const path = require('path');

require('./OCR');
const faxtest = require('./New')
const faxCompleted = require('./SmartAppFaxCompleted')
const faxCorrectionLetter = require('./SmartAppFaxCorrectionLetter')
const billableNew = require('./SmartAppBillableNew')
const billableCompleted = require('./SmartAppBillableCompleted')
const billableCorrectionLetter = require('./SmartAppBillableCorrectionLetter')
const medicalFormsNew = require('./SmartAppMedicalFormsNew')
const medicalFormsCompleted = require('./SmartAppMedicalFormsCompleted')
const medicalFormsCorrectionLetter = require('./SmartAppMedicalFormsCorrectionLetter')
require('./controllers/mailController')



const PORT = parseInt(process.env.PORT) || 8000;
// Make sure we are running node 10.0+


const [major, minor] = process.versions.node.split(".").map(parseFloat);
if (major < 10 || (major === 10 && minor <= 0)) {
  console.log(
    "Please go to nodejs.org and download version 10 or greater. 👌\n "
  );
  process.exit();
}

// import environmental variables from our variables.env file
require("dotenv").config({ path: ".variables.env" });

let dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: { encrypt: false },
  connectionTimeout: 900000,
  request : {
    stream: true
  },
  // pool: {
  //   max: 10,
  //   min: 0,
  //   idleTimeoutMillis: 500000
  // },
};



async function connectToDatabase() {
  console.log(`Checking database connection...`);
  try {
    await sql.connect(dbConfig);
  
    faxtest.watch()     
    faxCompleted.watch()
    faxCorrectionLetter.watch()
    billableNew.watch()
    billableCompleted.watch()
    billableCorrectionLetter.watch()
    medicalFormsNew.watch()
    medicalFormsCompleted.watch()
    medicalFormsCorrectionLetter.watch()

    console.log("Database connection OK!");
  } catch (error) {
    console.log("Unable to connect to the database:");
    console.log(error);
    process.exit(1);
  }
}
// Start our app!

async function init() {

  // await new Promise(resolve => setTimeout(resolve, 60000));
  await connectToDatabase();

  // app.set("port", parseInt(process.env.PORT) || 8000);
  const server = app.listen(PORT, () => {

    console.log(
      `Starting MS SQL + Express → On PORT : ${server.address().port}`

    );
  });
}

init();


