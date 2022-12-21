import React, { lazy, Suspense } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import PageLoader from "@/components/PageLoader";
import Reminder from "@/pages/Reminder";
import { selectAuth } from "@/redux/auth/selectors";
import { useSelector, useDispatch } from "react-redux";


const Dashboard = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/Dashboard")
);

const DSReminders = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/DsDashboard/Reminders")
);

const DSCards = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/DsDashboard/Cards")
);

const DSCalendar = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/DsDashboard/Calendar")
);

const DSAvatars = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/DsDashboard/Avatars")
);

const ManagementMilestones = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/ManagementMilestones")
);

const ManagementRoadmap = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/ManagementRoadmap")
);

const ManagementDashboard = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ManagementDashboard"
  )
);

const RAC = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/AuditTracking/RAC"
  )
);

const ADR = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/AuditTracking/ADR"
  )
);

const IntakeRequest = lazy(() =>
  import(/*webpackChunkName:'Denials'*/ "@/pages/IntakeRequests")
);

const NN = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/AuditTracking/NN"
  )
);

const CERT = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/AuditTracking/CERT"
  )
);

const Analytics = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/Analytics"
  )
);

const MilestonesAndRoadmap = lazy(() =>
  import(/*webpackChunkName:'Wq5508Page'*/ "@/pages/MilestonesAndRoadmap")
);

const CalendarBoard = lazy(() =>
  import(/*webpackChunkName:'CalendarBoardPage'*/ "@/pages/CalendarBoard")
);
const TaskCalendar = lazy(() =>
  import(/*webpackChunkName:'CalendarBoardPage'*/ "@/pages/TaskCalendar")
);
const Admin = lazy(() =>
  import(/*webpackChunkName:'AdminPage'*/ "@/pages/Admin")
);

const incomingwq = lazy(() =>
  import(/*webpackChunkName:'Wq5508Page'*/ "@/pages/IncomingWQ")
);

const Template = lazy(() =>
  import(/*webpackChunkName:'Wq5508Page'*/ "@/pages/Template")
);

const ChangePassword = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ChangePassword"
  )
);

const HIMSTeamRoster = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/HIMSTeamRoster"));

const HIMSCalendarSchedule = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/HIMSUserSchedule"));

const EmailLogger = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/EmailLogger")
);


const EpicProductivity = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/EpicProductivity"
  )
);

const Irb = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/Irb"));

const NoPccStudies = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/NoPccStudies"));

const Overview = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/Overview"));

const WorkAssignments = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/workAssignments"));

const IRBBudgetStatus = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/IRBBudgetStatus"));

const Iframe = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/iframe"));

const Documentation = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/Documentation"));

const PredictiveBilling = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/PredictiveBilling"));

const NLPRouting = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/NLPRouting"));

const UsefulChanges = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/UsefulChanges"));

const PostPaymentReview = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/RaReview"));


const Pages = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/Pages"));

const CoverageGovernment = lazy(() =>
  import(
    /*webpackChunkName:'CoverageGovernmentPage'*/ "@/pages/CoverageGovernment"
  )
);

const PerformanceCards = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ManagementDashboard/PerformanceCards"
  )
);


const ProductivityGraphs = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ManagementDashboard/ProductivityGraphs"
  )
);



const ProductivityTables = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ManagementDashboard/ProductivityTables"
  )
);

const HIMSMasterTaskList = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/HIMSMasterTaskList"));


const MisfileCheck = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/PatientMiscFile"));


const Logout = lazy(() =>
  import(/*webpackChunkName:'LogoutPage'*/ "@/pages/Logout")
);
const NotFound = lazy(() =>
  import(/*webpackChunkName:'NotFoundPage'*/ "@/pages/NotFound")
);



const ResetPassword = lazy(() => 
  import(
    /*webpackChunkName:'CoverageGovernmentPage'*/ "@/pages/PasswordManagement/ResetPassword"
  )
)

const ResetPasswordDone = lazy(() => 
  import(
    /*webpackChunkName:'CoverageGovernmentPage'*/ "@/pages/PasswordManagement/ResetPasswordDone"
  )
)

export default function AppRouter() {

  const { current } = useSelector(selectAuth);
  console.log(current)
  
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence exitBeforeEnter initial={false}>
        {
          current.managementCard ? 
          <Switch location={location} key={location.pathname}>
          <PrivateRoute path="/ds-team-dashboard-reminders" component={DSReminders} exact />
          <PrivateRoute path="/ds-team-dashboard-cards" component={DSCards} exact />
          <PrivateRoute path="/ds-team-dashboard-calendar" component={DSCalendar} exact />
          <PrivateRoute path="/ds-team-dashboard-avatars" component={DSAvatars} exact />
          <PrivateRoute path="/roi-qac" component={MisfileCheck} exact />
          <PrivateRoute path="/my-ds-team" component={ManagementDashboard} exact/>
          <PrivateRoute path="/productivity-metrics/graphs" component={ProductivityGraphs} exact/>
          <PrivateRoute path="/productivity-metrics/tables" component={ProductivityTables} exact/>
          <PrivateRoute path="/performance-cards" component={PerformanceCards} exact/>
          <PrivateRoute path="/intake-request" component={IntakeRequest} exact />

          <PrivateRoute path="/analytics" component={Analytics} exact />
          <PrivateRoute path="/professionals-center" component={Iframe} exact />
          <PrivateRoute path="/documentation" component={Documentation} exact />
          <PrivateRoute path="/team-calendar" component={CalendarBoard} exact />
          <PublicRoute path="/taskcalendar" component={TaskCalendar} exact />
          <PrivateRoute component={incomingwq} path="/incoming-faxes-wq" exact />
          <PrivateRoute component={Irb} path="/irb" exact />
          <PrivateRoute component={Overview} path="/overview" exact />
          <PrivateRoute component={IRBBudgetStatus} path="/irbbudgetstatus" exact />
          <PrivateRoute component={WorkAssignments} path="/work-assignments" exact />
          <PrivateRoute component={Reminder} path="/reminders" exact />
          <PrivateRoute component={Pages} path="/pages" exact />
          <PrivateRoute component={PredictiveBilling} path="/predictive-billing" exact />
          <PrivateRoute component={NLPRouting} path="/nlp-routing" exact />
          <PrivateRoute component={UsefulChanges} path="/useful-change" exact />
          <PrivateRoute component={NoPccStudies} path="/no-pcc-studies" exact />
          <PrivateRoute component={Template} path="/template" exact />
          <PrivateRoute path="/epic-productivity" component={EpicProductivity} exact />
          <PrivateRoute path="/master-staff-list" component={HIMSTeamRoster} exact />
          <PrivateRoute path="/hims-calendar-schedule" component={HIMSCalendarSchedule} exact />
          <PrivateRoute component={ChangePassword} path="/change-password" exact />
          <PrivateRoute component={ManagementMilestones} path="/management-milestones" exact />
          <PrivateRoute component={ManagementRoadmap} path="/management-roadmap" exact />
          <PrivateRoute path="/milestones-and-roadmap" component={MilestonesAndRoadmap} exact />
          <PrivateRoute path="/emaillogger" component={EmailLogger} exact />
          <PrivateRoute component={HIMSMasterTaskList} path="/hims-master-task-list" exact />
          <PrivateRoute component={CoverageGovernment} path="/coverage" exact/>
          <PrivateRoute component={RAC} path="/rac" exact/>
          <PrivateRoute component={ADR} path="/adr" exact/>
          <PrivateRoute component={NN} path="/nn" exact/>
          <PrivateRoute component={CERT} path="/cert" exact/>
          <PrivateRoute component={Admin} path="/team-members" exact />
          <PrivateRoute component={PostPaymentReview} path="/post-payment-review" exact />
          <PublicRoute path="/reset-password" component={ResetPassword} />  
          <PublicRoute path="/reset-password-done" component={ResetPasswordDone} /> 
          <PrivateRoute component={Logout} path="/logout" exact />
          <PublicRoute path="/login" render={() => <Redirect to="/" />} />
          <Route exact path="/">
          {current ? <Redirect to="/ds-team-dashboard-cards" /> : <NotFound />}
        </Route>
          <Route
            path="*"
            component={NotFound}
            render={() => <Redirect to="/notfound" />}
          />
        </Switch>
        :
         current.subSection == 'DS'  || current.subSection == 'DSB'  ?
        (
      <Switch location={location} key={location.pathname}>
        {/* <PrivateRoute path="/" component={} exact /> */}

        <PrivateRoute path="/ds-team-dashboard-reminders" component={DSReminders} exact />
          <PrivateRoute path="/ds-team-dashboard-cards" component={DSCards} exact />
          <PrivateRoute path="/ds-team-dashboard-calendar" component={DSCalendar} exact />
          <PrivateRoute path="/ds-team-dashboard-avatars" component={DSAvatars} exact />

        {/* <PrivateRoute component={Wq5508} path="/wq5508" exact /> */}
        <PrivateRoute component={incomingwq} path="/incoming-faxes-wq" exact />
        <PrivateRoute component={Irb} path="/irb" exact />
        <PrivateRoute component={NoPccStudies} path="/no-pcc-studies" exact />
        <PrivateRoute path="/roi-qac" component={MisfileCheck} exact />

        
        <PrivateRoute component={ChangePassword} path="/change-password" exact />
        <PrivateRoute component={RAC} path="/rac" exact/>
          <PrivateRoute component={ADR} path="/adr" exact/>
          <PrivateRoute component={NN} path="/nn" exact/>
          <PrivateRoute component={CERT} path="/cert" exact/>
          <PrivateRoute component={PostPaymentReview} path="/post-payment-review" exact />


        <PrivateRoute
          component={CoverageGovernment}
          path="/coverage"
          exact
        />

        <PublicRoute path="/reset-password" component={ResetPassword} />  
          <PublicRoute path="/reset-password-done" component={ResetPasswordDone} /> 
        <PrivateRoute component={Logout} path="/logout" exact />
        <PublicRoute path="/login" render={() => <Redirect to="/" />} />
        <Route exact path="/">
          {current ? <Redirect to="/ds-team-dashboard-cards" /> : <NotFound />}
        </Route>
        <Route
          path="*"
          component={NotFound}
          render={() => <Redirect to="/notfound" />}
        />
      </Switch>
    
        ) :
(

        <Switch location={location} key={location.pathname}>

        <PrivateRoute component={PostPaymentReview} path="/post-payment-review" exact />
 
        <PrivateRoute component={ChangePassword} path="/change-password" exact />
        <PrivateRoute component={RAC} path="/rac" exact/>
          <PrivateRoute component={ADR} path="/adr" exact/>
          <PrivateRoute component={NN} path="/nn" exact/>
          <PrivateRoute component={CERT} path="/cert" exact/>

          <PublicRoute path="/reset-password" component={ResetPassword} />  
          <PublicRoute path="/reset-password-done" component={ResetPasswordDone} /> 
        <PrivateRoute component={Logout} path="/logout" exact />
        <PublicRoute path="/login" render={() => <Redirect to="/" />} />
        <Route exact path="/">
          {current ? <Redirect to="/post-payment-review" /> : <NotFound />}
        </Route>
        <Route
          path="*"
          component={NotFound}
          render={() => <Redirect to="/notfound" />}
        />
      </Switch>
    
        )

      

        
        
        }

      
      </AnimatePresence>
    </Suspense>
  );
}
