import React, { useState } from "react";

import KPIDataTableModule from "@/modules/KPIDataTableModule";
import {  Input, Button, Space } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";

let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']

export default function KPI() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([])
  const {current} = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({})
  const [dataTableColumns, setDataTableColumns]  = useState([])
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

  React.useEffect(async () => {

    const response = await request.list("admin");
    let usersList = response.result.filter(res => res.ManagementAccess == 0 || res.ManagementAccess == null ).sort((a,b) => a['User'] - b['']).map((user) => ({EMPID: user.EMPID, name: user.Nickname, text: user.Nickname , value: user.Nickname , status: 'success'}))
    setUsers(usersList)

    let columns = []
    columns.push({
      title: "Date",
      dataIndex: "ActionTimeStamp",
      width: 120,
      sorter: { multiple: 1},
      sortOrder:  ( filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Date").length > 0) ?  filteredValue.sort.filter((value) => value.field == "Date")[0].order : null      
    })

  

    usersList.map((user, i ) => {
      columns.push({
        title:  user.name,
        width: 130,
        dataIndex:  user.name,
        key: user.name,
        children: [
          {
            title: 'Faxes',
            dataIndex:  i + '-WQFaxes',
            key: 'a',
            width: 130,
          },
          
        ],       
      })

    })
    
    setDataTableColumns(columns)
  }, [])



 

  const entity = "totalkpis";

  const getFilterValue = (values) => {
    setFilteredValue(values)
  }

  const getItems = (data) => {
    setItems(data)
  } 



  const panelTitle = "KPI";
  const dataTableTitle = "KPIs";
  const showProcessFilters = true;


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
    getItems,
    reload,
    getFilterValue,
    showProcessFilters,
    userList: users
  };

  {
  return dataTableColumns.length > 0 && users.length > 0 ? 
     <KPIDataTableModule config={config} />
     : null 
  }  
}
