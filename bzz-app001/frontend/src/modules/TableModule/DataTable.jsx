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
  DatePicker
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { CloseCircleTwoTone, EyeFilled, DeleteOutlined, EllipsisOutlined, ReloadOutlined, IdcardOutlined } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
import {
  EyeOutlined,
  EditOutlined,
  
} from "@ant-design/icons";
import { formatDate, formatDatetime, getDate } from "@/utils/helpers";
const {Option} = Select


export default function DataTable({ config }) {

  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, getItems, reload,  getFilterValue, dataTableTitle, showFooter = true, openEditModal, openAddModal, openingModal, confirmModal, AddIcon, deleteIcon = false, openPdf, isLoading, refresh, height} = config;
  
 

  useEffect(() => {
    if(isLoading) {
      setLoading(isLoading)
    } else {
      loadTable()
    }
  }, [isLoading])


  const newDataTableColumns = dataTableColumns.map((obj) => {

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

    if (obj.type == "datetime" ) {
      return ({
        ...obj,
        render: (text, row) => {
          return {            
            children: (
              <div>
                {text ? 
                 formatDatetime(text.toString())
                 : null }
              </div>
            )
          };
        },
      })
    }

    if (obj.type == "number" ) {
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
                          <p  className="menu-option" onClick={() => openingModal(row)}><span><EditOutlined /></span> Edit</p>
                          <p  className="menu-option" onClick={() => confirmModal(row)}><span><DeleteOutlined /></span>{row['Archive']? "Unarchive": "Archive"}</p>
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



    if (obj.type == "pencil") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            children: (
              <div>
                <EditOutlined onClick={() => openEditModal(row.ID)} />  {text ? <EyeFilled onClick={() => openAddModal(row.ID)} style={{ marginLeft: "10px" }} /> : ""}
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

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  var { pagination, items , filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])

  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
  }, [entity])

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
      delete data.column.filters  
      return data
    }))

    // setSorter(filteredArray)
  
    const option = {
      page: pagination.current || 1,
      filter: (filters),
      sorter: sorter ? (filteredArray) : ([])
    };

    filters.sort = (filteredArray);

    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    dispatch(crud.list1(entity, option));

  };

  const loadTable = () => {

    
    let filterValue = {};
    getFilterValue(filterValue);

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: ( filterValue),
      sorter: ([])
    };

    dispatch(crud.list1(entity, option));
  }

  useEffect(() => {

    loadTable()
  }, []);

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
                <Button  onClick={() =>openingModal()}>
                  <IdcardOutlined/>
                </Button>

                <Button className="mr-3" onClick={() =>loadTable()}>
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
            <Row gutter={[24, 24]} style={{minHeight: "25px "}}>
             
            </Row>
          )
        }
      />
      
    </div>
  );
}
