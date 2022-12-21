
import React, { useState, useRef } from "react";

import RACTableModule from "@/modules/RACTableModule";
import { Table, Input, Button, Space, Form, Row, Col, Select, Divider, Typography, DatePicker, notification } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, EyeFilled, EyeOutlined, PlusOutlined } from "@ant-design/icons";
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
import { formatDateTime, getDate } from "@/utils/helpers";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Config from "@/components/Editor"

import SortModal from "@/components/Sorter";
import { GetSortOrder } from "@/utils/helpers";




const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ADR() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openEditableModal, setOpenEditableModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [selectedId, setSelectedId] = useState("");
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const [workProgress, setWorkProgress] = useState([]);
  const [filteredValue, setFilteredValue] = useState({})
  const [filters, setFilters] = useState([])
  const dateFormat = 'YYYY/MM/DD';
  const dateFormatDatePicker = ['MM/DD/YYYY', 'MM-DD-YYYY']
  const [ADR_Due_Date, set_ADR_Due_Date] = useState();
  const [Date_ADR_Submitted_to_Noridian, set_Date_ADR_Submitted_to_Noridian] = useState();
  const [Closed_Date, set_Closed_Date] = useState();
  const [Date_ADR_Recd, set_Date_ADR_Recd] = useState();
  const [Demand_Letter_Date, set_Demand_Letter_Date] = useState();
  const [DOS_From, set_DOS_From] = useState();
  const [DOS_To, set_DOS_To] = useState();
  const [showClosedDate, setShowClosedDate] = useState(true)
  const [tabs, setTabs] = useState([])

  const [ID, setID] = useState("");
  var [value, setValue] = useState("");
  const editor = useRef();

  const [errors, setErrors] = useState({})
  const [hasErrors, setHasErrors] = useState(false)
  const [hasFilters, setHasFiters] = useState(false)
  const [department, setDepartment] = useState([])
  const [name, setName] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [rStatus, setRStatus] = useState([])
  const [status, setStatus] = useState('Open');
  const [recoupmentRationale, setRecoupmentRationale] = useState([])

  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])
  

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
      request.create('rac_status', {Name: name, ADR: 'Y'})


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

  const getSunEditorInstance = (sunEditor) => {
    editor.current = sunEditor;
  };


  const handleChange = (content) => {
    setValue(content)
  }


  var usDate = getDate()

  const [editableForm] = Form.useForm();



  const currentDate = usDate
  const { current } = useSelector(selectAuth);


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
        ADR: 'Y'
      })
    });

    setRStatus(result)
  }

  const getrecoupmentRationale = async () => {
    const {result} = await request.list("recoupmentrationale");
    setRecoupmentRationale(result)
  } 

  const getFilters = async (value) => {
    if (value['Open/Closed'].value) {
      value['Open/Closed']  = (value['Open/Closed'].value)
    } 

    const filters = await request.list("adr-filters", { filter: JSON.stringify(value['Open/Closed']) });
    let Patient = ([...new Set(filters.result['Patient'].sort())].map((value) => ({ text: value['Patient Name'], value: value['Patient Name'] })))
    let Status = ([...new Set(filters.result['Status'].sort())].map((value) => ({ text: value['Status'], value: value['Status'] })))
    let Description = ([...new Set(filters.result['Description'].sort())].map((value) => ({ text: value['Description'], value: value['Description'] })))
    let ARDREASONCODE = ([...new Set(filters.result['ARDREASONCODE'].sort())].map((value) => ({ text: value['ADR Reason Code'], value: value['ADR Reason Code'] })))
    let CPT = ([...new Set(filters.result['CPT'].sort())].map((value) => ({ text: value['CPT'], value: value['CPT'] })))
    let MD = ([...new Set(filters.result['MD'].sort())].map((value) => ({ text: value['MD'], value: value['MD'] })))
    let ServiceType = ([...new Set(filters.result['ServiceType'].sort())].map((value) => ({ text: value['Service Type'], value: value['Service Type'] })))
    let User = ([...new Set(filters.result['User'].sort())].map((value) => ({ text: value['User'], value: value['User'] })))
    let OpenClosed = ([...new Set(filters.result['OpenClosed'].sort())].map((value) => ({ text: value['Open/Closed'], value: value['Open/Closed'] })))
    let InternalNumber = ([...new Set(filters.result['InternalNumber'].sort())].map((value) => ({ text: value['Internal Number'], value: value['Internal Number'] })))
    let RecoupmentRationale = ([...new Set(filters.result['RecoupmentRationale'].sort())].map((value) => ({ text: value['Recoupment Rationale'], value: value['Recoupment Rationale'] })))

    if (tabs.length != OpenClosed.length) {
      setTabs(OpenClosed.reverse())
    }

    let Obj = {
      Patient,
      Status,
      Description,
      ARDREASONCODE,
      CPT,
      MD,
      ServiceType,
      User,
      OpenClosed,
      InternalNumber,
      RecoupmentRationale

    }

    console.log(Obj)
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


  const entity = "adr";

  const onhandleSave = (data) => {
    let obj = {}

    if (selectedValue == 'Notes') {
      obj = { notes: data.Notes }
    } else {
      obj = { Findings: data.Findings }

    }
    dispatch(crud.update(entity, data.ID, obj))
    setReload(false)
    setTimeout(() => setReload(true), 1000)
  }


  const onNotesAction = (id, status) => {

    let item = items.filter((item) => item.ID == id)[0]

    // dispatch(crud.create(loggerEntity, { IDWQ1075: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
  }


  const openEditModal = (value, id) => {

    let row = items.filter(item => item.ID == id)[0];

    setSelectedId(id);
    setModalType("EDIT");
    setSelectedValue(value)

    if (value == 'Notes') {
      // editForm.setFieldsValue({
      //   Notes: row.Notes
      // })

      setSelectedId(id);
      setValue(null)
      setTimeout(() => {
        setValue(row.Notes ? row.Notes : " ")
      }, 10)
    } else {

      setSelectedId(id);
      setValue(null)
      setTimeout(() => {
        setValue(row.Notes ? row.Notes : " ")
      }, 10)
      
      editForm.setFieldsValue({
        Notes: row.Findings
      })
    }


    setModalTitle("Edit " + value);
    setOpenModal(true)
    onNotesAction(id, 'Edit ' + value)

  }


  const getFilterValue = (values) => {
    setFilteredValue(values)
    getFilters(values)
  }


  const openAddModal = (value, id) => {

    let row = items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setSelectedValue(value)
    setModalType("VIEW");
    setModalTitle("View " + value);
    setOpenModal(true);
  }

  const handleCancel = () => {
    setModalTitle("");
    setOpenModal(false);
    setOpenEditableModal(false);
    set_ADR_Due_Date(null)
    set_Date_ADR_Submitted_to_Noridian(null)
    set_Closed_Date(null)
    set_Date_ADR_Recd(null)
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
      editableForm.setFieldsValue({
        'Open/Closed' : 'Closed' 
      })
    } else {
      editableForm.setFieldsValue({
        'Open/Closed' : 'Open' 
      })
    }
  }


  const onEditItem = () => {
   
    onhandleSave({ ID: selectedId, Notes: value, Findings: value })
    setOpenModal(false)
  }

  const onDateChanges = (entity, date) => {
    delete errors[entity]

    if (entity == 'ADR_Due_Date') {
      set_ADR_Due_Date(date)
    } else if (entity == "Date_ADR_Submitted_to_Noridian") {
      set_Date_ADR_Submitted_to_Noridian(date)
    } else if (entity == "Closed_Date") {
      editableForm.setFieldsValue({
        'Open/Closed' : 'Closed' 
      })
      set_Closed_Date(date) 
    } else if (entity == "Date_ADR_Recd") {
      set_Date_ADR_Recd(date)
    } else if (entity == "Demand_Letter_Date") {
      set_Demand_Letter_Date(date)
    } else if (entity == "DOS_From") {
      set_DOS_From(date)
    } else if (entity == "DOS_To") {
      set_DOS_To(date)
    }
  }

  const onEditADRItem = async (value) => {



    value['ADR Due Date'] = formatDateTime(ADR_Due_Date)
    value['Date ADR Submitted to Noridian'] = formatDateTime(Date_ADR_Submitted_to_Noridian)
    value['Closed Date'] = formatDateTime(Closed_Date)
    value["Date ADR Rec'd"] = formatDateTime(Date_ADR_Recd)
    value['Demand Letter Date'] = formatDateTime(Demand_Letter_Date)
    value['DOS From'] = formatDateTime(DOS_From)
    value['DOS To'] = formatDateTime(DOS_To)

    setReload(false)
    if (modalType == 'EDIT') {
      await request.update(entity, selectedId, value)
      notification.success({ message: "NN updated successfully!" })
    } else {
      await request.create(entity, value)
      notification.success({ message: "ADR added successfully!" })
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
                />
                : null
            }

          </div>
        }
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 18 }} className="text-end" style={{ marginBottom: "-10px" }}>

        <Button type="primary" htmlType="submit" className="mr-3" >
          Update
        </Button>
      </Form.Item>
    </Form>
  )

  const panelTitle = "ADR";
  const dataTableTitle = "ADR";

  const onWorkSaved = async (amount) => { }

  const openingModal = (row) => {

    editableForm.resetFields()

    if (row) {
      setModalType("EDIT");
      setSelectedId(row.ID)

      editableForm.setFieldsValue({
        'Internal Number': row['Internal Number'],
        'Open/Closed': row['Open/Closed'],
        'Status': row['Status'],
        'Recoupment Rationale': row['Recoupment Rationale'],
        'Days till Due Date': row['Days till Due Date'],
        'Patient Name': row['Patient Name'],
        'Claim Number': row['Claim Number'],
        'HAR No.': row['HAR No.'],
        'MRN': row['MRN'],
        'Claims Number': row['Claims Number'],
        'ADR Reason Code': row['ADR Reason Code'],
        'Total Charges': row['Total Charges'],
        'Service Type': row['Service Type'],
        'Description': row['Description'],
        'MD': row['MD'],
        'Findings': row['Findings'],
        'FILE AND RESOLVE': row['FILE AND RESOLVE'],
        'Recouped Amount': row['Recouped Amount'],
        'Denied Amount': row['Denied Amount'],
        'Expected Amount': row['Expected Amount'],
        'CPT': row['CPT']
      })

      set_ADR_Due_Date(row['ADR Due Date'] ? row['ADR Due Date'].split('T')[0] : "")
      set_Closed_Date(row['Closed Date'] ? row['Closed Date'].split('T')[0] : "")
      set_Date_ADR_Recd(row["Date ADR Rec'd"] ? row["Date ADR Rec'd"].split('T')[0] : "")
      set_Demand_Letter_Date(row['Demand Letter Date'] ? row['Demand Letter Date'].split('T')[0] : "")
      set_DOS_From(row['DOS From'] ? row['DOS From'].split('T')[0] : "")
      set_DOS_To(row['DOS To'] ? row['DOS To'].split('T')[0] : "")
      set_Date_ADR_Submitted_to_Noridian(row['Date ADR Submitted to Noridian'] ? row['Date ADR Submitted to Noridian'].split('T')[0] : "")

      setModalTitle("Edit ADR");
      setOpenEditableModal(true)

    }
    else {
      setModalType("ADD");
      setModalTitle("Add ADR");

      editableForm.setFieldsValue({
        'Open/Closed': 'Open'
        
      })
      setOpenEditableModal(true)
    }
  }

  const confirmModal = (row) => {
    setSelectedRow(row)
    setSelectedId(row.ID)
    setModalTitle("Archive ADR");
    setModalType("Archive");
    setOpenModal(true);
  }

  const onArchive = async () => {
    let archive = selectedRow['Archive'] ? 0 : 1
    setReload(false)

    await dispatch(crud.update(entity + "-archive", selectedId, { value: archive }))
    setReload(true)
    handleCancel()
  }

  const onChangeDate = async( column, value, selectedId) => {
  
    let obj = {}
    obj[column] = value
    obj['Open/Closed'] = 'Closed'
    setReload(false)
    await dispatch(crud.update(entity, selectedId, obj))
    setReload(true)
  
  }

  const deleteModal = (
    <div>
      <p>{selectedRow['Archive'] ? "Unarchive" : "Archive"} RAC {selectedRow.ID} ?</p>
      <div className="text-right mb-2">
        <Button type="danger" onClick={onArchive}>{selectedRow['Archive'] ? "Unarchive" : "Archive"}</Button>
      </div>
    </div>
  )

  // View Modal
  const viewModal = (
    <Row gutter={[24, 24]} style={{ marginBottom: "50px" }}>

      <Col className="gutter-row" span={24} dangerouslySetInnerHTML={{ __html: selectedValue == 'Notes' ? selectedRow.Notes : selectedRow.Findings }}>


      </Col>
    </Row>
  )


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
      order: 2,
      sorter: { multiple: 16 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient Name").length > 0) ? filteredValue.sort.filter((value) => value.field == "Patient Name")[0].order : null,
      filters: filters['Patient'],
      filterSearch: true,
      filteredValue: filteredValue['Patient Name'] || null,
    },

   
    {
      title: "HAR No.",
      name: "HAR No.",
      dataIndex: "HAR No.",
      key: "HAR No.",
      width: 140,
      type: "search",
      feature: "copy", 
      fixed: true,
      order: 3,
      sorter: { multiple: 17 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "HAR No.").length > 0) ? filteredValue.sort.filter((value) => value.field == "HAR No.")[0].order : null,
      ...getColumnSearchProps("HAR No."),
      filteredValue: filteredValue['HAR No.'] || null,
    },
    {
      title: "Status",
      name: "Status",
      dataIndex: "Status",
      key: "Status",
      width: 150,
      feature: "select",
      type: "filter",
      feature: "select",
      fixed: true,
      order: 4,

      filters: filters['Status'],
      filterSearch: true,
      filteredValue: filteredValue['Status'] || null,
    },
   
    {
      title: "Recoupment Rationale",
      name: "Recoupment Rationale",
      dataIndex: "Recoupment Rationale",
      key: "Recoupment Rationale",
      width: 150,
      feature: "select1",
      type: "filter",
      order: 5,
      filters: filters['RecoupmentRationale'],
      filterSearch: true,
      filteredValue: filteredValue['Recoupment Rationale'] || null,
    },
    {
      title: "Internal Number",
      name: "Internal Number",
      dataIndex: "Internal Number",
      key: "Internal Number",
      width: 120,
      type: "none",
      order: 6,
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
      type: "date",
      order: 7,
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
      type: "date",
      order: 8,
      sorter: { multiple: 21 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "DOS To").length > 0) ? filteredValue.sort.filter((value) => value.field == "DOS To")[0].order : null,
      ...getColumnSearchProps("DOS To"),
      filteredValue: filteredValue['DOS To'] || null,
    },
    {
      title: <span style={{ color: "#a20000" }}>Total Charges </span>,
      name: "Total Charges",
      dataIndex: "Total Charges",
      key: "Total Charges",
      width: 160,
      type: "search",
      order: 9,
      feature: "dollor",
      sorter: { multiple: 23 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Total Charges").length > 0) ? filteredValue.sort.filter((value) => value.field == "Total Charges")[0].order : null,
      ...getColumnSearchProps("Total Charges"),
      filteredValue: filteredValue['Total Charges'] || null,
    },
    {
      title: "CPT",
      name: "CPT",
      dataIndex: "CPT",
      key: "CPT",
      width: 100,
      order: 10,
      feature: "tooltip",
      sorter: { multiple: 24 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CPT").length > 0) ? filteredValue.sort.filter((value) => value.field == "CPT")[0].order : null,
      filters: filters['CPT'],
      filterSearch: true,
      filteredValue: filteredValue['CPT'] || null,
    },
    {
      title: "Expected Amount",
      name: "Expected Amount",
      dataIndex: "Expected Amount",
      key: "Expected Amount",
      width: 200,
      type: "search",
      order: 11,
      feature: "dollor",
      sorter: { multiple: 26 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Expected Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "Expected Amount")[0].order : null,
      ...getColumnSearchProps("Expected Amount"),
      filteredValue: filteredValue['Expected Amount'] || null,
    },
    {
      title: "Denied Amount",
      name: "Denied Amount",
      dataIndex: "Denied Amount",
      key: "Denied Amount",
      width: 200,
      type: "search",
      order: 12,
      feature: "dollor",
      sorter: { multiple: 26 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Denied Amount").length > 0) ? filteredValue.sort.filter((value) => value.field == "Denied Amount")[0].order : null,
      ...getColumnSearchProps("Denied Amount"),
      filteredValue: filteredValue['Denied Amount'] || null,
    },
   
    (status == 'ALL' ?
    {
      title: "Open / Closed",
      name: "Open / Closed",
      dataIndex: "Open/Closed",
      key: "Open/Closed",
      width: 120,
      order: 13,
      type: "none",
      filters: filters['OpenClosed'],
      filteredValue: filteredValue['Open/Closed'] || null,
      sorter: { multiple: 27 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Open/Closed").length > 0) ? filteredValue.sort.filter((value) => value.field == "Open/Closed")[0].order : null,
    }: 
    {name: "Open / Closed" , dataIndex: "Open/Closed" , order: 13}
    ),

    {
      title: "ADR Due Date",
      name: "ADR Due Date",
      dataIndex: "ADR Due Date",
      key: "ADR Due Date",
      width: 140,
      order: 14,
      type: "date",
      sorter: { multiple: 17 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "ADR Due Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "ADR Due Date")[0].order : null,
      ...getColumnSearchProps("ADR Due Date"),
      filteredValue: filteredValue['ADR Due Date'] || null,
    },
   
    {
      title: "Days till Due Date",
      name: "Days till Due Date",
      dataIndex: "Days till Due Date",
      key: "Days till Due Date",
      width: 130,
      type: "search",
      order: 15,
      sorter: { multiple: 7 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Days till Due Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Days till Due Date")[0].order : null,
      ...getColumnSearchProps("Days till Due Date"),
      filteredValue: filteredValue['Days till Due Date'] || null,
    },
    {
      title: "Date ADR Submitted to Noridian",
      name: "Date ADR Submitted to Noridian",
      dataIndex: "Date ADR Submitted to Noridian",
      key: "Date ADR Submitted to Noridian",
      width: 205,
      type: "date",
      sorter: { multiple: 8 },
      order: 16,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date ADR Submitted to Noridian").length > 0) ? filteredValue.sort.filter((value) => value.field == "Date ADR Submitted to Noridian")[0].order : null,
      ...getColumnSearchProps("Date ADR Submitted to Noridian"),
      filteredValue: filteredValue['Date ADR Submitted to Noridian'] || null,
    },

    {
      title: "Notes",
      name: "Notes",
      type: "search",
      width: 100,
      order: 17,
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
      type: "date",
      order: 18,
      feature: 'date',
      sorter: { multiple: 10 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Closed Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Closed Date")[0].order : null,
      ...getColumnSearchProps("Closed Date"),
      filteredValue: filteredValue['Closed Date'] || null,
    },
    {
      title: "Date ADR Rec'd",
      name: "Date ADR Rec'd",
      dataIndex: "Date ADR Rec'd",
      key: "Date ADR Rec'd",
      width: 140,
      type: "date",
      order: 19,
      ...getColumnSearchProps("Date ADR Rec'd"),
      filteredValue: filteredValue["Date ADR Rec'd"] || null,
      sorter: { multiple: 11 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date ADR Rec'd").length > 0) ? filteredValue.sort.filter((value) => value.field == "Date ADR Rec'd")[0].order : null
    },

    {
      title: "Demand Letter Date",
      name: "Demand Letter Date",
      dataIndex: "Demand Letter Date",
      key: "Demand Letter Date",
      width: 170,
      type: "date",
      order: 20,
      ...getColumnSearchProps("Demand Letter Date"),
      filteredValue: filteredValue["Demand Letter Date"] || null,
      sorter: { multiple: 12 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Demand Letter Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Demand Letter Date")[0].order : null
    },

   
 

    {
      title: "MRN",
      name: "MRN",
      dataIndex: "MRN",
      key: "MRN",
      order: 21,
      width: 140,
      type: "search",
      feature: "copy", 
      sorter: { multiple: 19 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "MRN").length > 0) ? filteredValue.sort.filter((value) => value.field == "MRN")[0].order : null,
      ...getColumnSearchProps("MRN"),
      filteredValue: filteredValue['MRN'] || null,
    },
    {
      title: "Claim Number",
      name: "Claim Number",
      dataIndex: "Claim Number",
      key: "Claim Number",
      width: 190,
      type: "search",
      order: 22,
      feature: "copy", 
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Claim Number").length > 0) ? filteredValue.sort.filter((value) => value.field == "Claim Number")[0].order : null,
      ...getColumnSearchProps("Claim Number"),
      filteredValue: filteredValue['Claim Number'] || null,
    },
   
    {
      title: "ADR Reason Code",
      name: "ADR Reason Code",
      dataIndex: "ADR Reason Code",
      key: "ADR Reason Code",
      width: 160,
      type: "filters",
      sorter: { multiple: 22 },
      order: 23,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "ADR Reason Code").length > 0) ? filteredValue.sort.filter((value) => value.field == "ADR Reason Code")[0].order : null,
      filters: filters["ARDREASONCODE"],
      filterSearch: true,
      filteredValue: filteredValue['ADR Reason Code'] || null,
    },

    
    
    {
      title: "Service Type",
      name: "Service Type",
      dataIndex: "Service Type",
      key: "Service Type",
      width: 190,
      type: "filter",
      sorter: { multiple: 25 },
      order: 24,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Service Type").length > 0) ? filteredValue.sort.filter((value) => value.field == "Service Type")[0].order : null,
      filters: filters["ServiceType"],
      filterSearch: true,
      filteredValue: filteredValue['Service Type'] || null,
    },
    {
      title: "Description",
      name: "Description",
      dataIndex: "Description",
      key: "Description",
      width: 200,
      type: "filter",
      order: 25,
      sorter: { multiple: 26 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Description").length > 0) ? filteredValue.sort.filter((value) => value.field == "Description")[0].order : null,
      filters: filters['Description'],
      filterSearch: true,
      filteredValue: filteredValue['Description'] || null,
    },
    {
      title: "MD",
      name: "MD",
      dataIndex: "MD",
      key: "MD",
      width: 180,
      type: "filter",
      sorter: { multiple: 27 },
      order: 26,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "MD").length > 0) ? filteredValue.sort.filter((value) => value.field == "MD")[0].order : null,
      filters: filters['MD'],
      filterSearch: true,
      filteredValue: filteredValue['MD'] || null,
    },
    {
      title: "Findings",
      name: "Findings",
      dataIndex: "Findings",
      key: "Findings",
      width: 100,
      feature: "view",
      type: "search",
      order: 27,
      ...getColumnSearchProps("Findings"),
     
      filteredValue: filteredValue['Findings'] || null
    },
    {
      title: "FILE AND RESOLVE",
      name: "FILE AND RESOLVE",
      dataIndex: "FILE AND RESOLVE",
      key: "FILE AND RESOLVE",
      width: 200,
      type: "search",
      order: 28,
      sorter: { multiple: 28 },
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
      order: 29,
      sorter: { multiple: 27 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "User").length > 0) ? filteredValue.sort.filter((value) => value.field == "User")[0].order : null,
      filters: filters['User'],
      filterSearch: true,
      filteredValue: filteredValue['User'] || null,
    },

    {
      title: "Action Date Time",
      name: "Action Date Time",
      dataIndex: "ActionTimeStamp",
      key: "ActionTimeStamp",
      width: 180,
      order: 30,
      type: "datetime",
      sorter: { multiple: 27 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "ActionTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "ActionTimeStamp")[0].order : null,

    },
    {
      title: "Archive",
      name: "Archive",
      dataIndex: "Archive",
      key: "Archive",
      width: 100,
      order: 31,
      type: "boolean",
      filters: [
        { text: "Yes", value: 0 },
        { text: "No", value: 1 },
        { text: "", value: null },
      ],
      filteredValue: filteredValue['Archive'] || null,
    }

  ];

  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";
  const config = {
    entity,
    panelTitle,
    dataTableTitle,
    ENTITY_NAME,
    CREATE_ENTITY,
    ADD_NEW_ENTITY,
    UPDATE_ENTITY,
    DATATABLE_TITLE,
    dataTableColumns,
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
    status: filters['Status'],
    handleChangeStatus,
    onChangeDate,
    setStatus


  };


  const addEditModalConfig = {
    title: modalTitle,
    openModal: openEditableModal,
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
    // if (value == 'Closed') {
    //   set_Closed_Date(null)
    //   setShowClosedDate(false)
    //   setTimeout(() => {
    //     onDateChanges('Closed_Date', getDate().split('T')[0])
    //     setShowClosedDate(true)
    //   }, 10)
    // }
  }

  // edit form
  const editADRModal = (
    <Form
      name="basic"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      onFinish={onEditADRItem}
      // onFinishFailed={onEditFailed}
      autoComplete="off"
      form={editableForm}
    >

      <Row gutter={[24, 24]}>

        
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
          <p>Open/Closed <span style={{ color: "red" }}>*</span></p>
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
            <Select
              placeholder="Open/Closed"
              showSearch
              optionFilterProp="children"
              onChange={changeOpenClosed}
              filterOption={(input, option) => {
                if (option.children != "null" && option.children != null) {
                  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              }
              }

              dropdownRender={menu => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space align="center" style={{ padding: '0 8px 4px' }}>
                    <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                    <Typography.Link onClick={(e) => addItem(e, 'OpenClosed')} style={{ whiteSpace: 'nowrap' }}>
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
          <p>ADR Due Date</p>
          <Form.Item
            label=""
            name="ADR Due Date"
          >

            {
              ADR_Due_Date ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(ADR_Due_Date, dateFormat)} onChange={(d, date) => onDateChanges('ADR_Due_Date', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('ADR_Due_Date', date)} />
            }

            <span className="ant-form-item-explain">{errors.ADR_Due_Date}</span>

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
                  <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Closed_Date', date)} />
                  : null
            }

            <span className="ant-form-item-explain">{errors.Closed_Date}</span>

          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Date ADR Rec'd</p>
          <Form.Item
            label=""
            name="Date ADR Recd"
          >

            {
              Date_ADR_Recd ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(Date_ADR_Recd, dateFormat)} onChange={(d, date) => onDateChanges('Date_ADR_Recd', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Date_ADR_Recd', date)} />
            }

            <span className="ant-form-item-explain">{errors.Date_ADR_Recd}</span>

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
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(DOS_To, dateFormat)} onChange={(d, date) => onDateChanges('DOS_To', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('DOS_To', date)} />
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

            <Select placeholder="Status"
              showSearch
              optionFilterProp="children"
              onChange={(value) => handleChangeStatus1(value)}
              filterOption={(input, option) => {
                if (option.children != "null" && option.children != null) {
                  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              }
              }

              dropdownRender={menu => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space align="center" style={{ padding: '0 8px 4px' }}>
                    <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                    <Typography.Link onClick={(e) => addItem(e, 'Status')} style={{ whiteSpace: 'nowrap' }}>
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
          <p>Date ADR Submitted to Noridian</p>
          <Form.Item
            label=""
            name="Date ADR Submitted to Noridian"
          >

            {
              Date_ADR_Submitted_to_Noridian ?
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} defaultValue={moment(Date_ADR_Submitted_to_Noridian, dateFormat)} onChange={(d, date) => onDateChanges('Date_ADR_Submitted_to_Noridian', date)} />
                :
                <DatePicker className="w-100" placeholder="MM/DD/YYYY or MM-DD-YYYY" format={dateFormatDatePicker} onChange={(d, date) => onDateChanges('Date_ADR_Submitted_to_Noridian', date)} />
            }

            <span className="ant-form-item-explain">{errors.Date_ADR_Submitted_to_Noridian}</span>

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
          <p>HAR No.</p>
          <Form.Item
            label=""
            name="HAR No."
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
          <p>ADR Reason Code</p>
          <Form.Item
            label=""
            name="ADR Reason Code"
          >

            <Select
              placeholder="ADR Reason Code"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                if (option.children != "null" && option.children != null) {
                  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              }
              }

              dropdownRender={menu => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space align="center" style={{ padding: '0 8px 4px' }}>
                    <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                    <Typography.Link onClick={(e) => addItem(e, 'ARDREASONCODE')} style={{ whiteSpace: 'nowrap' }}>
                      <PlusOutlined /> Add item
                    </Typography.Link>
                  </Space>
                </>
              )}
            >
              {
                filters && filters['ARDREASONCODE'] && filters['ARDREASONCODE'].filter((value) => value.value != "").map((status) => {
                  if (status.value != "") {
                    return <Select.Option value={status.value}>{status.text}</Select.Option>
                  }
                })
              }
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>Total Charges</p>
          <Form.Item
            label=""
            name="Total Charges"
          >

            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <p>CPT </p>
          <Form.Item
            label=""
            name="CPT"
          >
            <Input ></Input>
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
              filterOption={(input, option) => {
                if (option.children != "null" && option.children != null) {
                  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              }
              }

              dropdownRender={menu => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space align="center" style={{ padding: '0 8px 4px' }}>
                    <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                    <Typography.Link onClick={(e) => addItem(e, 'ServiceType')} style={{ whiteSpace: 'nowrap' }}>
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

              <p>Description</p>
              <Form.Item
                label=""
                name="Description"
              >

                <Select
                  placeholder="Description"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    if (option.children != "null" && option.children != null) {
                      return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  }
                  }

                  dropdownRender={menu => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Space align="center" style={{ padding: '0 8px 4px' }}>
                        <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                        <Typography.Link onClick={(e) => addItem(e, 'Description')} style={{ whiteSpace: 'nowrap' }}>
                          <PlusOutlined /> Add item
                        </Typography.Link>
                      </Space>
                    </>
                  )}
                >
                  {
                    filters && filters['Description'] && filters['Description'].filter((value) => value.value != "").map((status) => {
                      if (status.value != "") {
                        return <Select.Option value={status.value}>{status.text}</Select.Option>
                      }
                    })
                  }
                </Select>
              </Form.Item>
            </Col>


            <Col span={8}>
              <p>MD</p>
              <Form.Item
                label=""
                name="MD"
              >

                <Select
                  placeholder="MD"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    if (option.children != "null" && option.children != null) {
                      return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  }
                  }

                  dropdownRender={menu => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Space align="center" style={{ padding: '0 8px 4px' }}>
                        <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                        <Typography.Link onClick={(e) => addItem(e, 'MD')} style={{ whiteSpace: 'nowrap' }}>
                          <PlusOutlined /> Add item
                        </Typography.Link>
                      </Space>
                    </>
                  )}
                >
                  {
                    filters && filters['MD'] && filters['MD'].filter((value) => value.value != "").map((status) => {
                      if (status.value != "") {
                        return <Select.Option value={status.value}>{status.text}</Select.Option>
                      }
                    })
                  }
                </Select>
              </Form.Item>
            </Col>

        <Col span={8}>

          <Row gutter={[24, 24]}>
            


          <Col span={24}>
              <p>Denied Amount</p>
              <Form.Item
                label=""
                name="Denied Amount"
              >

                <Input type={"number"} />
              </Form.Item>
            </Col>

           
           

            <Col span={24}>
              <p>Expected Amount</p>
              <Form.Item
                label=""
                name="Expected Amount"
              >

                <Input type={"number"} />
              </Form.Item>
            </Col>
          </Row>
        </Col>

        <Col span={8}>
          <p>Findings</p>
          <Form.Item
            label=""
            name="Findings"
          >

            <TextArea rows={6} style={{ width: "100%", border: "1px solid lightgrey" }} />
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


      </Row>

      <Form.Item wrapperCol={{ offset: 15 }} style={{ marginBottom: "-10px", textAlign: "end" }}>

        <Button type="primary" htmlType="submit" className="mr-3" >
          {modalType == 'ADD' ? 'Add' : 'Update'}
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
            editADRModal
          }

        </Modals>

        <SortModal config={sortModalConfig} ></SortModal>

      </div>
    )

  } else {
    return  ""
  }
}
