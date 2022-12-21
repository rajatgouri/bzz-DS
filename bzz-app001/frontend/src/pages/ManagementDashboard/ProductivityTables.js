import React, { useRef, useState, useEffect } from "react";
import { Layout, Form, Breadcrumb, Statistic, Progress, Divider, Tag, Row, Col, Button, notification,  Radio } from "antd";

import { Column, Liquid, Pie, Gauge } from "@ant-design/charts";
import { request } from "@/request";

import { DashboardLayout } from "@/layout";
import Socket from "../../socket";
import CheckmarkCalendar from "@/components/Calendar";
import KPI from "../KPI";





const dashboardStyles = {
  content: {
    "boxShadow": "none",
    "padding": "35px",
    "width": "100%",
    "overflow": "auto",
    "background": "#eff1f4"
  },
  section: {
    minHeight: "100vh",
    maxHeight: "100vh",
    minWidth: "1300px"
  }
}

export default function PerformanceTables() {

 


  return (
    <DashboardLayout style={dashboardStyles}>

      <Row gutter={[24, 24]}>
      <Col className="gutter-row" style={{ width: "100%" }}>
          <div className="whiteBox shadow" style={{ height: "475px" }}>
            <div  className="pad20 " >
             
              <KPI/>
            </div>
          </div>
        </Col>

        

       
      </Row>

    </DashboardLayout>
  );
}
