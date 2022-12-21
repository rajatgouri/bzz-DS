
import React, { useState, useRef } from "react";

import RACTableModule from "@/modules/RACTableModule";
import { Table, Input, Button, Space , Form, Row, Col, Select, DatePicker, notification, Divider, Typography } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined, EyeFilled, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";

import moment from 'moment';
import { formatDateTime, getDate } from "@/utils/helpers";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Config from "@/components/Editor"

import SortModal from "@/components/Sorter";
import { GetSortOrder } from "@/utils/helpers";

import {  selectUsersList } from "@/redux/user/selectors";
import { mappedUser } from "@/utils/helpers";



const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function CERT() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [selectedId, setSelectedId]= useState("");
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedRow,setSelectedRow] = useState({});
  const [workProgress, setWorkProgress] = useState([]);
  const [filteredValue, setFilteredValue] = useState({})
  const [filters, setFilters] = useState([])
  const [CERT_Due_Date, set_CERT_Due_Date] = useState();
  const [Date_CERT_Submitted_to_CMS, set_Date_CERT_Submitted_to_CMS] = useState();
  const [Closed_Date, set_Closed_Date] = useState();
  const [Date_CERT_Recd, set_Date_CERT_Recd] = useState();
  const [Demand_Letter_Date, set_Demand_Letter_Date] = useState();
  const [DOS_From, set_DOS_From] = useState();
  const [DOS_To, set_DOS_To] = useState();
  const [errors , setErrors] = useState({});
  const dateFormat = 'YYYY/MM/DD';
  const dateFormatDatePicker = ['MM/DD/YYYY', 'MM-DD-YYYY'] 
  const [hasErrors, setHasErrors] = useState(false) 
  const [editCERTForm] = Form.useForm();
  const [openCERTModal, setOpenCERTModal] = useState(false);
  const [rStatus, setRStatus] = useState([])
  const [status, setStatus] = useState('Open');
  const [recoupmentRationale, setRecoupmentRationale] = useState([])

  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])


  const [showClosedDate, setShowClosedDate] = useState(true)
  var { result: listResult, isLoading: listIsLoading } = useSelector(selectUsersList);
  var { items : usersList } = listResult;

  const [ID, setID] = useState("");
  var [value, setValue] = useState("");
  const editor = useRef();
  
  const [name, setName] = useState('');


  const getSunEditorInstance = (sunEditor) => {
    editor.current = sunEditor;
  };


  const handleChange =(content) => {
    setValue(content)
  }

  const onNameChange = event => {
    setName(event.target.value);
  };

  const addItem = (e, entity) => {
    e.preventDefault();

    if(name.trim() == "") {
      return
    }

    if(entity == 'Status') {

      let exists = rStatus.filter((f) => f.Name == name)
      if(exists.length == 0) {
        rStatus.push({Name: name})
      }

      setRStatus(rStatus)
      request.create('rac_status', {Name: name, CERT: 'Y'})


    } 
    else  if(entity == 'RecoupmentRationale') {

      let exists = recoupmentRationale.filter((f) => f.Name == name)

      
      if(exists.length == 0) {
        recoupmentRationale.push({Name: name})
      }

      setRecoupmentRationale(recoupmentRationale)
      request.create('recoupmentrationale', {Name: name})

    }

    
    else {
      let exists = filters[entity].filter((f) => f.value == name)
      if(exists.length == 0) {
        filters[entity].push({text: name, value: name})
      }
      
      setFilters({...filters})
  
    }

    
    setName('');
  };

  var usDate = getDate()
  const currentDate = usDate 
  const {current} = useSelector(selectAuth);
  const [tabs, setTabs] = useState([])
  

  const dispatch = useDispatch()

  const load = async () => {
    const [{result: result1}] = await Promise.all([ await request.list(entity+"-columns", {id: current.EMPID})  ]);

    if(result1.length > 0) {
      setDataColumns([...dataTableColumns.map((c,i )=> {
         c['order'] =  result1[0][c.dataIndex]
         return c
      })])
      
    } else {
      setDataColumns(dataTableColumns)
    } 

    setColumns(true)
  }


  React.useEffect(async () => {

   setUsers(mappedUser(usersList))
   getStatus()
   getrecoupmentRationale()
   load()
   
  }, [usersList])

  const getStatus = async() => {
    const {result} = await request.list("rac_status", {
      data: JSON.stringify({
        CERT: 'Y'
      })
    });

    setRStatus(result)
  }

  const getrecoupmentRationale = async () => {
    const {result} = await request.list("recoupmentrationale");
    setRecoupmentRationale(result)
  } 

  const getFilters =async (value) => {
    if (value['Open/Closed'].value) {
      value['Open/Closed']  = (value['Open/Closed'].value)
    } 
    const filters = await request.list("cert-filters",{filter: JSON.stringify(value['Open/Closed'])});
    let Patient = ([...new Set(filters.result['Patient'].sort())].map((value) => ({text: value['Patient Name'], value:value['Patient Name']})))
    let Status = ([...new Set(filters.result['Status'].sort())].map((value) => ({text: value['Status'], value:value['Status']})))
    let ServiceType = ([...new Set(filters.result['ServiceType'].sort())].map((value) => ({text: value['Status'], value:value['Status']})))
    let User = ([...new Set(filters.result['User'].sort())].map((value) => ({text: value['User'], value:value['User']})))
    let OpenClosed = ([...new Set(filters.result['OpenClosed'].sort())].map((value) => ({ text: value['Open/Closed'], value: value['Open/Closed'] })))
    let InternalTrackingNo = ([...new Set(filters.result['InternalTrackingNo'].sort())].map((value) => ({ text: value['Internal Tracking No.'], value: value['Internal Tracking No.'] })))
    let RecoupmentRationale = ([...new Set(filters.result['RecoupmentRationale'].sort())].map((value) => ({ text: value['Recoupment Rationale'], value: value['Recoupment Rationale'] })))
    

    if(tabs.length != OpenClosed.length) {
      setTabs(OpenClosed.reverse())
    }

    let Obj = {
      Patient,
      Status,
      ServiceType,
      User,
      OpenClosed,
      InternalTrackingNo,
      RecoupmentRationale
      
    }

    // console.log(Obj)
    setFilters(Obj)
    getStatus()

  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          // ref={(node) => {
          //   searchInput = node;
          // }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
           onPressEnter={(e) => {
           
            if (e.code == 'Enter') {
              e.preventDefault()
              e.stopPropagation();
              return
            }
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, dataIndex,  confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    // onFilter: (value, record) => {
     
    //   return record[dataIndex]
    //     ? record[dataIndex]
    //         .toString()
    //         .toLowerCase()
    //         .includes(value.toLowerCase())
    //     : ""
    // },
      
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        // setTimeout(() => searchInput.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {

    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, dataIndex, confirm) => {
    
    clearFilters();
    setSearchText("");
    handleSearch('', confirm, dataIndex)
       
  };

  const entity = "cert";

  const onhandleSave = (data) => {
    dispatch(crud.update(entity, data.ID, {notes: data.Notes}))
    // onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
  }


  const onNotesAction = (id, status) => {

    let item = items.filter((item) => item.ID == id)[0]

    // dispatch(crud.create(loggerEntity, { IDWQ1075: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
  }

  const openEditModal = (value, id) => {
    let row = items.filter(item => item.ID == id)[0];

    setSelectedId(id);
    setModalType("EDIT");
    // editForm.setFieldsValue({
    //   Notes: row.Notes
    // })
    
    setSelectedId(id);
    setValue(null)
    setTimeout(() => {
      setValue(row.Notes ? row.Notes : " " )        
       
    }, 10)

    setModalTitle("Edit Notes");
    setOpenModal(true)
    onNotesAction(id, 'Edit Note')

  }

  const getFilterValue = (values) => {
    setFilteredValue(values)
    getFilters(values )
  }

  const openAddModal = (value,id) => {
    let row = items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View Notes");
    setOpenModal(true);
  }

  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
    setOpenCERTModal(false);
    set_CERT_Due_Date(null)
    set_Date_CERT_Submitted_to_CMS(null)
    set_Closed_Date(null)
    set_Date_CERT_Recd(null)
    set_Demand_Letter_Date(null)
    set_DOS_From(null)
    set_DOS_To(null)
    setErrors({})
    setSortModal(false)
  }



  const getItems = (data) => {


    setHasErrors(true)
    setItems(data)
  } 



    const onEditItem = () => {
      onhandleSave({ID: selectedId, Notes: value})
      setOpenModal(false)
    }


    const onDateChanges = (entity, date) => {
      delete errors[entity]
  
      if (entity == 'CERT_Due_Date') {
        set_CERT_Due_Date(date)
      } else if (entity == "Date_CERT_Submitted_to_CMS") {
        set_Date_CERT_Submitted_to_CMS(date)
      } else if (entity == "Closed_Date") {
        editCERTForm.setFieldsValue({
          'Open/Closed' : 'Closed' 
        })
        set_Closed_Date(date)
      } else if (entity == "Date_CERT_Recd") {
        set_Date_CERT_Recd(date)
      } else if (entity == "Demand_Letter_Date") {
        set_Demand_Letter_Date(date)
      } else if (entity == "DOS_From") {
        set_DOS_From(date)
      } else if (entity == "DOS_To") {
        set_DOS_To(date)
      }
    }
  
    const onEditem = async(value) => {
      value['CERT Due Date'] = formatDateTime( CERT_Due_Date)
      value['Date CERT Submitted to CMS'] = formatDateTime(Date_CERT_Submitted_to_CMS)
      value['Closed Date'] = formatDateTime(Closed_Date)
      value["Date CERT Rec'd"] = formatDateTime(Date_CERT_Recd)
      value['Demand Letter Date']  = formatDateTime(Demand_Letter_Date)
      value['DOS From'] =formatDateTime( DOS_From)
      value['DOS To'] = formatDateTime( DOS_To)
  
      setReload(false)
      if (modalType == 'EDIT') {
        await request.update( entity , selectedId, value)
        notification.success({message: "CERT updated successfully!"})
      } else {
        await request.create( entity , value)
        notification.success({message: "CERT added successfully!"})
      }
      
      handleCancel()
      setReload(true)
      getFilters(filteredValue)
      
    }
  
  

   // edit form
   const editModal = (
    <Form
    name="basic"
    labelCol={{ span: 0 }}
    wrapperCol={{ span: 24 }}
    onFinish={onEditItem}
    // onFinishFailed={onEditFailed}
    autoComplete="off"
    form={editForm}
  >
    <Form.Item
      label=""
      name="Notes"
    >      

{

<div className="suneditor-container">
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
        /> : null
        }
          
        </div>
        }
    </Form.Item>
    
    <Form.Item wrapperCol={{ offset: 18 }} className="text-end" style={{marginBottom: "-10px"}}>
      <Button type="primary" htmlType="submit" className="mr-3" >
        Update
      </Button>
    </Form.Item>
  </Form>
  )


  const handleChangeStatus = async(ID, value, column) => {
    let obj = {}
    obj[column] = value
    if(value.indexOf("Closed") > -1) {
      obj['Open/Closed'] = 'Closed'
    }
    await request.update(entity ,ID , obj)
  }

  const handleChangeStatus1 = async( value) => {

    
    if(value.indexOf("Closed") > -1) {
      editCERTForm.setFieldsValue({
        'Open/Closed' : 'Closed' 
      })
    } else {
      editCERTForm.setFieldsValue({
        'Open/Closed' : 'Open' 
      })
    }
  }
 
 
  const panelTitle = "CERT";
  const dataTableTitle = "CERT";
  
  const onWorkSaved = async (amount) => {}

  const openingModal = (row) => {

    editCERTForm.resetFields()

    if (row) {
      setModalType("EDIT");
      setSelectedId(row.ID)

      editCERTForm.setFieldsValue({
        'Internal Tracking No.': row['Internal Tracking No.'],
        'Open/Closed': row['Open/Closed'],
        'Status': row['Status'],
        'Recoupment Rationale': row['Recoupment Rationale'],
        'Days till Due Date': row['Days till Due Date'],
        'Number of Claims': row['Number of Claims'],
        'Patient Name': row['Patient Name'],
        'CID No.': row['CID No.'],
        'HAR No.': row['HAR No.'],
        'MRN': row['MRN'],
        'Claim Number': row['Claim Number'],
        'Total Charges': row['Total Charges'],
        'CPT': row['CPT'],
        'Drug/Procedure': row['Drug/Procedure'],
        'FILE AND RESOLVE': row['FILE AND RESOLVE'],
        'Paid Amount': row['Paid Amount'],
        'Recouped Amount': row['Recouped Amount']
      })

      set_CERT_Due_Date(row['CERT Due Date'] ? row['CERT Due Date'].split('T')[0] : "")
      set_Closed_Date(row['Closed Date'] ? row['Closed Date'].split('T')[0]: "")
      set_Date_CERT_Recd(row["Date CERT Rec'd"] ? row["Date CERT Rec'd"].split('T')[0] : "")
      set_Demand_Letter_Date(row['Demand Letter Date'] ?  row['Demand Letter Date'].split('T')[0] : "")
      set_DOS_From(row['DOS From'] ?  row['DOS From'].split('T')[0] : "")
      set_DOS_To(row['DOS To'] ?  row['DOS To'].split('T')[0] : "")
      set_Date_CERT_Submitted_to_CMS(row['Date CERT Submitted to CMS'] ?  row['Date CERT Submitted to CMS'].split('T')[0] : "")



      setModalTitle("Edit CERT");
      setOpenCERTModal(true)

    } else {
      
      setModalType("ADD");
      setModalTitle("Add CERT");

      editCERTForm.setFieldsValue({
        'Open/Closed' : 'Open' 
      })
      setOpenCERTModal(true)

    }
  }


  

  const confirmModal = (row) => {
    setSelectedRow(row)
    setSelectedId(row.ID)
    setModalTitle("Archive CERT");
    setModalType("Archive");
    setOpenModal(true);
  }

  const onArchive = async () => {
    let archive = selectedRow['Archive'] ? 0 : 1
    setReload(false)

    await dispatch(crud.update(entity + "-archive", selectedId, {value: archive}))
    setReload(true)
    handleCancel()
  }

  const deleteModal = (
    <div>
      <p>{selectedRow['Archive'] ? "Unarchive": "Archive"} RAC {selectedRow.ID} ?</p>
      <div className="text-right mb-2">
        <Button type="danger" onClick={onArchive}>{selectedRow['Archive'] ? "Unarchive": "Archive"}</Button>
      </div>
    </div>
  )

   // View Modal
   const viewModal = (
    <Row gutter={[24, 24]} style={{marginBottom: "50px"}}>
       <Col className="gutter-row" span={24} dangerouslySetInnerHTML={{ __html: selectedRow.Notes  }}>
       
         </Col>
   </Row>  
 )
 

 const onChangeDate = async( column, value, selectedId) => {
  
  let obj = {}
  obj[column] = value
  obj['Open/Closed'] = 'Closed'
  setReload(false)
  await dispatch(crud.update(entity, selectedId, obj))
  setReload(true)

}

 const dataTableColumns = [
  {
    title: "Action",
    name: "Action",
    dataIndex: "Action",
    width: 80,
    fixed: true,
    order: 1
  },
  {
    title: "Patient Name",
    name: "Patient Name",
    dataIndex: "Patient Name",
    key: "Patient Name",
    width: 180,
    type: "filter",
    fixed: true,
    order:2,
    sorter: { multiple: 16},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient Name").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Patient Name")[0].order : null,
    filters: filters['Patient'],
    filterSearch: true,
    filteredValue:filteredValue['Patient Name'] || null,
  },
  {
    title: "Status",
    name: "Status",
    dataIndex: "Status",
    key: "Status",
    width: 180,
    type: "filter",
    fixed: true,
    order:3,
    feature: "select",
    filters: filters['Status'],
    filterSearch: true,
    filteredValue:filteredValue['Status'] || null,
   
  },
  {
    title: "DOS From",
    name: "DOS From",
    dataIndex: "DOS From",
    key: "DOS From",
    width: 140,
    type: "date",
    order: 4,
    sorter: { multiple: 12},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DOS From").length > 0) ?  filteredValue.sort.filter((value) => value.field == "DOS From")[0].order : null,
    ...getColumnSearchProps("DOS From"),
    filteredValue:filteredValue['DOS From'] || null,
  },
  {
    title: "DOS To",
    name: "DOS To",
    dataIndex: "DOS To",
    key: "DOS To",
    width: 140,
    order:5,
    type: "date",
    sorter: { multiple: 21},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DOS To").length > 0) ?  filteredValue.sort.filter((value) => value.field == "DOS To")[0].order : null,
    ...getColumnSearchProps("DOS To"),
    filteredValue:filteredValue['DOS To'] || null,
  },
  {
    title: "Recoupment Rationale",
    name: "Recoupment Rationale",
    dataIndex: "Recoupment Rationale",
    key: "Recoupment Rationale",
    width: 150,
    order:6,
    feature: "select1",
    type: "filter",
    filters: filters['RecoupmentRationale'],
    filterSearch: true,
    filteredValue: filteredValue['Recoupment Rationale'] || null,
  },
  {
    title: "Internal Tracking No.",
    name: "Internal Tracking No.",
    dataIndex: "Internal Tracking No.",
    key: "Internal Tracking No.",
    width: 160,
    feature: "number", 
    type :"none",
    order: 7,
    filters: filters['InternalTrackingNo'],
    filteredValue: filteredValue['Internal Tracking No.'] || null,
    filterSearch: true,
    sorter: { multiple: 3},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Internal Tracking No.").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Internal Tracking No.")[0].order : null
  },
  
  {
    title: "CPT",
    name: "CPT",
    dataIndex: "CPT",
    key: "CPT",
    width: 160,
    order: 8,
    feature: "tooltip",
    type: "filter",
    sorter: { multiple: 23},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CPT").length > 0) ?  filteredValue.sort.filter((value) => value.field == "CPT")[0].order : null,
    ...getColumnSearchProps("CPT"),
    filteredValue:filteredValue['CPT'] || null,
  },
  {
    title: "Paid Amount",
    name: "Paid Amount", 
    dataIndex: "Paid Amount",
    key: "Paid Amount",
    width: 140,
    type: "filter",
    feature: 'dollor',
    order: 9,
    sorter: { multiple: 26},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Paid Amount").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Paid Amount")[0].order : null,
    ...getColumnSearchProps("Paid Amount"),
    filteredValue:filteredValue['Paid Amount'] || null,
  },
  {
    title: "Recouped Amount",
    name: "Recouped Amount",
    dataIndex: "Recouped Amount",
    key: "Recouped Amount",
    width: 140,
    type: "search",
    feature: 'dollor',
    order: 10,
    sorter: { multiple: 27},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Recouped Amount").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Recouped Amount")[0].order : null,
    ...getColumnSearchProps("Recouped Amount"),
    filteredValue:filteredValue['Recouped Amount'] || null,
  },
 
  (status == 'ALL' ?
  {
    title: "Open / Closed",
    name: "Open / Closed",
    dataIndex: "Open/Closed",
    key: "Open/Closed",
    type: "filter",
    width: 120,
    type: "none",
    order: 11,
    filters: filters['OpenClosed'],
    filteredValue: filteredValue['Open/Closed'] || null,
    sorter: { multiple: 27 },
    sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Open/Closed").length > 0) ? filteredValue.sort.filter((value) => value.field == "Open/Closed")[0].order : null,
    
  }: 
  {name: "Open / Closed" , dataIndex: "Open/Closed" , order: 11}
  ),

  {
    title: "CERT Due Date",
    name: "CERT Due Date",
    dataIndex: "CERT Due Date",
    key: "CERT Due Date",
    width: 140,
    type: "date",
    order:12,
    sorter: { multiple: 17},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CERT Due Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "CERT Due Date")[0].order : null,
    ...getColumnSearchProps("CERT Due Date"),
    filteredValue:filteredValue['CERT Due Date'] || null,
  },
  
  

  {
    title: "Days till Due Date",
    name: "Days till Due Date",
    dataIndex: "Days till Due Date",
    key: "Days till Due Date",
    width: 130,
    type: "search",
    sorter: { multiple: 7},
    order: 13,
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Days till Due Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Days till Due Date")[0].order : null,
    ...getColumnSearchProps("Days till Due Date"),
    filteredValue:filteredValue['Days till Due Date'] || null,
  },
  {
    title: "Date CERT Submitted to CMS",
    name: "Date CERT Submitted to CMS",
    dataIndex: "Date CERT Submitted to CMS",
    key: "Date CERT Submitted to CMS",
    width: 190,
    type: "date",
    order: 13,
    sorter: { multiple: 8},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date CERT Submitted to CMS").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Date CERT Submitted to CMS")[0].order : null,
    ...getColumnSearchProps("Date CERT Submitted to CMS"),
    filteredValue:filteredValue['Date CERT Submitted to CMS'] || null,
  },
 
  {
    title: "Notes",
    name: "Notes",
    type: "search",
    width: 100, 
    dataIndex: "Notes", 
    feature:"pencil",
    order: 14,
    ...getColumnSearchProps("Notes"),
    
    filteredValue: filteredValue['Notes'] || null
  },
  {
    title: "Closed Date",
    name: "Closed Date",
    dataIndex: "Closed Date",
    key: "Closed Date",
    width: 160,
    type: "date",
    feature: 'date',
    order:15,
    sorter: { multiple: 10},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Closed Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Closed Date")[0].order : null,
    ...getColumnSearchProps("Closed Date"),
    filteredValue:filteredValue['Closed Date'] || null,
  },
  {
    title: "Date CERT Rec'd",
    name: "Date CERT Rec'd",
    dataIndex: "Date CERT Rec'd",
    key: "Date CERT Rec'd",
    width: 150,
    type: "date",
    order: 16,
    ...getColumnSearchProps("Date CERT Rec'd"),
    filteredValue:filteredValue["Date CERT Rec'd"] || null,
    sorter: { multiple: 11},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date CERT Rec'd").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Date CERT Rec'd")[0].order : null
  },

  {
    title: "Demand Letter Date",
    name: "Demand Letter Date",
    dataIndex: "Demand Letter Date",
    key: "Demand Letter Date",
    width: 170,
    type: "date",
    order: 17,
    ...getColumnSearchProps("Demand Letter Date"),
    filteredValue:filteredValue["Demand Letter Date"] || null,
    sorter: { multiple: 12},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Demand Letter Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Demand Letter Date")[0].order : null
  },
  {
    title: "CID No.",
    name: "CID No.",
    dataIndex: "CID No.",
    key: "CID No.",
    width: 120,
    type: "search",
    order: 17,
    sorter: { multiple: 13},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CID No.").length > 0) ?  filteredValue.sort.filter((value) => value.field == "CID No.")[0].order : null,
    ...getColumnSearchProps("CID No."),
    filteredValue:filteredValue['CID No.'] || null,
  },
  
  
  
  {
    title: "HAR No.",
    name: "HAR No.",
    dataIndex: "HAR No.",
    key: "HAR No.",
    width: 130,
    type: "serach",
    feature: "copy", 
    order: 17,
    sorter: { multiple: 18},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "HAR No.").length > 0) ?  filteredValue.sort.filter((value) => value.field == "HAR No.")[0].order : null,
    ...getColumnSearchProps("HAR No."),
    filteredValue:filteredValue['HAR No.'] || null,
  },
  {
    title: "MRN",
    name: "MRN",
    dataIndex: "MRN",
    key: "MRN",
    width: 130,
    type: "search",
    order: 18,
    feature: "copy", 
    sorter: { multiple: 19},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "MRN").length > 0) ?  filteredValue.sort.filter((value) => value.field == "MRN")[0].order : null,
    ...getColumnSearchProps("MRN"),
    filteredValue:filteredValue['MRN'] || null,
  },
  {
    title: "Claim Number",
    name: "Claim Number",
    dataIndex: "Claim Number",
    key: "Claim Number",
    width: 190,
    type: "search",
    feature: "copy", 
    order: 19,
    sorter: { multiple: 30},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Claim Number").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Claim Number")[0].order : null,
    ...getColumnSearchProps("Claim Number"),
    filteredValue:filteredValue['Claim Number'] || null,
  },
  
  {
    title: "Total Charges",
    name: "Total Charges",
    dataIndex: "Total Charges",
    key: "Total Charges",
    width: 160,
    type: "search",
    order: 20,
    sorter: { multiple: 22},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Charges").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Total Charges")[0].order : null,
    ...getColumnSearchProps("Total Charges"),
    filteredValue:filteredValue['Total Charges'] || null,
  },
  
  {
    title: "Service Type",
    name: "Service Type",
    dataIndex: "Service Type",
    key: "Service Type",
    width: 160,
    type: "filter",
    sorter: { multiple: 23},
    order: 21,
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Service Type").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Service Type")[0].order : null,
    filters: filters["ServiceType"],
    filterSearch: true,
    filteredValue:filteredValue['Service Type'] || null,
  },
  
  {
    title: "FILE AND RESOLVE",
    name: "FILE AND RESOLVE",
    dataIndex: "FILE AND RESOLVE",
    key: "FILE AND RESOLVE",
    width: 200,
    type: "filter",
    sorter: { multiple: 25},
    order: 22,
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FILE AND RESOLVE").length > 0) ?  filteredValue.sort.filter((value) => value.field == "FILE AND RESOLVE")[0].order : null,
    ...getColumnSearchProps("FILE AND RESOLVE"),
    filteredValue:filteredValue['FILE AND RESOLVE'] || null,
  },

  
  {
    title: "User",
    name: "User",
    dataIndex: "User",
    key: "User",
    width: 140,
    type: "filter",
    sorter: { multiple: 27},
    order:23,
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "User").length > 0) ?  filteredValue.sort.filter((value) => value.field == "User")[0].order : null,
    filters: filters['User'],
    filterSearch: true,
    filteredValue:filteredValue['User'] || null,
  },

  {
    title: "Action Date Time",
    name: "Action Date Time",
    dataIndex: "ActionTimeStamp",
    key: "ActionTimeStamp",
    width: 180,
    order: 24,
    type: "datetime",
    sorter: { multiple: 27},
    sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "ActionTimeStamp").length > 0) ?  filteredValue.sort.filter((value) => value.field == "ActionTimeStamp")[0].order : null,
   
  },
  {
    title: "Archive",
    name: "Archive",
    dataIndex: "Archive",
    key: "Archive",
    width: 120,
    order:25,
    type: "boolean",
    filters : [
      {text: "Yes", value: 0},
      {text: "No", value: 1},
      {text: "", value: null},
    ],
    filterSearch: true,
    filteredValue: filteredValue['Archive'] || null,
    
  }
];


  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";
  

  const addEditModalConfig = {
    title: modalTitle,
    openModal: openCERTModal,
    handleCancel,
    width: 1000
  };

  const deleteConfig = {
    title: modalTitle,
    openModal,
    handleCancel,
    style: {
      minWidth: "800px",
      minHeight: "auto",
      display: "inline-grid"
    }
    
  };
  

  const changeOpenClosed = (value) => {
    // if(value == 'Closed' ) {
    //   set_Closed_Date(null) 
    //   setShowClosedDate(false)
    //   setTimeout(() =>  {
    //     onDateChanges('Closed_Date', getDate().split('T')[0])
    //     setShowClosedDate(true)
    //   } , 10)
      
    // }
  }

   // edit form
   const editCERTModal = (
    <Form
      name="basic"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      onFinish={onEditem}
      // onFinishFailed={onEditFailed}
      autoComplete="off"
      form={editCERTForm}
    >

      <Row gutter={[24, 24]}>
        <Col span={8}>
          <p>Internal Tracking No.</p>
          <Form.Item
            label=""
            name="Internal Tracking No."
          >
            <Input placeholder="Internal Tracking No." />
          </Form.Item>
        </Col>
        <Col span={8}>
          <p>Open/Closed <span style={{color : "red"}}>*</span></p>
          <Form.Item
            label=""
            name="Open/Closed"
            rules={[
              {
                required: true,
                message: "Please choose item!",
              },
            ]}
          >
            <Select placeholder="Open/Closed"
            showSearch
            optionFilterProp="children"
            onChange={changeOpenClosed}
            filterOption={(input, option) =>  {

              if(option.children != "null" && option.children != null ) {
               return  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0

              }
            }
            }
            dropdownRender={menu => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space align="center" style={{ padding: '0 8px 4px' }}>
                  <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                  <Typography.Link onClick={(e) => addItem(e,'OpenClosed') } style={{ whiteSpace: 'nowrap' }}>
                    <PlusOutlined /> Add item
                  </Typography.Link>
                </Space>
              </>
            )}
            >

            {
                filters && filters['OpenClosed'] && filters['OpenClosed'].filter((value) => value.value != "").map((status) => {
                  if (status.value != "") {
                    return <Select.Option value={status.value}>{status.text}</Select.Option>
                  }
                })
              }
              
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <p>CERT Due Date</p>
          <Form.Item
            label=""
            name="CERT Due Date"
          >

            {
              CERT_Due_Date ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(CERT_Due_Date, dateFormat)} onChange={(d, date) => onDateChanges('CERT_Due_Date', date)} />
                :
                <DatePicker className="w-100"  placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('CERT_Due_Date', date)} />
            }

            <span className="ant-form-item-explain">{errors.CERT_Due_Date}</span>

          </Form.Item>

        </Col>

        <Col span={8}>
          <p>Closed Date</p>
          <Form.Item
            label=""
            name="Closed Date"
          >

            {
              Closed_Date ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(Closed_Date, dateFormat)} onChange={(d, date) => onDateChanges('Closed_Date', date)} />
                :
                showClosedDate ? 
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker}  onChange={(d, date) => onDateChanges('Closed_Date', date)} />
              : null
            }

            <span className="ant-form-item-explain">{errors.Closed_Date}</span>

          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Date CERT Rec'd</p>
          <Form.Item
            label=""
            name="Date CERT Rec'd"
          >

            {
              Date_CERT_Recd ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(Date_CERT_Recd, dateFormat)} onChange={(d, date) => onDateChanges('Date_CERT_Recd', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Date_CERT_Recd', date)} />
            }

            <span className="ant-form-item-explain">{errors.Date_CERT_Recd}</span>

          </Form.Item>
        </Col>
        <Col span={8}>
          <p>Demand Letter Date</p>
          <Form.Item
            label=""
            name="Demand Letter Date"
          >

            {
              Demand_Letter_Date ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(Demand_Letter_Date, dateFormat)} onChange={(d, date) => onDateChanges('Demand_Letter_Date', date)} />
                : 
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Demand_Letter_Date', date)} />
            }

            <span className="ant-form-item-explain">{errors.Demand_Letter_Date}</span>

          </Form.Item>
        </Col>

        <Col span={8}>
          <p>DOS From</p>
          <Form.Item
            label=""
            name="DOS From"
          >

            {
              DOS_From ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(DOS_From, dateFormat)} onChange={(d, date) => onDateChanges('DOS_From', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('DOS_From', date)} />
            }

            <span className="ant-form-item-explain">{errors.DOS_From}</span>

          </Form.Item>
        </Col>

        <Col span={8}>
          <p>DOS To</p>
          <Form.Item
            label=""
            name="DOS To"
          >

            {
              DOS_To ?
                <DatePicker className="w-100"  placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(DOS_To, dateFormat)} onChange={(d, date) => onDateChanges('DOS_To', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker}  onChange={(d, date) => onDateChanges('DOS_To', date)} />
            }

            <span className="ant-form-item-explain">{errors.DOS_To}</span>

          </Form.Item>
        </Col>
    
        <Col span={8}>
          <p>Status</p>
          <Form.Item
            label=""
            name="Status"
          >

            <Select 
            placeholder="Status"
            showSearch
            optionFilterProp="children"
            onChange={(value) => handleChangeStatus1(value)}
            filterOption={(input, option) =>  {

              if(option.children != "null" && option.children != null ) {
               return  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0

              }
            }
            }
            dropdownRender={menu => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space align="center" style={{ padding: '0 8px 4px' }}>
                  <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                  <Typography.Link onClick={(e) => addItem(e,'Status') } style={{ whiteSpace: 'nowrap' }}>
                    <PlusOutlined /> Add item
                  </Typography.Link>
                </Space>
              </>
            )}
            >
              {
                rStatus.filter((value) => value.value != "").map((status, index) => {
                  if (status.value != "") {
                    return <Select.Option key={index} value={status.Name} style={{background: status.Background, color: status.Color}}>{status.Name} </Select.Option>
                  }
                })
              }
            </Select>
          </Form.Item>
        </Col>


        <Col span={8}>
          <p>Recoupment Rationale</p>
          <Form.Item
            label=""
            name="Recoupment Rationale"
            
          >

            <Select placeholder="Recoupment Rationale" 
             showSearch
             optionFilterProp="children"
             filterOption={(input, option) => {

              if(option.children != "null" && option.children != null ) {
                return  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0

               }
             }
             }
           
             dropdownRender={menu => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space align="center" style={{ padding: '0 8px 4px' }}>
                  <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                  <Typography.Link onClick={(e) => addItem(e,'RecoupmentRationale') } style={{ whiteSpace: 'nowrap' }}>
                    <PlusOutlined /> Add item
                  </Typography.Link>
                </Space>
              </>
            )}
            >
              {
                recoupmentRationale.filter((value) => value.value != "").map((status, index) => {
                    return <Select.Option key={index} value={status.Name} >{status.Name} </Select.Option>
                })
              }
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Date CERT Submitted to CMS</p>
          <Form.Item
            label=""
            name="Date CERT Submitted to CMS"
          >

            {
              Date_CERT_Submitted_to_CMS ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(Date_CERT_Submitted_to_CMS, dateFormat)} onChange={(d, date) => onDateChanges('Date_CERT_Submitted_to_CMS', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Date_CERT_Submitted_to_CMS', date)} />
            }

            <span className="ant-form-item-explain">{errors.Date_CERT_Submitted_to_CMS}</span>

          </Form.Item>
        </Col>


     

      

       

        <Col span={8}>
          <p>HAR No.</p>
          <Form.Item
            label=""
            name="HAR No."
          >

            <Input />
          </Form.Item>
        </Col>


        <Col span={8}>
          <p>Patient Name</p>
          <Form.Item
            label=""
            name="Patient Name"
          >

            <Input />
          </Form.Item>
        </Col>

      
        <Col span={8}>
          <p>CID No.</p>
          <Form.Item
            label=""
            name="CID No."
          >

            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>MRN</p>
          <Form.Item
            label=""
            name="MRN"
          >

            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Claim Number</p>
          <Form.Item
            label=""
            name="Claim Number"
          >

            <Input />
          </Form.Item>
        </Col>


        



        <Col span={8}>
          <p>Total Charges</p>
          <Form.Item
            label=""
            name="Total Charges"
          >

            <Input type="number" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>CPT</p>
          <Form.Item
            label=""
            name="CPT"
          >

            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Service Type</p>
          <Form.Item
            label=""
            name="Service Type"
          >

            <Select 
            placeholder="Service Type"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>  {

              if(option.children != "null" && option.children != null ) {
               return  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0

              }
            }
            }
            dropdownRender={menu => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space align="center" style={{ padding: '0 8px 4px' }}>
      ,            <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                  <Typography.Link onClick={(e) => addItem(e,'ServiceType') } style={{ whiteSpace: 'nowrap' }}>
                    <PlusOutlined /> Add item
                  </Typography.Link>
                </Space>
              </>
            )}
            >
              {
                filters && filters['ServiceType'] && filters['ServiceType'].filter((value) => value.value != "").map((status) => {
                  if (status.value != "") {
                    return <Select.Option value={status.value}>{status.text}</Select.Option>
                  }
                })
              }
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>FILE AND RESOLVE</p>
          <Form.Item
            label=""
            name="FILE AND RESOLVE"
          >

            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Paid Amount</p>
          <Form.Item
            label=""
            name="Paid Amount"
          >

            <Input type="number"/>
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Recouped Amount</p>
          <Form.Item
            label=""
            name="Recouped Amount"
          >

            <Input type="number"/>
          </Form.Item>
        </Col>

      </Row>

    <Form.Item wrapperCol={{ offset: 15 }} style={{ marginBottom: "-10px",  textAlign:"end" }}>
      
        <Button type="primary" htmlType="submit" className="mr-3" >
              {modalType == "ADD" ? 'Add': 'Update'}
        </Button>
      </Form.Item>
    </Form>
  )

  const onSort = async (data) => {

    setReload(false)
    var x = {}

    data.map((d, i ) =>  {
      x[d.dataIndex] =  i
    })
    x.EMPID = current.EMPID
    await request.create(entity+ "-columns" , x)
    handleCancel()
    setTimeout(() => setReload(true), 1000)
    
    notification.success({message: "Please Refesh page!"})

  }

  const openSortModal = () => {
    setSortModal(true)
  }
 

  if(columns) {

    
    let cols = dataTableColumns.map((d, i) => {
      d.order = dataColumns[i].order
      return d
    })

    cols = cols.sort(GetSortOrder('order'))

    const sortModalConfig = {
      title: "Column Sort",
      openModal: sortModal,
      handleCancel,
      columns: cols,
      onSort:onSort
    };


    const config = {
      entity,
      panelTitle,
      dataTableTitle,
      ENTITY_NAME,
      CREATE_ENTITY,
      ADD_NEW_ENTITY,
      UPDATE_ENTITY,
      DATATABLE_TITLE,
      dataTableColumns: cols,
      dataTableColorList,
      showFooter: false,
      onhandleSave,
      openEditModal,
      openAddModal,
      getItems,
      reload,
      getFilterValue,
      userList: users,
      onWorkSaved,
      openingModal,
      confirmModal,
      AddIcon: false,
      height: 'calc(100vh - 21.5em)',
      tab: tabs,
      status : filters['Status'],
      handleChangeStatus,
      onChangeDate,
      setStatus,
      openSortModal: openSortModal
    };

  return (
    <div>
      
     <RACTableModule config={config} />

     
        <Modals config={deleteConfig} >
          {
            modalType == "EDIT" ?
              editModal : null
          }
          {
            modalType == "VIEW" ?
              viewModal : null
          }
           {
          modalType == 'Archive' ?
          deleteModal : null
        }
        </Modals>

        <Modals config={addEditModalConfig} >
          {
              editCERTModal 
          }
      
        </Modals>
        <SortModal config={sortModalConfig} ></SortModal>

    </div>
  )
  } else {
    return ""
  }  
}
