import React, {useState, useEffect} from "react";
import {
  Progress
} from "antd";

export default function ProgressChart({ wq1 = true , percent , text, height = 80 , width = 78 , customClassName, color = "#BEE6BE"}) {

  
  return (
    <div className={customClassName ? customClassName + " progress-chart" : "liquid-chart progress-chart"} style={{textAlign: "center",}}>
      {
        wq1 ?
        <Progress type="dashboard" strokeColor={color} percent={percent} height={height} width={width} style={{padding:"11px 0px 4px 0px"}}  />
          : 
        <Progress type="dashboard" strokeColor={color} percent={percent} height={height} width={width} style={{padding:"11px 0px 4px 0px"}} format={percent => `${percent} %` }  />

      }
      <p className="liquid-chart-label">{text}</p>
    </div>

  );

}
