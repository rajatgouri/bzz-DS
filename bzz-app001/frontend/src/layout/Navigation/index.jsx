import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Button } from "antd";
import { request } from "@/request";
import { useSelector, useDispatch } from "react-redux";
import logo from "../../assets/images/logo.png";
import {user} from '@/redux/user/actions'
import Modals from "@/components/Modal";

import {
  SettingOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  TeamOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined,
  FileProtectOutlined


} from "@ant-design/icons";
import uniqueId from "@/utils/uinqueId";
import { selectListItems } from "@/redux/crud/selectors";
import { crud } from "@/redux/crud/actions";
import { logout } from "@/redux/auth/actions";
import { selectAuth } from "@/redux/auth/selectors";
import {  selectUsersList } from "@/redux/user/selectors";
const { Sider } = Layout;
const { SubMenu } = Menu;


function Navigation() {
  const { current } = useSelector(selectAuth);
  const [collapsed, setCollapsed] = useState(false);
  const [Status, setStatus] = useState(current.Status)
  const [open, setOpen] = useState(false)

  const dispatch = useDispatch();

  const onCollapse = () => {
    setCollapsed(!collapsed);
  };

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : users } = listResult;

  useEffect(() => {
    dispatch(user.list('admin'))
}, [])


const updateStatus = async  (status) => {
  setStatus(status)
  updateLocal(status)
  await request.update('jwt', current.EMPID , {Status: status})
  await request.create("/pageLogger", {Url : '', Page : '', Status: status, UserName: current.name});
}

  const switchUser = async (ID) => {
    // const response = await request.post("/admin/switch", {ID});
    // console.log(response)
  }


  useEffect(() => {
    if(Status != 'Working') {
      setOpen(true)
    }
  }, [Status])
  
  const setWorkingStatus = () => {
    setStatus('Working')
    current.Status = 'Working'
    updateLocal('Working')
  }


  const updateLocal = (status) => {
    let auth = JSON.parse(localStorage.getItem('auth'))
    auth.current.Status = status
    localStorage.setItem('auth', JSON.stringify(auth))
    setOpen(false)
  }

  const menu = (
    <Menu>
      <SubMenu
                    key="sub-status1"
                    title="Status"
                  >
                    <Menu.Item key="1000" onClick={() => updateStatus('Working')}>
                    <CheckCircleOutlined  style={{color: "#adff2f"}}/> Working
                    </Menu.Item>
                    <Menu.Item key="2000" onClick={() => updateStatus('Meeting')}>
                    <MinusCircleOutlined  style={{color: "#ff0000"}} /> Meeting
                    </Menu.Item>
                    <Menu.Item key="3000" onClick={() => updateStatus('Away')}>
                    <CloseCircleOutlined /> Away
                    </Menu.Item>
                   
                  </SubMenu>
      <Menu.Item key={`${uniqueId()}`} style={{ fontWeight: 'bold ' }} onClick={() => dispatch(logout())}>Log Out </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        style={{
          zIndex: 1000,
          background: "#fff",
          overflow: "hidden"
        }}
      >
        <div className="logo">
          <Dropdown overlay={menu} placement="bottomRight" arrow>
            <div>
            
                <div style={{width: "180px"}}>
                  <div style={{width: "50px", display: "contents"}}> 
                    <img style={{ height: "50px", marginTop: "-5px" }} src={logo} />
                  </div>  
                  <div  className="" style={{width: "150px", display: "contents" }} >
                    <span style={{verticalAlign: "top", width: "125px", display: "inline-flex", flexDirection: "column"}}>
                        <span className="text-center sub-header">Documentation Support</span>
                        <span className="header username">{current ? current.name.split(" ")[0] : ""}
                        
                        </span>
                    </span>
                </div>
                </div>  
            </div>

          </Dropdown>
        </div>

        {
        

            current.managementCard ?
              (
                <Menu 
                defaultOpenKeys={['sub9']}
                mode="inline"
                >
                  <SubMenu
                    key="sub9"
                    icon={<DashboardOutlined />}
                    title="DS Team Dashboard"
                  >
                    <Menu.Item key="92">
                      <NavLink to="/ds-team-dashboard-cards" />
                       Performance Cards
                    </Menu.Item>

                    <Menu.Item key="2600">
                      <NavLink to="/intake-request" />
                      Intake Requests
                    </Menu.Item>

                    <Menu.Item key="91">
                      <NavLink to="/ds-team-dashboard-reminders" />
                        Reminders
                    </Menu.Item>
                    
                    <Menu.Item key="93">
                      <NavLink to="/ds-team-dashboard-calendar" />
                        Calendar
                    </Menu.Item>
                    <Menu.Item key="94">
                      <NavLink to="/ds-team-dashboard-avatars" />
                        Avatars
                    </Menu.Item>
                  </SubMenu>

                  
                  <SubMenu
                    key="sub300"
                    icon={<AppstoreOutlined />}
                    title="Records"
                  >
                      <Menu.Item key="301" className="large-content" >
                        <NavLink to="/analytics" />
                        Analytics
                      </Menu.Item>
                  </SubMenu>



                    <Menu.Item key="2" icon={<ProfileOutlined />}>
                      <NavLink to="/incoming-faxes-wq" />
                      Incoming Faxes WQ
                    </Menu.Item>

                    <Menu.Item key="2454" icon={<ProfileOutlined />}>
                      <NavLink to="/roi-qac" />
                        ROI QAC
                    </Menu.Item>

                    

                    <SubMenu
                    key="sub550"
                    icon={<FileProtectOutlined />}
                    title="Routine Audits"
                  >

                    <Menu.Item key="555" >
                      <NavLink to="/post-payment-review" />
                      RA Review 
                    </Menu.Item>

                    <Menu.Item key="551">
                      <NavLink to="/rac" />
                       RAC
                    </Menu.Item>
                    <Menu.Item key="552">
                      <NavLink to="/adr" />
                        ADR
                    </Menu.Item>
                    
                    <Menu.Item key="553">
                      <NavLink to="/nn" />
                        NN
                    </Menu.Item>
                    <Menu.Item key="554">
                      <NavLink to="/cert" />
                        CERT
                    </Menu.Item>
                  </SubMenu>
              

                  <SubMenu
                    key="sub3"
                    icon={<TeamOutlined />}
                    title="Administration"
                  >
                   
                    <SubMenu
                      key="sub12"
                      // title="Correction Letters"
                      title={<div style={{ display: "flex", flexDirection: "column" }}><span  style={{ marginTop: "5px", fontSize: "13px !important" }} >Correction Letters</span>  </div>}
                      >
                        <Menu.Item key="32">
                          <NavLink to={"/template?id=1"} />
                            Template 01
                          </Menu.Item>
                          <Menu.Item key="33">
                            <NavLink to={"/template?id=2"} />
                            Template 02
                          </Menu.Item>
                          <Menu.Item key="34">
                          <NavLink to={"/template?id=3"} />
                            Template 03
                          </Menu.Item>
                    
                        
                    </SubMenu>

                    <Menu.Item key="18">
                      <NavLink to="/documentation" />
                        Documentation
                    </Menu.Item>

                    <Menu.Item key="222" className="large-content" >
                      <NavLink to="/hims-master-task-list" />
                      HIMS Master Task List
                    </Menu.Item>

                    <Menu.Item key="221" className="large-content" >
                      <NavLink to="/hims-calendar-schedule" />
                      HIMS Calendar Schedule
                    </Menu.Item>
                  </SubMenu>

                  <SubMenu
                    key="sub2"
                    icon={<AppstoreOutlined />}
                    title={<div style={{ display: "flex", flexDirection: "column" }}><span className="header italic" style={{ marginTop: "5px", fontSize: "14px !important" }} >Management Services</span>  </div>}
                  >
                     <Menu.Item key="17" >
                        <NavLink to="/performance-cards" />
                        <span >Performance Cards</span>
                      </Menu.Item>
                      

                  <SubMenu
                    key="sub8"
                    
                    title={<span style={{fontSize: "12.8px"}}>Professionals Center</span>}
                  >
                     <Menu.Item key="182">
                          <NavLink to="/productivity-metrics/graphs" />
                              Graphs
                          </Menu.Item>
                          <Menu.Item key="19">
                          <NavLink to="/productivity-metrics/tables" />
                              Tables
                          </Menu.Item>         
                  </SubMenu>

                   
                    <Menu.Item key="24">
                      <NavLink to="/reminders" />
                      Reminders
                    </Menu.Item>
                    <Menu.Item key="25">
                      <NavLink to="/team-calendar" />
                      Team Calendar
                    </Menu.Item>
                   
                    <Menu.Item key="27">
                      <NavLink to="/management-milestones" />
                       Milestones
                    </Menu.Item>
                    <Menu.Item key="28">
                      <NavLink to="/management-roadmap" />
                       Roadmap
                    </Menu.Item>          
                    <Menu.Item key="29">
                      <NavLink to="/emaillogger" />
                       Email Logger
                    </Menu.Item>       
                    
                    <Menu.Item key="220" className="large-content" >
                      <NavLink to="/master-staff-list" />
                      Master Staff List
                    </Menu.Item>

                                        
                  


                  </SubMenu>

                  <SubMenu
                    key="sub123"
                    icon={<SettingOutlined />}
                    title={'Settings'}
                    style={{fontSize: "12.8px"}}
                  >
                    <Menu.Item key="1900">
                      <NavLink to="/change-password" />
                        Change Password
                    </Menu.Item>
                    
                  </SubMenu>
                </Menu>
              )
              : 
              current.subSection == 'DS' || current.subSection == 'DSB'  ?
              (
                <Menu 
                defaultOpenKeys={['sub9']}
                mode="inline"
                
                >

                <SubMenu
                    key="sub9"
                    icon={<DashboardOutlined />}
                    title="DS Team Dashboard"
                  >
                     <Menu.Item key="92">
                      <NavLink to="/ds-team-dashboard-cards" />
                      Performance Cards
                    </Menu.Item>

                    <Menu.Item key="2600">
                      <NavLink to="/intake-request" />
                      Intake Requests
                    </Menu.Item>
                    <Menu.Item key="91">
                      <NavLink to="/ds-team-dashboard-reminders" />
                        Reminders
                    </Menu.Item>
                   
                    <Menu.Item key="93">
                      <NavLink to="/ds-team-dashboard-calendar" />
                        Calendar
                    </Menu.Item>
                    <Menu.Item key="94">
                      <NavLink to="/ds-team-dashboard-avatars" />
                        Avatars
                    </Menu.Item>


                  </SubMenu>

                  <Menu.Item key="2" icon={<ProfileOutlined />}>
                    <NavLink to="/incoming-faxes-wq" />
                      Incoming Faxes WQ
                  </Menu.Item>
                  
                  <Menu.Item key="2454" icon={<ProfileOutlined />}>
                      <NavLink to="/roi-qac" />
                        ROI QAC
                  </Menu.Item>
              
                {
                  current.subSection == 'DSB' ?
                  <SubMenu
                  key="sub550"
                  icon={<FileProtectOutlined />}
                  title="Routine Audits"
                >

                  <Menu.Item key="555" >
                    <NavLink to="/post-payment-review" />
                    RA Review 
                  </Menu.Item>

                  <Menu.Item key="551">
                    <NavLink to="/rac" />
                     RAC
                  </Menu.Item>
                  <Menu.Item key="552">
                    <NavLink to="/adr" />
                      ADR
                  </Menu.Item>
                  
                  <Menu.Item key="553">
                    <NavLink to="/nn" />
                      NN
                  </Menu.Item>
                  <Menu.Item key="554">
                    <NavLink to="/cert" />
                      CERT
                  </Menu.Item>
                </SubMenu>
              : null
                }
                 
                  <SubMenu
                    key="sub3"
                    icon={<TeamOutlined />}
                    title="Administration"
                  >
                   
                    <SubMenu
                      key="sub5"
                      icon={<TeamOutlined />}
                      title="Correction Letters"
                    >
                        <Menu.Item key="32">
                          <NavLink to={"/template?id=1"} />
                            Template 01
                          </Menu.Item>
                          <Menu.Item key="33">
                            <NavLink to={"/template?id=2"} />
                            Template 02
                          </Menu.Item>
                          <Menu.Item key="34">
                          <NavLink to={"/template?id=3"} />
                            Template 03
                          </Menu.Item>
                    
                    </SubMenu>
                  </SubMenu>

                 
                  
                  <SubMenu
                    key="sub123"
                    icon={<SettingOutlined />}
                    title={'Settings'}
                    style={{fontSize: "12.8px"}}
                  >
                    <Menu.Item key="1900">
                      <NavLink to="/change-password" />
                        Change Password
                    </Menu.Item>
                    
                  </SubMenu>

                </Menu>
              )
               : 
               (
                <Menu 
                defaultOpenKeys={['sub550']}
                mode="inline"
                
                >
                  

                  <SubMenu
                    key="sub550"
                    icon={<FileProtectOutlined />}
                    title="Routine Audits"
                  >

                

                    <Menu.Item key="555" >
                      <NavLink to="/post-payment-review" />
                      RA Review 
                    </Menu.Item>

                    <Menu.Item key="551">
                      <NavLink to="/rac" />
                       RAC
                    </Menu.Item>
                    <Menu.Item key="552">
                      <NavLink to="/adr" />
                        ADR
                    </Menu.Item>
                    
                    <Menu.Item key="553">
                      <NavLink to="/nn" />
                        NN
                    </Menu.Item>
                    <Menu.Item key="554">
                      <NavLink to="/cert" />
                        CERT
                    </Menu.Item>
                  </SubMenu>
              


                  <SubMenu
                    key="sub123"
                    icon={<SettingOutlined />}
                    title={'Settings'}
                    style={{fontSize: "12.8px"}}
                  >
                    <Menu.Item key="1900">
                      <NavLink to="/change-password" />
                        Change Password
                    </Menu.Item>
                    
                  </SubMenu>

                </Menu>
              )


        }
      </Sider>

      <Modals config={{
          title: "Status",
          openModal: open,
          handleCancel: close,
          close: true
        }}>
          <div>
            <p>Your current status is {Status}</p>
            To continue set it to <Button type="primary" className="ml-168" onClick={setWorkingStatus}>Working</Button> 
          </div>
        </Modals>
    </>
  );
}
export default Navigation;
