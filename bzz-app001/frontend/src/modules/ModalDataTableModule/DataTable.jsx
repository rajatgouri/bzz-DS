import React, { useContext, useCallback, useEffect, useState, useRef, } from "react";
import {
  Button,
  PageHeader,
  Table,
  Checkbox,
  Dropdown,
  Input,
  Form,
  Badge,
  notification,
  Tabs,
  Radio,
  Row,
  Col,
  Select,
  Popconfirm,
  DatePicker
} from "antd";
import { ZoomOutOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Document, Page } from 'react-pdf';

import { pdfjs } from 'react-pdf';
import { getDate } from "@/utils/helpers";
import Modals from "@/components/Modal";
import moment from "moment";
import Data from "../../data"
pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';


const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
const { Option } = Select;

var searchObject = {}

const {folders, options} = Data

// const folders = {
//   'Fax Completed': 'faxtest/SmartApp Fax Completed',
//   'Fax Correction Letter': 'faxtest/SmartApp Fax Correction Letter',
//   'New': 'faxtest',
//   'Billable New': 'faxtest/SmartApp Billable New',
//   'Not Billable': 'faxtest',
//   'Billable Correction Letter': 'faxtest/SmartApp Billable Correction Letter',
//   'Billable Completed': 'faxtest/SmartApp Billable Completed',
//   'Duplicate': 'faxtest/SmartApp Completed',
//   'Medical Form New': 'faxtest/SmartApp Medical Form New',
//   'Medical Forms Completed': 'faxtest/SmartApp Medical Forms Completed',
//   'Medical Forms Correction Letter': 'faxtest/SmartApp Medical Forms Correction Letter'

// }


export default function DataTable1({ config }) {

  let { entity, closeModal, updateLine, pdf, resetSearch, patients, filename, id, process } = config;
  const [dataSource1, setDataSource1] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});
  const [selectedRecord, setSelectedRecord] = useState({})
  const [selectedID, setSelectedID] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [coloredRow, setColoredRow] = useState({});
  const [tableItemsList, setTableItemsList] = useState([]);
  const [renameChecked, setRenameChecked] = useState(true);
  const [showPdf, setShowPdf] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [patientFound, setPatientFound] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({})
  const [folder, setFolder] = useState('');
  const [addItem, setAddItem] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedFile, setSelectedFile] = useState(1);
  const [form1] = Form.useForm();
  const eventListeners = useRef();
  const [disabled, setDisabled] = useState(false);
  const [dateError, setDateError] = useState(false)
  const [searchForm] = Form.useForm();
  const [optionForm] = Form.useForm();
  const [processType, setProcessType] = useState()
  const dateFormat = 'YYYY/MM/DD';
  const dateFormatDatePicker = ['MM/DD/YYYY', 'MM-DD-YYYY', 'M/D/YY', 'M-D-YY'];
  const [noOfRequests, setNoOfRequests] = useState(0)
  const [copyToBillableNew, setCopyToBillableNew] = useState(false)


  // const options = {
  //   'New': [
  //     'Fax Completed',
  //     'Duplicate',
  //     'Fax Correction Letter',
  //     'Billable New',
  //     'Medical Form New',
  //   ],
  //   'Billable New': [
  //     'Billable Completed',
  //     'Billable Correction Letter',
  //     'Not Billable'
  //   ],
  //   'Medical Form New': [
  //     'Medical Forms Completed',
  //     'Not Billable'
  //   ],
  //   'Fax Completed': [
  //     'Fax Completed',
  //     'Not Billable',
  //     'Duplicate',
  //     'EMR To File'
  //   ],
  //   'Fax Correction Tab': [
  //     'Fax Correction Letter',
  //     'Not Billable'
  //   ],
  //   'Billable Completed': [
  //     'Billiable correction Letter',
  //     'Billable New'
  //   ],
  //   'Medical Form New': [
  //     'Medical Form New',
  //     'Medical Forms Completed',
  //     'Medical form correction Letter'
  //   ],
  //   'Medical Forms Completed': [
  //     'Medical Form New',
  //     'Medical Forms Completed',
  //     'Medical form correction Letter'
  //   ],
  //   'Medical form correction Letter': [
  //     'Medical Form New',
  //     'Medical Forms Completed',
  //     'Medical form correction Letter'
  //   ],
  //   'other': [
  //     'Fax Completed',
  //     'Fax Correction Letter',
  //     'Not Billable',
  //     'Billable New',
  //     'Duplicate',
  //     'Billable Completed',
  //     'Billable Correction letter',
  //     'Medical Form New',
  //     'Medical Forms Completed',
  //    'Medical Forms Correction Letter'

  //   ]

  // }

  const dataTableColumns = [
    {
      title: 'First Name',
      dataIndex: 'PAT_FIRST_NAME',
      width: 150,
      sorter: (a, b) => {

        a = a['PAT_FIRST_NAME']
        b = b['PAT_FIRST_NAME']

        return (a < b) ? -1 : (a > b) ? 1 : 0;

      }
    },

    {
      title: 'Middle Name',
      dataIndex: 'PAT_MIDDLE_NAME',
      width: 150,

    },
    {
      title: 'Last Name',
      dataIndex: 'PAT_LAST_NAME',
      width: 150,
      sorter: (a, b) => {

        a = a['PAT_LAST_NAME']
        b = b['PAT_LAST_NAME']

        return (a < b) ? -1 : (a > b) ? 1 : 0;
      }
    },
    {
      title: 'DOB',
      dataIndex: 'BIRTH_DATE',
      width: 150
    },

    {
      title: 'Email',
      dataIndex: 'EMAIL_ADDRESS',
      width: 150
    },
    {
      title: 'Street',
      dataIndex: 'ADD_LINE_1',
      width: 150
    },
    {
      title: 'City',
      dataIndex: 'CITY',
      width: 150
    },
    {
      title: 'MRN',
      dataIndex: 'PAT_MRN_ID',
      width: 150
    },

    {
      title: 'SSN',
      dataIndex: 'SSN',
      width: 150
    }

  ];

  const [loading, setLoading1] = useState(false)
  const { Search } = Input;
  const loadTable1 = async (searchObject, filters, sorter) => {
    let values = Object.keys(searchObject);

    if (values.length == 1) {
      if (searchObject[values[0]].length < 2) return
    }


    setDateError(false)

    if (values.length > 0) {
      setDataSource1([]);
      setLoading1(true)

      let response  = await request.list(entity, { value: JSON.stringify(searchObject) })
      setDataSource1(response.result);
      setLoading1(false)

      if( !response.result ) {
        
        return 
      }
      
      const listIds = response.result.map((x) => x.ID);
      setTableItemsList(listIds);

      setLoading1(false)
    } if (values.length == 0) {
      setSelectedRecord({})
      setSelectedRowKeys([])
      setLoading1(false)
      if (!sorter) {
        setDataSource1([]);
        let response = await request.list(entity, { value: JSON.stringify({}) })
        setDataSource1(response.result);

      }
    }

    setFolder('')
    searchObject = {}

  }

  var x, y;

  useEffect(() => {
    searchForm.resetFields()
    optionForm.resetFields()
    setCurrentRecord({})
    setSelectedFile('')
    setSelectedRowKeys([])
    loadTable1({})
    setNoOfRequests(0)
    setCopyToBillableNew(false)
    setDataSource1([]);


  }, [pdf])


  useEffect(async () => {
    if (patients.length > 0) {
      let response = await request.create(entity, { patients })
      setDataSource1(response.result);
    }
  }, [patients])

  useEffect(() => {
    setShowPdf(true)
  }, [config])


  useEffect(() => {
    setProcessType(process[0])
  }, [process])

  const handelColorRow = (checked, record, index, originNode) => {
    return {
      props: {
        style: {
          background: "blue",
        },
      },
      // children: originNode,
    };
  };

  const onSelectChange = (selectedKeys, selectedRows) => {
    setSelectedRowKeys(selectedKeys);
  };


  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    hideSelectAll: true,
    columnWidth: 0,
    renderCell: handelColorRow,
    selectedRowKeys: selectedRowKeys,
  };



  const newDataTableColumns = dataTableColumns.map((obj) => {

    if (obj.dataIndex == "BIRTH_DATE") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text.split("T")[0] ?
                  
                  (text.split("T")[0].split('-')[1] + "-" +
                  text.split("T")[0].split('-')[2] + "-" +
                  text.split("T")[0].split('-')[0]).replace('00:00:00.000','')

                  : ""
                }
                {/* {text ? text.split("T")[0] : ""} */}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "SSN") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text ? text.substr(text.length - 4) : null}
                {/* {text ? text.split("T")[0] : ""} */}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "PAT_MIDDLE_NAME") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text && text != "NULL" ? text : null}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "PAT_FIRST_NAME") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text && text != "NULL" && text != null ? text : ""}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "PAT_LAST_NAME") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text && text != "NULL" && text != null ? text : ""}
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "EMAIL_ADDRESS") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text && text != "NULL" ? text : null}
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "ADD_LINE_1") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text && text != "NULL" ? text : null}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "CITY") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {text && text != "NULL" ? text : null}
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

  const columns1 = newDataTableColumns.map((col) => {
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


  const handleChange = (value, field) => {

    delete searchObject['FileName']
    if (value == "" || value == null) {
      delete searchObject[field]
      setDateError(false)
      setSearchQuery(searchObject)
    } else {

      searchObject[field] = value
      setSearchQuery({ ...searchQuery, field: value })

    }


    setCurrentRecord(searchObject)
    if(field == "BIRTH_DATE") {
      loadTable1(searchObject)
    }



  }

  // loadTable1(searchObject)
  // 
  const onClickRow = (record, rowIndex) => {
    return {
      onClick: () => {

        if (selectedID != record.ID) {
          setSelectedRecord(record)
          setCurrentRecord(record)
          setSelectedID(record.ID)
        } else {
          setSelectedRecord({})
          setCurrentRecord({})
          setSelectedID(null)
        }

      },
      onMouseDown: (e) => {
        if (selectedID != record.ID) {
          setSelectedRowKeys([record.ID]);

        } else {
          setSelectedRowKeys([]);

        }

      },

    };
  };



  const handleAdd = () => {
    let roiTag = (optionForm.getFieldValue()['ROI Status'])
    let record = currentRecord

    updateLine({ record, rename: renameChecked, roiTag: roiTag , noOfRequests: noOfRequests, copyToBillableNew})
    searchObject = {}
    searchForm.resetFields()
    optionForm.resetFields()
    setNoOfRequests(0)
    setCopyToBillableNew(false)
    loadTable1({})
  }

  const updateAdd = () => {
    let roiTag = (optionForm.getFieldValue()['ROI Status'])

    let record = (currentRecord)
    setCurrentRecord(record)
    updateLine({ record, rename: renameChecked, roiTag: roiTag , noOfRequests: noOfRequests, copyToBillableNew})
    searchObject = {}
    setSelectedRowKeys([])
    searchForm.resetFields()
    optionForm.resetFields()
    setNoOfRequests(0)
    setCopyToBillableNew(false)
    loadTable1({})
  }


  const handleClose = () => {
    searchForm.resetFields()
    optionForm.resetFields()
    setSelectedRowKeys([])
    setSelectedFile('')
    setCurrentRecord({})
    loadTable1({})
    setShowPdf(false)
    setZoom(1)
    setNoOfRequests(0)

    closeModal()
  }

  const getDateTime = () => {
    let d = getDate().split('T')[0].split('-')
    return d[1] + "-" + d[2] + "-" + d[0]
  }

  const getFileName = (pf) => {

    if (pf == 'Billable New' || pf == 'Medical Forms New' ) {
      setSelectedFile(
        filename.replace('.PDF', '')
      )
    } else {
      if (currentRecord['PAT_FIRST_NAME'] && currentRecord['PAT_LAST_NAME']) {

        if (currentRecord['PAT_LAST_NAME'] && currentRecord['PAT_LAST_NAME']) {

          if (pf == 'Duplicate') {
            setSelectedFile(
                currentRecord['PAT_LAST_NAME'] + ", " + currentRecord['PAT_FIRST_NAME'] +  " " +  getDateTime() + " " + "DUPLICATE"
            )
          } else {
            setSelectedFile(
              currentRecord['PAT_LAST_NAME'] + ", " + currentRecord['PAT_FIRST_NAME'] + " " + getDateTime()
            )
          }


        } else {
          setSelectedFile(
            getDateTime()
          )
        }
      } else {
        let file = (searchForm.getFieldValue())

        if (file['PAT_LAST_NAME'] && file['PAT_FIRST_NAME']) {

          if (pf == 'Duplicate') {
            setSelectedFile(
              file['PAT_LAST_NAME'] + ", " + file['PAT_FIRST_NAME'] + " " + getDateTime() + " DUPLICATE" 
            )
          } else {
            setSelectedFile(
              file['PAT_LAST_NAME'] + ", " + file['PAT_FIRST_NAME'] + " " + getDateTime()
            )
          }

        } else {
          setSelectedFile(
            getDateTime()
          )
        }

      }
    }


  }


  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  }

  const handleCancel = () => {
    setOpenModal(false)
    optionForm.resetFields()
    // setSelectedFile('')
    // setCurrentRecord({})
    setZoom(1)
  }


  useEffect(() => {
    if (resetSearch) {
      // handleClose()
    }
  }, [resetSearch])

  const copy = async () => {
    if (disabled) {
      return
    }

    let textArea = document.createElement("textarea");
    textArea.value = currentRecord['PAT_MRN_ID'];
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise(async (res, rej) => {
      // here the magic happensP
      document.execCommand('copy') ? res() : rej();
      textArea.remove();

      currentRecord['FileName'] = selectedFile

      setDisabled(true)

      let file = await request.listinlineparams("incomingwq", { id, filename: selectedFile + ".PDF" })
      setDisabled(false)
      if (file.success) {
        notification.error({ message: "File name already exists!" })
        return
      }


      if (!selectedFile) {
        return
      }
      notification.success({ message: "MRN Copied. Proceed to EPIC.", duration: 3 })


      if (dataSource1.length > 0) {
        updateAdd()
      } else {
        handleAdd()
      }



      handleCancel()

    });

  }


  const handleAddorUpdate = () => {
    if (addItem) {
      handleAdd()
    } else {
      updateAdd()
    }

    handleCancel()
  }

  const ConfirmModal = (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <p>You may now Proceed to Epic for Processing.</p>
        <p>Please remember to return and click Finish.</p>

        <div style={{ textAlign: "end", marginBottom: "10px" }}>
          <Button style={{ color: "green", marginRight: "10px" }} disabled={disabled} onClick={handleAddorUpdate}>Yes</Button>
          <Button style={{ color: "red" }} onClick={handleCancel}>No</Button>
        </div>
      </Col>
    </Row>
  )

  const editFileName = (e) => {
    if (e.target.value.trim()) {
      setSelectedFile(e.target.value)
      currentRecord['FileName'] = (e.target.value)
      setCurrentRecord(currentRecord)
    } else if (e.target.value.trim() == "") {
      setSelectedFile(e.target.value)
      notification.error({ message: "File name can't be blank!" })
    }

  }

  const onCopyToBillableNew = (e) => {
    setCopyToBillableNew(e.target.checked)
  }

const onChangeNoOfRequest = (e) => {
  setNoOfRequests(e.target.value)
}

  const ROIModal = (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <h5>ROI Status: {patientFound}</h5>
        <p>1) File will be renamed to:  </p>
        <Input style={{ width: "100%", marginBottom: "10px" }} onChange={editFileName} value={selectedFile}></Input>
        <p>2) Renamed file will be moved to: </p>
        <h5 style={{ textAlign: "center" }}>{folder}</h5>
       {
         processType == 'New' ?
         <div>
          <p>3) # of Patient Requests: </p>
          <Input style={{ width: "100%", marginBottom: "10px" }} type="number" onChange={onChangeNoOfRequest} value={noOfRequests} ></Input>
         </div> 
        :
        null
       }
        
        {
         processType== 'New' && patientFound == 'Medical Forms New' ?

          <div>
          <p>4) Send a copy to "Billable New":  { "  "}
          <Checkbox onChange={onCopyToBillableNew} checked={copyToBillableNew} value={copyToBillableNew}></Checkbox>

          </p>
          </div>
         
          : null
        }

        <p>Perform these steps?</p>
        <div style={{ textAlign: "end", marginBottom: "10px" }}>
          <Button style={{ color: "green", marginRight: "10px" }} onClick={copy}>Yes</Button>
          <Button style={{ color: "red" }} onClick={handleCancel}>No</Button>
        </div>
      </Col>
    </Row>
  )


  const handleROIModal = (e) => {

    setPatientFound(e)
    getFileName(e)

    if (e == 'Fax Completed') {
      if (currentRecord['PAT_FIRST_NAME'] && currentRecord['PAT_LAST_NAME']) {
        setFolder(folders[e])
        setOpenModal(true)
        setModalType('ROI')
        return
      } else if (currentRecord['PAT_FIRST_NAME'] || currentRecord['PAT_LAST_NAME']) {

        notification.error({ 'message': "Please FILL IN Patient information!" })
        optionForm.resetFields()

      } else {

        notification.error({ 'message': "Please SELECT a Patient!" })
        optionForm.resetFields()
      }


    } else {


      setFolder(folders[e])
      setOpenModal(true)
      setModalType('ROI')
      return
    }


  }

  const handleConfirmatiomodal = (value) => {
    setOpenModal(true)
    setModalType('Confirm')
    setAddItem(value)
  }




  const configModal = {
    title: "Confirm",
    openModal,
    handleCancel,
    close: true
  }

  function changeZoom(offset) {
    setZoom(prevZoom => prevZoom + offset);
  }

  const previousZoom = () => {
    if (zoom > 1) {
      // removeMouseEvent()
      changeZoom(-1);
    }
  }

  const nextZoom = () => {
    changeZoom(1);
    // addMouseEvent()
  }

  const mouseHandler = (e) => {
    let viewer = document.getElementsByClassName('pdf-viewer')[0]
    let el = viewer.getElementsByClassName('react-pdf__Document')[0]

    if (x && y) {
      el.scrollBy(e.clientX - x, e.clientY - y);
    }

    x = e.clientX;
    y = e.clientY;

  }

  const removeMouseEvent = () => {

    let viewer = document.getElementsByClassName('pdf-viewer')[0]
    let el = viewer.getElementsByClassName('react-pdf__Document')[0]
    el.removeEventListener('mousemove', eventListeners.current, true)
  }


  const addMouseEvent = () => {

    let viewer = document.getElementsByClassName('pdf-viewer')[0]
    let el = viewer.getElementsByClassName('react-pdf__Document')[0]
    eventListeners.current = mouseHandler
    el.addEventListener('mousemove', eventListeners.current, true)
  }



  return (
    <div className="wq-filter-table">
      <h4 style={{ marginTop: "10px" }}>Patient Lookup</h4>
      <Row gutter={[24, 24]}>
        <Col span={15}>
          <PageHeader
            style={{
              "padding": "0px"
            }}
            ghost={false}
            tags={
              <div>
                <Form
                  name="basic"
                  labelCol={{ span: 0 }}
                  wrapperCol={{ span: 24 }}
                  form={searchForm}
                >
                  <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>


                  <Col span={5}>
                      <Form.Item
                        label=""
                        name="NAME"
                      >
                        <Search placeholder="Full Name" onSearch={() => loadTable1(searchObject)} onChange={(e) => handleChange(e.target.value, 'NAME')} style={{ width: "100%" }} />
                        {/* <Input placeholder="First Name" onKeyUp={(e) => handleChange(e.target.value, 'PAT_FIRST_NAME')}></Input> */}
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        label=""
                        name="PAT_FIRST_NAME"
                      >
                        <Search placeholder="First Name" onSearch={() => loadTable1(searchObject)} onChange={(e) => handleChange(e.target.value, 'PAT_FIRST_NAME')} style={{ width: "100%" }} />
                        {/* <Input placeholder="First Name" onKeyUp={(e) => handleChange(e.target.value, 'PAT_FIRST_NAME')}></Input> */}
                      </Form.Item>
                    </Col>

                    <Col span={5}>
                      <Form.Item
                        label=""
                        name="PAT_MIDDLE_NAME"
                      >
                        <Search placeholder="Middle Name" onSearch={() => loadTable1(searchObject)} onChange={(e) => handleChange(e.target.value, 'PAT_MIDDLE_NAME')} style={{ width: "100%" }} />

                        {/* <Input placeholder="Middle Name" onChange={(e) => handleChange(e.target.value, 'PAT_MIDDLE_NAME')}></Input> */}
                      </Form.Item>
                    </Col>

                    <Col span={5}>
                      <Form.Item
                        label=""
                        name="PAT_LAST_NAME"
                      >
                        <Search placeholder="Last Name" onSearch={() => loadTable1(searchObject)} onChange={(e) => handleChange(e.target.value, 'PAT_LAST_NAME')} style={{ width: "100%" }} />

                        {/* <Input placeholder="Last Name" onChange={(e) => handleChange(e.target.value, 'PAT_LAST_NAME')}></Input> */}
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        label=""
                        name="BIRTH_DATE"
                      >
                        {/* <Search placeholder="mm-dd-yyyy" onSearch={() => loadTable1(searchObject)} onChange={(e) => handleChange(e.target.value, 'BIRTH_DATE')} style={{ width: "100%" }} /> */}
                        <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => handleChange(date, 'BIRTH_DATE')} />

                        {/* <Input placeholder={"Select DOB (mm-dd-yyyy)"} style={{width: "100%"}} onChange={(e) => handleChange(e.target.value, 'BIRTH_DATE')} onKeyDown={(e) => searchDate(e)}></Input> */}
                        {/* <DatePicker placeholder={"Select DOB"} style={{width: "100%"}} format={'MM/DD/YYYY'} onChange={(value, date) => handleChange(date, 'BIRTH_DATE')} /> */}
                      </Form.Item>

                      <p style={{
                        marginTop: "-12px",
                        color: "red"
                      }}>
                        {dateError ?
                          'Date format is incorrect'
                          : null
                        }</p>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        label=""
                        name="PAT_MRN_ID"
                      >
                        <Search placeholder="MRN" onSearch={() => loadTable1(searchObject)} onChange={(e) => handleChange(e.target.value, 'PAT_MRN_ID')} style={{ width: "100%" }} />

                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        label=""
                        name="SSN"
                      >
                        <Search placeholder="SSN" onSearch={() => loadTable1(searchObject)} onChange={(e) => handleChange(e.target.value, 'SSN')} style={{ width: "100%" }} />

                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        label=""
                        name="ADD_LINE_1"
                      >
                        <Search placeholder="Street" onSearch={() => loadTable1(searchObject)} onChange={(e) => handleChange(e.target.value, 'ADD_LINE_1')} style={{ width: "100%" }} />

                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        label=""
                        name="CITY"
                      >
                        <Search placeholder="City" onSearch={() => loadTable1(searchObject)} onChange={(e) => handleChange(e.target.value, 'CITY')} style={{ width: "100%" }} />

                      </Form.Item>
                    </Col>
                  </Row>
                </Form>

              </div>
            }
          ></PageHeader>
          <Table
            columns={columns1}
            rowKey="ID"
            dataSource={dataSource1}
            onRow={onClickRow}

            rowSelection={rowSelection}
            pagination={false}
            rowClassName={(record, index) => {
              return 'wq-rows'
            }}
            scroll={{ y: '24em' }}
            loading={loading ? true : false}
            onChange={loadTable1}
            footer={
              () => (
                <Row gutter={[24, 24]}>
                  <Col span={18}>
                    <Form
                      name="basic"
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 14 }}
                      form={optionForm}
                    >
                      <Row gutter={[24, 24]}>
                        <Col style={{ width: "350px" }}>
                          <Form.Item
                            label="ROI Status"
                            name="ROI Status"
                          >
                            <Select
                              onChange={(e) => handleROIModal(e)}
                              style={{
                                marginLeft: "calc(100% - 123%)"
                              }}>
                              
                              {
                               processType && options[processType] ?

                               options[processType].map((o) => {
                                return <Option value={o.value}>{o.name}</Option>
                              }) 
                              :
                              options['other'].map((o) => {
                                return <Option value={o.value}>{o.name}</Option>
                              }) 
                              }
                            
                            </Select>
                          </Form.Item>
                        </Col>
                       
                      </Row>
                    </Form>
                  </Col>
                  <Col span={6} style={{ textAlign: "end", paddingTop: "10px" }}>

               
                  </Col>
                </Row>
              )
            }
          />
        </Col>
        <Col span={9} className="search-modal-pdf" style={{  height: "570px", border: "1px solid lightgrey", borderRadius: "5px" }}>
          {
            showPdf && pdf ?
              <div className="zoom-container-1">
                <Button
                  style={{ marginRight: "10px" }}
                  type="button"
                  disabled={zoom <= 1}
                  onClick={previousZoom}
                >
                  <ZoomOutOutlined />
                </Button>
                <Button
                  type="button"
                  disabled={zoom > 1}
                  onClick={nextZoom}
                >
                  <ZoomInOutlined />
                </Button>
              </div>
              :
              null
          }
          {
            showPdf && pdf ?

              <div className="pdf-viewer">

                <Document
                  file={pdf}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  {Array.from(
                    new Array(numPages),
                    (el, index) => (
                      <Page
                        key={`page_${index + 1}`}
                        scale={zoom}
                        pageNumber={index + 1}
                      />
                    ),
                  )}
                </Document>
              </div>

              :
              <h4 style={{ marginTop: "10px" }}>Loading..</h4>
          }

        </Col>
      </Row>

      <Modals config={configModal}>
        {
          modalType == 'ROI' ?
            ROIModal
            : ConfirmModal
        }

      </Modals>
    </div>
  );
}
