import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import { DashboardLayout } from "@/layout";
import { request } from "@/request";
import TopCard from "@/components/TopCard";
import Socket from "../../socket";
import PageLoader from "@/components/PageLoader";
import { selectAuth } from "@/redux/auth/selectors";
import { useSelector } from "react-redux";


export default function Cards() {

  const [cardData, setCardData] = useState([]);
  const [admins, setAdmins] = useState([]);
  const { current } = useSelector(selectAuth);


  useEffect(() => {
    Socket.on('updated-wqs', () => {
      load();
    });

    load();
  }, [])

  const load = () => {
    (async () => {

      

      const performance = await request.list('performance');

      let {wqProgress, feedbackProgress, adminlist, wqWorkProgress , kpi } = performance.result
      let wq1 = wqProgress
      let feedback = feedbackProgress;
      let wq1Work = wqWorkProgress
      let admin = adminlist;

      let liAdmin  =  admin.filter(list => list.ManagementCard == '1' && list.First != 'Admin')
      let user  =  admin.filter(list => list.ManagementCard != '1' && (list.SubSection == 'DS' || list.SubSection == 'DSB')  )
      


      let b = liAdmin[liAdmin.findIndex(li => li.Nickname == 'Shanna')];
      liAdmin[liAdmin.findIndex(li => li.Nickname == 'Shanna')] = liAdmin[liAdmin.findIndex(li => li.Nickname == 'Alberto')];
      liAdmin[liAdmin.findIndex(li => li.Nickname == 'Alberto')] = b;

      setAdmins(liAdmin)

      wq1 = (wq1.sort((a,b) => {
        return a.First.localeCompare(b.First)
      }))

      if (current.managementCard != '1') {
        let emp = user.filter((u) => u.EMPID == current.EMPID)[0]
        user =user.filter((u) => u.EMPID != current.EMPID)
        user.unshift(emp)
      }
   


      let merged = [];

      for (let i = 0; i < user.length; i++) {

        let KPI = kpi.filter(k => k.EMPID == user[i].EMPID)
      
        let obj = {
         WQ: (KPI.map(res => ({
           value: res['Fax Processed'],
           year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
         }))).splice(0,5), 
       
         
        }  

        merged.push({
          EMPID: user[i].EMPID,
          wq1: wq1.filter(w => w['EMPID'] == user[i]['EMPID'])[0],
          user: user[i],
          KPI: obj.WQ.reverse(),
          feedback: feedback.filter(f => f.EMPID == user[i].EMPID)[0],
          WQWorkDone: wq1Work.filter(w => w.EMPID == user[i]['EMPID'])[0]
        });
      }

      console.log(merged)
      setCardData(merged)


    })()
  }

  const ratingChanged = async (id, rating) => {
    const feedback = await request.create("feedback", { EMPID: id, Stars: rating });
    if (feedback.success) {
      notification.success({ message: "Feedback given successfully!" })
    }
  }


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

  return (
    <DashboardLayout style={dashboardStyles}>
      {
        cardData.length > 0 ?
          <Row gutter={[20, 20]}style={{ width: "100%", display: "block", marginLeft: "0px" }}>
            <Col className="" style={{ width: "100%", textAlign: "left", padding: "0px"  }}>
              <div
                className="whiteBox shadow"
                style={{ color: "#595959", fontSize: 13 }}
              >

                <Row gutter={[24, 24]} className="texture">
                  {
                    admins && admins.map((admin) => {
                      return <Col style={{ width: "20%", height: "142px" }}>
                        <div
                          className="pad5 strong"
                          style={{ textAlign: "left" }}
                        >
                          <h3 style={{ color: "#22075e", margin: "3px auto", fontSize: "10px !important", textAlign: "center" }} className="header">

                            {admin.Nickname}

                          </h3>

                          <div style={{ textAlign: "center", height: "55px", marginBottom: "7px" }}>
                            {
                              admin && admin.Avatar && admin.Avatar != "null"  ?
                                <img src={admin.Avatar} className="user-avatar scale2"></img>
                                : null
                            }
                          </div>

                        </div>
                      </Col>
                    })
                  }

                  <Col  style={{ width: "260px", position: "absolute", right: "0px", display: "flex" ,height: "142px"}}>
                      <span  className="topbar-header">Management</span>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          : null
      }

      <div className="space30"></div>

      <Row gutter={[20, 20]}>

        {
          cardData.length > 0 ?
            cardData.map((data) => {
              console.log(data)
              return <TopCard
                EMPID={data.EMPID}
                user={data.user}
                feedback={data.feedback}
                title={data?.user?.Nickname}
                KPI= {data.KPI}
                percent={data?.wq1?.ChargesProcessed}
                FaxProcessed={data?.wq1 ? data?.wq1['Fax Processed'] : 0}
                onRatingChanged={(id, rating) => ratingChanged(id, rating)}
                WQWorkDone={data.WQWorkDone}
                notes={() => { }}
              />
            })

            :
            <PageLoader />
        }
      </Row>
    </DashboardLayout>
  );
}
