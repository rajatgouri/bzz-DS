// import React, { useState, useEffect } from "react";
// import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
// import { DashboardLayout } from "@/layout";
// import {  Row, Col} from 'antd';
// import AutomationAndBusiness from "../assets/images/Snag_ec11e6.png";
// import ChargesDistribution from "../assets/images/Snag_132e80d.png";
// import CriticalTrails1 from "../assets/images/critical-trails-1.png";
// import CriticalTrails2 from "../assets/images/critical-trails.png";


// const styles = {
//   layout: {
//     // backgroundImage : `url(${background})`,
//     // backgroundSize: "cover",
//     // backgroundRepeat: "no-repeat"
//   } ,
//   content:  {
//     padding: "30px 40px",
//     margin: "85px auto",
//     width: "100%",
//     maxWidth: "1090px",
//     height: "78vh",
//     background: "white",
//     boxShadow: "1px 1px 6px 5px lightgrey",
//     borderRadius: "5px"
//   } 
// }

// const dashboardStyles = {
//   content: {
//     "boxShadow": "none",
//     "padding": "35px",
//     "width": "100%",
//     "overflow": "auto",
//     "background": "#eff1f4",
//     "margin": "auto",
//     "maxWidth": "1150px"
//   },
//   section : {
//     minHeight: "100vh", 
//     maxHeight: "100vh",
//     minWidth: "1300px"
//   }
// }

// export default function Documentation() {
  
//   return (
//     // <FullCalendarLayout style={styles}>
//       // <h2 className="calendar-header">
//       //   Algorithms and Rules
//       // </h2>
//     // </FullCalendarLayout>
//     <DashboardLayout style={dashboardStyles}>
//     <Row gutter={[24, 24]}>
//     <Col className="gutter-row" span={24}>
//           <div className="whiteBox shadow" style={{ height: "100%" }}>
//             <div
//               className="pad20"
//             >
//               <Row gutter={[12, 12]} > 
//                 <Col className="gutter-row" span={24} >
//                     <img src={CriticalTrails1} height="100%" width="70%" style={{margin: " auto", display: "block" }}></img>
//                 </Col>
//               </Row>
//             </div>
//           </div>
//         </Col>
//     <Col className="gutter-row" span={24}>
//           <div className="whiteBox shadow" style={{ height: "100%" }}>
//             <div
//               className="pad20"
//             >
//               <Row gutter={[12, 12]} > 
//                 <Col className="gutter-row" span={24} >
//                     <img src={CriticalTrails2} height="100%" width="70%" style={{margin: " auto", display: "block"}}></img>
//                 </Col>
//               </Row>
//             </div>
//           </div>
//         </Col>
//       <Col className="gutter-row" span={24}>
//           <div className="whiteBox shadow" style={{ height: "100%" }}>
//             <div
//               className="pad20"
//             >
//                <h3 className="calendar-header" style={{marginBottom: "0px"}}>Algorithms and Rules</h3>
//               <Row gutter={[12, 12]} > 
//                 <Col className="gutter-row" span={24} >
//                     <img src={ChargesDistribution} height="100%" width="70%" style={{margin: " auto",}}></img>
//                 </Col>
//               </Row>
//             </div>
//           </div>
//         </Col>
//         <Col className="gutter-row" span={24}>
//           <div className="whiteBox shadow" style={{ height: "100%" }}>
//             <div
//               className="pad20"
//             >
//                <h3 className="calendar-header" style={{marginBottom: "0px"}}>Automation & Business Logic Layer</h3>
//               <Row gutter={[12, 12]} style={{padding: "50px"}}> 
//                 <Col className="gutter-row" span={24} >
//                     <img src={AutomationAndBusiness} height="100%" width="100%"></img>
//                 </Col>
//               </Row>
//             </div>
//           </div>
//         </Col>

//       </Row> 
//     </DashboardLayout> 
//   )

// }




import React, { useState, useEffect, useRef } from "react";
import { FullCalendarLayout, DashboardLayout } from "@/layout";
import roadmap1 from "../assets/images/roadmap1.png";
import {  Row, Col} from 'antd';
import { Button } from "antd";
import { request } from "@/request";
import { notification } from "antd";
import Socket from "../socket";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Config from "@/components/Editor"

export default function Documentation() {
  
  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4",
      "margin": "auto",
      "maxWidth": "1150px"
    },
    section : {
      minHeight: "100vh", 
      maxHeight: "100vh",
      minWidth: "1300px"
    }
  }


  const [ID, setID] = useState("");
  var [value, setValue] = useState("");
  const [collapsed, setCollapsed] = useState(false)
  const editor = useRef();


  const getSunEditorInstance = (sunEditor) => {
    editor.current = sunEditor;
  };

  const onSaveReminder = async () => {

    const resposne = await request.update('billingreminder', ID, {Document: value});
    notification.success({message: "Document Updated Successfully!",duration:3})
    // Socket.emit('update-reminder')
  }

  const handleChange =(content) => {
    setValue(content)
  }
  

  useEffect(() => {
    (async () => {
      const resposne = await request.read('billingreminder', 1);
      setID(resposne.result[0].ID)
      setValue(resposne.result[0].Document ?  resposne.result[0].Document : "Hello!")        

    })()
  }, [])

  const showEditor = () => {
    setCollapsed(!collapsed)
  }

  return (
    
    <DashboardLayout style={dashboardStyles}>
    <Row gutter={[24, 24]} style={{rowGap: "14px !important" }}>
      <Col className="gutter-row" span={24} style={{marginBottom: "15px"}}>
          <div className="whiteBox shadow" style={{ height: "100%" }}>
            <div
              className="pad20"
            >
               {/* <h3 className="calendar-header" style={{marginBottom: "10px"}}>Management Services</h3> */}
              <Row gutter={[12, 12]}> 
                <Col className="gutter-row reminders-container" span={24}  dangerouslySetInnerHTML={{ __html: value }}>
                    {/* <img src={roadmap1} height="100%" width="100%" style={{ marginBottom: "50px"}}></img> */}
                </Col>
              </Row>
            </div>
          </div>
        </Col>
        <Col className="gutter-row" span={24} style={{height: "calc(100% - 90%)", textAlign: 'right',marginBottom: "15px"}}>
          <Button className="shadow" default onClick={showEditor}>{collapsed ? "Hide" : "Edit" } </Button>
        </Col>
        {
          collapsed ? 
        <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow" style={{ height: "100%", minHeight: "0px" }}>
            <div
              className="pad20"
            >
               {/* <h3 className="calendar-header" style={{marginBottom: "10px"}}>Management Services</h3> */}
              <Row gutter={[12, 12]} style={{height: "625px"}}> 
                
                  
                  <Col className="gutter-row" span={24} style={{height: "100%"}}>
                  {/* <img src={roadmap2} height="100%" width="100%" style={{marginTop: "30px", marginBottom: "30px"}}></img> */}
                  <div  style={{height: "100%"}}>
                    <div style={{height: "calc(100% - 30px)"}}>
                      {
                        value ? 
                        <SunEditor  
                        onChange={handleChange}
                        getSunEditorInstance={getSunEditorInstance}
                        setOptions={{ 
                        font: Config.font,
                        buttonList: Config.buttonList 
                      }} 
                      defaultValue={value}
                      /> : 
                      null
                      }
                      </div>
                      {
                         value ? 
                         <div className="text-right">
                            <Button type="primary" onClick={onSaveReminder}>Save</Button>
                          </div>
                          : null
                        } 
                    </div>
              </Col>
               
              </Row>
            </div>
          </div>
        </Col>
        :
        null }

      </Row> 
    </DashboardLayout>
  )
}
