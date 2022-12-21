
import React, { useState, useRef, useEffect } from "react";

import RACTableModule from "@/modules/RACTableModule";
import { Table, Input, Button, Space, Form, Row, Col, Select, Divider, Typography,  DatePicker, notification } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, EyeFilled, EyeOutlined, ConsoleSqlOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import Socket from "@/socket";
import moment from 'moment';
import { set } from "@antv/util";
import { formatDate, formatDateTime, getDate } from "@/utils/helpers";
import { PlusOutlined } from '@ant-design/icons';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Config from "@/components/Editor"
import SortModal from "@/components/Sorter";
import { GetSortOrder } from "@/utils/helpers";




export default function RAC() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openRACModal, setOpenRACModal] = useState(false);

  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [workProgress, setWorkProgress] = useState([]);
  const [status, setStatus] = useState('Open');
  const [recoupmentRationale, setRecoupmentRationale] = useState([])
  const [filteredValue, setFilteredValue] = useState({})
  const [filters, setFilters] = useState([])
  const dateFormat = 'YYYY/MM/DD';
  const dateFormatDatePicker = ['MM/DD/YYYY', 'MM-DD-YYYY'];

  const [showClosedDate, setShowClosedDate] = useState(true)
  const {current} = useSelector(selectAuth);

  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])
  

  const [ID, setID] = useState("");
  var [value, setValue] = useState("");
  const editor = useRef();



  const [RAC_Due_Date, set_RAC_Due_Date] = useState();
  const [Compliance_Due_Date, set_Compliance_Due_Date] = useState();
  const [Date_ADR_Submitted_to_CMS, set_Date_ADR_Submitted_to_CMS] = useState();
  const [Closed_Date, set_Closed_Date] = useState();
  const [Appeals_Due_Date, set_Appeals_Due_Date] = useState()
  const [Date_Recd, set_Date_Recd] = useState();
  const [Demand_Letter_Date, set_Demand_Letter_Date] = useState();
  const [DOS_From, set_DOS_From] = useState();
  const [DOS_To, set_DOS_To] = useState();

  const [errors, setErrors] = useState({})
  const [hasErrors, setHasErrors] = useState(false)
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

      request.create('rac_status', {Name: name, RAC: 'Y'})
    }  else  if(entity == 'RecoupmentRationale') {

      let exists = recoupmentRationale.filter((f) => f.Name == name)

      
      if(exists.length == 0) {
        recoupmentRationale.push({Name: name})
      }

      setRecoupmentRationale(recoupmentRationale)
      request.create('recoupmentrationale', {Name: name})

    } else {
      let exists = filters[entity].filter((f) => f.value == name)
      if(exists.length == 0) {
        filters[entity].push({text: name, value: name})
      }
      
      setFilters({...filters})
  
    }

    
    setName('');
  };

 
  
  const [editForm] = Form.useForm();
  const [editRACForm] = Form.useForm();
  const [tabs, setTabs] = useState([])
  const [rStatus, setRStatus] = useState([])

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

    const response = await request.list("admin");
    let usersList = response.result.filter(res => res.ManagementAccess == 0 || res.ManagementAccess == null).map((user) => ({ id: user.EMPID, name: user.Nickname, text: user.Nickname, value: user.Nickname, status: 'success' }))
    setUsers(usersList)

    
    getStatus()
    getrecoupmentRationale()
    load()

  }, [])

  const getStatus = async() => {
    const {result} = await request.list("rac_status", {
      data: JSON.stringify({
        RAC: 'Y'
      })
    });

    setRStatus(result)
  }

  const getrecoupmentRationale = async () => {
    const {result} = await request.list("recoupmentrationale");
    setRecoupmentRationale(result)
  } 

  const getFilters = async(value) => {
    
    if (value['Open/Closed'].value) {
      value['Open/Closed']  = (value['Open/Closed'].value)
    } 

    const filters = await request.list("rac-filters", {filter: JSON.stringify(value['Open/Closed'])});
    let Patient = ([...new Set(filters.result['Patient'].sort())].map((value) => ({ text: value['Patient Name'], value: value['Patient Name'] })))
    let Status = ([...new Set(filters.result['Status'].sort())].map((value) => ({ text: value['Status'], value: value['Status'] })))
    let DrugProcedure = ([...new Set(filters.result['DrugProcedure'].sort())].map((value) => ({ text: value['Drug/Procedure'], value: value['Drug/Procedure'] })))
    let User = ([...new Set(filters.result['User'].sort())].map((value) => ({ text: value['User'], value: value['User'] })))
    let OpenClosed = ([...new Set(filters.result['OpenClosed'].sort())].map((value) => ({ text: value['Open/Closed'], value: value['Open/Closed'] })))
    let InternalNumber = ([...new Set(filters.result['InternalNumber'].sort())].map((value) => ({ text: value['Internal Number'], value: value['Internal Number'] })))
    let RecoupmentRationale = ([...new Set(filters.result['RecoupmentRationale'].sort())].map((value) => ({ text: value['Recoupment Rationale'], value: value['Recoupment Rationale'] })))
    
    if(tabs.length != OpenClosed.length) {
      setTabs(OpenClosed.reverse())
    }
    let Obj = {
      Patient,
      Status,
      DrugProcedure,
      User,
      OpenClosed,
      InternalNumber,
      RecoupmentRationale
    }


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



  const entity = "rac";

  const onhandleSave = (data) => {
    dispatch(crud.update(entity, data.ID, { notes: data.Notes }))
    // onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true), 1000)
  }


  const onNotesAction = (id, status) => {

    let item = items.filter((item) => item.ID == id)[0]

  }


  const openEditModal = (value,id) => {
    let row = items.filter(item => item.ID == id)[0];
    
    setSelectedId(id);
    setValue(null)
    setTimeout(() => {
      setValue(row.Notes ? row.Notes : " " )        
    }, 10)
    setModalType("EDIT");
    // editForm.setFieldsValue({
    //   Notes: row.Notes
    // })

    setModalTitle("Edit Notes");
    setOpenModal(true)
    onNotesAction(id, 'Edit Note')

  }

  const getFilterValue = (values) => {
    setFilteredValue(values)
    let obj = {}
    for(let i in values) {
      obj[i] = {value: values[i]}
    }
    getFilters(values)
  }

  const openAddModal = (value, id) => {
    let row = items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View Notes");
    setOpenModal(true);
  }

  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
    setOpenRACModal(false);
    set_Compliance_Due_Date(null)
    set_RAC_Due_Date(null)
    set_Date_ADR_Submitted_to_CMS(null)
    set_Closed_Date(null)
    set_Date_Recd(null)
    set_Demand_Letter_Date(null)
    set_Appeals_Due_Date(null)
    set_DOS_From(null)
    set_DOS_To(null)
    setErrors({})
    setValue(null)
    setSortModal(false)
  }



   const getItems = (data) => {

  
    setHasErrors(true)
    setItems(data)
  }

  useEffect(() => {
  }, [status])


  const onEditItem = () => {
    onhandleSave({ ID: selectedId, Notes: value })
    setValue(null)
    setOpenModal(false)
  }


  const onDateChanges = (entity, date) => {
    delete errors[entity]

    if (entity == 'RAC_Due_Date') {
      set_RAC_Due_Date(date)
    } else if (entity == "Compliance_Due_Date") {
      set_Compliance_Due_Date(date)
    } else if (entity == "Date_ADR_Submitted_to_CMS") {
      set_Date_ADR_Submitted_to_CMS(date)
    } else if (entity == "Appeals_Due_Date") {
      set_Appeals_Due_Date(date)
    } else if (entity == "Closed_Date") {
      editRACForm.setFieldsValue({
        'Open/Closed' : 'Closed' 
      })
      set_Closed_Date(date)
    } else if (entity == "Date_Recd") {
      set_Date_Recd(date)
    } else if (entity == "Demand_Letter_Date") {
      set_Demand_Letter_Date(date)
    } else if (entity == "DOS_From") {
      set_DOS_From(date)
    } else if (entity == "DOS_To") {
      set_DOS_To(date)
    }
  }

  const onEditRACItem = async(value) => {
    value['RAC Due Date'] = formatDateTime( RAC_Due_Date)
    value['Compliance Due Date'] = formatDateTime( Compliance_Due_Date)
    value['Date ADR Submitted to CMS'] = formatDateTime( Date_ADR_Submitted_to_CMS)
    value['Appeals Due Date'] = formatDateTime(Appeals_Due_Date)
    value['Closed Date'] = formatDateTime(Closed_Date)
    value["Date Rec'd"] = formatDateTime( Date_Recd)
    value['Demand Letter Date']  = formatDateTime( Demand_Letter_Date)
    value['DOS From'] = formatDateTime( DOS_From)
    value['DOS To'] =  formatDateTime (DOS_To)

    setReload(false)

    handleCancel()

    
    if(modalType == 'EDIT') {
      let response = await request.update( entity , selectedId, value)

      if(response.success) {
        notification.success({message: response.message})
      } else {
        notification.error({message: response.message || 'Something went wrong!'})
      }
    } else {
    let response =   await request.create( entity , value)
    if(response.success) {
      notification.success({message: response.message})
    } else {
      notification.error({message: response.message || 'Something went wrong!'})
    }
      // 
    }

    
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
            /> 
            : null
            }
          
        </div>
        }


      </Form.Item>

      <Form.Item wrapperCol={{ offset: 18 }} className="text-end"  style={{ marginBottom: "-10px" }}>
        <Button type="primary" htmlType="submit" className="mr-3" >
          Update
        </Button>
      </Form.Item>
    </Form>
  )





  const panelTitle = "RAC";
  const dataTableTitle = "RAC";

  const onWorkSaved = async (amount) => { }

  const openingModal = (row) => {

    editRACForm.resetFields()


    

    if (row) {
      setModalType("EDIT");
      setSelectedId(row.ID)

      editRACForm.setFieldsValue({
        'Internal Number': row['Internal Number'],
        'Open/Closed': row['Open/Closed'],
        'Status': row['Status'],
        'Recoupment Rationale': row['Recoupment Rationale'],
        'Days till Due Date': row['Days till Due Date'],
        'Number of Claims': row['Number of Claims'],
        'Expected Amount': row['Expected Amount'],
        'Letter Ref Number': row['Letter Ref Number'],
        'HMS Audit ID': row['HMS Audit ID'],
        'RAC Case Number': row['RAC Case Number'],
        'Patient Name': row['Patient Name'],
        'Claim Number': row['Claim Number'],
        'Acct Number': row['Acct Number'],
        'MRN': row['MRN'],
        'CPT Charge Amount': row['CPT Charge Amount'],
        'CPT/J/HCPCS': row['CPT/J/HCPCS'],
        'Drug/Procedure': row['Drug/Procedure'],
        'FILE AND RESOLVE': row['FILE AND RESOLVE'],
        'Paid Amount': row['Paid Amount'],
        'Recouped Amount': row['Recouped Amount'],
        'All' : 'No'
      })

      set_RAC_Due_Date(row['RAC Due Date'] ? row['RAC Due Date'].split('T')[0] : "")
      set_Compliance_Due_Date(row['Compliance Due Date'] ? row['Compliance Due Date'].split('T')[0] : "")
      set_Closed_Date(row['Closed Date'] ? row['Closed Date'].split('T')[0]: "")
      set_Date_Recd(row["Date Rec'd"] ? row["Date Rec'd"].split('T')[0] : "")
      set_Demand_Letter_Date(row['Demand Letter Date'] ?  row['Demand Letter Date'].split('T')[0] : "")
      set_DOS_From(row['DOS From'] ?  row['DOS From'].split('T')[0] : "")
      set_DOS_To(row['DOS To'] ?  row['DOS To'].split('T')[0] : "")
      set_Date_ADR_Submitted_to_CMS(row['Date ADR Submitted to CMS'] ?  row['Date ADR Submitted to CMS'].split('T')[0] : "")
      set_Appeals_Due_Date(row['Appeals Due Date'] ?  row['Appeals Due Date'].split('T')[0] : "")

      setModalTitle("Edit RAC");
      setOpenRACModal(true)

    }  else {

      setModalType("ADD");
      setModalTitle("Add RAC");


      
      editRACForm.setFieldsValue({
        'Open/Closed': 'Open'
      })
      setOpenRACModal(true)

      

    }
  }

  const confirmModal = (row) => {
    setSelectedRow(row)
    setSelectedId(row.ID)
    setModalTitle("Archive RAC");
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
    <Row gutter={[24, 24]} style={{ marginBottom: "50px" }}>

      <Col className="gutter-row" span={24} >
        <div dangerouslySetInnerHTML={{ __html: selectedRow.Notes }}>
        
        </div>
        
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
      editRACForm.setFieldsValue({
        'Open/Closed' : 'Closed' 
      })
    } else {
      editRACForm.setFieldsValue({
        'Open/Closed' : 'Open' 
      })
    }
  }


  const dataTableColumns = [
    {
      title: "Action",
      name: "Action",
      dataIndex: "Action",
      width: 80,
      fixed: true,
      order:1
    },
    {
      title: "Patient Name",
      name: "Patient Name",
      dataIndex: "Patient Name",
      key: "Patient Name",
      width: 180,
      type: "filter",
      order: 2,
      fixed: true,
      sorter: { multiple: 16 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "Patient Name")[0].order : null,
      filters: filters['Patient'],
      filterSearch: true,
      filteredValue: filteredValue['Patient Name'] || null,
    },

   
  
    {
      title: "Acct Number",
      name: "Acct Number",
      dataIndex: "Acct Number",
      key: "Acct Number",
      width: 160,
      type: "search",
      feature: "copy",
      order: 3,
      fixed: true,
      sorter: { multiple: 18 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Acct Number").length > 0) ? filteredValue.sort.filter((value) => value.field == "Acct Number")[0].order : null,
      ...getColumnSearchProps("Acct Number"),
      filteredValue: filteredValue['Acct Number'] || null,
    },
    {
      title: "Status",
      name: "Status",
      dataIndex: "Status",
      key: "Status",
      width: 180,
      order: 4,
      fixed: true,
      status: true,
      type: "filter",
      feature: "select",
      filters: filters['Status'],
      filterSearch: true,
      filteredValue:filteredValue['Status'] || null,
     
    },
    {
      title: "Recoupment Rationale",
      name: "Recoupment Rationale",
      dataIndex: "Recoupment Rationale",
      key: "Recoupment Rationale",
      width: 150,
      order: 5,
      feature: "select1",
      type: "filter",
      filters: filters['RecoupmentRationale'],
      filterSearch: true,
      filteredValue: filteredValue['Recoupment Rationale'] || null,
    },
    {
      title: "Internal Number",
      name: "Internal Number",
      dataIndex: "Internal Number",
      key: "Internal Number",
      width: 130,
      order: 6,
      type: "filter",
      filters: filters['InternalNumber'],
      filteredValue: filteredValue['Internal Number'] || null,
      sorter: { multiple: 3 },
      filterSearch: true,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Internal Number").length > 0) ? filteredValue.sort.filter((value) => value.field == "Internal Number")[0].order : null
    },
    
 
    {
      title: "DOS From",
      name: "DOS From",
      dataIndex: "DOS From",
      key: "DOS From",
      width: 140,
      order: 7,
      type: "date",
      sorter: { multiple: 12 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DOS From").length > 0) ? filteredValue.sort.filter((value) => value.field == "DOS From")[0].order : null,
      ...getColumnSearchProps("DOS From"),
      filteredValue: filteredValue['DOS From'] || null,
    },
    {
      title: "DOS To",
      name: "DOS To",
      dataIndex: "DOS To",
      key: "DOS To",
      width: 140,
      order: 8,
      type: "date",
      sorter: { multiple: 21 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DOS To").length > 0) ? filteredValue.sort.filter((value) => value.field == "DOS To")[0].order : null,
      ...getColumnSearchProps("DOS To"),
      filteredValue: filteredValue['DOS To'] || null,
    },
    {
      title: "CPT/J/HCPCS",
      name: "CPT/J/HCPCS",
      dataIndex: "CPT/J/HCPCS",
      key: "CPT/J/HCPCS",
      width: 160,
      order: 9,
      feature: "tooltip",
      type: "search",
      sorter: { multiple: 23 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CPT/J/HCPCS").length > 0) ? filteredValue.sort.filter((value) => value.field == "CPT/J/HCPCS")[0].order : null,
      ...getColumnSearchProps("CPT/J/HCPCS"),
      filteredValue: filteredValue['CPT/J/HCPCS'] || null,
    },
    {
      title: "Paid Amount",
      name: "Paid Amount",
      dataIndex: "Paid Amount",
      key: "Paid Amount",
      width: 140,
      order: 10,
      type: "search",
      feature: 'dollor',
      sorter: { multiple: 26 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Paid Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "Paid Amount")[0].order : null,
      ...getColumnSearchProps("Paid Amount"),
      filteredValue: filteredValue['Paid Amount'] || null,
    },
    {
      title: "Expected Amount",
      name: "Expected Amount",
      dataIndex: "Expected Amount",
      key: "Expected Amount",
      width: 140,
      type: "search",
      order: 11,
      feature: 'dollor',
      sorter: { multiple: 26 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Expected Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "Expected Amount")[0].order : null,
      ...getColumnSearchProps("Expected Amount"),
      filteredValue: filteredValue['Expected Amount'] || null,
    },
    {
      title: "Recouped Amount",
      name: "Recouped Amount",
      dataIndex: "Recouped Amount",
      key: "Recouped Amount",
      width: 160,
      order: 12,
      type: "search",
      feature: 'dollor',
      sorter: { multiple: 27 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Recouped Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "Recouped Amount")[0].order : null,
      ...getColumnSearchProps("Recouped Amount"),
      filteredValue: filteredValue['Recouped Amount'] || null,
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
      order: 12,
      filters: filters['OpenClosed'],
      filteredValue: filteredValue['Open/Closed'] || null,
      sorter: { multiple: 27 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Open/Closed").length > 0) ? filteredValue.sort.filter((value) => value.field == "Open/Closed")[0].order : null,
      
    }: 
    {  name: "Open/Closed", dataIndex: "Open/Closed", order: 12}
    ),
    {
      title: "RAC Due Date",
      name: "RAC Due Date",
      dataIndex: "RAC Due Date",
      key: "RAC Due Date",
      width: 130,
      order: 13,
      type: "date",
      sorter: { multiple: 17 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "RAC Due Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "RAC Due Date")[0].order : null,
      ...getColumnSearchProps("RAC Due Date"),
      filteredValue: filteredValue['RAC Due Date'] || null,
    },
    {
      title: "Compliance Due Date",
      name: "Compliance Due Date",
      dataIndex: "Compliance Due Date",
      key: "Compliance Due Date",
      width: 160,
      order: 14,
      type: "date",
      sorter: { multiple: 5 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Compliance Due Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Compliance Due Date")[0].order : null,
      ...getColumnSearchProps("Compliance Due Date"),
      filteredValue: filteredValue['Compliance Due Date'] || null,
    },
    {
      title: "Appeals Due Date",
      name: "Appeals Due Date",
      dataIndex: "Appeals Due Date",
      key: "Appeals Due Date",
      width: 160,
      order: 15,
      type: "date",
      sorter: { multiple: 5 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Appeals Due Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Appeals Due Date")[0].order : null,
      ...getColumnSearchProps("Appeals Due Date"),
      filteredValue: filteredValue['Appeals Due Date'] || null,
    },
   

    {
      title: "Days till Due Date",
      name: "Days till Due Date",
      dataIndex: "Days till Due Date",
      key: "Days till Due Date",
      width: 130,
      type: "search",
      order: 16,

      sorter: { multiple: 7 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Days till Due Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Days till Due Date")[0].order : null,
      ...getColumnSearchProps("Days till Due Date"),
      filteredValue: filteredValue['Days till Due Date'] || null,
    },
    {
      title: "Date ADR Submitted to CMS",
      name: "Date ADR Submitted to CMS",
      dataIndex: "Date ADR Submitted to CMS",
      key: "Date ADR Submitted to CMS",
      width: 220,
      type: "date",
      order: 17,

      sorter: { multiple: 8 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date ADR Submitted to CMS").length > 0) ? filteredValue.sort.filter((value) => value.field == "Date ADR Submitted to CMS")[0].order : null,
      ...getColumnSearchProps("Date ADR Submitted to CMS"),
      filteredValue: filteredValue['Date ADR Submitted to CMS'] || null,
    },
    {
      title: "No. Of Claims",
      name: "No. Of Claims",
      dataIndex: "Number of Claims",
      key: "Number of Claims",
      width: 120,
      order: 18,

      type: "search",
      feature: "number",
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Number of Claims").length > 0) ? filteredValue.sort.filter((value) => value.field == "Number of Claims")[0].order : null,
      ...getColumnSearchProps("Number of Claims"),
      filteredValue: filteredValue['Number of Claims'] || null,
    },
    {
      title: "Notes",
      name: "Notes",
      type: "search",
      width: 100,
      order: 19,

      dataIndex: "Notes",
      feature: "pencil",
      ...getColumnSearchProps("Notes"),
      filteredValue: filteredValue['Notes'] || null
    },
    {
      title: "Closed Date",
      name: "Closed Date",
      dataIndex: "Closed Date",
      key: "Closed Date",
      width: 160,
      order: 20,

      type: "date",
      feature: 'date',
      sorter: { multiple: 10 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Closed Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Closed Date")[0].order : null,
      ...getColumnSearchProps("Closed Date"),
      filteredValue: filteredValue['Closed Date'] || null,
    },
    {
      title: "Date Rec'd",
      name: "Date Rec'd",
      dataIndex: "Date Rec'd",
      key: "Date Rec'd",
      width: 150,
      order: 21,

      type: "date",
      ...getColumnSearchProps("Date Rec'd"),
      filteredValue: filteredValue["Date Rec'd"] || null,
      sorter: { multiple: 11 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date Rec'd").length > 0) ? filteredValue.sort.filter((value) => value.field == "Date Rec'd")[0].order : null
    },

    {
      title: "Demand Letter Date",
      name: "Demand Letter Date",
      dataIndex: "Demand Letter Date",
      key: "Demand Letter Date",
      width: 140,
      order: 22,
      type: "date",
      ...getColumnSearchProps("Demand Letter Date"),
      filteredValue: filteredValue["Demand Letter Date"] || null,
      sorter: { multiple: 12 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Demand Letter Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Demand Letter Date")[0].order : null
    },
    {
      title: "Letter Ref Number",
      name: "Letter Ref Number",
      dataIndex: "Letter Ref Number",
      key: "Letter Ref Number",
      width: 220,
      order: 23,
      type: "search",
      sorter: { multiple: 13 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Letter Ref Number").length > 0) ? filteredValue.sort.filter((value) => value.field == "Letter Ref Number")[0].order : null,
      ...getColumnSearchProps("Letter Ref Number"),
      filteredValue: filteredValue['Letter Ref Number'] || null,
    },

    {
      title: "HMS Audit ID",
      name: "HMS Audit ID",
      dataIndex: "HMS Audit ID",
      key: "HMS Audit ID",
      width: 160,
      order: 24,
      type: "search",
      sorter: { multiple: 14 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "HMS Audit ID").length > 0) ? filteredValue.sort.filter((value) => value.field == "HMS Audit ID")[0].order : null,
      ...getColumnSearchProps('HMS Audit ID'),
      filteredValue: filteredValue['HMS Audit ID'] || null,
    },
    {
      title: "RAC Case Number",
      name: "RAC Case Number",
      dataIndex: "RAC Case Number",
      key: "RAC Case Number",
      width: 140,
      order: 25,
      type: "search",
      feature: "string",
      sorter: { multiple: 15 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "RAC Case Number").length > 0) ? filteredValue.sort.filter((value) => value.field == "RAC Case Number")[0].order : null,
      ...getColumnSearchProps("RAC Case Number"),
      filteredValue: filteredValue['RAC Case Number'] || null,
    },
   
    {
      title: "Claim Number",
      name: "Claim Number",
      dataIndex: "Claim Number",
      key: "Claim Number",
      width: 180,
      type: "search",
      feature: "copy",
      order: 26,
      sorter: { multiple: 17 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Claim Number").length > 0) ? filteredValue.sort.filter((value) => value.field == "Claim Number")[0].order : null,
      ...getColumnSearchProps("Claim Number"),
      filteredValue: filteredValue['Claim Number'] || null,
    },
  
    {
      title: "MRN",
      name: "MRN",
      dataIndex: "MRN",
      key: "MRN",
      width: 120,
      order: 27,
      type: "search",
      feature: "copy",

      sorter: { multiple: 19 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "MRN")[0].order : null,
      ...getColumnSearchProps("MRN"),
      filteredValue: filteredValue['MRN'] || null,
    },
    
    {
      title: "CPT Charge Amount",
      name: "CPT Charge Amount",
      dataIndex: "CPT Charge Amount",
      key: "CPT Charge Amount",
      width: 160,
      order: 28,
      type: "search",
      feature: "dollor",
      sorter: { multiple: 22 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CPT Charge Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "CPT Charge Amount")[0].order : null,
      ...getColumnSearchProps("CPT Charge Amount"),
      filteredValue: filteredValue['CPT Charge Amount'] || null,
    },
    
    {
      title: "Drug/Procedure",
      name: "Drug/Procedure",
      dataIndex: "Drug/Procedure",
      key: "Drug/Procedure",
      width: 180,
      order: 29,
      type: "filter",
      sorter: { multiple: 24 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Drug/Procedure").length > 0) ? filteredValue.sort.filter((value) => value.field == "Drug/Procedure")[0].order : null,
      filters: filters['DrugProcedure'],
      filterSearch: true,
      filteredValue: filteredValue['DrugProcedure'] || null,
    },

    {
      title: "FILE AND RESOLVE",
      name: "FILE AND RESOLVE",
      dataIndex: "FILE AND RESOLVE",
      key: "FILE AND RESOLVE",
      width: 200,
      order: 30,
      type: "search",
      sorter: { multiple: 25 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FILE AND RESOLVE").length > 0) ? filteredValue.sort.filter((value) => value.field == "FILE AND RESOLVE")[0].order : null,
      ...getColumnSearchProps("FILE AND RESOLVE"),
      filteredValue: filteredValue['FILE AND RESOLVE'] || null,
    },

   
   
    {
      title: "User",
      name: "User",
      dataIndex: "User",
      key: "User",
      width: 140,
      type: "filter",
      order: 31,

      sorter: { multiple: 27},
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
      order: 32,

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
      order: 33,

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
  

  const deleteConfig = {
    title: modalTitle,
    openModal,
    handleCancel,
    style: {
      minWidth: "800px",
      minHeight: "autopx",
      display: "inline-grid"
    }
  };

  const addEditModalConfig = {
    title: modalTitle,
    openModal: openRACModal,
    handleCancel,
    width: 1000,
    height: 'auto',
    minHeight: 'auto'
  };


  const onKeyUp = (a) => {
  }


  const changeOpenClosed = (value) => {
    // console.log(value)
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
  const RACModal = (
    <Form
      name="basic"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      onFinish={onEditRACItem}
      // onFinishFailed={onEditFailed}
      autoComplete="off"
      form={editRACForm}
    >

      <Row gutter={[24, 24]} style={{rowGap: "0px"}}>
      <Col span={8}></Col>
      <Col span={8}></Col>

      <Col span={8}>
        {modalType == 'EDIT' ?
        <div>

        <p>All</p>
        <Form.Item
          label=""
          name="All"
        >
          <Select >
            <Option value="Yes">Yes</Option>
            <Option value="No">No</Option>

          </Select>
          
        </Form.Item>
      </div>
      : null
      }
        

        </Col>
      <Col span={8}>
          <p>No. of Claims</p>
          <Form.Item
            label=""
            name="Number of Claims"
          >

            <Input type="number" placeholder="No. of Claims"/>
          </Form.Item>
        </Col>


        <Col span={8}>
          <p>Internal Number</p>
          <Form.Item
            label=""
            name="Internal Number"
          >
            <Input placeholder="Internal Number" />
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
            filterOption={(input, option) =>  {

              if(option.children != "null" && option.children != null ) {
               return  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0

              }
            }
            }
            onChange={changeOpenClosed}
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
          <p>RAC Due Date</p>
          <Form.Item
            label=""
            name="RAC Due Date"
          >
            {
              RAC_Due_Date ?
                <DatePicker  className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(RAC_Due_Date, dateFormat)} onChange={(d, date) => onDateChanges('RAC_Due_Date', date)} />
                :
                <DatePicker  className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker}   onChange={(d, date) => onDateChanges('RAC_Due_Date', date)}  />
            }

            <span className="ant-form-item-explain">{errors.RAC_Due_Date}</span>

          </Form.Item>

        </Col>

        <Col span={8}>
          <p>Compliance Due Date</p>
          <Form.Item
            label=""
            name="Compliance Due Date"
          >

            {
              Compliance_Due_Date ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} defaultValue={moment(Compliance_Due_Date, dateFormat)} onChange={(d, date) => onDateChanges('Compliance_Due_Date', date)} />
                :
                <DatePicker className="w-100"  placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Compliance_Due_Date', date)} />
            }

            <span className="ant-form-item-explain">{errors.Compliance_Due_Date}</span>

          </Form.Item>
        </Col>


        <Col span={8}>
          <p>Date Rec'd</p>
          <Form.Item
            label=""
            name="Date Rec'd"
          >

            {
              Date_Recd ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} defaultValue={moment(Date_Recd, dateFormat)} onChange={(d, date) => onDateChanges('Date_Recd', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Date_Recd', date)} />
            }

            <span className="ant-form-item-explain">{errors.Date_Recd}</span>

          </Form.Item>
        </Col>

       

        <Col span={8}>
          <p>Status</p>
          <Form.Item
            label=""
            name="Status"
            
          >

            <Select placeholder="Status" 
             showSearch
             optionFilterProp="children"
             onChange={(value) => handleChangeStatus1(value)}
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
          <p>Demand Letter Date</p>
          <Form.Item
            label=""
            name="Demand Letter Date"
          >

            {
              Demand_Letter_Date ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} defaultValue={moment(Demand_Letter_Date, dateFormat)} onChange={(d, date) => onDateChanges('Demand_Letter_Date', date)} />
                :
                <DatePicker className="w-100"  placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker}  onChange={(d, date) => onDateChanges('Demand_Letter_Date', date)} />
            }

            <span className="ant-form-item-explain">{errors.Demand_Letter_Date}</span>

          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Letter Ref Number</p>
          <Form.Item
            label=""
            name="Letter Ref Number"
          >

            <Input />
          </Form.Item>
        </Col>
       
        

            <Divider/>


            <Col span={8}>
          <p>Appeals Due Date</p>
          <Form.Item
            label=""
            name="Appeals Due Date"
          >

            {
              Appeals_Due_Date ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} defaultValue={moment(Appeals_Due_Date, dateFormat)} onChange={(d, date) => onDateChanges('Appeals_Due_Date', date)} />
                :
                <DatePicker className="w-100"  placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Appeals_Due_Date', date)} />
            }

            <span className="ant-form-item-explain">{errors.Appeals_Due_Date}</span>

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
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} defaultValue={moment(DOS_From, dateFormat)} onChange={(d, date) => onDateChanges('DOS_From', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker}  onChange={(d, date) => onDateChanges('DOS_From', date)} />
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
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} defaultValue={moment(DOS_To, dateFormat)} onChange={(d, date) => onDateChanges('DOS_To', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker}  onChange={(d, date) => onDateChanges('DOS_To', date)} />
            }

            <span className="ant-form-item-explain">{errors.DOS_To}</span>

          </Form.Item>
        </Col>

         
     
        <Col span={8}>
          <p>Date ADR Submitted to CMS</p>
          <Form.Item
            label=""
            name="Date ADR Submitted to CMS"
          >

            {
              Date_ADR_Submitted_to_CMS ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} defaultValue={moment(Date_ADR_Submitted_to_CMS, dateFormat)} onChange={(d, date) => onDateChanges('Date_ADR_Submitted_to_CMS', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"   format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Date_ADR_Submitted_to_CMS', date)} />
            }

            <span className="ant-form-item-explain">{errors.Date_ADR_Submitted_to_CMS}</span>

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
                <DatePicker className="w-100"  placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker} defaultValue={moment(Closed_Date, dateFormat)} onChange={(d, date) => onDateChanges('Closed_Date', date)} />
                :
                showClosedDate ? 

                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY"  format={dateFormatDatePicker}  onChange={(d, date) => onDateChanges('Closed_Date', date)} />
                : 
                null
              }

            <span className="ant-form-item-explain">{errors.Closed_Date}</span>

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
          <p>HMS Audit ID</p>
          <Form.Item
            label=""
            name="HMS Audit ID"
          >

            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>RAC Case Number</p>
          <Form.Item
            label=""
            name="RAC Case Number"
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
          <p>Acct Number</p>
          <Form.Item
            label=""
            name="Acct Number"
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
          <p>CPT Charge Amount</p>
          <Form.Item
            label=""
            name="CPT Charge Amount"
          >

            <Input type="number" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>CPT/J/HCPCS</p>
          <Form.Item
            label=""
            name="CPT/J/HCPCS"
          >

            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Drug Procedure</p>
          <Form.Item
            label=""
            name="Drug/Procedure"
          >

            <Select
             placeholder="Drug/Procedure" 
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
                  <Typography.Link onClick={(e) => addItem(e,'DrugProcedure') } style={{ whiteSpace: 'nowrap' }}>
                    <PlusOutlined /> Add item
                  </Typography.Link>
                </Space>
              </>
            )}
             
             >

              {
                filters && filters['DrugProcedure'] && filters['DrugProcedure'].filter((value) => value.value != "").map((status) => {
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

            <Input type={"number"}/>
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Expected Amount</p>
          <Form.Item
            label=""
            name="Expected Amount"
          >

            <Input type={"number"}/>
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Recouped Amount</p>
          <Form.Item
            label=""
            name="Recouped Amount"

          >

            <Input type={"number"}/>
          </Form.Item>
        </Col>

      </Row>

    <Form.Item wrapperCol={{ offset: 15 }} style={{ marginBottom: "-10px", textAlign:"end" }}>
      
     
        <Button type="primary" htmlType="submit" className="mr-3" >
          {modalType == 'ADD' ? 'Add': 'Update'}
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
            modalType == "EDIT" ?
              RACModal : null
          }
          {
            modalType == "ADD" ?
              RACModal : null
          }
       

        </Modals>

        <SortModal config={sortModalConfig} ></SortModal>

      </div>
    )
  } else {
    return ""
  }



}


