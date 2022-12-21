import React, { useLayoutEffect } from "react";

import {
  Button,
  PageHeader,
  Badge,
 
} from "antd";
import ProgressChart from "@/components/Chart/progress";
import {  EyeFilled, ReloadOutlined,  EyeInvisibleFilled, SortAscendingOutlined } from "@ant-design/icons";
import uniqueId from "@/utils/uinqueId";



export default function Header(config) {
  
  const {dataTableTitle, showClock, formatTime , processPercent, donePercent, totalFaxes,users,handelDataTableLoad,handleClock,timer, filters,todayProcessed, openSortModal} = config

  return (
    <PageHeader
    style={{
      "padding": "0px",
      "marginTop": "-5px",
      "marginBottom": "10px"
    }}
    ghost={false}
    tags={
      <div>
        <div style={{ 'display': 'block', marginBottom: "20px" }}>
    <h2
      className="ant-page-header-heading-title"
      style={{ fontSize: "25px", marginRight: "18px", width: "150px" }}
    >
      {dataTableTitle}

    </h2>
  </div>
        <div className="timer-container">
          <div className="timer">
          {
                showClock ? 
                  <p style={{marginBottom: "3px"}}>{formatTime(timer)}</p>
                : null
              }
          </div>
        </div>

      </div>

    }
    extra={[
      <div className="text-right flex ">
        
        <div className="counter-container" >
              <div style={{ height: "84px" }}>
                <div>
                  <p className="amount-container digital">{
                    (parseInt(todayProcessed)).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  } </p>
                  <p className="general-label">Fax Processed</p>
                </div>
                
              </div>
            </div>
        <ProgressChart percent={(processPercent * 100).toFixed(2)} text={"Work Done"} />
        <ProgressChart percent={(donePercent * 100).toFixed(2)} color="#f89321" text={"Work to Do"} wq1={false} />

        <div>

          <div className="chart-container">
           

            <div className="empty-aging-days" style={{
              padding: "5px",
              width: "92px",
              margin: "auto",
              display: "flex",
              marginTop: "5px",
              flexDirection: "column"
            }}>
              <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "25px" }} className="digital"> {('0000' + totalFaxes).substr(-4)}</div>
                </div>

              </div>
            </div>
            <div >
            </div>
            <p className="barchart-label">Faxes</p>
          </div>
        </div>
        

        <div className="user-members" style={{ minWidth: "115px" }}>
          <div style={{ height: "92px", padding: "5px 0px", overflowX: "inherit" }} >
            {
              users.map((user) => {
                return <Badge className="mr-3 text-shadow fnt-10 d-block" status={user.status} text={user.name} />
              })
            }
          </div>
          <p className="general-label" style={{ marginRight: "0px" , marginTop: "0px" }}>Attendance</p>
        </div>

        <div style={{ display: "inline-block" }}>
       
          <Button style={{ display: 'block' }} size="small" onClick={() => handelDataTableLoad(1, { 'ROI Status': filters['ROI Status'] } , {})} key={`${uniqueId()}`}>
            <ReloadOutlined />
          </Button>
          {
            !showClock ? 
            
            <Button  size="small" style={{marginTop: "5px", height: "25px", width: "100%", display: "block"}} key={`${uniqueId()}`}>
              <EyeFilled  onClick={() => handleClock(true)}/> 
            </Button>
             :
             
            <Button  size="small" style={{marginTop: "5px", height: "25px", width: "100%", display: "block"}} key={`${uniqueId()}`}>
            <EyeInvisibleFilled onClick={() => handleClock(false)}/>
         </Button>

          }

              <Button className="ml-3 mt-5" size="small" title="Sort" onClick={() => {
                openSortModal()
                }} key={`${uniqueId()}`}>
                  <SortAscendingOutlined />
                </Button>

        
        </div>
      </div>
    ]}
  
  ></PageHeader>
  );
}
