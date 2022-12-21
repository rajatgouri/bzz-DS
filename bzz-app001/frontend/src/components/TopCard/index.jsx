import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Divider } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";
import LiquidChart from "@/components/Chart/liquid";
let { request } = require('@/request')
import { CheckOutlined, DollarTwoTone, CheckSquareTwoTone } from "@ant-design/icons";
import ReactTooltip from 'react-tooltip';
import CheckImage from "../../assets/images/check.png";
import Halloween from "../../assets/images/halloween.png";
import SantaBag from "../../assets/images/santa-gift-bag.png";
import ExternalPumpkin from "../../assets/images/external-pumpkin.png";
import CandyCaneBow from "../../assets/images/candy-cane-bow.png";
import CandyCane from "../../assets/images/candy-cane.png";
import Candy from "../../assets/images/candy.png";
import Autumn from "../../assets/images/autumn.png";
import SealOfExellence from "../../assets/images/seal-of-exellence.png";
import CheckerFlags from "../../assets/images/checker-flags.png";
import BearBadge from "../../assets/images/bear1.png";
import FireworksBadge from "../../assets/images/balloons1.png";
import PencilBadge from "../../assets/images/pencil1.png";
import StarBadge from "../../assets/images/star1.png";
import RibbonBadge from "../../assets/images/ribbon1.png";
import ThumbsupBadge from "../../assets/images/thumbs-up1.png"; 
import ProgressChart from "../Chart/progress";
import logo from "../../assets/images/logo.png";
import { Line } from '@ant-design/charts';



// export default function Modals({ config, children }) {
//   let { title,  openModal, handleCancel } = config;

//   return (
//     <>
//     <Modal centered title={title} visible={openModal} onCancel={handleCancel} footer={null}  width={400}>
//         {children}
//       </Modal>
//     </> 
//   );
// }

const renderCustomizedLabel = (props) => {
  const { x, y, width, value } = props;
  const radius = 10;
  return (
    <g>
      <text
        x={x + width / 2}
        y={y - radius}
        fill="#000000"
        style={{
          fontSize: "9px"
        }}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value}
      </text>
    </g>
  );
};


const DemoLine = ({ data , value}) => {
  
  console.log(data)
  console.log(value)
  const config = {
    data,
    width: 110,
    height: 80,
    autoFit: false,
    padding: 'auto',
    xField: 'year',
    yField: 'value',
    renderer: "svg",
    legend: false,
    xAxis: {
      tickCount: 10,

      label: {
        style: {
          fontSize: 6
        }
      }
    },
    yAxis: {
      label: {
        style: {
          fontSize: 6
        }
      }
    },
    point: {
      size: 3,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    tooltip: {
      customContent: (title, data) => {
        return `<div class='linechart-tooltip'>

          <div ><span class="bold"> Date </span>:  ${title} </div> 
          <div ><span class="bold">${value}</span> :  ${data[0] ? data[0].value : ""} </div> 
        </div>`;
      }
    }
  };
  return <Line {...config} />;
};


export default function TopCard({ EMPID, user,title, percent = 0, FaxProcessed=0, KPI,  feedback = {},  WQWorkDone = {}, onRatingChanged , showBadge = false, notes}) {

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [badges, setBadges] = useState([
    { badge: StarBadge, index: 1, active: false, notes: "" , text: "Star"},
    { badge: BearBadge, index: 2, active: false, notes: "" , text: "Bear"},
    { badge: RibbonBadge, index: 3, active: false, notes: "" , text: "Ribbon"},
    { badge: ThumbsupBadge, index: 4, active: false, notes: "" , text: "Thumbsup"},
    { badge: PencilBadge, index: 5, active: false, notes: "" , text: "Pencil"},
    { badge: FireworksBadge, index: 6, active: false, notes: "" , text: "Firework"}
  ])

  const [selectedBadge, setSelectedBadge] = useState({});
  const [WQWorkingDays,setWQWorkingDays] = useState([])
  const [weeks, setWeeks] = useState([])
  const [WQWork , setWQWork] = useState([])

  useEffect(() => {


    (async () => {
      const response = await request.list1("admin-one", { data: JSON.stringify({
        EMPID: EMPID
      }) 
    });
      let result = (response.result)[0];
      if(result) {

      let wdays = days.slice(days.indexOf(result.StartDay), days.indexOf(result.StartDay) + 5)
      setWQWorkingDays(wdays)

      // weeks
      let WQWeekList = [];


      for (let i = 1; i < 5; i++) {

        WQWeekList.push(WQWork['Week' + i])
      }

      setWeeks(WQWeekList)
    

      if(WQWork.AdminAssignedBadge) {
        let badgesList = badges;
        let selected = badges.filter(badge => badge.index == WQWork.AdminAssignedBadge )[0]

        if(selected) {
          badgesList[selected.index -1 ].active = true
          badgesList[selected.index -1 ].notes = WQWork.Notes

          setSelectedBadge(selected)
          setBadges(...badgesList)

        }
      }

    }
    })()


  }, [WQWork, EMPID])


  const onBageAssigned = async(index) => {

    // let badgeIndex = badges.findIndex(badge => badge.index = index);
    let badgeList  = badges;
    
    badgeList.map((badge) => {
      if(badge.index != index) {
        badge.active = false
      }
    })

    badgeList[index -1].active = !badgeList[index -1].active;

    let response;
    if(badgeList[index - 1].active) {
      setSelectedBadge(badgeList[index-1])
      response = await request.update("incomingwqWork", EMPID, { AdminAssignedBadge: badgeList[index -1].index });
      notes(EMPID, badgeList[index - 1].text)
      
    } else {
      setSelectedBadge({})
      response = await request.update("incomingwqWork", EMPID ,{ AdminAssignedBadge: null });
    }


    setBadges(null)
    setTimeout(() => setBadges(badgeList), 0)
  }



  

  return (
    <Col className="gutter-row topcard" >
      <div
        className="whiteBox shadow"
        style={{ color: "#595959", fontSize: 13 }}
      >
        <div
          className="pad5 strong"
          style={{ textAlign: "left", justifyContent: "center" }}
        >
          <h3 style={{ color: "#22075e", margin: "3px auto", fontSize: "10px !important", textAlign: "center" }} className="header">
            {
              selectedBadge.badge ? 
                <span >
                  <p data-tip={selectedBadge.notes} style={{display: "contents"}}>
                  <img className="scale1"  src={selectedBadge.badge} style={{ position: "absolute", width: "45px", marginTop: "-6px" , left: "12px" }}></img>
                    </p>
                 {/* <img   src={selectedBadge.badge} style={{ position: "absolute", width: "45px", marginTop: "-6px" , left: "12px" }}></img> */}

                  {/* <p data-tip="hello world">T</p> */}
                  <ReactTooltip />
                  </span>
              
              : null
            }
            {title}
            {
              WQWork.Badge ?
                <img height="30" width="23" className="scale3" src={SealOfExellence} style={{ marginLeft: "10px" }}></img>
                : null
            }
          </h3>
          
          <div style={{textAlign: "center", height: "55px", marginBottom: "7px"}}>
          {
            user ?

              user.Avatar  && user.Avatar != "null"  ? 
              <img src={ user.Avatar  } style={{filter : user.Online ? "" : "grayscale(100%)", opacity: user.Online ? 1 : 0.4 }} className="user-avatar scale2"></img>
              : 
              <img src={ logo  } style={{borderRadius: "0px", filter : user.Online ? "" : "grayscale(100%)", opacity: user.Online ? 1 : 0.4 }} className="user-avatar scale2"></img>
            : null
            }  
          </div> 
          {/* <div className="badges">
            <Row gutter={[0, 0]}>
              <Col className="gutter-row" span={12} >
                <div className="text-center">
                  <span style={{ right: "10px" }}>
                    {
                      weeksWQ1075.map(week => {
                        return <img src={Autumn}  className="scale1" height="18" width="18" style={{ filter: !week ? "grayscale(100%)" : "", opacity: !week ? "0.25" : "", marginRight: "5px" }} />
                      })
                    }
         
                  </span>
                </div>
              </Col>
              <Col className="gutter-row" span={12} style={{ textAlign: "right" }}>
                <div className="text-center"> 
                  <span style={{ right: "10px" }}>
                    {
                      weeksWQ5508.map((week, index) => {
                        return  <img src={Autumn} key={index} className="scale1" height="18" width="18" style={{ filter: !week ? "grayscale(100%)" : "", opacity: !week ? "0.25" : "", marginLeft: "5px" }} />
                      })
                    }
                  </span>
                </div>

              </Col>
            </Row>
          </div> */}
        </div>

        <Divider style={{ padding: 0, margin: 0, borderColor: "#dbdbdb" }}></Divider>
        <div className="">
          <Row gutter={[0, 0]} style={{ padding: "0px 6px" }}>

            <Col
              className="gutter-row top-card-right"
              span={24}
              style={{ paddingBottom: "5px" }}
            >
              <div style={{ textAlign: "center", marginTop: "5px", fontWeight: 600, marginBottom: "10px" }}>IncomingWQ</div>
              {
                user.EMPID != 2 ? 
                <ProgressChart percent={(percent)} height={80} width={60} customClassName={"liquid"} text={"Work Done"} />
                :  null
              }
              
              <div style={{ textAlign: "center" }}>
                <div className="counter-container" >
                  <div style={{ height: "84px" }}>
                    <div>
                      <p className="amount-container digital">
                        {
                          (parseInt(FaxProcessed)).toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })
                        }
                      </p>
                      <p className="general-label">Fax Processed</p>
                    </div>
                    
                  </div>
                </div>
              </div>

              {
                KPI && KPI.length > 0 ?
                  <div style={{ textAlign: "left !important", marginTop: "30px" }}>
                    <div style={{ textAlign: "center" }}>
                      <DemoLine data={KPI} value={'Fax Processed'}/>
                    </div>
                  </div>

                  : (
                    <div className="empty-aging-days" style={{
                      padding: "25px",
                      width: "105px",
                      margin: "0px auto",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden"

                    }}>
                      <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%", }}>
                        <img src={CheckerFlags} width="60" height="35"></img>
                      </div>
                    </div>
                  )
              }

              <p className="barchart-label" style={{ marginTop: "5px" }}>Fax Processed</p>


              {/* {
                showCalendar ?
                  <div>
                    <div className="user-members" style={{
                      padding: " 5px",
                      width: "92px",
                      margin: "auto",
                      display: "flex",
                      marginTop: "20px",
                      flexDirection: "column"
                    }}>
                      {
                        amountWQ1 && amountWQ1.length == 0 ?
                          <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "40%", }}>
                            <img src={CheckerFlags} width="60" height="35"></img>
                          </div>
                          :
                          amountWQ1 && amountWQ1.map((amount) => {
                            return <div style={{ fontSize: "10px", minWidth: "65px", lineHeight: "21px", fontWeight: "500", paddingLeft: "8px" }}><DollarTwoTone twoToneColor="#52C41A" style={{ marginRight: "3px" }} /> {
                              (parseInt(amount)).toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })
                            }</div>
                          })
                      }
                    </div>
                    <p className="barchart-label" style={{ marginTop: "5px" }}>Top $ Amount</p>
                  </div>
                  : null
              } */}
            </Col>

            {/* <div
              className="pad5 strong"
              style={{ textAlign: "left", justifyContent: "center", width: "100%", padding: "0px 0px 10px", marginBottom: "10px" }}
            >
              <div className="badges text-center">
                <Row gutter={[0, 0]}>
                  <Col className="gutter-row" span={24} >
                    <div className="text-center">
                      <span style={{ right: "10px" }}>
                        {
                          WQ1WorkingDays.map(day => {
                            return WQ1Work[day] ? <img src={CheckImage} height="17px" weight="16px" style={{ filter: "hue-rotate(293deg)", marginLeft: "1px" }} className="scale1" /> : <img style={{ filter: "grayscale(100%)", opacity: "0.25", marginLeft: "1px" }} className="scale1" src={CheckImage} height="16px" weight="16px" />
                          })
                        }

                      </span>
                    </div>
                  </Col>
                  
                </Row>
              </div>
            </div>

            {
              showCalendar && calendar ?
                <Col span={24} style={{ padding: "9px" }} inputRef={(ref) => {
                  this.calendar = ref

                  console.log(this.calendar)
                }}>

                  <Calendar
                    calendarType="US"
                    next2Label={null}
                    prev2Label={null}
                    maxDate={new Date(`${new Date().getFullYear()}-12-31`)}
                    onDrillUp={() => console.log('y')}
                    minDate={new Date(`${new Date().getFullYear()}-01-01`)}
                    tileDisabled={disableTile}
                    tileContent={tileContent}
                    onClickDay={onDayClick}
                    onViewChange={(e) => console.log(e)}
                    value={value}
                  />
                </Col>
                : null
            }*/}

            {
              showBadge ?
                <Col span={24} style={{ display: "flex", marginBottom: "15px", marginTop: "10px", textAlign: "center" }} >
                  {
                    badges && badges.length > 0 && badges.map((badge, index) => {
                      if (badge.active) {
                        return <img onClick={() => onBageAssigned(badge.index)} src={badge.badge} className="asssignedBadge" style={{}} />

                      } else {
                        return <img onClick={() => onBageAssigned(badge.index)} src={badge.badge} className="asssignedBadge" style={{ filter: !badge.active ? "grayscale(100%)" : "", opacity: !badge.active ? "0.35" : "" }} />

                      }
                    })
                  }
                </Col>
                : null
            } 
          </Row>
        </div>
      </div>
    </Col>
  );
};


   