const express = require("express");

const { catchErrors } = require("../handlers/errorHandlers");

const router = express.Router();

const adminController = require("../controllers/adminController");
const incomingwqController = require("../controllers/incomingwqController");
const irbController = require("../controllers/irbController");
const coverageGovermentController = require("../controllers/coverageGovermentController");
const billingCalendarStaffController = require("../controllers/billingCalendarStaffController");
const billingColorController = require("../controllers/billingColorController");
const billingTeamListController = require("../controllers/billingTeamListController");
const billingReminderController = require('../controllers/billingReminderController');
const authController = require('../controllers/authController');
const incomingwqLoggerController = require("../controllers/incomingwqLoggerController");
const incomingwqProgressController = require("../controllers/incomingwqProgressController");
const feedbackController = require("../controllers/feedbackController");
const incomingwqWorkController = require("../controllers/incomingwqWorkController");
const BillingIrbBudgetStatusController = require("../controllers/billingIrbBudgetStatusController");
const BillingNoPccStudiesController = require("../controllers/billingNoPccStudiesController");
const coveragesLLoggerController = require('../controllers/coveragesGovernmentLoggerController');
const mediaController = require('../controllers/mediaController');
const patientLookupController = require('../controllers/patientLookupController');
const misfileController = require('../controllers/misfileController');
const correctionLetterController = require('../controllers/correctionLetterController');
const himsteamrosterController = require("../controllers/himsTeamRosterController");
const himsTeamUserScheduleController = require("../controllers/himsTeamUserScheduleController");
const emailLoggerController = require("../controllers/emailLoggerController");
const epicProductivityController = require("../controllers/epicProductivityController");
const masterTaskListController = require("../controllers/MasterTaskListController");
const ocrController = require('../controllers/ocrController')
const racController = require('../controllers/racController');
const adrController = require('../controllers/adrController');
const nnController = require('../controllers/nnController');
const certController = require('../controllers/certController');
const RaReviewController = require('../controllers/raReviewController')
const racStatusController = require('../controllers/racStatusController')
const databaseController = require('../controllers/databaseController')
const performanceController = require('../controllers/performanceController')
const totalKPIsController = require('../controllers/totalKpisController')
const avatarController = require('../controllers/avatarController')
const IntakeRequestController = require('../controllers/IntakeRequestController')
const JwtController = require('../controllers/JWTController');
const AchievementController = require('../controllers/achievements');



const multer  = require('multer');
const recoupmentRationaleController = require("../controllers/recoupmentRationaleController");


const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/attachments')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()  + "_" + file.originalname 
    cb(null,  uniqueSuffix)
  }
})

const upload1 = multer({ storage: storage1 })



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'OCR/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()  + "_" + file.originalname 
    cb(null,  uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

router.route("/upload-file/create").post(upload.single('myFile'), catchErrors(ocrController.upload));

// router.route("/mail/create").post(upload.array('files', 10), catchErrors(emailController.send));

// ______________________________ Page Logger __________________________________
router.route("/emailLogger/list").get(catchErrors(emailLoggerController.list));
router.route("/emailuserfilter/list").get(catchErrors(emailLoggerController.userFilter));
router.route("/emailLogger1/list").get(catchErrors(emailLoggerController.list1));
router.route("/emailLogger-search/list").get(catchErrors(emailLoggerController.search));


router.route("/achievements/create").post(catchErrors(AchievementController.create));

//_______________________________ Database _______________________________________
router.route("/database/query").post(catchErrors(databaseController.query));

router.route("/avatar-tabs/list").get(catchErrors(avatarController.tabs));
router.route("/avatar-images/list").get(catchErrors(avatarController.photos));



//_______________________________ Admin management_______________________________
router.route("/change-password/create").post(catchErrors(adminController.changePassword));

router.route("/admin/create").post(catchErrors(adminController.create));
// router.route("/admin/read/:id").get(catchErrors(adminController.read));
router.route("/admin/update/:id").patch(catchErrors(adminController.update));
router.route("/admin/delete/:id").delete(catchErrors(adminController.delete));
// router.route("/admin/search").get(catchErrors(adminController.search));
router.route("/admin/list").get(catchErrors(adminController.list));
router.route("/admin-one/list1").post(catchErrors(adminController.one));
router.route("/admin-avatar/update/:id").patch(catchErrors(adminController.updateImage));
router.route("/admin-fulllist/list").get(catchErrors(adminController.fullList));
router.route("/admin-findall/list").get(catchErrors(adminController.findALL));
router.route("/getuserbysection/list").get(catchErrors(adminController.getUserBySection));


//____________________________________________________________________________________
router.route("/rac-columns/list").get(catchErrors(racController.columns));
router.route("/rac-columns/create").post(catchErrors(racController.createColumns));



//____________________________________________________________________________________
router.route("/adr-columns/list").get(catchErrors(adrController.columns));
router.route("/adr-columns/create").post(catchErrors(adrController.createColumns));


//____________________________________________________________________________________
router.route("/nn-columns/list").get(catchErrors(nnController.columns));
router.route("/nn-columns/create").post(catchErrors(nnController.createColumns));



//____________________________________________________________________________________
router.route("/cert-columns/list").get(catchErrors(certController.columns));
router.route("/cert-columns/create").post(catchErrors(certController.createColumns));

//____________________________________________________________________________________
router.route("/incomingwq-columns/list").get(catchErrors(incomingwqController.columns));
router.route("/incomingwq-columns/create").post(catchErrors(incomingwqController.createColumns));

router.route("/jwt/update/:id").patch(catchErrors(JwtController.update));

router.route("/performance/list").get(catchErrors(performanceController.list));

// ______________________________User ___________________________________________
router.route("/admin/switch").post(catchErrors(authController.switch));

// ______________________________ Epic Productivity 1 __________________________________
router.route("/epic-productivity1/list").get(catchErrors(epicProductivityController.list));

//_____________________________________ API for incomingwq _____________________
router.route("/incomingwq/update/:id").patch(catchErrors(incomingwqController.update));
router.route("/incomingwq-check/list/").get(catchErrors(incomingwqController.check));
router.route("/incomingwq/list").get(catchErrors(incomingwqController.list));
router.route("/incomingwq-full-list/list").get(catchErrors(incomingwqController.fullList));
router.route("/incomingwq/delete/:fileName").delete(catchErrors(incomingwqController.delete));
router.route("/incomingwq/list/:id/:fileName").get(catchErrors(incomingwqController.read));
router.route("/incomingwq-filters/list").get(catchErrors(incomingwqController.filters));
router.route("/incomingwq/create").post(catchErrors(incomingwqController.create));

router.route("/totalkpis/list").get(catchErrors(totalKPIsController.list));
router.route("/totalkpisyear/list").get(catchErrors(totalKPIsController.year));



// router.route("/billingcalendarstaff/list/:month/:year/:date_column").get(catchErrors(billingCalendarStaffController.list));

router.route("/incomingwq-rename/update/:id").patch(catchErrors(incomingwqController.rename));




router.route("/intake-request/list1").post(catchErrors(IntakeRequestController.list));
router.route("/intake-request/create").post(catchErrors(IntakeRequestController.create));
router.route("/intake-request/update/:id").patch(catchErrors(IntakeRequestController.update));
router.route("/intake-request-filters/list").get(catchErrors(IntakeRequestController.filters));
router.route("/intake-request/delete/:id").delete(catchErrors(IntakeRequestController.delete));



//_____________________________________ API for Patient Lookup _____________________
router.route("/patientlookup/list").get(catchErrors(patientLookupController.list));
router.route("/patientlookup/create").post(catchErrors(patientLookupController.create));


router.route("/ra-review/list").get(catchErrors(RaReviewController.list));
router.route("/ra-review-total/list").get(catchErrors(RaReviewController.total));



router.route("/misfilecheck/list").get(catchErrors(misfileController.list));
router.route("/misfilecheck/update/:id").patch(catchErrors(misfileController.update));
router.route("/misfilecheck-filenames/list").get(catchErrors(misfileController.filenames));
router.route("/misfilecheck/delete/:id").delete(catchErrors(misfileController.delete));
router.route("/misfilecheckbyfilename/update/:id").patch(catchErrors(misfileController.updateByFilename));


//_____________________________________ API for incomingwq Progress __________________________
router.route("/incomingwqprogress/create").post(catchErrors(incomingwqProgressController.create));
router.route("/incomingwqprogress/update/:id").patch(catchErrors(incomingwqProgressController.update));


//_____________________________________ API for billingReminderController __________________________
router.route("/correction-letters/read/:id").get(catchErrors(correctionLetterController.read));
router.route("/correction-letters/create").post(catchErrors(correctionLetterController.create));
router.route("/correction-letters/update/:id").patch(catchErrors(correctionLetterController.update));



// ____________________________________ API for himsteamroster __________________ 
router.route("/himsteamroster/list").get(catchErrors(himsteamrosterController.list));
router.route("/himsteamroster-department/list").get(catchErrors(himsteamrosterController.department));
router.route("/himsteamroster-fulllist/list").get(catchErrors(himsteamrosterController.fulllist));
router.route("/himsteamroster/update/:id").patch(catchErrors(himsteamrosterController.update));
router.route("/himsteamroster/create").post(catchErrors(himsteamrosterController.create));
router.route("/himsteamroster/delete/:id").delete(catchErrors(himsteamrosterController.delete));
router.route("/himsteamroster-contractor/list").get(catchErrors(himsteamrosterController.contactor));
router.route("/himsteamroster-columns/list").get(catchErrors(himsteamrosterController.columns));
router.route("/himsteamroster-columns/create").post(catchErrors(himsteamrosterController.createC));


// ____________________________________ API for himsUserSchedule __________________ 
router.route("/himsuserschedule/list").get(catchErrors(himsTeamUserScheduleController.list));
router.route("/himsuserschedule-filters/list").get(catchErrors(himsTeamUserScheduleController.filters));
router.route("/himsuserschedule/create").post(catchErrors(himsTeamUserScheduleController.create));
router.route("/himsuserschedule/delete/:id").delete(catchErrors(himsTeamUserScheduleController.delete));
router.route("/himsuserschedule/update/:id").patch(catchErrors(himsTeamUserScheduleController.update));

// ____________________________________ API for himsUserSchedule __________________ 
router.route("/himsmastertasklist/list").get(catchErrors(masterTaskListController.list));
router.route("/himsmastertasklist-filters/list").get(catchErrors(masterTaskListController.filters));
router.route("/himsmastertasklist/create").post(catchErrors(masterTaskListController.create));
router.route("/himsmastertasklist/delete/:id").delete(catchErrors(masterTaskListController.delete));
router.route("/himsmastertasklist/update/:id").patch(catchErrors(masterTaskListController.update));

// ____________________________________ API for RAC __________________ 
router.route("/rac/list1").post(catchErrors(racController.list));
router.route("/rac-filters/list").get(catchErrors(racController.filters));
router.route("/rac-tabs/list").get(catchErrors(racController.tabs));
router.route("/rac/create").post(catchErrors(racController.create));
router.route("/rac/update/:id").patch(catchErrors(racController.update));
router.route("/rac-archive/update/:id").patch(catchErrors(racController.delete));
router.route("/rac-exports/list").get(catchErrors(racController.exports));


// ____________________________________ API for ADR __________________ 
router.route("/adr/list1").post(catchErrors(adrController.list));
router.route("/adr-filters/list").get(catchErrors(adrController.filters));
router.route("/adr-tabs/list").get(catchErrors(adrController.tabs));

router.route("/adr/create").post(catchErrors(adrController.create));
router.route("/adr/update/:id").patch(catchErrors(adrController.update));
router.route("/adr-archive/update/:id").patch(catchErrors(adrController.delete));
router.route("/adr-exports/list").get(catchErrors(adrController.exports));

// RAC Status
router.route("/rac_status/list").get(catchErrors(racStatusController.list));
router.route("/rac_status/create").post(catchErrors(racStatusController.create));

// recoupment Rationale Status
router.route("/recoupmentrationale/list").get(catchErrors(recoupmentRationaleController.list));
router.route("/recoupmentrationale/create").post(catchErrors(recoupmentRationaleController.create));


// ____________________________________ API for NN __________________ 
router.route("/nn/list1").post(catchErrors(nnController.list));
router.route("/nn-filters/list").get(catchErrors(nnController.filters));
router.route("/nn-tabs/list").get(catchErrors(nnController.tabs));

router.route("/nn/create").post(catchErrors(nnController.create));
router.route("/nn/update/:id").patch(catchErrors(nnController.update));
router.route("/nn-archive/update/:id").patch(catchErrors(nnController.delete));
router.route("/nn-exports/list").get(catchErrors(nnController.exports));



// ____________________________________ API for CERT __________________ 
router.route("/cert/list1").post(catchErrors(certController.list));
router.route("/cert-filters/list").get(catchErrors(certController.filters));
router.route("/cert-tabs/list").get(catchErrors(certController.tabs));

router.route("/cert/create").post(catchErrors(certController.create));
router.route("/cert/update/:id").patch(catchErrors(certController.update));
router.route("/cert-archive/update/:id").patch(catchErrors(certController.delete));
router.route("/cert-exports/list").get(catchErrors(certController.exports));



//_____________________________________ API for Feedback __________________________
router.route("/feedback/list").get(catchErrors(feedbackController.list));
router.route("/feedback/create").post(catchErrors(feedbackController.create));


//_____________________________________ API for Work ______________________________
router.route("/incomingwqWork/list").get(catchErrors(incomingwqWorkController.list));
router.route("/incomingwqWork/create").post(catchErrors(incomingwqWorkController.create));
router.route("/incomingwqWork/update/:id").patch(catchErrors(incomingwqWorkController.update));

//_____________________________________ API for wq5508 Logger __________________________
router.route("/incomingwqLogger/create").post(catchErrors(incomingwqLoggerController.create));

//_____________________________________ API for wq5508 Progress __________________________
router.route("/incomingwqprogress/create").post(catchErrors(incomingwqProgressController.create));
router.route("/incomingwqprogress/list").get(catchErrors(incomingwqProgressController.list));


//_____________________________________ API for irbs ___________________________
router.route("/irb/create").post(catchErrors(irbController.create));
router.route("/irb/delete/:id").delete(catchErrors(irbController.delete));
// router.route("/irb/read/:id").get(catchErrors(irbController.read));
router.route("/irb/update/:id").patch(catchErrors(irbController.update));
// router.route("/irb/search").get(catchErrors(irbController.search));
router.route("/irb/list").get(catchErrors(irbController.list));

//_____________________________________ API for billingCalendarStaffController __________________________
router.route("/billingcalendarstaff/list/:month/:year/:date_column").get(catchErrors(billingCalendarStaffController.list));
router.route("/billingcalendarstaff/create").post(catchErrors(billingCalendarStaffController.create));
router.route("/billingcalendarstaff/update/:id").patch(catchErrors(billingCalendarStaffController.update));
router.route("/billingcalendarstaff/delete/:id").delete(catchErrors(billingCalendarStaffController.delete));

//_____________________________________ API for billingColorController __________________________
router.route("/billingcolor/read/:id").get(catchErrors(billingColorController.read));
router.route("/billingcolor/create").post(catchErrors(billingColorController.create));
router.route("/billingcolor/update/:id").patch(catchErrors(billingColorController.update));

//_____________________________________ API for billingReminderController __________________________
router.route("/billingreminder/read/:id").get(catchErrors(billingReminderController.read));
router.route("/billingreminder/create").post(catchErrors(billingReminderController.create));
router.route("/billingreminder/update/:id").patch(catchErrors(billingReminderController.update));

//_____________________________________ API for billingteamList __________________________
router.route("/billingteamlist/list").get(catchErrors(billingTeamListController.list));

// ___________________________________ API  media ____________________________________
router.route("/media/list/:folder/:filename/:load").get(catchErrors(mediaController.show));
router.route("/media/create/").post(catchErrors(mediaController.rename));
router.route("/transfer/create/").post(catchErrors(mediaController.transfer));
router.route("/transfer-with-differnt-name/create/").post(catchErrors(mediaController.transferWithDifferentName));


//_____________________________________ API for coverageGoverments ___________________________
// router
//   .route("/coverageGoverment/create")
//   .post(catchErrors(coverageGovermentController.create));
// router
//   .route("/coverageGoverment/read/:id")
//   .get(catchErrors(coverageGovermentController.read));
router
  .route("/coverageGoverment/update/:id")
  .patch(catchErrors(coverageGovermentController.update));
// router
//   .route("/coverageGoverment/delete/:id")
//   .delete(catchErrors(coverageGovermentController.delete));
// router
//   .route("/coverageGoverment/search")
//   .get(catchErrors(coverageGovermentController.search));
router
  .route("/coverageGoverment/list")
  .get(catchErrors(coverageGovermentController.list));


  
//_____________________________________ API for coverages Governemt Logger __________________________
router.route("/coverageGovermentLogger/create").post(catchErrors(coveragesLLoggerController.create));


//_____________________________________ API for BillingIRBBudgetStatus ___________________________

router
  .route("/billingirbbudgetstatus/update/:id")
  .patch(catchErrors(BillingIrbBudgetStatusController.update));

router
  .route("/billingirbbudgetstatus/list")
  .get(catchErrors(BillingIrbBudgetStatusController.list));

router.route("/billingirbbudgetstatus/create").post(catchErrors(BillingIrbBudgetStatusController.create));
router.route("/billingirbbudgetstatus/delete/:id").delete(catchErrors(BillingIrbBudgetStatusController.delete));
router.route("/billingirbbudgetstatus-status-list/list").get(catchErrors(BillingIrbBudgetStatusController.fullList));
  

//_____________________________________ API for BillingNoPccStatus ___________________________

router
  .route("/billingnopccstudies/update/:id")
  .patch(catchErrors(BillingNoPccStudiesController.update));

router
  .route("/billingnopccstudies/list")
  .get(catchErrors(BillingNoPccStudiesController.list));

router.route("/billingnopccstudies/create").post(catchErrors(BillingNoPccStudiesController.create));
router.route("/billingnopccstudies/delete/:id").delete(catchErrors(BillingNoPccStudiesController.delete));
router.route("/billingnopccstudies-studies-list/list").get(catchErrors(BillingNoPccStudiesController.fullList));
  
module.exports = router;
