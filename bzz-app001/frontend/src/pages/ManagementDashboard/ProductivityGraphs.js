import React, { useRef, useState, useEffect } from "react";
import { Layout, Form, Breadcrumb, Statistic, Progress, Divider, Tag, Row, Col, Button, notification, Select, Radio, DatePicker } from "antd";

import { Column, Liquid, Pie, Gauge, Line } from "@ant-design/charts";
import { request } from "@/request";

import { DashboardLayout } from "@/layout";
import Socket from "../../socket";
import moment from "moment";
import Performance from "@/components/Chart/performance";
// import { setValue } from "@syncfusion/ej2-base";
const { Option } = Select;


const DemoGauge = ({ percent }) => {

  var config = {
    percent: +percent / 100,
    type: 'meter',
    innerRadius: 0.75,
    range: {
      ticks: [0, 1 / 3, 2 / 3, 1],
      color: ['#F4664A', '#FAAD14', '#30BF78'],
    },

    indicator: {
      pointer: { style: { display: 'none' } },
      pin: { style: { stroke: '#D0D0D0' } },
    },
    axis: {
      label: {
        formatter: function formatter(v) {
          return Number(v) * 100;
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '18px',
          lineHeight: '20px',
          color: "#000000",
          fontWeight: "600",
          marginTop: "15px"
        },
      },
    },
  };
  return <Gauge height={150} {...config} />;
};



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


const AllKPIGraph = ({ usersList = [] }) => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('IncomingWQ');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].FIRST_NAME)
      setUsers(usersList)
      asyncFetch(value, usersList[0].FIRST_NAME);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);

    let KPI = totalkpisyear.result;

    let obj = {
     

      wqTotalKPI: (KPI.map(res => ({
        value: res['Fax Processed'],
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }

    console.log(obj)
    debugger

      setData(obj.wqTotalKPI.reverse())

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
        Total Faxes Processed
      </div>
    
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            // color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: datum.value };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};

export default function PerformanceCards() {

  const [totalProductivity, setTotalProductivity] = useState(0);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
   

    load()
  }, [])

  const load = () => {
    (async () => {

      // const [wq5508Progress, wq1075Progress, dailyProgress] = await Promise.all([request.list("IncomingWQrogress"), request.list("wq1075progress"), request.list("dailyprogress")]);

      const [wqProgress  ] = await Promise.all([request.list("incomingwqprogress")]);
 
      let wq = wqProgress.result;
      // setEpicData(emailLogger.result)

      let sumwq = 0;

      for (let i = 0; i < wq.length; i++) {
        sumwq += +wq[i].ChargesProcessed;
      }

      setTotalProductivity(((sumwq / (wq.length * 100)) * 100).toFixed(2))
      const response = await request.list("admin");
      setUsersList(response.result.filter((re) => re.ManagementAccess != 1 && re.SubSection == 'DS'))
    })()
  }


  return (
    <DashboardLayout style={dashboardStyles}>

      <Row gutter={[24, 24]}>
       
      <Col className="gutter-row" style={{ width: "80%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >

              <AllKPIGraph usersList={usersList} />
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "20%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div
              className="pad20"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              <h3 style={{ color: "#22075e", marginBottom: 30 }}>
                Productivity Preview
              </h3>

              {/* <Progress type="dashboard" percent={totalProductivity} width={148} /> */}
              <DemoGauge width={148} percent={totalProductivity} />

              <Divider />
              <p style={{ color: "#22075e", margin: " 30px 0" }}>
                Total Work Done
              </p>

              <h1 className="calendar-header">IncomingWQ</h1>
             
            </div>
          </div>
        </Col>
      </Row>

    </DashboardLayout>
  );
}
