
import React, { useState } from "react";

import FixedDataTableModule from "@/modules/FixedDataTableModule";
import { Table, Input, Button, Space , Form, Row, Col, Select, DatePicker, notification } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import  Socket  from "@/socket";
import moment from 'moment';
import { set } from "@antv/util";
import { getDate } from "@/utils/helpers";
import PdfModal from "@/components/Pdf";
import { useForm } from "antd/lib/form/Form";
import { useEffect } from "react";


const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function MisFileCheck() {
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
  const [openExport1Modal, setOpenExport1Modal] = useState(false)
  const [patient, setPatient] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filteredValue, setFilteredValue] = useState({
   
  })
  const [filters, setFilters] = useState([])
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const dateFormat = 'YYYY/MM/DD';
  const [CMPNY_SENIORITY_DT, set_CMPNY_SENIORITY_DT] = useState();
  const [EFFDT, set_EFFDT] = useState();
  const [ORIG_HIRE_DT, set_ORIG_HIRE_DT] = useState();
  const [HIRE_DT, set_HIRE_DT] = useState();
  const [TERMINATION_DT, set_TERMINATION_DT] = useState();
  const [errors , setErrors] = useState({})
  const [hasErrors, setHasErrors] = useState(false) 
  const [hasFilters, setHasFiters] = useState(false)
  const [department, setDepartment] = useState([])
  var usDate = getDate()
  const [showPdf, setShowPdf] = useState(false);
  const [pdf, setPdf] = useState('')
  const [openPDFModal, setOpenPDFModal] = useState(false);
  const [page, setPage] = useState(0)
  const [patientform ] =  Form.useForm()



  const currentDate = usDate 
  
  const {current} = useSelector(selectAuth);

  const dispatch = useDispatch()
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


  const entity = "misfilecheck";


  useEffect(() => {
    (async() => {
      let response = await request.list(entity + "-filenames");

      let Obj = {}
      Obj['FileName'] = (response.result.map(res => ({text: res.FileName, value: res.FileName})))
      setFilters(Obj)
    })()
  }, [])

  const onhandleSave = (data) => {
    
    dispatch(crud.update(entity, data.ID, {notes: data.Notes}))

    onNotesAction(data.ID, 'Update Note')
    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
  }

  const [selectedFile, setSelectedFile] = useState()
  const uploadFile = async (e) => {
    if (e.target.files[0].type == 'application/pdf') {
      setSelectedFile(e.target.files[0])

      let file  = e.target.files[0].name
    let patientName1 = (file.slice(file.indexOf('_'), file.indexOf(' ')).replace(/_/g, ' ').trim())
    let lastName =  (patientName1.split(' ')[0]  )
    let firstName = patientName1.split(' ')[1]
    let MiddleName  = ''

    if(patientName1.split(' ').length == 2) {
     MiddleName = (file.slice(file.indexOf(' ') , file.length).split('_'))[0].trim()
    }
    
    patientform.setFieldsValue({
      First: firstName,
      Last: lastName,
      Middle: MiddleName
    })
    } else {
      notification.error({message: 'Please select pdf file'})
    }
  }

  const handleFileModal = () => {
    setOpenExport1Modal(true)
  }

  const closeExportModal = () => {
    setOpenExportModal(false)
  }


  const handleFileUpoad = async (values) => {
    const formData = new FormData();

    
    if(!selectedFile  ) {
      notification.error({message: 'Please select a file'})
      return 
    }


    formData.append(
      "myFile",
      selectedFile,
      selectedFile.name
    );

    formData.append('First', values.First)
    formData.append('Middle', values.Middle)
    formData.append('Last', values.Last)

    setIsLoading(true)
    closeExport1Modal()

    let response = await request.create("upload-file", formData)
      
    if(!response.success) {
      setIsLoading(false)
      return 
    } else {
      notification.success({message: 'Processing and loading data...'})
      setIsLoading(false) 
      patientform.resetFields()
      
    }


    
    
        
  }

  const onNotesAction = (id, status) => {

    let item = items.filter((item) => item.ID == id)[0]

    dispatch(crud.create(loggerEntity, { IDWQ1075: id, UserName: current.name, MRN: item['Patient MRN'], Status: status, DateTime: currentDate }))
  }

  const onRowMarked = async (row, value) => {
    setReload(false)
    await dispatch(crud.update(entity, row.ID, {Error: value ? '0' : '1'}))
    setReload(true)
  }



  const openEditModal = (id) => {
    
    let row =  items.filter(item => item.ID == id)[0];

    setSelectedId(id);
    setModalType("EDIT");
    editForm.setFieldsValue({
      Notes: row.Notes
    })

    setModalTitle("Edit Notes");
    setOpenModal(true)
    onNotesAction(id, 'Edit Note')

  }


  const getFilterValue = (values) => {
    setFilteredValue(values)
  }


  const openAddModal = (id) => {
    let row =  items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View Notes");
    setOpenModal(true);
  }

  


  const getFilters = (data) => {}

  const getItems = (data) => {

    if ( filters.length ==0 ) {
      getFilters(data)
    } 

    setHasErrors(true)
    setItems(data)
  } 

  const openPdf = async(filename, patient = '', page) => {

    setPdf('')
    let folder= 'OCR'
    setOpenPDFModal(true)

    localStorage.setItem('filename', filename)
    let response = await request.listinlineparams("media",  {folder, filename, load: false})

    if (response.result.file) {
      setPdf('data:application/pdf;base64,' + response.result.file)
      setPage(page)
      setPatient(patient)
      setShowPdf(true)

    } else {
      notification.error({ message: "Oops, File not Found!" })
    }

    

  }



  
  const panelTitle = "Misfile Check";
  const dataTableTitle = "ROI QAC";
  
  
 
  const dataTableColumns = [
    {
      title: "Page",
      dataIndex: "Page",
      key: "Page",
      width: 130,
      filters: filters['Page'],
      filteredValue:filteredValue['Page'] || null,
      sorter: { multiple: 3},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Page").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Page")[0].order : null
    },
    {
      title: "Found",
      dataIndex: "Found",
      key: "Found",
      width: 120,
      filters: [
        {text: 'Yes', value: 'Yes'},
        {text: 'No', value: 'No'},
        {text: '', value: ''}
      ],
      filteredValue:filteredValue['Found'] || null,
      sorter: { multiple: 5},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Found").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Found")[0].order : null
    },{
      title: "Link",
      dataIndex: "Link",
      key: "Link",
      width: 80,
    
    },
    {
      title: "Names Found",
      dataIndex: "NamesFound",
      key: "NamesFound",
      width: 250,
      ...getColumnSearchProps("NamesFound"),
      filteredValue:filteredValue['NamesFound'] || null,
    },
    {
      title: "File Name",
      dataIndex: "FileName",
      key: "FileName",
      width: 250,
      filters: filters['FileName'],
      filteredValue:filteredValue['FileName'] || null,
      sorter: { multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FileName").length > 0) ?  filteredValue.sort.filter((value) => value.field == "FileName")[0].order : null
    },
    {
      title: "Patient",
      dataIndex: "Patient",
      key: "Patient",
      width: 150,
      ...getColumnSearchProps("Patient"),
      filteredValue:filteredValue['Patient'] || null,
      sorter: { multiple: 2},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Patient").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Patient")[0].order : null
    },
    
    
    {
      title: "Count",
      dataIndex: "Count",
      key: "Count",
      width: 80,
      
    },
    {
      title: "Validate",
      dataIndex: "Validate",
      key: "Validate",
      width: 180,
      filters: [
        {text: 'Found', value: 'Found'},
        {text: 'Not Found', value: 'Not Found'},
        {text: '', value: ''},

      ],
      filteredValue:filteredValue['Validate'] || null,
      
    },
    
    
    {
      title: "User",
      dataIndex: "UserName",
      key: "UserName",
      width: 160,
      filters: filters['UserName'],
      filteredValue:filteredValue['UserName'] || null,
      sorter: { multiple: 7},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "UserName").length > 0) ?  filteredValue.sort.filter((value) => value.field == "UserName")[0].order : null
    },
    {
      title: "ProcessTime",
      dataIndex: "ProcessTime",
      key: "ProcessTime",
      width: 160
      
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
    onWorkSaved : () => {},
    onRowMarked,
    openingModal: handleFileModal,
    confirmModal: () => {},
    AddIcon: true,
    deleteIcon: true,
    refresh: true,
    openPdf: openPdf,
    isLoading: isLoading 
  };

  const handleCancel = () => {
    setOpenPDFModal(false)
    setReload(false)
    setTimeout(() => setReload(true) , 1000) 
    
  }

  const pdfConfig = {
    title: "See PDF", 
    openModal: openPDFModal,
    handleCancel,
    pdf: pdf,
    page: page,
    patient: patient,
    centered: false,
    style: {
      top: 10.5,
      marginRight: "0px",
    },
    width: "75%",
  
  }

  const closeExport1Modal = () => {
    setOpenExport1Modal(false)
    setSelectedFile({})
    patientform.resetFields()

  }

  const modalConfig7 = {
    title: "Enter Patient Name and Select Patient File",
    openModal: openExport1Modal,
    handleCancel: closeExport1Modal,
    width: 500
  };

  {
  return    <div className="misfile">
      
     <FixedDataTableModule config={config} />

      <PdfModal config={pdfConfig} ></PdfModal>

      <div className="load-modal">
        <Modals config={modalConfig7}>

          <Form
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleFileUpoad}
            autoComplete="off"
            form={patientform}
          >
            <Form.Item
              label="First"
              name="First"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input type="text"  className="box-shadow" />
            </Form.Item>

            <Form.Item
              label="Middle"
              name="Middle"
            >
              <Input type="text"  className="box-shadow" />
            </Form.Item>

            <Form.Item
              label="Last"
              name="Last"
              rules={[
                {
                  required: true,
                },
              ]}
          
            >
              <Input type="text"  className="box-shadow" />
            </Form.Item>

            <Form.Item
              label="File"
              name="file"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input type="file" className="file-upload" id="file"  onChange={(e) => uploadFile(e)} />
            </Form.Item>

              <div style={{ marginBottom: "12px", marginTop: "20px", textAlign: "end" }}>
                <Button type="primary"  htmlType="submit" >Search</Button>

              </div>
          </Form>
        </Modals>
      </div>

    </div>
  }  
}
