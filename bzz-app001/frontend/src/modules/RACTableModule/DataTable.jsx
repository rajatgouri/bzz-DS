import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {
  Button,
  PageHeader,
  Table,
  Checkbox,
  Input,
  Form,
  notification,
  Radio,
  Popover,
  Select,
  Row,
  Col,
  Tooltip,
  DatePicker
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { CloseCircleTwoTone, EyeFilled, DeleteOutlined, EllipsisOutlined, ReloadOutlined, IdcardOutlined, CopyOutlined, CloudDownloadOutlined , SortAscendingOutlined} from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import Modals from "@/components/Modal";
import {
  EyeOutlined,
  EditOutlined,
  
} from "@ant-design/icons";
import { formatDate, formatDatetime, getDate } from "@/utils/helpers";
import Data from "../../data"

const {Option} = Select
// const { RRStatus} = Data

const dateFormat = 'YYYY/MM/DD';
const dateFormatDatePicker = ['MM/DD/YYYY', 'MM-DD-YYYY'];



export default function DataTable({ config }) {

  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, getItems, reload,  getFilterValue, dataTableTitle, showFooter = true, openEditModal, openAddModal, openingModal, confirmModal, isLoading, tab = [], height, setStatus, handleChangeStatus, onChangeDate,openSortModal} = config;
  const [RRStatus, setRRStatus] = useState([])
 
  function copy(textToCopy, column = '') {
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
      notification.success({ message: column + " Copied!", duration: 3 })
    });
  }

  const getrecoupmentRationale = async () => {
    const {result} = await request.list("recoupmentrationale");
    setRRStatus(result)
  } 


  useEffect(() => {
    getrecoupmentRationale()
  }, [])

  

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  var { pagination, items , filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
  const [process, setProcess] = useState('Open')
  const [tabs, setTabs] = useState(tab)
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [openExportModal, setOpenExportModal] = useState(false)
  const [ rStatus,setRStatus] = useState([])
  
  
  const newDataTableColumns = dataTableColumns.map((obj) => {


    

    if (obj.feature == "date" ) {
      return ({
        ...obj,
        
        render: (text, row) => {

          
          let d = text ? new Date(formatDate(text.split('T')[0])).toISOString().split('T')[0] : null

          return {        
            children: (
              <div >

                <DatePicker className="w-100"  placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} defaultValue={d ? moment(d, dateFormat) : ''} onChange={(d, date) => onChangeDate('Closed Date', date, row["ID"])} />

              </div>
            )
          };
        },
      })
    }



    if (obj.type == "date" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {            
            children: (
              <div>
                {text ? 
                formatDate(text.toString().split('T')[0])
                 : null }
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Days till Due Date" ) {
      return ({
        ...obj,
        render: (text, row) => {


          let color = '#000000'
          let background = '#FFFFFF'

          if (+text >= 15) {
            color = '#385724'
            background= '#C5E0B4'
          } else if (+text == 14 ) {
            color= '#70AD47'
            background = '#FFFFCC'
          } else if (+text <= 7 && +text >0) {
            color= '#FFC000'
            background = '#C00000'
          }

          return {   
            props: {
              style: {
                background: background,
                color: color,
                textAlign: 'center'
              },
            },   
            children: (
              <div >
                {text < 0 ? '' : text}
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "copy" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {       
            props: {
              style: {
                textAlign: "center"
              },
            },   
            children: (
              <div>
                {
                  text ?

                  <div style={{width: "100%"}}>
                   <div style={{width: "90%", display: "inline-block"}}>
                    {text}
                </div>
                <div style={{width: "10%", display: "inline-block", verticalAlign: "top"}}>
                    <CopyOutlined onClick={() => copy(text, obj.title)} />
                  </div>
                  </div>
                  : null
                }
                
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "tooltip" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {       
            props: {
              style: {
                textAlign: "center"
              },
            },   
            children: (
              <div>
                <Tooltip placement="topLeft" title={text}>
                  {text && text.length > 25 ? text.substring(0,25) + "..." : text}
                  </Tooltip>
              </div>
            )
          };
        },
      })
    }

  
    if (obj.type == "datetime" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {        
               
            children: (
              <div>
                {text ? 
                 formatDatetime(text)
                 : null }
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "number" ) {
      return ({
        ...obj,
        
        render: (text, row) => {
          return {        
            props: {
              style: {
                color: text < 0  ? "red" : "black",

              },
            },    
            children: (
              <div>
                { text? parseInt(text): ''}
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "dollor" ) {
      return ({
        ...obj,
        
        render: (text, row) => {
          return {        
                
            children: (
              <div >

                 { text?   
                  "$" + new Intl.NumberFormat('en-US',  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(text)
                 : ''}
               

              </div>
            )
          };
        },
      })
    }


    
   

    if (obj.dataIndex == "Action" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
        
            children: (
              <div style={{textAlign: "center"}}>
                <span className="actions" >
                    <span className="actions">
                      <Popover placement="rightTop" content={
                        <div>
                          <p  className="menu-option" onClick={() => openingModal(row)}><span><EditOutlined /></span> { " "}   Edit</p>
                          <p  className="menu-option" onClick={() => confirmModal(row)}><span><DeleteOutlined /></span>{row['Archive']? " Unarchive": " Archive"}</p>
                        </div>
                      } trigger="click">
                        <EllipsisOutlined />
                      </Popover>
                    </span>
                  </span> 
              </div>
            )
          };
        },
      })
    }



    if (obj.feature == "pencil") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div>
                <EditOutlined onClick={() => openEditModal('Notes', row.ID)} />  {text ? <EyeFilled onClick={() => openAddModal('Notes',row.ID)} style={{ marginLeft: "10px" }} /> : ""}
              </div>
            )
          };
        },
      })
    }

    if (obj.feature == "view") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div>
                <EditOutlined onClick={() => openEditModal('Findings', row.ID)} />  {text ? <EyeFilled onClick={() => openAddModal('Findings',row.ID)} style={{ marginLeft: "10px" }} /> : ""}
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == 'Open/Closed' ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {
           
            children: (
              <div>

                  { process == 'ALL' ? text :''}
              </div>
            )
          };
        },
      })
    }


    if (obj.feature == "select1") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
           
            children: (
              <div>

                    <Select  style={{ width: "100%", textAlign: "left",
                  }}  defaultValue={text}  placeholder="Recoupment Rationale" onChange={(value) => handleChangeStatus( row['ID'], value, obj.dataIndex)}>
                      {
                       
                          RRStatus.map((status, index) => {
                            return <Option key={status.Name ? status.Name  : null}  value={status.Name ? status.Name  : ''}>{status.Name}</Option>
                          })

                      }
                    </Select>
              </div>
            )
          };
        },
      })
    }


    if (obj.feature == "select") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              className: text ? text.replace(/ /g,"_").replace(/&/g,"_").replace(/\//g,"_") : ''
          },
            children: (
              <div>

                    <Select  style={{ width: "100%", textAlign: "left",
                  }}  defaultValue={text}  placeholder="Status" onChange={(value) => handleChangeStatus( row['ID'], value, obj.dataIndex)}>
                      {
                       
                          rStatus.map((status, index) => {
                            return <Option key={status.Name ? status.Name  : null} style={{background: status.Background, color: status.Color}} value={status.Name ? status.Name : ''}>{status.Name}</Option>
                          })

                      }
                    </Select>
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Archive") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div>
               {text? "Yes": "No" }
              </div>
            )
          };
        },
      })
    }


    return ({
      ...obj,
      render: (text, row) => {
        return {
          
          children:
            typeof text === "boolean" ? <Checkbox checked={text} /> : text,
        };
      },
    })
  });
  
  useEffect(() => {
    if(isLoading) {
      setLoading(isLoading)
    } else {

      loadTable()
    }
  }, [isLoading])
  
  useEffect(() => {
    setTabs(tab)
    let t = tab.filter((t) => t.value != null)
    
    setProcess(t.length > 0  ?  t[0].value : 'Open')
  }, [tab])

  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])

  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
    getStatus()
    getrecoupmentRationale()
  }, [entity])



  const getStatus = async () => {
    let obj = {}
    obj[entity.toUpperCase()] = 'Y'
    let {result} = await request.list('rac_status', {
      data: JSON.stringify(obj)
    })
    
    setRStatus(result)
    
  }

  useEffect(() => {
      getItems(items)
      setDataSource(items)

  }, [items])

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {    
   
    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }

    filteredArray = (filteredArray.map((data) => {
      if (data.column) {
        delete data.column.filters  
      }
      return data
    }))


    if (!filters.hasOwnProperty('Open/Closed')) {
      filters['Open/Closed'] = process == 'ALL' ? { value : ['Open', 'Closed'], type: "filter" } :  {value: [process], type: 'filter'}
    }
    
    if (previousEntity == entity) {
      
      getFilterValue(filters);
    }

    let filteredObject = {}
    for (let f in filters) {
      let type = columns.filter((c) => c.dataIndex == f)[0] ? columns.filter((c) => c.dataIndex == f)[0].type : '' 
      filteredObject[f] = {value: filters[f], type: type ? type : ''}
    }

    const option = {
      page: pagination.current || 1,
      filter: (filteredObject) || ({}),
      sorter: sorter ? (filteredArray) : ([]),
    };

    dispatch(crud.list1(entity, option));
    filters.sort = (filteredArray);

  };

  const loadTable = async () => {

    const response   = await request.list(entity +"-tabs")
    
    let filterValue = {};

    let p = (response.result['OpenClosed'].filter((o) => o['Open/Closed'] != null)[0])
    filterValue= { 'Open/Closed': {}} 
    
    if (p['Open/Closed']) {
      filterValue['Open/Closed'] = {value: [p['Open/Closed']], type: 'filter'}
    } else {
      filterValue['Open/Closed'] =  {value: ['Open'], type: 'filter'}
    }

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: ( filterValue),
      sorter: []
    };

    dispatch(crud.list1(entity, option));

    getFilterValue(filterValue)

  }

  

  useEffect(() => {
   items = []
   setDataSource([])
  },[entity])

  useEffect(() => {

    if(dataSource.length == 0) {
      return 
    }

    if (reload) {
      if (previousEntity == entity) {
        setDataSource([])
        handelDataTableLoad(pagination, filters, sorters)
      } else {
        handelDataTableLoad(pagination, {}, {})
      }

    } else {
      setLoading(true)
    }

  }, [reload])

  const columns = newDataTableColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });

  const onProcessChanged = (e) => {
    const value = e.target.value;
    setProcess(value)
    setStatus(value)
    handelDataTableLoad(1, { 'Open/Closed':  value != 'ALL' ? { value: [value], type: 'filter'} : {value: ['Closed', 'Open'], type: 'filter' }}, {})
  }

  const exportTable = async () => {
    notification.success({message: "Downloading..."})
    let response = await request.list(entity + "-exports");

    setFileName(response.result.name)
    setFileUrl(response.result.file)
    setOpenExportModal(true)
  }

  const closeExportModal = () => {
    setOpenExportModal(false)
  }

  const modalConfig = {
    title: "Download File",
    openModal: openExportModal,
    handleCancel: closeExportModal,
    width: 500
  };


  return (
    <div className= {"general-table"}>
          <Row gutter={[24,24]}>
            <Col span={12}>

            <div style={{ 'display': 'block', 'float': 'left', marginBottom: "20px" }}>
              <h2
                className="ant-page-header-heading-title"
                style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
              >
                {dataTableTitle}
              </h2>
              </div>
            </Col>
            <Col span={12}  style={{textAlign :"end"}}>

              
                    <Button className="ml-3" size="sm" title="Sort" onClick={() => {
                openSortModal()
                }} key={`${uniqueId()}`}>
                  <SortAscendingOutlined />
                </Button>
                
                <Button className="mr-3" title="Export" onClick={() =>exportTable()}>
                  <CloudDownloadOutlined/>
                </Button>
                
                <Button className="mr-3" title="Add Item"  onClick={() =>openingModal()}>
                  <IdcardOutlined/>
                </Button>

                <Button className="mr-3" title="Refresh" onClick={() =>loadTable()}>
                  <ReloadOutlined/>
                </Button>



            </Col>
          </Row> 
          
      <Table
        columns={ columns}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows '
        }}
        scroll={{ y: height }}
        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        onChange={handelDataTableLoad}
        footer={
          () => (
            <Row gutter={[24, 24]} className="rac-footer" style={{minHeight: "25px"}}>
              <Col style={{ width: "52%" }}>

                  <div>
                    {
                      tabs && tabs.length > 0 ?

                      <Radio.Group value={process} onChange={onProcessChanged}> 
                          {
                            tabs.map((tab) => {
                              return <Radio.Button style={{marginRight: "5px"}} value={tab.value} className="box-shadow">{tab.text? tab.text :  <span style={{visibility: "hidden"}}>_</span>}</Radio.Button>
                            })
                          }
                          <Radio.Button style={{marginRight: "5px"}} value={'ALL'} className="box-shadow">ALL</Radio.Button>

                      </Radio.Group>
                      
                    : null  
                  }
              
                  </div>
              
              </Col>
            </Row>
          )
        }
      />
      
      <div className="confirm-modal">
        <Modals config={modalConfig}>
          <p> {fileName}</p>

          <div style={{ marginBottom: "12px", textAlign: "end" }}>
            <Button type="primary" href={fileUrl} onClick={() => closeExportModal()}>Yes</Button>
            <Button type="primary" danger style={{ marginLeft: "10px" }} onClick={() => closeConfirmModal()}>No</Button>

          </div>
        </Modals>
      </div>
    </div>



  );
}
