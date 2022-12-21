import React, { useState, useEffect } from "react";
import { Switch, Input, Space, Button, Popover, Modal, Form, Select } from "antd";
import { EllipsisOutlined, SearchOutlined } from "@ant-design/icons";
import DataTableModule from "@/modules/DataTableModule";
import Highlighter from "react-highlight-words";
import { notification } from "antd";
import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import IrbIcon from "../assets/images/add-irb-icon.png";
import TextArea from "rc-textarea";
let { request } = require('../request/index');

import {
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment";


export default function Irb() {
  const entity = "billingirbbudgetstatus"; // entity api name , don't change it
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [selectedID, setSelectedID] = useState(0);
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const dispatch = useDispatch();
  const [addIcon, setAddIcon] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [reload, setReload] = useState(false);
  const [status, setStatus] = useState([]);
  const [filteredValue, setFilteredValue] = useState({})

  const showEditModal = () => {
    
    let selectedItem = getRow(selectedID)
    editForm.setFieldsValue(selectedItem)
    setIsEditModalVisible(true);
  };

  useEffect(() => {
    (async ()=> {
      const response = await request.list("billingirbbudgetstatus-status-list");
      let items = (response.result.map((result) => result.Status != null ? result.Status : "null"  ))

      let status = items.map(m => m.replace(/\r\n/, ''))
      let elements = [...new Set(status)];
      let el = (elements.sort((a,b) =>  {
        if (a < b) //sort string ascending
          return -1;
        if (a > b)
          return 1;
        return 0;
      }) )
      
      setStatus(el)
    })()
    
  }, [])

  const getRow = (id) => {

    return items.filter(item => item.ID === id)[0];
  }

  const handleCancel = () => {
    setIsEditModalVisible(false);
    setShowDeleteModal(false)
  };

  const onAddItem = async(values) => {
    
    let response = await request.create(entity, values);

    if(response.success) {
      setIsEditModalVisible(false)
      reloading()
      addForm.resetFields()
      notification.success({message: "Successfully Added Budget Status!", duration:3});
    } 
  }

  const onAddFailed = (errorInfo) => {
    notification.error({message: "Please eneter the fields!", duration:3});
  };

  const formData = (
    <div>
      <Form.Item
          label="IRB"
          name="IRB"
          labelAlign="left"
          rules={[{ required: true, message: 'Please input irb!' }]}
        >
          <Input type="text" ></Input>
        </Form.Item>
        <Form.Item
          label="Status"
          name="Status"
          labelAlign="left"
          rules={[{ required: true, message: 'Please select status!' }]}
        >
           <Select  style={{ width: "100%" }} >
             {
               status.map(s => {
                 if(s != "null") {
                  return <Select.Option value={s}>{s}</Select.Option>
                 }
               }) 
             }
          </Select>
        </Form.Item>
        <Form.Item
          label={<span style={{marginLeft: "3px"}}>Clarification</span>}
          name="ClarificationComment"
          labelAlign="ClarificationComment"
          // rules={[{ required: true, message: 'Please input Clarification!' }]}
        >
          <TextArea style={{ width: "100%", border: "1px solid lightgrey" }} rows={8} type="text" ></TextArea>
        </Form.Item>
    </div>
  ) 

  const addModal = {
    icon: IrbIcon,
    title: "Add New Entry",
    type: 'image',
    content : (
        <Form
        name="basic"
        style={{marginTop: "6px !important", width: "350px"}}
        labelCol={{ span: 7 }}
        onFinish={onAddItem}
        onFinishFailed={onAddFailed}
        autoComplete="off"
        form={addForm}
      >
        {formData}
        <Form.Item wrapperCol={{ offset: 19 }} style={{marginBottom: "6px !important", marginTop: "-5px"}}>
          <Button type="primary" htmlType="submit" className="mr-3">
            Save
          </Button>
        </Form.Item>
      </Form>
    )
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

  const content = (
    <div>
      <p onClick={() => setShowDeleteModal(true)} className="menu-option"><span><DeleteOutlined /></span> Delete</p>
      <p onClick={showEditModal} className="menu-option"><span><EditOutlined /></span> Edit</p>
    </div>
  );

  const handleRowClick = (record, value) => {
    return {
      onClick: event => {
        setSelectedID(record.ID)
      },
    };
  }


  const dataTableColumns = [
    {
      title: "No.",
      dataIndex: "SNo",
      key: "SNo",
      width: 80,
      sorter: true,
      sortOrder: (filteredValue.sort && filteredValue.sort.column == "SNo") ? filteredValue.sort.order : null ,
    },
    {
      title: "IRB",
      dataIndex: "IRB",
      key: "IRB",
      ...getColumnSearchProps("IRB"),
      width: 100,
      filteredValue:filteredValue['IRB'] || null,
      render: (value) => <div >
        <span className="float-left">{value}</span>
        
      </div>,
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      filteredValue:filteredValue['Status'] || null,
      filters: status.map(m => ({text: m == "null" ? "" : m, value: m})),
      width: 180,
    },
  
    {
      title: "Clarification ",
      dataIndex: "ClarificationComment",
      key: "ClarificationComment",
      width: 500,
      filteredValue:filteredValue['ClarificationComment'] || null,
      ...getColumnSearchProps("ClarificationComment"),
      render: (text, row) => {
        return {
          children:  (
            <div>
             <div style={{width: "95%", display: "inline-block"}}>
               { text == 'null' ? '' : text}             
              </div> 

           <span className="float-right actions">
           <span className="actions">
             <Popover placement="rightTop"  content={content} trigger="click">
                 <EllipsisOutlined/>
             </Popover>
           </span>
         </span>
         </div>
          )
        };
      },
    },
    // {
    //   title: "Fix",
    //   dataIndex: "Fix",
    //   key: "Fix",
    //   width: 120,
    //   ...getColumnSearchProps("Fix"),
    //   render: (text, row) => {
    //     return {
    //       children: (
    //         <div>
    //            { text}
    //           <span className="float-right actions">
    //           <span className="actions">
    //             <Popover placement="rightTop" content={content} trigger="click">
    //                 <EllipsisOutlined/>
    //             </Popover>
    //           </span>
    //         </span>
    //         </div>
    //         ),
    //     };
    //   },
    // },
  ];

  const getFilterValue = (values) => {
    setFilteredValue(values)
  }

  const onEdit = async(values) => {
    let response = await request.update(entity, selectedID, values);
    if(response.success) {
      setIsEditModalVisible(false)
      reloading()
      notification.success({message: "Sucessfully updated the Status!", duration:3})
    } else {
      notification.error({message: response.message,duration:3})
    }
  }

  const onEditFailed = () => {
      notification.error({message: "Please enter all fileds!", duration:3})
  }

  const getItems  = (items) => {
    setItems(items)
    
  }

  const reloading = () => {
    setReload(true)
    setReload(false)

  }

  const onDeleteIRB = async () => {
    await dispatch(crud.delete(entity, selectedID))
    notification.success({message: "Successfully deleted Status!", duration:3})
    setShowDeleteModal(false)
    reloading()
  } 

  const DATATABLE_TITLE = "IRB Budget Status";

  const config = {
    entity,
    DATATABLE_TITLE,
    dataTableColumns,
    handleRowClick,
    getItems,
    onAddItem,
    addModal,
    reload,
    getFilterValue
  };
  return <>
    <DataTableModule config={config} />;
    <Modal 
      centered
      title="Edit Entry" 
      visible={isEditModalVisible} 
      onCancel={handleCancel}
      footer={null}
      width={400}
      >
      <Form
        name="basic"
        labelCol={{ span: 6 }}
        onFinish={onEdit}
        onFinishFailed={onEditFailed}
        autoComplete="off"
        form={editForm}

      >
        {formData}

        <Form.Item labelAlign="right" wrapperCol={{ offset: 18 }}>
            <Button className="mr-3" type="primary" htmlType="submit">
                Update
            </Button>
        </Form.Item>
      </Form>
    </Modal>

    <Modal
      centered
      title="Delete Entry"
      visible={showDeleteModal}
      footer={null}
      onCancel={handleCancel}
      width={400}

    >
      <p>Deleting Entry { getRow(selectedID) ? getRow(selectedID).IRB: ''} ?</p>
      <div className="text-right">
        <Button type="danger" className="mb-10" onClick={() => onDeleteIRB()}> Delete</Button>
      </div>
    </Modal>
  </>
}
