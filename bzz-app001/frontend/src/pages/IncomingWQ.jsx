import React, { useState, useRef } from "react";

import FullDataTableModule from "@/modules/FullDataTableModule";
import ModalDataTableModule from "@/modules/ModalDataTableModule";
import { Table, Input, Button, Space, Form, Row, Col, Select, notification, DatePicker } from "antd";
import Highlighter from "react-highlight-words";
import { EyeOutlined, SearchOutlined ,CopyOutlined, RightOutlined, LeftOutlined, ZoomOutOutlined, ZoomInOutlined} from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('../request/index');
import { selectAuth } from "@/redux/auth/selectors";
import SortModal from "@/components/Sorter";
import { GetSortOrder } from "@/utils/helpers";


import { Document, Page } from 'react-pdf';
import Data from '../data' 
const {folders, options, foldersText} = Data


import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

// import { PdfViewerComponent, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, Inject } from '@syncfusion/ej2-react-pdfviewer';
import { getDate } from "@/utils/helpers";
import { values } from "@antv/util";
// import PDFViewer from 'pdf-viewer-reactjs'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const { Option } = Select;

const searchEntity = "patientlookup"
const search = {};

var x,y;

const fetchSearchQueryResult = async (value, callback, field) => {

  let values = Object.keys(value);

  for (let i = 0; i < values.length; i++) {
    if (search[values[i]] == "") {
      delete search[values[i]]
    }
  }

  let response = await request.list(searchEntity, { value: JSON.stringify(value) })
  const result = response.result;
  callback(result.map((res) => ({ text: res[field], value: res[field], ID: res.ID, data: res })))


}


const SearchInput = ({ placeholder, field, type = "select", cb }) => {

  const [data, setData] = useState([]);
  const [value, setValue] = useState();

  const handleSearch = value => {
    search[field] = value.trim()
    setValue(value)

    fetchSearchQueryResult({ ...search }, data => setData(data), field);

  };

  const handleChange = value => {

    if (type == "date") {
      search[field] = value.toISOString().split('T')[0];
    } else {
      search[field] = value.trim();
    }

    fetchSearchQueryResult({ ...search }, data => {
      cb(data)
      setData(data)
    }, field);
    setValue(value);
  };




  return (

    type == "select" ?

      <Select
        showSearch
        value={value}
        placeholder={placeholder}
        style={{ width: "100%" }}
        showArrow={false}
        filterOption={false}
        onSearch={handleSearch}
        onChange={handleChange}
        notFoundContent={null}
      >
        {
          data.map((d, index) => {
            return <Option key={d.ID} value={d.value}>{d.text}</Option>
          })
        }
      </Select>
      :

      <DatePicker style={{ width: "100%" }} onChange={handleChange} />
  );
}

export default function IncomingWQ() {
  const dateFormat = 'YYYY/MM/DD';

  // const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [selectedId, setSelectedId] = useState("");
  const [reload, setReload] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [loaded, setLoaded] = useState(false)
  const [users, setUsers] = useState([]);
  const [openPDFModal, setOpenPDFModal] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [filename, setFilename] = useState('')

  const [openNewEntryModal, setOpenNewEntryModal] = useState(false);
  const [roiTag, SetRoiTag] = useState('')

  const [timeValue, setTimeValue] = useState({});
  const [hardReload, SetHardReload] = useState(false)
  const [searchMode, setSearchMode] = useState(false);
  const [birthDate, setBirthDate] = useState();
  const [editModalField, setEditModalField] = useState('');
  const [renderDate, setRenderDate] = useState(false)
  const [data, setData] = useState([])
  const [showPdf, setShowPdf] = useState(false);
  const [pdf, setPdf] = useState('')
  const eventListeners = useRef();
  const [resetSearch,setResetSearch] = useState(true)
  const [patients,setPatients] = useState([])
  const [path, setPath] = useState('')
  const [MRN, setMRN] = useState('')
  const [filters, setFilters] = useState({})
  const [cp_to_Billabe_new, set_cp_to_Billabe_new] = useState(false)

  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])
  


  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours());
  var usDate = getDate()

  const currentDate = usDate
  const childRef = useRef();

  const { current } = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({
    UserAssigned: current.managementAccess ? [] : [current.name],
    Status: current.managementAccess ? null : ['Review'],
    'ROI Status': ['New', 'Not Billable', 'Not Form', 'Not Completed', 'Not Letter']
  })

  const WQFilterEntity = "incomingwqfilters"

  const dispatch = useDispatch()

  const defaultColors = [
    { text: "Done", color: "#BEE6BE", selected: false },
    { text: "Pending", color: "#FAFA8C", selected: false },
    { text: "Defer", color: "#F0C878", selected: false },
    { text: "Misc-I", color: "#E1A0E1", selected: false },
    { text: "Misc-II", color: "#AAAAB4", selected: false },
    { text: "Review", color: "#FFFFFF", selected: false },
  ]

  const billingColorData = {
    EMPID: 1,
    User: "Admin",
    Color1: "#BEE6BE",
    Color2: "#FAFA8C",
    Color3: "#F0C878",
    Color4: "#E1A0E1",
    Color5: "#AAAAB4",
    Color6: "#FFFFFF",
    Category1: "Done",
    Category2: "Pending",
    Category3: "Defer",
    Category4: "Misc-I",
    Category5: "Misc-II",
    Category6: "Review",
  }

  
  const loadColumns = async () => {
    const [{result: result1}] = await Promise.all([ await request.list(entity+"-columns", {id: current.EMPID})  ]);

    if(result1.length > 0) {
      setDataColumns([...dataTableColumns1.map((c,i )=> {
         c['order'] =  result1[0][c.dataIndex]
         return c
      })])
      
    } else {
      setDataColumns(dataTableColumns1)
    } 

    setColumns(true)
  }

  const load = async () => {
    const [admin] = await Promise.all([await request.list("admin") ]);
    let usersList = admin.result.filter(res => res.ManagementAccess == 0 || res.ManagementAccess == null).map((user) => ({ EMPID: user.EMPID, name: user.Nickname, text: user.Nickname, value: user.Nickname, status: 'success' }))
    setUsers(usersList);

    getFilters()
    loadColumns()

  }

  const getFilters = async() => {
    
    const [{result}] = await Promise.all([await request.list("incomingwq-filters") ]);
    setFilters(result)
  }

  React.useEffect(() => {

    load();

  }, [])


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

  const entity = "incomingwq";
  const loggerEntity = "incomingwqLogger";
  const onhandleSave = (data) => {

    dispatch(crud.update(entity, data.ID, { Comments: data.Notes }))

    logData(data.ID, 'Update Comments')
    setReload(true)
    setTimeout(() => setReload(false), 1000)
  }


  

  function copy(textToCopy, message) {
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
      notification.success({ message: message  + " Copied!", duration: 3 })
    });
  }


  const logData = (id, status, Filename, action) => {
    dispatch(crud.create(loggerEntity, { IDIncomingWQ: id, UserName: current.name,  Action: action, Filename: Filename,  Status: status, DateTime: currentDate }))
  }


 




  const openViewModal = async (folder,name, mrn= '') => {

    setOpenPDFModal(true)

    loadPdf(folder, name, mrn)
  }


  const loadPdf = async (folder,filename, mrn = '', load = false) => {
    setShowPdf(true)
    setPdf('')
    setPatients([])
    
    setPath(foldersText[folder] + filename)
    setMRN(mrn)
    let response = await request.listinlineparams("media",  {folder, filename, load: load})

    if (response.result.file) {
      setPdf('data:application/pdf;base64,' + response.result.file)
      setPatients(response.result.patients)
      setFilename(filename)
    } else {
      notification.error({ message: "Oops, File not Found!" })
    }

  }

  const openEditModal = (id, type, modalType, title, action) => {

    let row = items.filter(item => item.ID == id)[0];
    setSelectedId(id);
    setEditModalField(type)
    setModalType(modalType);
    setSelectedRow(row)

    editForm.setFieldsValue({
      Notes: row[type]
    })

    setModalTitle(title);
    logData(id, action, row.FileName, 'EDIT');
    setOpenModal(true)

  }


  const getFilterValue = (values) => {
    
    setFilteredValue(values)
  }


  const openAddModal = (id) => {
    let row = items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View Comments");
    setOpenModal(true);
  }

  const handleCancel = () => {
    setZoom(2)
    setResetSearch(false)
    setModalTitle("");
    logData(selectedId, 'Close Look-up', selectedRow.FileName, 'Click')
    setOpenModal(false);
    setOpenNewEntryModal(false)
    setOpenPDFModal(false)
    setOpenSearchModal(false)
    setPdf('')
    setPatients([])
    setMRN('')
    setPath('')
    setShowPdf(false)
    setSortModal(false)
  }


  const getFullList = (data) => { }


  const handleRename = async (row, show = false, addDate = false) => {

    setModalType(null)
    if(!show) {
      setOpenModal(true)
      setSelectedRow(row);
      setModalType("Rename File");
      setModalTitle("Rename");

      editForm.setFieldsValue({
        Notes: row['FileName'].slice(0, -4)  
      })
      return 
    }

    let oldPath = row.FileName;
    let newPath = row['PAT_LAST_NAME'] + ", " + row['PAT_FIRST_NAME'] + " " + getDate().split('T')[0] + ".PDF"

    let file =  await request.read(entity, newPath)
    
    setReload(true)

    if(file.success) {
      notification.error({message: "File Already Exists !"})
      setReload(false)
      return 
    }

    
    await request.update(entity, row.ID, { "FileName": newPath, "OriginalFileName": row.Location });
    
    await request.create("media", { oldPath, newPath, folder: row['ROI Status'] }); 
    logData(row.ID, 'Rename File',oldPath, 'RENAME' )
    
    setTimeout(() => {
      setReload(false)
    }, 1500)

  }

  const getItems = (data) => {
    setItems(data)
    getFilters()
  }

  const openSearch = (row) => {
    setSelectedId(row.ID)
    setSelectedRow(row)
    setOpenSearchModal(true)

    setTimeout(() => {
      loadPdf(row['ROI Status'], row.FileName, row.PAT_MRN_ID, true)
    }, 1000)

  }

  const onEditItem = async (value,) => {

     if (modalType == "Rename File") {

      let oldPath = selectedRow.FileName;
      let newPath = ''
      if(value.Notes.indexOf('.PDF') > 0) {
         newPath = value.Notes
      } else {
        newPath = value.Notes + ".PDF"
      }
      setOpenModal(false)
  
      setReload(true)
      let response = await request.update(entity, selectedRow.ID, { "FileName": newPath, "OriginalFileName": selectedRow.Location });
      if(!response.success) {
        setReload(false)
        notification.error({message: "File Already Exists!"})
        return 
      }

      await request.create("media", { oldPath, newPath, folder: selectedRow['ROI Status'] });
      setReload(false)
  
     } else if (editModalField == "Error Type") {
      setReload(true)
      setOpenModal(false)
      await request.update(entity, selectedId, { Error: '1', 'Error Type': value.Notes ? value.Notes : "" });
      setReload(false)

    }
   
    
    else if (editModalField == "ROI Status") {
      setReload(true)
      setOpenModal(false)

      let params = {FileName: selectedRow.FileName, 'ROI Status': value.Notes ? value.Notes : "", OriginalFileName:  selectedRow['Location']}
      
      
      if(value.Notes == 'Not Billable' && selectedRow['ROI Status'] == 'Duplicate') {
         params = {FileName: selectedRow.FileName.replace(/ Duplicate/ig, '').replace(/Duplicate/ig, '').trim(), 'ROI Status': value.Notes ? value.Notes : "", OriginalFileName:  selectedRow['Location']}

      }

      await request.update(entity, selectedId, params);
      logData(selectedId, 'ROI Status Updated', selectedRow.FileName, 'UPDATE')
     
      if(value.Notes) {

        let obj = { fileName: selectedRow['FileName'].trim(), dest_folder: value.Notes, current_folder: selectedRow['ROI Status'] }

        if(selectedRow['ROI Status'] == 'Not Billable') {
          obj['StartTimeStamp'] = null,
          obj['FinishTimeStamp'] = null,
          obj['Duraton'] = null 
        }

        
        await request.create("transfer", obj);
       
        setTimeout(async () => {
          setReload(false)
        }, 1000)
      } else {
        setReload(false)
      }

      
    }

    else if (editModalField == "Letter Template") {
      setReload(true)
      setOpenModal(false)

      await request.update(entity, selectedId, { 'Letter Template': value.Notes ? value.Notes : "" });
      setReload(false)
    }

    else if (editModalField == "Requested By") {
      setReload(true)
      setOpenModal(false)

      await request.update(entity, selectedId, { 'Requested By': value.Notes ? value.Notes : "" });
      setReload(false)
    } 
    else {
      onhandleSave({ ID: selectedId, Notes: value.Notes ? value.Notes : "" })

    }
    editForm.resetFields()


  }

  const onCopied = (id, mrn) => {
    dispatch(crud.create(loggerEntity, { IDIncomingWQ: id, UserName: current.name, Color: "", Status: "Copy MRN", DateTime: currentDate, 'MRN': mrn }))
  }

  const onRowMarked = async (row, value, type) => {

  }


  const onSearchSubmit = async (value) => {
  }


  // edit form
  const textModal = (
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
        <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={3} />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 18 }}>
        <Button type="primary" htmlType="submit" className="mr-3">
          Confirm
        </Button>
      </Form.Item>
    </Form>
  )


  
  // edit form
  const InputModal = (
    <Form
      name="basic"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      onFinish={onEditItem}
      autoComplete="off"
      form={editForm}
    >

      <Form.Item
        label=""
        name="Notes"
      >
        <Input type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={3} />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 18 }}>
        <Button type="primary" htmlType="submit" className="mr-3">
          Update
        </Button>
      </Form.Item>
    </Form>
  )


    
    const updateLine = async ({ record, roiTag, rename, noOfRequests,  copyToBillableNew}) => {
    setResetSearch(true)
   
    set_cp_to_Billabe_new(copyToBillableNew)
    let updateObject = {
      'PAT_MRN_ID': record['PAT_MRN_ID'] && record['PAT_MRN_ID'] != "NULL" ? record['PAT_MRN_ID'] : "",
      'BIRTH_DATE': record['BIRTH_DATE'] && record['BIRTH_DATE'] != "NULL" ? record['BIRTH_DATE'].split(' ')[0] : "",
      'PAT_FIRST_NAME': record['PAT_FIRST_NAME'] && record['PAT_FIRST_NAME'] != "NULL" ? record['PAT_FIRST_NAME'] : "",
      'PAT_MIDDLE_NAME': record['PAT_MIDDLE_NAME'] && record['PAT_MIDDLE_NAME'] != "NULL" ? record['PAT_MIDDLE_NAME'] : "",
      'PAT_LAST_NAME': record['PAT_LAST_NAME'] && record['PAT_LAST_NAME'] != "NULL" ? record['PAT_LAST_NAME'] : "",
      'SSN': record['SSN'] && record['SSN'] != "NULL" ? record['SSN'] : "",
      'ADD_LINE_1': record['ADD_LINE_1'] && record['ADD_LINE_1'] != "NULL" ? record['ADD_LINE_1'] : "",
      'CITY': record['CITY'] && record['CITY'] != "NULL" ? record['CITY'] : "",
      'EMAIL_ADDRESS':  record['EMAIL_ADDRESS'] && record['EMAIL_ADDRESS'] != "NULL" ? record['EMAIL_ADDRESS'] : ""
    }



   

    if (roiTag) {
      SetRoiTag(roiTag)
    }

    handleCancel()

    let oldPath = ''
    let newPath = ''

    if (rename) {

      selectedRow['PAT_FIRST_NAME'] = record['PAT_FIRST_NAME'] ? record['PAT_FIRST_NAME'] : ""
      selectedRow['PAT_LAST_NAME'] = record['PAT_LAST_NAME'] ? record['PAT_LAST_NAME'] : ""

      newPath = record['FileName'].indexOf('.PDF') > 0 ? record['FileName']  : record['FileName'] + '.PDF'
      oldPath = selectedRow['FileName']
      
      updateObject['FileName'] =  record['FileName'].indexOf('.PDF') > 0 ? record['FileName']  : record['FileName'] + '.PDF'
      updateObject['OriginalFileName'] = selectedRow['Location']    

    }


    setReload(true)

    await Promise.all([
      request.update(entity, selectedId, updateObject), 
      request.create("media", { oldPath, newPath, folder: selectedRow['ROI Status'], noOfRequests })  
    ]) 

    if(copyToBillableNew) {
      updateObject['ROI Status'] = 'Billable New'
      await Promise.all([
        request.create(entity,  updateObject) 
      ])
    }
     
    


       if(roiTag == 'Fax Completed') {
        setTimeout(() => {          
          openViewModal(selectedRow['ROI Status'],newPath, record['PAT_MRN_ID'])
        }, 2000)
      }

    setBirthDate("")
    


    if (childRef.current &&  (roiTag == 'Medical Forms New' || roiTag == 'Fax Correction Letter') ){
      childRef.current.doHandleReset(newPath)
    } else {
      setReload(false) 
    }
    
  }



  // Error form
  const AddModal = (
    <Form
      name="basic"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
      onFinish={updateLine}
      autoComplete="off"
      form={searchForm}
    >

      <Form.Item label="First" name="PAT_FIRST_NAME" placeholder="First" >
        {/* <SearchInput placeholder="First Name" field="PAT_FIRST_NAME" cb={formatForm} value="Pear"/> */}
        <Input placeholder="First Name"></Input>
      </Form.Item>

      <Form.Item label="M" name="PAT_MIDDLE_NAME" placeholder="M">
        {/* <SearchInput placeholder="Middle Name" field="PAT_MIDDLE_NAME" cb={formatForm} value="N"/> */}
        <Input placeholder="Middle Name"></Input>

      </Form.Item>

      <Form.Item label="Last" name="PAT_LAST_NAME" placeholder="Last">
        {/* <SearchInput placeholder="Last Name" field="PAT_LAST_NAME" cb={formatForm} value="Jelly"/> */}
        <Input placeholder="Last Name"></Input>

      </Form.Item>

      <Form.Item label="MRN" name="PAT_MRN_ID" placeholder="MRN">
        {/* <SearchInput placeholder="MRN" field="PAT_MRN_ID" cb={formatForm} value="1111111"/> */}
        <Input placeholder="MRN"></Input>

      </Form.Item>

      <Form.Item label="SSN" name="SSN" placeholder="SSN">
        {/* <SearchInput placeholder="SSN" field="SSN" cb={formatForm} value="112-445-333"/> */}
        <Input placeholder="SSN"></Input>
      </Form.Item>

      <Form.Item label="Birth Date" name="BIRTH_DATE" placeholder="Birth Date">
        <DatePicker style={{ width: "100%" }} onChange={(value, date) => setBirthDate(date)} />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 20 }}>
        <Button type="primary" htmlType="submit" className="">
          Add
        </Button>

      </Form.Item>
    </Form>
  )


  // Select Modal
  const selectModal1 = (
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

      <Select >
        {

          options && options[filteredValue['ROI Status'][0]].map((tab) => {
            return (
              <Option value={tab.value}>{tab.name}</Option>
            )
          })
           
        }
          
        

        </Select>

      </Form.Item>

      <Form.Item wrapperCol={{ offset: 14 }}>
        <Button type="primary" htmlType="submit" className="">
          Update
        </Button>

        <Button type="default" htmlType="button" onClick={handleCancel} className="mr-3">
          Close
        </Button>
      </Form.Item>
    </Form>
  )


  const selectModal = (
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
        <Select >
          <Option value="Completed">Completed</Option>
          <Option value="Correction Letter">Correction Letter</Option>
          <Option value="DMRS Acknowledged">DMRS Acknowledged</Option>
          <Option value="DMRS Completed">DMRS Completed</Option>
        </Select>

      </Form.Item>
      <Form.Item wrapperCol={{ offset: 18 }}>
        <Button type="primary" htmlType="submit" className="mr-3">
          Update
        </Button>

      </Form.Item>
    </Form>
  )



  const selectModal2 = (
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

        <Select >
          <Option value="Letter 01">Letter 01</Option>
          <Option value="Letter 02">Letter 02</Option>
          <Option value="Letter 03">Letter 03</Option>
        </Select>

      </Form.Item>
      <Form.Item wrapperCol={{ offset: 18 }}>
        <Button type="primary" htmlType="submit" className="mr-3">
          Update
        </Button>

      </Form.Item>
    </Form>
  )

  // View Modal
  const viewModal = (
    <Row gutter={[24, 24]} style={{ marginBottom: "50px" }}>
      <Col className="gutter-row" span={24}>
        {selectedRow.Comments}
      </Col>
    </Row>
  )

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(2);


  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  }

  const mouseHandler = (e) => {
    let viewer = document.getElementsByClassName('pdf-viewer1')[0]
    let el = viewer.getElementsByClassName('react-pdf__Document')[0]

    if (x && y ) {
      el.scrollBy(e.clientX - x, e.clientY - y);
    }
  
    x = e.clientX;
    y = e.clientY;

  }

  const removeMouseEvent = () => {

    let viewer = document.getElementsByClassName('pdf-viewer1')[0]
    let el = viewer.getElementsByClassName('react-pdf__Document')[0]
    el.removeEventListener('mousemove', eventListeners.current, true)
  }


  const addMouseEvent= () => {
    
    let viewer = document.getElementsByClassName('pdf-viewer1')[0]
    let el = viewer.getElementsByClassName('react-pdf__Document')[0]
    eventListeners.current = mouseHandler
      el.addEventListener('mousemove', eventListeners.current, true)
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function changeZoom(offset) {
    setZoom(prevZoom => prevZoom + offset);
  }
  
  const previousZoom = () => {
    if(zoom > 2 ) {
      changeZoom(-1);
      // removeMouseEvent()

    }
  }

  const nextZoom = () => {
    changeZoom(1);
    // addMouseEvent()
  }

  const previousPage = () => {
    changePage(-1);
  }

  

  const nextPage = () => {
    changePage(1);
  }


  const panelTitle = "Incoming WQ";
  const dataTableTitle = "Incoming Faxes  WQ";
  const progressEntity = "incomingwqprogress";
  const workEntity = "incomingWork";
  const showProcessFilters = true;


  const onWorkSaved = async (amount) => {
    const response = await request.list("incomingwqWork");
    const result = (response.result);
    const selectedRow = result.filter(res => res.EMPID == current.EMPID)[0]
    if (selectedRow.Amount) {

      let targetAmount = JSON.parse(selectedRow.Amount);
      const found = targetAmount.some(r => amount.indexOf(r) >= 0)
      if (!found) {
        var date = new Date();
        var utcDate = new Date(date.toUTCString());
        utcDate.setHours(utcDate.getHours() - 7);
        var day = new Date(utcDate).getDay();
        let obj = {}
        obj[days[day]] = 1;
        dispatch(crud.create(workEntity, obj));
      }
    }
  }

  const updateTime = async (id, value, cb, row) => {

    if (value.FinishTimeStamp) {
      setReload(true)
      setTimeValue(value)
      logData(id, 'Finish', selectedRow.FileName, 'Click')
      let updateObject = {}
      updateObject['FinishTimeStamp'] = getDate()
      updateObject['StartTimeStamp'] = value.StartTimeStamp
      updateObject['Duration'] = value['Duration'] ? value['Duration'] :  (new Date(getDate()) - new Date(row['StartTimeStamp'])).toString()
      updateObject['ActionTimeStamp'] =getDate()
  
      await request.update(entity, selectedId, updateObject)
      await request.list(entity + "-check", {ID: id})


      if(roiTag) {
        setReload(true)
        await request.update(entity, id, {
          'ROI Status': roiTag 
        })

        let oldValue = localStorage.getItem('previous-row')
        oldValue = (JSON.parse(oldValue))
        await request.create("transfer", { previousFilename: oldValue['FileName'], fileName: row['FileName'].indexOf('.PDF') > -1 ? row['FileName']  :  row['FileName'] + '.PDF', dest_folder: roiTag, current_folder: oldValue['ROI Status'], cp_to_Billabe_new });
        setReload(false)

      }

      setTimeout(() => {
        setReload(false)
      }, 1000)


    } else if (value.entity == "START") {
      setSelectedId(id)
      setOpenSearchModal(true)
      setSelectedRow(row)
      loadPdf(row['ROI Status'], row.FileName, row.PAT_MRN_ID, true)
      delete value['entity']
      
      logData(id, 'Start', row.FileName, 'Click')
      localStorage.setItem('previous-row', JSON.stringify(row))
      cb(true)
    } else if (value.entity == "RESET") {
      delete value['entity']
      let oldPath = (row['FileName'])
      let newPath = selectedRow['FileName']
      logData(id, 'Reset', row['FileName'],'Click')
      setReload(true)


      let oldValue = localStorage.getItem('previous-row')
      oldValue = (JSON.parse(oldValue))
      await request.update(entity, id, {
        'PAT_MRN_ID': oldValue['PAT_MRN_ID'], 
        'PAT_FIRST_NAME': oldValue['PAT_FIRST_NAME'], 
        'PAT_LAST_NAME': oldValue['PAT_LAST_NAME'],
        'PAT_MIDDLE_NAME': oldValue['PAT_MIDDLE_NAME'],
        'BIRTH_DATE': oldValue['BIRTH_DATE'],
        'SSN': oldValue["SSN"],
        'MRN': oldValue['MRN'],
        'FileName': oldValue['FileName'],
        'EMAIL_ADDRESS': oldValue['EMAIL_ADDRESS'],
        'CITY': oldValue['CITY'],
        'ADD_LINE_1': oldValue['ADD_LINE_1'],
      
      })
      await request.create("media", { oldPath, newPath, folder: selectedRow['ROI Status'] });
        setReload(false)

    }
  }

  const addLine = () => {
    handleCancel()
    setOpenNewEntryModal(true)
  }


  const dataTableColumns1 = [
    {
      title: "START", width: 100, dataIndex: "START",
      name: "START",
      align: 'center',
      order: 1
    },
    {
      title: "FINISH", width: 100, dataIndex: "FINISH",
      align: 'center',
      name: "FINISH",
      order: 2 
    },
    (filteredValue['ROI Status'] == 'Fax Correction Letter' ? 
      {
        title: "Letter Template",
        name: "Letter Template",
        width: 180, dataIndex: "Letter Template",
        filters: [
          { text: "Letter 01", value: "Letter 01" },
          { text: "Letter 02", value: "Letter 02" },
          { text: "Letter 03", value: "Letter 03" },
        ],
        order: 3 ,
        filteredValue: filteredValue['Letter Template'] || null
      }
      : 
      {
        order: 3 ,name: "Letter Template", dataIndex: "Letter Template",  
      }
    ),
    (
      filteredValue['ROI Status'] == 'Fax Correction Letter' ? 
      {
        title: "Letter Send", name: "Letter Send",  width: 120, dataIndex: "Letter Send", order: 4
      }
      : 
      {name: "Letter Send", dataIndex: "Letter Send", order: 4}
    ),
    (
      filteredValue['ROI Status'] == 'Fax Correction Letter' ?
      {
        title: "Folder Location",name: "Folder Location", dataIndex: "FolderLocation", width: 350, order: 5
      }
      : 
      {name: "Folder Location", dataIndex: "FolderLocation",  order: 5}
    ),

    // (
    //   filteredValue['ROI Status'] == 'Fax Correction Letter' ?

    //   {
    //     title: "Letter Status", width: 180, dataIndex: "Letter Status",
    //     name : "Letter Status",
    //     order: 6,
    //     filters: [
    //       { text: "Sent", value: "Sent" },
    //       { text: "", value: "" },
    //     ],
    //     filteredValue: filteredValue['Letter Status'] || null
    //   }
    //   : 
    //   {
    //     name: "Letter Status",
    //     dataIndex: "Letter Status",
    //     order: 6
    //   }

    // ),
    {
      title: "ROI Status", width: 150, dataIndex: "ROI Status",
      name: "ROI Status",
      order: 7,
      filters:
     (
      
      filters && filters[filteredValue['ROI Status'][0]] &&filters[filteredValue['ROI Status'][0]].map((o) => {
        return  ({text: o['ROI Status'], value: o['ROI Status']})
      })
     ),
    
      filteredValue: filteredValue['ROI Status'] || null
    },
    {
      title: "File Name", dataIndex: "FileName", width: 300,
      name: "File Name",
      order: 8,
      ...getColumnSearchProps("FileName"),
      filteredValue: filteredValue['FileName'] || null
    }, {
      title: "Date Modified", dataIndex: "Date Modified", width: 140, sorter: { multiple: 7 },
      name: "Date Modified", order: 9,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date Modified").length > 0) ? filteredValue.sort.filter((value) => value.field == "Date Modified")[0].order : null,
    },
    {
      title: "First", dataIndex: "PAT_FIRST_NAME", width: 120,
      name: "First",
      order: 10,
      ...getColumnSearchProps("PAT_FIRST_NAME"),
      filteredValue: filteredValue['PAT_FIRST_NAME'] || null,
      sorter: { multiple: 7 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "PAT_FIRST_NAME").length > 0) ? filteredValue.sort.filter((value) => value.field == "PAT_FIRST_NAME")[0].order : null,

    },
    {
      title: "M", dataIndex: "PAT_MIDDLE_NAME", width: 60,
      name: "M",
      order: 11,
      ...getColumnSearchProps("PAT_MIDDLE_NAME"),
      filteredValue: filteredValue['PAT_MIDDLE_NAME'] || null,
      sorter: { multiple: 7 },

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "PAT_MIDDLE_NAME").length > 0) ? filteredValue.sort.filter((value) => value.field == "PAT_MIDDLE_NAME")[0].order : null,

    },
    {
      title: "Last", dataIndex: "PAT_LAST_NAME", width: 120, 
      name: "Last", order: 12,
      ...getColumnSearchProps("PAT_LAST_NAME"),
      filteredValue: filteredValue['PAT_LAST_NAME'] || null,
      sorter: { multiple: 7 },

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "PAT_LAST_NAME").length > 0) ? filteredValue.sort.filter((value) => value.field == "PAT_LAST_NAME")[0].order : null,

    },
    {
      title: "MRN", dataIndex: "PAT_MRN_ID", width: 130,
      name: "MRN", order: 13,
      ...getColumnSearchProps("PAT_MRN_ID"),
      filteredValue: filteredValue['PAT_MRN_ID'] || null,
      sorter: { multiple: 7 },

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "PAT_MRN_ID").length > 0) ? filteredValue.sort.filter((value) => value.field == "PAT_MRN_ID")[0].order : null,

    },
    {
      title: "DOB", dataIndex: "BIRTH_DATE", width: 100, sorter: { multiple: 1 },
      name: "DOB", order: 14,
      sorter: { multiple: 7 },

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "BIRTH_DATE").length > 0) ? filteredValue.sort.filter((value) => value.field == "BIRTH_DATE")[0].order : null,
    },
    {
      title: "SSN", dataIndex: "SSN", width: 100,
      name: "SSN",
      order: 15,
      ...getColumnSearchProps("SSN"),
      filteredValue: filteredValue['SSN'] || null,
      sorter: { multiple: 7 },

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "SSN").length > 0) ? filteredValue.sort.filter((value) => value.field == "SSN")[0].order : null,

    },
    {
      title: "Street Address", dataIndex: "ADD_LINE_1", width: 200,
      name: "Street Address", order: 16,
      ...getColumnSearchProps("ADD_LINE_1"),
      filteredValue: filteredValue['ADD_LINE_1'] || null,
      sorter: { multiple: 7 },

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "ADD_LINE_1").length > 0) ? filteredValue.sort.filter((value) => value.field == "ADD_LINE_1")[0].order : null,

    },
    {
      title: "City", dataIndex: "CITY", width: 200,
      name: "City", order: 17,
      ...getColumnSearchProps("CITY"),
      filteredValue: filteredValue['CITY'] || null,
      sorter: { multiple: 7 },

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "CITY").length > 0) ? filteredValue.sort.filter((value) => value.field == "CITY")[0].order : null,

    },
    {
      title: "Email", dataIndex: "EMAIL_ADDRESS", width: 200,
      name: "Email", order: 18,
      ...getColumnSearchProps("EMAIL_ADDRESS"),
      filteredValue: filteredValue['EMAIL_ADDRESS'] || null,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "EMAIL_ADDRESS").length > 0) ? filteredValue.sort.filter((value) => value.field == "EMAIL_ADDRESS")[0].order : null,

    },
    { title: "Requested By", width: 150, dataIndex: "Requested By" , order: 19, name: "Requested By"},
    
    {
      title: "Rename File", width: 120, dataIndex: "Rename File", order: 20, name: "Rename File"
    },
    {
      title: "Original File Name", dataIndex: "OriginalFileName", width: 350, name: "Original File Name", order: 21, 
      ...getColumnSearchProps("OriginalFileName"),
      filteredValue: filteredValue['OriginalFileName'] || null,
      sorter: { multiple: 7 },

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "OriginalFileName").length > 0) ? filteredValue.sort.filter((value) => value.field == "OriginalFileName")[0].order : null,

    },
    {
      title: "Start Time", dataIndex: "StartTimeStamp", width: 140, sorter: { multiple: 6 },
      order: 22, name: "Start Time",
      sorter: { multiple: 7 },

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "StartTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "StartTimeStamp")[0].order : null,
    },
    {
      title: "Finish Time", name: "Finish Time", dataIndex: "FinishTimeStamp", width: 140, sorter: { multiple: 7 }, order: 23,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FinishTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "FinishTimeStamp")[0].order : null,
    },
    {
      title: "Duration", dataIndex: "Duration", width: 110,
      order: 24, name:"Duration",
      ...getColumnSearchProps("Duration"),
      filteredValue: filteredValue['Duration'] || null
    },
    { title: "Team Member", width: 150, dataIndex: "User", name:"Team Members", order: 25 },

  ];

  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";
  

  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel,
  };

  const modalTableConfig = {
    entity: searchEntity,
    closeModal: handleCancel,
    updateLine,
    addLine,
    pdf: pdf,
    patients: patients,
    id: selectedId,
    filename: filename,
    resetSearch:resetSearch ,
    process: filteredValue['ROI Status'],


    // close: true
  }

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

    
    
    let cols = dataTableColumns1.map((d, i) => {
      d.order = dataColumns[i].order
      return d
    })
    console.log(cols)
    console.log( filteredValue['ROI Status'])


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
      dataTableColumns:  cols,
      dataTableColorList,
      onhandleSave,
      openEditModal,
      openViewModal,
      openAddModal,
      getItems,
      reload,
      progressEntity,
      onCopied,
      getFilterValue,
      workEntity,
      showProcessFilters,
      userList: users,
      onWorkSaved,
      onRowMarked,
      WQFilterEntity,
      getFullList,
      updateTime,
      handleRename,
      hardReload,
      openSearch,
      ref: childRef,
      openSortModal: openSortModal
    };


    return (columns &&  users.length > 0) ?
      <div>
        <Modals config={modalConfig} >
          {
            modalType == "EDIT" ?
              textModal : null
          }
          {
            modalType == "VIEW" ?
              viewModal : null
          }
          {
            modalType == "ERROR" ?
              selectModal : null
          }
          {
            modalType == "ROI Status" ?
              selectModal1 : null
          }
          {
            modalType == "Letter Template" ?
              selectModal2 : null
          }
          {
            modalType == "Requested By" ?
              textModal : null
          }
       
          {
            modalType == "Rename File" ?
            InputModal : null
          }

        </Modals>

        <Modals config={
          {
            title: "View PDF",
            openModal: openPDFModal,
            handleCancel,
            centered: false,
            style: {
              top: 10.5,
              marginRight: "0px",
            },
            width: "75%"

          }
        }>

          {
            pdf ?
              <div className="pdf-viewer1">

                <div className="zoom-container">

                <p style={{position: "absolute" ,marginTop: "5px"}}>
                  Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
                </p>
                
                <Button
                    style={{marginRight: "10px", marginLeft: "100px"}}
                    type="button"
                    shape="circle"
                    disabled={pageNumber <= 1}
                    onClick={previousPage}
                  >
                    <LeftOutlined/>
                  </Button>
                  <Button
                    type="button"
                    shape="circle"
                    disabled={pageNumber >= numPages}
                    onClick={nextPage}
                  >
                    <RightOutlined/>
                  </Button>

                  <Button
                    style={{marginRight: "10px", marginLeft: "10px"}}
                    type="button"
                    shape="circle"
                    disabled={zoom <= 2}
                    onClick={previousZoom}
                  >
                    <ZoomOutOutlined />
                  </Button>
                  <Button
                    type="button"
                    shape="circle"
                    disabled={zoom > 2}
                    onClick={ nextZoom}
                  >
                    <ZoomInOutlined />
                  </Button>

                  {
                    MRN ? 
                    <span className="mt-10 mr-20 font-18">    
                    <CopyOutlined onClick={() => copy(MRN, "MRN")} />  {"  "}

                    <label>MRN: </label> {MRN + "  "}
                    </span>
                    : null
                  }

                  <br></br>
                  {
                    path ? 

                    <span className="mt-10 mr-100 mb-20 block"> 
                   
                    <CopyOutlined onClick={() => copy('//fs2/faxes/EPICIRWFS/faxtest' + path, "PDF Path")} />  {"  "}

                    <label>PDF Path: </label>//fs2/faxes/EPICIRWFS/faxtest{path + "  "} 
                     </span>
                    : null
                  }


                </div>

                <Document
                  file={pdf}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page scale={zoom} pageNumber={pageNumber} />
                </Document>
                <div style={{textAlign: "center", marginBottom: "8px"}}>
                </div>

              
              </div>
              : 
              <h4>Loading..</h4>

          }

        </Modals>




        <Modals config={
          {
            title: "Patient Lookup",
            openModal: openNewEntryModal,
            handleCancel,
          }
        }>
          {AddModal}
        </Modals>

        <Modals config={{
          title: "",
          openModal: openSearchModal,
          handleCancel,
          width: "1300",
          centered: false,
          // close:true,
          style: {
            top: 3.5,
            margin: "auto",
            minWidth: "1366px"
          },
          minHeight: "580px",
          updateLine,
        }}>
          <ModalDataTableModule config={modalTableConfig} ></ModalDataTableModule>
        </Modals>

        <SortModal config={sortModalConfig} ></SortModal>


        <FullDataTableModule config={config}   />


      </div>
      : null
  } else {
    return ""
  }
}
