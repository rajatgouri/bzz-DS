import React, { useEffect, useState, Suspense } from "react";
import { Router as RouterHistory } from "react-router-dom";
import { Provider } from "react-redux";
import Router from "@/router";
import history from "@/utils/history";
import store from "@/redux/store";
import Socket from "../socket";
import { Button, Result } from "antd";
import { request } from "@/request";
import { useSelector, useDispatch} from "react-redux";
import idleTimer from "idle-timer"
import { getDate , getDay} from "@/utils/helpers";


import useNetwork from "@/hooks/useNetwork";

function App() {
  const { isOnline: isNetwork } = useNetwork();
  const [path, setPath] = useState('')
  const [status, setStatus] = useState('')


  setInterval(() => {
    autoLogout()

    if(localStorage.getItem('auth')) {
      Socket.emit('setEMPID', JSON.parse(localStorage.getItem('auth')).current.EMPID)
    } 
  }, 600000)
  

  useEffect(() => {
    // tracker()
  }, [history])



  const autoLogout = () => {
    if(localStorage.getItem('loggedDay') != getDay()) {
      // localStorage.clear()
      window.localStorage.removeItem('auth');
      window.localStorage.removeItem('x-auth-token');
      localStorage.setItem('loggedDay', getDay())
      window.location.href = "/login"
    }
  }

  useEffect(() => {
      
    autoLogout()

    if(localStorage.getItem('auth')) {
      Socket.emit('setEMPID', JSON.parse(localStorage.getItem('auth')).current.EMPID)
    } 
       

  }, [])


  // tracking //
  history.listen(async (location, action) => {
    setPath(location.pathname)
  });

  useEffect(()=>{
    tracker()
  }, [path])

  useEffect(() => {
    if(status) {
      tracker(status)
    }
  },[status])

  var done = true;
  const tracker = async (Status = "Visit") => {

    let Url = location.pathname
    let Page = location.pathname.replace(/-/g, " ").substring(1) !== "" ?  location.pathname.replace(/-/g, " ").substring(1): "Pb team dashboard"   
    const UserName = localStorage.getItem('auth') ?  JSON.parse(localStorage.getItem('auth')).current.name : "";
    
    if(Url.trim() != "/" && UserName != "" && done) {
        if(Url.trim() != "/" && UserName != "" ) {
          await request.create("/pageLogger", {Url, Page, Status, UserName});
          done = !done
        } 
       
        setTimeout(() => {
          done = true
        }, 1500)
    }  
  }
  // if (!isNetwork)
  //   return (
  //     <>
  //       <Result
  //         status="404"
  //         title="No Internet Connection"
  //         subTitle="Check your Internet Connection or your network."
  //         extra={
  //           <Button href="/" type="primary">
  //             Try Again
  //           </Button>
  //         }
  //       />
  //     </>
  //   );

  
  const callbackFn =  () => {
    setStatus("Idle")

  }

  
  const activeCallbackFn =  () => {
    setStatus("Active")

  }


  idleTimer({
    // function to fire after idle
    callback: callbackFn,
    // function to fire when active
    activeCallback: activeCallbackFn,
    // Amount of time in milliseconds before becoming idle. default 60000
    idleTime: 1000 * 60  * 5
  })

  return (
    <div>
    <RouterHistory history={history}>
      <Provider store={store}>
        <Router />
      </Provider>
    </RouterHistory>
  </div>
  );
}

export default App;
