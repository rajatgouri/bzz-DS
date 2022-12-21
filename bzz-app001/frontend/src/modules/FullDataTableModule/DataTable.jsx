import React, {forwardRef, useContext, useCallback, useEffect, useState, useRef , useImperativeHandle} from "react";
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
  Radio,
  Select,
  Row,
  Col,
  Popconfirm,
  message
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";

// import BarChart from "@/components/Chart/barchat";
import { CaretDownOutlined, CloseOutlined, CopyOutlined, EditOutlined, FormOutlined, EyeFilled, ReloadOutlined, SettingOutlined, FileSearchOutlined,  EyeInvisibleFilled } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { FilterOutlined } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import LiquidChart from "@/components/Chart/liquid";
import { selectAuth } from "@/redux/auth/selectors";
// import { filter } from "@antv/util";
import CheckerFlags from "../../assets/images/checker-flags.png";
import ProgressChart from "@/components/Chart/progress";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import Data from "../../data"
import GreenDot from "assets/images/red-dot.png"
import Header from "./Header";

import { getDate } from "@/utils/helpers";
import socket from "@/socket";

const {folders, tabs} = Data

const {Option}  = Select
var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = getDate()


const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}

      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const renderCustomizedLabel = (props) => {
  const { x, y, width, value } = props;
  const radius = 10;

  return (
    <g>
      <text
        x={x + width / 2}
        y={y - radius}
        fill="#000000"
        style={{
          fontSize: "9px"
        }}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value}
      </text>
    </g>
  );
};

export default  forwardRef(({config}) =>  {

  const inputColorRef = useRef(null);
  const [timer, setTimer] = useState(0)
  const countRef = useRef(null)

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableItemsList, setTableItemsList] = useState([]);
  const [coloredRow, setColoredRow] = useState({});
  const [isDropDownBox, setDropDownBox] = useState(false);
  const [pickerColor, setPickerColor] = useState("#FFFFFF");
  const [colorIndex, setColorIndex] = useState(null);
  const [status, setStatus] = useState("Done")
  const [colorList, setColorList] = useState([]);
  const [EMPID, setEMPID] = useState(1);
  const [month, setMonth] = React.useState(moment().month() + 1)
  const [year, setYear] = React.useState(moment().year())
  const [amountList, setAmountList] = useState([]);
  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  const [startTime, setStartTime] = useState()
  const [selectedRowID, setSelectedRowID] = useState();

  let { entity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, hardReload, reload, progressEntity, updateTime, handleRename, openSearch,workEntity, onWorkSaved, onCopied, getFilterValue, showProcessFilters, userList, openViewModal, onRowMarked, getFullList, ref, openSortModal } = config;


  const [users, setUsers] = useState(userList)
  const [process, setProcess] = useState('New');
  const [selectedRow, setSelectedRow] = useState({})

 
  

  const getCurrentDate = () => {
    
    return getDate()
  }

  const handleStart = async (id, row) => {

    let date = getCurrentDate();

    if (selectedRowID != null) {
    
    await request.list(entity + "-check", {ID: id})

    updateTime(id, { StartTimeStamp: date, entity: "RESET" } , () => {
      handelDataTableLoad(pagination, {'ROI Status': [process]} , {})
    }, row)
    clearInterval(countRef.current)
    setSelectedRowID(null)
    setStartTime(null)
    setTimer(0)
    return
    }

    let response = await request.list(entity + "-check", {ID: id, FileName: row['FileName'], Folder: row['ROI Status']})
    
    var { result, success, message} = response;

    if(!success) {
      notification.error({message: message})
      return
    }
    
    countRef.current = setInterval(() => {
      setTimer((timer) => timer + 1)
    }, 1000)

    setSelectedRowID(id);

    setStartTime(date);
    setSelectedRow(row)

    updateTime(id, { StartTimeStamp: date, entity: "START" } , () => {
      // handelDataTableLoad(pagination, {'ROI Status': [process]} , {})
    }, row)
  }


  useImperativeHandle(ref, () => ({

    doHandleReset (newPath) {
      selectedRow.FileName = newPath
      handleReset(selectedID, selectedRow)
    }

  }));

  const handleReset = (id, row) => {
    if (selectedRowID != id) {
      return
    }


    let date = getCurrentDate()

    console.log((new Date(date) - new Date(startTime)).toString())

    updateTime(id, {StartTimeStamp: new Date(startTime), FinishTimeStamp: date, entity: "FINISH" , Duration: (new Date(date) - new Date(startTime)).toString()}, () => {}, row)
    clearInterval(countRef.current)
    setSelectedRowID(null)
    setStartTime(null)
    setTimer(0)
  }

  const formatTime = (timer) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)

    return (
      <div className="timer-box-container">
        <span className="time-box">{getHours}</span> <span className="time-box">{getMinutes}</span>  <span className="time-box">{getSeconds}</span>

      </div>
    )
  }

  const formatTime1 = (timer) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)

    return (
      <div>
        <span >{getHours} </span> :  <span>{getMinutes}</span> : <span>{getSeconds}</span>

      </div>
    )
  }



  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
    let clock = localStorage.getItem('clock')
    setShowClock(JSON.parse(clock))
  }, [entity])
  /***************/
  const handleColorChange = (color) => {
    const tmpObj = {};
    selectedRowKeys.map((x) => {
      tmpObj[x] = color;
    });

    let data = colorList.filter(list => list.color == color)[0]
    // saves the color to database //
    config.onHandleColorChange(selectedRowKeys, data)

    setColoredRow({ ...coloredRow, ...tmpObj });
    setSelectedRowKeys([]);
  };

  const load = async () => {
    const { result = [] } = await request.listinlineparams('billingcalendarstaff', { month, year, date_column: 'WhenPosted' })
    // let currentDate = new Date().toISOString().split('T')[0];

    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const y = (new Date(date).getFullYear())
    var m = (new Date(date).getMonth())
    var d = (new Date(date).getDate())
    var fullDate = y

    if (m < 9) {
      m = ('0' + m + 1)
    } else {
      m = (m + 1)
      fullDate += "-" + m
    }


    if (d < 10) {
      d = ('-0' + d)
      fullDate += d
    } else {
      d = ('-' + d)
      fullDate += d
    }

    let getTodayResults = (result.filter(res => res['WhenPosted'].split("T")[0] == fullDate));

    
    const foundOnCalendar = getTodayResults.map(c => {
      return users.findIndex((el) => {
        console.log(el)
        return el.EMPID == c.EmployeeID
      })
    })


    for (let i = 0; i < foundOnCalendar.length; i++) {
      if (foundOnCalendar[i] >= 0) {
        let userList = users;

        userList[foundOnCalendar[i]].status = 'error'
        setUsers(userList)
      }
    }
  }

  React.useEffect(() => {
    load();
  }, [month, year])



  function MakeNewColor({ colorsList }) {

    const onDefault = () => {
      config.getDefaultColors((colors) => {
        setColorList(colors)
        onSaveColors(colors)
      })
    }

    const onChangeColorPicker = (e) => {
      if (colorList[colorIndex].color !== '#FFFFFF') {
        setPickerColor(e.target.value)
        if (colorIndex == null || e.target.value.substring(0, 2) == "#f") return

        colorList[colorIndex].color = e.target.value;
        setColorList(colorList)
      }
    };

    const onSelectColor = (index, color) => {

      setColorIndex(index);
      setPickerColor(color);
      setStatus(colorList[index].text)
      handleColorChange(color);
      makeSelectedHightlight(index)
    }

    const makeSelectedHightlight = (index) => {
      let list = colorList;
      for (let i = 0; i < colorList.length; i++) {
        list[i].selected = false
      }
      list[index].selected = true;
    }

    // const onStatusChange = (value) => {
    //   setStatus(value)
    //   if (colorIndex == null) return
    //   let listExists = colorList.filter(list => list.text == value)
    //   if (listExists[0]) listExists[0].text = "";
    //   colorList[colorIndex].text = value;
    //   setColorList(colorList)
    // }


    const colorsButton = colorsList.map((element, index) => {
      let borderStyleColor = "lightgrey"
      return (
        <div className="colorPicker" key={uniqueId()}>
          <div style={{ marginBottom: "5px", fontSize: "9px", fontWeight: element.text == "Review" ? "bold" : "" }} className="digital"> {('000' + element.total).substr(-3)}</div>
          <Button
            type="primary"
            shape="circle"
            style={{
              background: element.color,
              borderColor: element.selected ? '#000000' : borderStyleColor,
              margin: "auto",
              marginBottom: "5px",
              display: element.text == "Review" ? "block" : "inline-block"

            }}
            onClick={(e) => {
              onSelectColor(index, element.color)
            }}
          >
            &nbsp;
          </Button>
          <span >{element.text}</span>
        </div>
      );
    });

    const popUpContent = (
      <div className="dropDownBox">
        <div >
          <span className="float-left"></span>
          <span className="float-right padding-right padding-top" >
            <CloseOutlined onClick={() => onCloseColor()} />
          </span>
        </div>

        <div className="pad20" style={{ width: "400px", height: "180px", marginTop: "20px" }}>

          <div >{colorsButton}</div>
          <div >

            <input
              type="color"
              autoFocus
              ref={inputColorRef}
              value={pickerColor}
              onChange={onChangeColorPicker}
              style={{
                width: "94%",
                marginBottom: '18px',
                marginTop: '5px',
                float: "left",
                marginLeft: "10px"
              }}
            />
            <Button style={{ float: "left" }} type="link" onClick={() => onDefault()}>Reset to Default Colors</Button>
            <Button style={{ float: "right", marginRight: "12px" }} type="primary" className="mb-1" onClick={() => onSaveColors(colorList)}>Save</Button>
          </div>
        </div>
      </div>
    );


    const onCloseColor = () => {
      config.getPreviousColors()
      setColorIndex(null)
      setPickerColor("#FFFFFF")
      setStatus("Done")
      setDropDownBox(!isDropDownBox)
    }

    const onSaveColors = (colors) => {

      const data = {
        Color1: colors[0].color,
        Color2: colors[1].color,
        Color3: colors[2].color,
        Color4: colors[3].color,
        Color5: colors[4].color,
        Color6: "#FFFFFF",
        Category1: colors[0].text,
        Category2: colors[1].text,
        Category3: colors[2].text,
        Category4: colors[3].text,
        Category5: colors[4].text,
        Category6: 'Review'
      }


      config.handleSaveColor(EMPID, data);
      onCloseColor()

    }

    const handleDropDownClick = () => {
      setDropDownBox(!isDropDownBox);
    };



    return (
      <>

        <div style={{ display: "inline-block", position: "relative", width: "410px" }} className="color-box">
          {colorsButton}

          <Dropdown
            overlay={popUpContent}
            trigger={["click"]}
            visible={isDropDownBox}
            // onVisibleChange={openColorBox}
            onClick={handleDropDownClick}
          >
            <Button shape="circle" style={{ top: "8px", position: "absolute", height: "28px" }} icon={<SettingOutlined />} />
          </Dropdown>
        </div>
      </>
    );
  }


  function copy1(textToCopy) {
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
      notification.success({ message: "Location Path Copied!", duration: 3 })
    });
  }


  function copy(id, textToCopy) {
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
      notification.success({ message: "Text Copied!", duration: 3 })
      onCopied(id, textToCopy)
      // onCopiedEvent(textToCopy)
    });
  }

  const onCopiedEvent = (textToCopy) => {
    handelDataTableLoad(1, { ...filters, 'PAT_MRN_ID': [textToCopy] }, sorters)
    setInCopiedMode(true)
  }

  const newDataTableColumns = dataTableColumns.map((obj) => {

    if (obj.dataIndex == "PAT_MRN_ID") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' || 
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 




                  )  ? "red" : "black",

              },
            },
            children: (
              <div>
                {text} 
                 {
                   text ? 
                 <CopyOutlined onClick={() => copy(row.ID, text)} />
                  : null
                   } 
              </div>
            )
          };
        },
      })
    }



    if (obj.dataIndex == "Notes") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' ||
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",
              },
            },
            children: (
              <div>
                <EditOutlined onClick={() => openEditModal(row.ID, "Notes", "EDIT", "Edit Notes", "Edit ")} />  {text ? <EyeFilled onClick={() => openAddModal(row.ID)} style={{ marginLeft: "10px" }} /> : ""}
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "ROI Status") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' ||
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black"
              },
            },
            children: (
              <div style={{minHeight: "30px"}} onClick={() => openEditModal(row.ID, "ROI Status", "ROI Status", "ROI Status", "Edit ")}>
                  {text }
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Letter Template") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' || 
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",
              },
            },
            children: (
              
                row['ROI Status'] ?
              <div style={{minHeight: "30px"}} onClick={() => openEditModal(row.ID, "Letter Template", "Letter Template", "Letter Template", "Edit ")}>
                  {text }
              </div>
              : null
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Requested By") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' ||
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",
              },
            },
            children: (
              <div style={{minHeight: "30px"}} onClick={() => openEditModal(row.ID, "Requested By", "Requested By", "Requested By", "Edit ")}>
                  {text }
              </div>
            )
          };
        },
      })
    }


    

    if (obj.dataIndex == "FileName") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' || 
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  ) ? 'red' : "",
              },
            },
            children: (
              <div style={{ width: "100%" }}>
                <span style={{ display: "inline-block", height: "25px", width: "100%" }} onClick={() => {
                  openViewModal(row['ROI Status'],text, row['PAT_MRN_ID'])}
                }>
                  {text}
                </span>
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "START") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' ||
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",
                textAlign: "center"
              },
            },
            children: (
              <div className="start-button">
                {
                  process != 'Fax Completed' ?
                <Button  type={selectedRowID !=  row.ID ?   "primary" : "danger" } onClick={() => handleStart(row.ID, row)}>{ selectedRowID == row.ID ? "RESET" : "START" }</Button>
                  : null
                }
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "Letter Send") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' ||
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",
                textAlign: "center"
              },
            },
            children: (
              <div>
                {
                  row['ROI Status'] == 'Fax Correction Letter' ? 
                  <Button type="primary" > Send</Button>
                  : null
                }
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
                color: (
                  row['ROI Status'] == 'Not Billable' || 
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",

              },
            },
            children: (
              <div>
                <div style={{ width: "90%", display: "inline-block", textAlign: "left" }}>{text}</div>
                {/* <div style={{ width: "10%", display: "inline-block" }}>
                      <FileSearchOutlined  onClick={() => openSearch(row)} />
                </div> */}
              </div>
            )
          };
        },
      })
    }



    if (obj.dataIndex == "Rename File") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' || 
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  ) ? "red" : "black",

                textAlign: "center"
              },
            },
            children: (
              <div >
                <div style={{ width: "100%", textAlign: "center" }}>
                  {
                    row['PAT_FIRST_NAME'] && row['PAT_LAST_NAME'] ?
                      <FormOutlined onClick={() => handleRename(row)} />
                      : null
                  }
                </div>
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Duration") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' ||
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",

              },
            },
            children: (
              <div>
                {text ? formatTime1(+text / 1000) : ""}
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "FINISH"  ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' || 
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",

                textAlign: "center"
              },
            },
            children: (
              <div>
                   {
                    process != 'Fax Completed' ?
                    <Button className="checker-background" onClick={() => handleReset(row.ID, row)}>      </Button>

                    // <Button  type={selectedRowID !=  row.ID ?   "primary" : "danger" } onClick={() => handleStart(row.ID, row)}>{ selectedRowID == row.ID ? "RESET" : "START" }</Button>
                    : null
                  }
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
                color: (
                  row['ROI Status'] == 'Not Billable' || 
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",

              },
            },
            children: (
              <div>
                <span style={{marginLeft: "11px"}}></span>
                {text ? (text == "NULL" || text == "null") ? "" : text : ""}  
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Date Modified") {
      return ({
        ...obj,
        render: (text, row) => {
          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' || 
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",

              },
            },
            children: (
              <div>
                {text ? 
                
                text.split("T")[0].split('-')[1] + "-" + 
                text.split("T")[0].split('-')[2] + "-" + 
                text.split("T")[0].split('-')[0] 
                
                + " " + text.split("T")[1]?.substring(0, 8) : ""}
              </div>
            )
          };
        },
      })
    }



    if (obj.dataIndex == "StartTimeStamp" || obj.dataIndex == "FinishTimeStamp") {
      return ({
        ...obj,
        render: (text, row) => {


          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' ||
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",

              },
            },
            children: (
              <div>
                {text ? 
                
                
                  text.split("T")[0].split('-')[1] + "-" + 
                  text.split("T")[0].split('-')[2] + "-" + 
                  text.split("T")[0].split('-')[0] 

                + " " + text.split("T")[1]?.substring(0, 8) : ""}
              </div>
            )
          };
        },
      })
    }



    if (obj.dataIndex == "FolderLocation" ) {
      return ({
        ...obj,
        render: (text, row) => {

          let url = `//fs2/faxes/EPICIRWFS/` + folders[row['ROI Status']]
          let path = url.replace(/\//g, '\\')


          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' || 
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",

              },
            },
            children: (
              row['ROI Status'] == 'Fax Correction Letter' ?

              <div style={{width: "100%"}}>
                   <div style={{width: "90%", display: "inline-block"}}>
                   {path}
                </div>
                <div style={{width: "10%", display: "inline-block", verticalAlign: "top"}}>
                    <CopyOutlined onClick={() => copy1(path)} />
                  </div>
                  
              </div>
              : null
            )
          };
        },
      })
    }


    if (obj.dataIndex == "BIRTH_DATE") {
      return ({
        ...obj,
        render: (text, row) => {


          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' ||
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",

              },
            },
            children: (
              <div>

                {text && text.split(" ")[0]? 
                
                text.split("T")[0].split('-')[1] + "-" + 
                  text.split("T")[0].split('-')[2] + "-" + 
                  text.split("T")[0].split('-')[0] 

                : ""}
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Status") {
      return ({
        ...obj,
        render: (text, row) => {


          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: (
                  row['ROI Status'] == 'Not Billable' ||
                  row['ROI Status'] == 'Not Form' ||
                  row['ROI Status'] == 'Not Completed' ||
                  row['ROI Status'] == 'Not Letter' ||
                  row['ROI Status'] == 'Not Billable Completed' ||
                  row['ROI Status'] == 'Not Billable Letter' ||
                  row['ROI Status'] == 'Not Forms Completed' 



                  )  ? "red" : "black",
                textAlign: "center"
              },
            },
            children: (
              <div>
                {text ? text.split("T")[0] : ""}
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
          props: {
            style: {
              background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
              color:(
                row['ROI Status'] == 'Not Billable' ||
                row['ROI Status'] == 'Not Form' ||
                row['ROI Status'] == 'Not Completed' ||
                row['ROI Status'] == 'Not Letter' ||
                row['ROI Status'] == 'Not Billable Completed' ||
                row['ROI Status'] == 'Not Billable Letter' ||
                row['ROI Status'] == 'Not Forms Completed' 



                ) ? "red" : "black",
            },
          },
          children:
            typeof text === "boolean" ? <Checkbox checked={text} /> : text,
        };
      },
    })
  });

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);
  var { pagination, items, filters, sorters } = listResult;
  
  const [dataSource, setDataSource] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [donePercent, setDonePercent] = useState(1);
  const [processPercent, setProcessPercent] = useState(0);
  const { current } = useSelector(selectAuth);
  const [selectedID, setSelectedID] = useState(0);
  const [fullList, setFullList] = useState([]);
  const [totalFaxes, setTotalFaxes] = useState(0);
  const [user, setUser] = useState({});
  const [todayProcessed, setTodayProcessed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [prevPage, setPrevPage] = useState(1);
  const [showClock, setShowClock] = useState(false)

  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])

  useEffect(() => {
    if (config.dataTableColorList && fullList && fullList.length > 0) {
      let list = config.dataTableColorList
      list = list.map(li => {
        if (li.color == "#FFFFFF") {
          li.total = fullList.filter(item => item.Status === li.text || item.Status === null || item.Status === "").length
          return li
        }
        li.total = fullList.filter(item => item.Status === li.text).length
        return li
      })

      setColorList(list)
    }
  }, [config, fullList])


  useEffect(() => {

    if (config.dataTableColorList && fullList && fullList.length == 0) {

      let list = config.dataTableColorList
      list = list.map(li => {
        li.total = 0
        return li
      })

      setColorList(list)
    }
  }, [config])

  const preparebarChartData = async ( dP, pP, faxes) => {

    
      dispatch(crud.create(progressEntity, { ChargesProcessed: (dP * 100).toFixed(2), ChargesToReview: (pP * 100).toFixed(2),'Fax Processed': faxes}));
    
  }

  // set Default color to each row //
  const setRowBackgroundColor = (items) => {
    const tmpObj = {};
    items.map(({ ID, Color }) => {
      tmpObj[ID] = Color
    });

    setColoredRow({ ...coloredRow, ...tmpObj });
  }

  useEffect(() => {

    if (items.length > 0) {
      setRowBackgroundColor(items)
      let i = items.map(item => {
        item.key = item.id
        return item
      })

      getItems(items)
      setDataSource(i)
      
    } else {
      getItems(items)
      setDataSource([])
    }
  }, [items])


  const selectAllRows = (items) => {
    setSelectedRowKeys(items.map((item) => item.ID))
  }

  const getPercentage = (fullList = []) => {

    if (fullList) {

      let dP = (fullList.data.chargesProcessedCount[0]['count']) / fullList.data.totalCharges;
      let pP = (fullList.data.chargesLeftCount[0]['count'] )/ fullList.data.totalCharges;

      dP = dP ? dP : 0
      pP= pP ? pP : 0
      setProcessPercent(dP)
      setDonePercent(pP)
      setTotalFaxes(fullList.data.chargesLeftCount[0]['count'])
      setTodayProcessed(fullList.data.totalProcess[0]['count'])
      
     
      preparebarChartData(dP, pP, fullList.data.totalProcess[0]['count'])
    }
  }

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {

    delete filters['sort']
    setSelectedRowKeys([])
    if (inCopiedMode && !filters['PAT_MRN_ID']) {
      setInCopiedMode(false)
    }


    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }

    // localStorage.setItem(entity, pagination.current)

    const option = {
      page: pagination.current || 1,
      filter: JSON.stringify(filters) || JSON.stringify({}),
      sorter: sorter ? JSON.stringify(filteredArray) : JSON.stringify([])
    };

    filters.sort = (filteredArray);

    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    dispatch(crud.list(entity, option));

    (async () => {
      const response = await request.list(entity + "-full-list");
      setFullList(response.result)
      getPercentage(response.result)
    })()
  };

  const loadTable = async () => {

    let filters = {};

      filters = {
        UserAssigned: [],
        'ROI Status': ['New', 'Not Billable','Not Form','Not Completed', 'Not Letter']

      }

    getFilterValue(filters)

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: JSON.stringify(filters),
      sorter: JSON.stringify([])
    };

    dispatch(crud.list(entity, option));

    (async () => {

      const response = await request.list(entity + "-full-list");
      setFullList(response.result)
      getPercentage(response.result)
      getFullList(response.result)


    })()

  }

  useEffect(() => {

    loadTable()

  }, []);

  useEffect(() => {
    setPrevPage(pagination.current)
  }, [pagination])

  useEffect(async () => {

    if (dataSource.length == 0) {
      return
    }

    if (!reload) {
      if (inCopiedMode) {

        sorters = []
      }
      setInCopiedMode(false)

      if (previousEntity == entity) {

        delete filters['sort']

        handelDataTableLoad(pagination, filters, sorters)
      } else {

        handelDataTableLoad(pagination, {}, {})
      }

    } else {
      setLoading(true)
    }

  }, [reload])


  // useEffect(() => {

  //   handelDataTableLoad(pagination, {}, {})
  // }, [hardReload])

  useEffect(() => {

    if(items.length > 0) {
      const listIds = items.map((x) => x.ID);
      setTableItemsList(listIds);  
    }
    
  }, [items]);



  const [firstRow, setFirstRow] = useState();

  const [onSelect, setSelect] = useState(false);
  const onClickRow = (record, rowIndex) => {
    return {
      onClick: () => {
        setSelectedID(record.ID)
      },
      onMouseDown: (e) => {
        setFirstRow(rowIndex);
        setSelectedRowKeys([record.ID]);
        setSelect(true);

      },
      onMouseEnter: () => {
        if (onSelect) {
          let tableList = []

          if (tableItemsList.length > 100) {

            tableList = (tableItemsList.filter(list => {
              return (tableItemsList.indexOf(list) < (pagination.current * 100) && tableItemsList.indexOf(list) > ((pagination.current - 1) * 100) - 1)
            }))

            const selectedRange = tableList.slice(firstRow, rowIndex + 1);
            setSelectedRowKeys(selectedRange);

          } else {
            tableList = tableItemsList
            const selectedRange = tableList.slice(firstRow, rowIndex + 1);
            setSelectedRowKeys(selectedRange);

          }
        }
      },
      onMouseUp: () => {
        setSelect(false);
      }
    };
  };

  const handelColorRow = (checked, record, index, originNode) => {
    return {
      props: {
        style: {
          background: coloredRow[record.ID] ? coloredRow[record.ID] : "",
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

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

  const handleSave = (row) => {
    const newData = [...items];
    const index = newData.findIndex((item) => row.ID === item.ID);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData)
    onhandleSave(row)

    setTimeout(() => handelDataTableLoad({}), 2000)
  }


  useEffect(() => {
    window.onbeforeunload = function(event)
    {
      socket.emit('update-InProgress', {user: current.EMPID})
    };
  }, [])
 

  const onProcessChanged = (e) => {
    
    let value = e.target.value;
    setProcess(value)
    
    setDataSource([])
    items = []

    if(value == 'New') {
      value = ['New', 'Not Billable', 'Not Form', 'Not Completed', 'Not Letter'] 
    } else if (value == 'Fax Completed') {
      value = ['Fax Completed', 'Duplicate', 'EMR To File']
    }  else if (value == 'Billable New') {
      value = ['Billable New', 'Not Billable Completed', 'Not Billable Letter']
    } else if (value == 'Medical Forms New') {
      value = ['Medical Forms New', 'Not Forms Completed']
    }
  
     else {
      value = [value]
    }

    handelDataTableLoad(1, { 'ROI Status': value }, {})
  }


  const onProcessChanged1 = (e) => {
    let value = e;
    setProcess1(value)
    
    if(value == 'New') {
      value = ['New', 'Not Billable', 'Not Form','Not Completed', 'Not Letter'] 
    } else if (value == 'Fax Completed') {
      value = ['Fax Completed', 'Duplicate', 'EMR To File']
    
    }else {
      value = [value]
    }

    handelDataTableLoad(1, { 'ROI Status': value }, {})
  }

  const barChartConfig = {
    width: 115,
    height: 95,
    data: chartData,
    style: {
      display: "inline-block",
      marginRight: "5px",
      marginTop: "10px"
    }
  }


  const handleClock = (value) => {
    setShowClock(value)
    localStorage.setItem('clock', JSON.stringify(value))
  } 

  return (
    <div className="wq-table">
      

      <Header dataTableTitle={dataTableTitle} showClock={showClock} formatTime={formatTime}  processPercent={processPercent} donePercent={donePercent} totalFaxes={totalFaxes} users={users} handelDataTableLoad={handelDataTableLoad} handleClock={handleClock} timer={timer} filters={filters} todayProcessed={todayProcessed} openSortModal={openSortModal}> </Header>
      <Table
        columns={columns}
        rowKey="ID"
        rowSelection={rowSelection}
        onRow={onClickRow}
        rowClassName={(record, index) => {
          // return 'wq-rows'
          if (record.ID == selectedRowID ) {
            return 'wq-rows '
          } else if(selectedRowID) {
            return 'wq-rows blur-background'
          } else {
            return "wq-rows"
          }
        }}
        scroll={{ y: 'calc(100vh - 25em)' }}

        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
        onChange={handelDataTableLoad}
        footer={
          () => (
            <Row gutter={[24, 24]} className="mt--10">
              <Col style={{ width: "80%" , minWidth: "1200px"}}>
                <Radio.Group value={process} onChange={onProcessChanged}>
                  {
                    tabs && tabs.length > 0 && tabs.map((tab) => {
                      return (
                        tab.value == 'SPACE' ?
                        <Radio.Button style={{visibility: "hidden"}} disabled className="shadow-2 " >{" "}</Radio.Button>
                        :
                        (
                          <Radio.Button value={tab.value} className="shadow-2 mr-3" >{tab.name}</Radio.Button>
                        )
                      )
                    })
                  }
                
                </Radio.Group>
              
              </Col>
              
            </Row>
          )
        }
      />
      <div style={{ marginTop: "-30px" }}>
      </div>
    </div>
  );
})
