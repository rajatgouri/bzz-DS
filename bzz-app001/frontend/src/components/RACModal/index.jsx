import React from "react";


export default function RACModal({ config, children }) {
  let { Status, onDateChanges, RAC_Due_Date, Compliance_Due_Date, } = config;

  return (
    <Form
    name="basic"
    labelCol={{ span: 0 }}
    wrapperCol={{ span: 24 }}
    onFinish={onEditRACItem}
    // onFinishFailed={onEditFailed}
    autoComplete="off"
    form={editRACForm}
  >
    {/* <Form.Item
      label=""
      name="Notes"
    >      
      <TextArea type="text" style={{width: "100%", marginBottom: "-5px"}} rows={10}/>
    </Form.Item> */}

    <Row gutter={[24,24]}>
      <Col span={8}>
        <p>Internal Number</p>
        <Form.Item
        label=""
        name="Internal Number"
      >      
        <Input placeholder="Internal Number"/> 
      </Form.Item>
      </Col>
      <Col span={8}>
      <p>Open/Closed</p>
        <Form.Item
        label=""
        name="Open/Closed"
      >      
        <Select >
          <Select.Option value={"Open"}>Open</Select.Option>
          <Select.Option value={"Closed"}>Closed</Select.Option>

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
          <DatePicker style={{ width: "100%" }} defaultValue={moment(RAC_Due_Date, dateFormat)} onChange={(d, date) => onDateChanges('RAC_Due_Date', date)} />
            :
          <DatePicker style={{ width: "100%" }} defaultValue={moment(RAC_Due_Date, dateFormat)} onChange={(d, date) => onDateChanges('RAC_Due_Date', date)} />
          }
          
            <span className="ant-form-item-explain">{errors.RAC_Due_Date }</span>
          
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
          <DatePicker style={{ width: "100%" }} defaultValue={moment(Compliance_Due_Date, dateFormat)} onChange={(d, date) => onDateChanges('Compliance_Due_Date', date)} />
            :
          <DatePicker style={{ width: "100%" }} defaultValue={moment(Compliance_Due_Date, dateFormat)} onChange={(d, date) => onDateChanges('Compliance_Due_Date', date)} />
          }
          
            <span className="ant-form-item-explain">{errors.Compliance_Due_Date }</span>
          
      </Form.Item>
      </Col>

      <Col span={8}>
         <p>Status</p>
        <Form.Item
        label=""
        name="Status"
      >      
       
       <Select >
            {
              Status.filter((value) => value.value != "").map((status) => {
                if(status.value  != "" ) {
                  return  <Select.Option value={status.value}>{status.text}</Select.Option>
                }
               })
             } 
          </Select>
      </Form.Item>
      </Col>

      
    </Row>
    
    <Form.Item wrapperCol={{ offset: 18 }} style={{marginBottom: "-10px"}}>
      <Button type="primary" htmlType="submit" className="mr-3" >
        Update
      </Button>
    </Form.Item>
  </Form>
  );
}
