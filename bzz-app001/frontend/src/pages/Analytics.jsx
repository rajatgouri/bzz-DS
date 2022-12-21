import React, { useState, useEffect } from "react";
import { FullCalendarLayout, DashboardLayout } from "@/layout";
import Graph from "../assets/images/executive-graph.png";
import roadmap from "../assets/images/roadmap.png";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";

import { Row, Col } from 'antd';

export default function Analytics() {
  
  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4",
      "margin": "auto",
      "maxWidth": "1150px",
      "height": "0px"
    },
    section : {
      minHeight: "100vh", 
      maxHeight: "100vh",
      minWidth: "1300px"
    }
  }

  return (
    
    <DashboardLayout style={dashboardStyles}>
    <Row gutter={[24, 24]} style={{height: "100%"}}>
      <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow" style={{ height: "100%" }}>
            <div
              className="pad20"
            >
               <h3 className="calendar-header" style={{marginBottom: "0px"}}>Analytics</h3>
              <Row gutter={[12, 12]}> 
                <Col className="gutter-row" span={24}>
                    {/* <img src={Graph} height="100%" width="100%" style={{ marginBottom: "50px"}}></img> */}
                </Col>
              </Row>
            </div>
          </div>
        </Col>
       
      </Row> 
    </DashboardLayout>
  )



}
