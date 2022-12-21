import React, { useState, useEffect } from "react";
import { FullCalendarLayout, DashboardLayout } from "@/layout";
import Anna from "../assets/images/performance-anna.png";
import Ferdinand from "../assets/images/performance-ferdinand.png";
import Jacqueline from "../assets/images/performance-jacqueline.png";
import Jannet from "../assets/images/performance-jannet.png";
import Suzanne from "../assets/images/performance-suzanne.png";
import { Row, Col} from "antd";
import {useLocation} from "react-router-dom";

const styles = {
  layout: {
    // backgroundImage : `url(${background})`,
    // backgroundSize: "cover",
    // backgroundRepeat: "no-repeat"
    minWidth: "1000px",
    padding: "0px 100px",
    overflow: "auto"
  } ,
  content:  {
    padding: "30px 40px",
    margin: "85px auto",
    width: "100%",
    maxWidth: "1000px",
    height: "78vh",
    background: "white",
    boxShadow: "1px 1px 6px 5px lightgrey",
    borderRadius: "5px"
  } 
}

const dashboardStyles = {
  content: {
    "boxShadow": "none",
    "padding": "35px",
    "width": "100%",
    "overflow": "auto",
    "background": "#eff1f4",
    "margin": "auto",
    "maxWidth": "1150px",
    "height": "1px"
  },
  section : {
    minHeight: "100vh", 
    maxHeight: "100vh",
    minWidth: "1300px"
  }
}

export default function Iframe() {

  const search = useLocation().search;
  const id = new URLSearchParams(search).get('id');
  
  
  return (
    

    <DashboardLayout style={dashboardStyles}>
      
    <Row gutter={[24, 24]} style={{height: "100%"}}>
      <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow" style={{ height: "100%" }}>
            <div
              className="pad20"
            >
               <h2 className="calendar-header">
         Performance Data Feedback
      </h2>
      <Row gutter={[12, 12]}> 
        <Col className="gutter-row" span={24} style={{padding: "10rem 0em", height: "100%"}}>
            {
              id == 0 ?
               <img src={Anna} height="100%" width="70%" style={{margin: "70px auto ", display: "block"}}></img> 
              : null
            }
            {
              id == 1 ?
               <img src={Ferdinand} height="100%" width="70%" style={{margin: "70px auto ", display: "block"}}></img> 
              : null
            }
            {
              id == 2 ?
               <img src={Jacqueline} height="100%" width="70%" style={{margin: "70px auto ", display: "block"}}></img> 
              : null
            }
            {
              id == 3 ?
               <img src={Jannet} height="100%" width="70%" style={{margin: "70px auto ", display: "block"}}></img> 
              : null
            }
            {
              id == 6 ?
               <img src={Suzanne} height="100%" width="70%" style={{margin: "70px auto ", display: "block"}}></img> 
              : null
            }
            
        </Col>
      </Row>
            </div>
          </div>
        </Col>
      

      </Row> 
    </DashboardLayout>
    
  )

}
