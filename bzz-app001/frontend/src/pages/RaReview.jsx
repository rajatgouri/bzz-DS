import React, { useEffect, useState } from "react";
import { Row, Col , Select, Button} from "antd";
import { DashboardLayout } from "@/layout";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { Pie, measureTextWidth } from "@ant-design/charts";
import PageLoader from "@/components/PageLoader";
import { DatePicker, Space } from 'antd';
import { SearchOutlined } from "@ant-design/icons";
import { request } from "@/request";
const { RangePicker } = DatePicker;
const dateFormatList = ['MM/DD/YYYY', 'MM/DD/YY', 'MM-DD-YYYY', 'MM-DD-YY',];

const {Option} = Select

const dashboardStyles = {
  content: {
    "boxShadow": "none",
    "padding": "35px",
    "width": "100%",
    "overflow": "revert",
    "background": "#eff1f4",
    "margin": "auto",
    "maxWidth": "1333px",
    "height": "0px"
  },
  section: {
    minHeight: "100vh",
    maxHeight: "100vh",
    minWidth: "1333px"
  }
}


const DemoPie = ({ data = [], type = '', layout = 'vertical', colors = [], percentage = "%", closed = 'Closed' }) => {

  data = data.filter((d) => d.type != "Total Recouped")
  data = data.filter((d) => d.type != "Total Denied")
  data = data.filter((d) => d.type != "Total Appeals")



  function renderStatistic(containerWidth, text, style, fontWeight = 500) {
    const { width: textWidth, height: textHeight } = measureTextWidth(text, style);
    const R = containerWidth / 2; // r^2 = (w / 2)^2 + (h - offsetY)^2

    let scale = 1;

    if (containerWidth < textWidth) {
      scale = Math.min(Math.sqrt(Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2)))), 1);
    }

    const textStyleStr = `width:${containerWidth}px;`;
    return `<div style="${textStyleStr};font-size:${scale}em;line-height:${scale < 1 ? 1 : 'inherit'};font-weight:${fontWeight}  ">${text}</div>`;
  }


  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.64,
    meta: {
      value: {
        formatter: (v) => `${v}`,
      },
    },
    legend: {
      layout: layout,
      position: 'bottom',
      style: {
        fontSize: "8px",
        marginTop: "-50px"
      }
    },
    label: {
      type: 'inner',
      offset: '-50%',
      style: {
        textAlign: 'center',
        fill: 'black'
      },
      autoRotate: false,
      content: (value) => value.value ? value.value + percentage : '',
      formatter: (value) => {
        console.log(value)
      }

    },
    colorField: 'type',
    color: colors.length > 0 ? colors : data.map((d) => d.color),

    statistic: {
      title: {
        offsetY: -4,
        style: {
          fontSize: '12px',
        },
        customHtml: (container, view, datum) => {
          const { width, height } = container.getBoundingClientRect();
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          const text = datum ? datum.type :  closed + " " + type;
          return renderStatistic(d, text, {
            fontSize: 8,
            fontWeight: 700
          });
        },
      },
      content: {
        offsetY: 4,
        style: {
          fontSize: '14px',
        },
        customHtml: (container, view, datum, data) => {
          const { width } = container.getBoundingClientRect();
          const text = '';
          return renderStatistic(width, text, {
            fontSize: 14,
          });
        },
      },
    },
    // 添加 中心统计文本 交互
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
      {
        type: 'pie-statistic-active',
      },
    ],
  };
  return <Pie {...config} />;
};

export default function RAReview() {
  const dispatch = useDispatch();
  const [data, setData] = useState([])
  const [loading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState('RAC')
  const [dates, setDates] = useState([])
  const [totalData, setTotalData] = useState({})

  var { result: listResult, isLoading } = useSelector(selectListItems);
  var { items } = listResult;


  useEffect(() => {
    getData({ dates: JSON.stringify([]) })
    getTotalData()
  }, [])

  useEffect(() => {

    setData(items)
  }, [items])


  const getData = (options) => {
    dispatch(crud.list('ra-review', options));
  }


  const onChangeDatePicker = (d, value) => {
    getData({ dates: JSON.stringify(value) })
  }


 const getTotalData = async () => {
  setIsLoading(true)
  console.log(dates)
  let {result} = await request.list('ra-review-total', {model: selected, date: dates })
  setTotalData(result)
  setIsLoading(false)

}


  return (
    <DashboardLayout style={dashboardStyles}>


      <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>
        <Col span={12}>

          <div style={{ 'display': 'block', 'float': 'left', marginBottom: "20px" }}>
            <h2
              className="ant-page-header-heading-title"
              style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
            >
              Routine Audits Post Payment Review
            </h2>
          </div>
        </Col>
        <Col span={12} style={{ textAlign: "end" }}>


        </Col>
        <Col span={24} style={{ textAlign: "end", marginBottom: "30px" }}>
          <label className="small-header">Audits Received :</label> {"   "}
          <RangePicker
            className="shadow-1"
            format={dateFormatList}
            onChange={onChangeDatePicker}
          />
        </Col>
      </Row>
      {/* <div style={{ width: "100%", marginBottom: "45px" }}>

        <h2 className="ant-page-header-heading-title">Routine Audits Post Payment Review</h2>
      </div> */}

      <Row gutter={[24, 24]} className="ra-review">



        <Col span={12} className="gutter-row ">
          <div className="whitebox shadow h-100 p-5 mb-5 border-5" style={{ minHeight: "400px", fontSize: "12.5px" }}>
            {
              isLoading ?
                <PageLoader />
                :
                <div>
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <h4 style={{ marginBottom: "35px" }}>RACs Post Payment Review</h4>

                      <div >
                        <div className="inline w-50 font-bold">Closed </div>
                        <div className="inline w-50 text-end ">{data['RAC'] ? data['RAC']['closed'] : 0}</div>
                      </div>

                      <div >
                        <div className="inline w-50 font-bold">
                          Open
                        </div>
                        <div className="inline w-50 text-end ">
                          {data['RAC'] ? data['RAC']['open'] : 0}
                        </div>
                      </div>


                      <div style={{ height: "50px" }}></div>

                      <div >
                        <div className="inline w-75 ">
                          Total Handled Touched
                        </div>
                        <div className="inline w-25 text-end " style={{ padding: "2px 5px" }}>
                          {data['RAC'] ? data['RAC']['total'] : 0}
                        </div>
                      </div>

                      {
                        data['RAC'] && data['RAC']['data'].map((d) => {
                          return (
                            <div style={{ background: d.color, padding: "5px 5px" }}>
                              <div className="inline w-20 ">
                                {/* {d.value} % */}
                                {d.value ? d.value + ' %' : ''}

                              </div>
                              <div className="inline w-55 ">
                                {d.type}
                              </div>
                              <div className="inline w-25 text-end ">
                                {d.count}
                              </div>
                            </div>
                          )
                        })
                      }

                    </Col>
                    <Col span={12} style={{ marginTop: "-30px" }}>
                      <DemoPie data={data['RAC'] ? data['RAC']['data'] : []} type={'RACs'} />


                    </Col>

                  </Row>
                  <Row gutter={[24, 24]}>
                    <Col span={12}>

                      <div className="status_open" >
                        <h5>
                          Status Open
                        </h5>
                        <div className="open-items">

                          {
                            data['RAC'] && data['RAC']['status']['open'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.Status}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>

                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="status_closed">
                        <h5>
                          Status Closed
                        </h5>
                        <div className="closed-items">

                          {
                            data['RAC'] && data['RAC']['status']['closed'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.Status}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>

                        <div style={{ marginTop: "23px", marginBottom: "10px" }}></div>

                        <h5>
                          Recoupment Rationale
                        </h5>
                        <div className="recoupment-items">

                          {
                            data['RAC'] && data['RAC']['recoupmentRationale'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.RecoupmentRationale}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    </Col>

                  </Row>
                </div>

            }


          </div>
        </Col>

        <Col span={12} className="gutter-row ">
          <div className="whitebox shadow h-100 p-5 border-5" style={{ minHeight: "400px", fontSize: "12.5px" }}>
            {
              isLoading ?
                <PageLoader />
                :
                <div>
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <h4 style={{ marginBottom: "35px" }}>ADRs Pre & Post Payment Review</h4>

                      <div >
                        <div className="inline w-50 font-bold">Closed </div>
                        <div className="inline w-50 text-end ">{data['ADR'] ? data['ADR']['closed'] : 0}</div>
                      </div>

                      <div >
                        <div className="inline w-50 font-bold">
                          Open
                        </div>
                        <div className="inline w-50 text-end ">
                          {data['ADR'] ? data['ADR']['open'] : 0}
                        </div>
                      </div>


                      <div style={{ height: "50px" }}></div>

                      <div >
                        <div className="inline w-75 ">
                          Total Touched
                        </div>
                        <div className="inline w-25 text-end " style={{ padding: "2px 5px" }}>
                          {data['ADR'] ? data['ADR']['total'] : 0}
                        </div>
                      </div>

                      {
                        data['ADR'] && data['ADR']['data'].map((d) => {
                          return (
                            <div style={{ background: d.color, padding: "5px 5px", }}>
                              <div className="inline w-20 ">
                                {d.value ? d.value + ' %' : ''}
                              </div>
                              <div className="inline w-55 font-1">
                                {d.type}
                              </div>
                              <div className="inline w-25 text-end ">
                                {d.count}
                              </div>
                            </div>
                          )
                        })
                      }

                    </Col>
                    <Col span={12} style={{ marginTop: "-30px" }}>
                      <DemoPie data={data['ADR'] ? data['ADR']['data'] : []} type={'ADRs'} />
                    </Col>

                  </Row>
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <div className="status_open" >
                        <h5>
                          Status Open
                        </h5>
                        <div className="open-items">

                          {
                            data['ADR'] && data['ADR']['status']['open'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.Status}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="status_closed">
                        <h5>
                          Status Closed
                        </h5>
                        <div className="closed-items" >

                          {
                            data['ADR'] && data['ADR']['status']['closed'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.Status}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>

                        <div style={{ marginTop: "23px", marginBottom: "10px" }}></div>

                        <h5>
                          Recoupment Rationale
                        </h5>
                        <div className="recoupment-items">

                          {
                            data['ADR'] && data['ADR']['recoupmentRationale'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.RecoupmentRationale}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>

                      </div>
                    </Col>
                  </Row>
                </div>
            }

          </div>
        </Col>

        <Col span={12} className="gutter-row ">
          <div className="whitebox shadow h-100 p-5 border-5" style={{ minHeight: "400px", fontSize: "12.5px" }}>
            {
              isLoading ?
                <PageLoader />
                :
                <div>
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <h4 style={{ marginBottom: "35px" }}>NNs Post Payment Review</h4>

                      <div >
                        <div className="inline w-50 font-bold">Closed </div>
                        <div className="inline w-50 text-end ">{data['NN'] ? data['NN']['closed'] : 0}</div>
                      </div>

                      <div >
                        <div className="inline w-50 font-bold">
                          Open
                        </div>
                        <div className="inline w-50 text-end ">
                          {data['NN'] ? data['NN']['open'] : 0}
                        </div>
                      </div>


                      <div style={{ height: "50px" }}></div>



                      {
                        data['NN'] && data['NN']['data'].map((d) => {
                          return (
                            <div style={{ background: d.color, padding: "2px 5px", }}>
                              <div className="inline w-20 ">
                                {/* {d.value} % */}
                                {d.value ? d.value + ' %' : ''}

                              </div>
                              <div className="inline w-55 font-1">
                                {d.type}
                              </div>
                              <div className="inline w-25 text-end ">
                                {d.count}
                              </div>
                            </div>
                          )
                        })
                      }





                    </Col>
                    <Col span={12} style={{ marginTop: "-30px" }}>
                      <DemoPie data={data['NN'] ? data['NN']['data'] : []} type={'NNs'} />


                    </Col>

                  </Row>
                  <Row gutter={[24, 24]}>
                    <Col span={12}>

                      <div className="status_open" >
                        <h5>
                          Status Open
                        </h5>
                        <div className="open-items">

                          {
                            data['NN'] && data['NN']['status']['open'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.Status}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>

                    </Col>
                    <Col span={12}>

                      <div className="status_closed">
                        <h5>
                          Status Closed
                        </h5>
                        <div className="closed-items">

                          {
                            data['NN'] && data['NN']['status']['closed'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.Status}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>

                        <div style={{ marginTop: "23px", marginBottom: "10px" }}></div>

                        <h5>
                          Recoupment Rationale
                        </h5>
                        <div className="recoupment-items">

                          {
                            data['NN'] && data['NN']['recoupmentRationale'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.RecoupmentRationale}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>

                      </div>
                    </Col>
                  </Row>
                </div>
            }

          </div>
        </Col>
        <Col span={12} className="gutter-row ">
          <div className="whitebox shadow h-100 p-5 border-5" style={{ minHeight: "400px", fontSize: "12.5px" }}>
            {
              isLoading ?
                <PageLoader />
                :
                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <h4 style={{ marginBottom: "35px" }}>CERTs Post Payment Review</h4>

                    <div >
                      <div className="inline w-50 font-bold">Closed </div>
                      <div className="inline w-50 text-end ">{data['CERT'] ? data['CERT']['closed'] : 0}</div>
                    </div>

                    <div >
                      <div className="inline w-50 font-bold">
                        Open
                      </div>
                      <div className="inline w-50 text-end ">
                        {data['CERT'] ? data['CERT']['open'] : 0}
                      </div>
                    </div>


                    <div style={{ height: "50px" }}></div>


                    {
                      data['CERT'] && data['CERT']['data'].map((d) => {
                        return (
                          <div style={{ background: d.color, padding: "2px 5px" }}>
                            <div className="inline w-20 ">
                              {/* {d.value} % */}
                              {d.value ? d.value + ' %' : ''}

                            </div>
                            <div className="inline w-55 font-1">
                              {d.type}
                            </div>
                            <div className="inline w-25 text-end ">
                              {d.count}
                            </div>
                          </div>
                        )
                      })
                    }





                  </Col>
                  <Col span={12} style={{ marginTop: "-30px" }}>
                    <DemoPie data={data['CERT'] ? data['CERT']['data'] : []} type={'CERTs'} />



                  </Col>
                  <Col span={12}>
                    <div className="status_open" >
                      <h5>
                        Status Open
                      </h5>
                      <div className="open-items">

                        {
                          data['CERT'] && data['CERT']['status']['open'].map((d) => {
                            return (
                              <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                <div className="inline w-75 ">
                                  {d.Status}
                                </div>
                                <div className="inline w-25 text-end ">
                                  {d.count}
                                </div>
                              </div>
                            )
                          })
                        }
                      </div>


                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="status_closed"  >
                      <h5>
                        Status Closed
                      </h5>
                      <div className="closed-items" >

                        {
                          data['CERT'] && data['CERT']['status']['closed'].map((d) => {
                            return (
                              <div style={{ background: d.color, padding: "5px 5px", border: "1px solid lightgrey" }}>

                                <div className="inline w-75 ">
                                  {d.Status}
                                </div>
                                <div className="inline w-25 text-end ">
                                  {d.count}
                                </div>
                              </div>
                            )
                          })
                        }
                      </div>

                      <div style={{ marginTop: "23px", marginBottom: "10px" }}></div>

                      <h5>
                        Recoupment Rationale
                      </h5>
                      <div className="recoupment-items">

                        {
                          data['CERT'] && data['CERT']['recoupmentRationale'].map((d) => {
                            return (
                              <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                <div className="inline w-75 ">
                                  {d.RecoupmentRationale}
                                </div>
                                <div className="inline w-25 text-end ">
                                  {d.count}
                                </div>
                              </div>
                            )
                          })
                        }
                      </div>

                    </div>
                  </Col>
                </Row>
            }

          </div>
        </Col>



        <Col span={12} className="gutter-row ">
          <div className="whitebox shadow h-100 p-5 border-5" style={{ minHeight: "400px", fontSize: "12.5px" }}>
            {
              isLoading ?
                <PageLoader />
                :
                <div>

                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <h4 style={{ marginBottom: "35px" }}>All Pre & Post Payment Review</h4>

                      <div >
                        <div className="inline w-50 font-bold">Closed </div>
                        <div className="inline w-50 text-end ">{data['All'] ? data['All']['closed'] : 0}</div>
                      </div>

                      <div >
                        <div className="inline w-50 font-bold">
                          Open
                        </div>
                        <div className="inline w-50 text-end ">
                          {data['All'] ? data['All']['open'] : 0}
                        </div>
                      </div>


                      <div style={{ height: "50px" }}></div>

                      <div >
                        <div className="inline w-75 ">
                          Total Touched
                        </div>
                        <div className="inline w-25 text-end " style={{ padding: "2px 5px" }}>
                          {data['All'] ? data['All']['total'] : 0}
                        </div>
                      </div>

                      {
                        data['All'] && data['All']['data'].map((d) => {
                          return (
                            <div style={{ background: d.color, padding: "5px 5px" }}>
                              <div className="inline w-20 ">
                                {d.value ? d.value + ' %' : ''}
                              </div>
                              <div className="inline w-55 font-1">
                                {d.type}
                              </div>
                              <div className="inline w-25 text-end ">
                                {d.count}
                              </div>
                            </div>
                          )
                        })
                      }




                    </Col>
                    <Col span={12} style={{ marginTop: "-30px" }}>
                      <DemoPie data={data['All'] ? data['All']['data'] : []} type={'All'} />


                    </Col>



                  </Row>
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <div className="status_open" >
                        <h5>
                          Status Open
                        </h5>
                        <div className="open-items">

                          {
                            data['All'] && data['All']['status']['open'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.Status}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="status_closed">
                        <h5>
                          Status Closed
                        </h5>
                        <div className="closed-items" >

                          {
                            data['All'] && data['All']['status']['closed'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.Status}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>

                        <div style={{ marginTop: "23px", marginBottom: "10px" }}></div>

                        <h5>
                          Recoupment Rationale
                        </h5>
                        <div className="recoupment-items">

                          {
                            data['All'] && data['All']['recoupmentRationale'].map((d) => {
                              return (
                                <div style={{ background: d.color, padding: "2px 5px", border: "1px solid lightgrey" }}>

                                  <div className="inline w-75 ">
                                    {d.RecoupmentRationale}
                                  </div>
                                  <div className="inline w-25 text-end ">
                                    {d.count}
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>

                      </div>
                    </Col>
                  </Row>
                </div>
            }

          </div>
        </Col>


        <Col span={12} className="gutter-row ">
          <div className="whitebox shadow h-100 p-5 border-5" style={{ minHeight: "400px", fontSize: "12.5px" }}>
            {
              isLoading ?
                <PageLoader />
                :
                <Row gutter={[24, 24]}>

                  <Col span={24} >
                    <h4 style={{ textAlign: "center" }}>Total Outcome</h4>
                    <DemoPie data={data['All'] ? data['All']['outcome'] : []} type={'Outcome'} layout="horizontal" percentage="" />
                  </Col>

                  <Col span={24} >
                    <h4 style={{ textAlign: "center" }}>Total Open | Closed</h4>
                    <DemoPie data={data['All'] ? data['All']['statuses'] : []} type={'Status'} layout="horizontal" colors={['#FFC482', '#7CCDE6']} percentage="" />
                  </Col>

                </Row>
            }

          </div>
        </Col>


        <Col span={24} className="gutter-row ">
          <div className="whitebox shadow h-100 p-5 mb-5 border-5" style={{ minHeight: "400px", fontSize: "12.5px" }}>
            <Row gutter={[24, 24]}>
            <Col span={12}>
                    <h4 >Total per Year</h4>
                        
                    </Col>
                    <Col span={12} className={"text-end"}>
                        <Select className="mr-3 w-25 text-left" value={selected} onChange={(value) => setSelected(value) }>
                            <Option key="RAC" value={'RAC'}>RAC</Option>
                            <Option key="ADR" value={'ADR'}>ADR</Option>
                            <Option key="NN" value={'NN'}>NN</Option>
                            <Option key="CERT" value={'CERT'}>CERT</Option>

                        </Select>
                        <DatePicker picker="year" className="mr-3" onChange={(d,value) => setDates(value)}></DatePicker>
                        <Button onClick={getTotalData}>
                          <SearchOutlined ></SearchOutlined>

                        </Button>
                    </Col>
            </Row>
            {
              loading ?
                <PageLoader />
                :
                <div>
                  <Row gutter={[24, 24]}>
                    
                    <Col span={12}>
                      <div style={{ height: "50px" }}></div>


                      <div >
                        <div className="inline w-50 font-bold">Total {selected} </div>
                        <div className="inline w-50 text-end ">{totalData['total'] ? totalData['total'] : 0}</div>
                      </div>

                      <div >
                        <div className="inline w-50 font-bold">Closed </div>
                        <div className="inline w-50 text-end ">{totalData['closed'] ? totalData['closed'] : 0}</div>
                      </div>

                      <div >
                        <div className="inline w-50 font-bold">
                          Open
                        </div>
                        <div className="inline w-50 text-end ">
                          {totalData['open'] ? totalData['open'] : 0}
                        </div>
                      </div>

                      <div style={{ height: "20px" }}></div>


                      {
                         totalData['totalyear'] && totalData['totalyear'].map((d,i) => {
                          return (
                              
                            <div style={{ background: d.color , padding: "5px 5px"}}>
                              <div className="inline w-20 ">
                                {d.value ? d.value + ' %' : ''}
                              </div>
                              <div className="inline w-55 font-bold">
                                
                               {d.type}  {d.year ?  d.year  : ''}
                              </div>
                              <div className="inline w-25 text-end ">
                                {d.count}
                              </div>
                            </div>
                          )
                        })
                      }
                      <div style={{ height: "20px" }}></div>
                     

                      {
                         totalData['year'] && totalData['year'].flatMap ((d,i) => {
                          if (i > 0 && totalData['year'][i-1].year != d.year) { 
                            
                            return [ {
                              type: 'Space',
                            }, d]
                          } else {
                            return d
                          }

                         }).map((d) => {

                          console.log(d)
                          return (
                              d.type == 'Space' ?
                             <div style={{ height: "5px" }}></div>
                              :
                            <div style={{ background: d.color , padding: "5px 5px"}}>

                              <div className="inline w-20 ">
                                {d.value ? d.value + ' %' : ''}
                              </div>
                              <div className="inline w-55 font-bold">
                                
                               {d.type} in  {d.year ?  d.year  : '-'}
                              </div>
                              <div className="inline w-25 text-end ">
                                {d.count}
                              </div>
                            </div>
                          )
                        })
                      }

                   
                    </Col>
                    <Col span={12} >
                    <div style={{ height: "50px" }}></div>

                      <DemoPie data={totalData['totalyear'] && totalData['totalyear'].length > 0 ? totalData['totalyear'] : totalData['year']} type={'Total per year'}  layout="horizontal" closed=""/>


                    </Col>

                  </Row>
                 
                </div>

            }


          </div>
        </Col> 
        <div style={{ padding: "35px" }}></div>
      </Row>

      
    </DashboardLayout>
  );
}
