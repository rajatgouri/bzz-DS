import FullPageLayout from "@/layout/FullPageLayout";
import React, { useState, useEffect, useRef } from "react";
// import { Editor } from "react-draft-wysiwyg";
// import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
// import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js'
import draftToHtml from 'draftjs-to-html';
import { Button } from "antd";
import { request } from "@/request";
import { notification } from "antd";
import { FullCalendarLayout } from "@/layout";
import Socket from "../socket";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Config from "@/components/Editor"


const styles = {
  layout: {
    // backgroundImage : `url(${background})`,
    // backgroundSize: "cover",
    // backgroundRepeat: "no-repeat"
    minWidth: "1000px",
    padding: "0px 100px"
  } ,
  content:  {
    padding: "30px 40px",
    margin: "85px auto",
    width: "100%",
    maxWidth: "1000px",
    height: "78vh",
    background: "white",
    boxShadow: "1px 1px 6px 5px lightgrey",
    borderRadius: "5px"
  } 
}

export default function Reminder() {
  // const [editMode, setEditMode] = useState(false);
  const [ID, setID] = useState("");
  var [value, setValue] = useState("");
  const editor = useRef();

  const getSunEditorInstance = (sunEditor) => {
    editor.current = sunEditor;
  };

  // const onEditorStateChange = (editState) => {
  //   setEditorState(editState)
  // }

  const onSaveReminder = async () => {

    const resposne = await request.update('billingreminder', ID, {Reminder: value});
    notification.success({message: "Reminders updated successfully!",duration:3})
    Socket.emit('update-reminder')
    // let data =  (draftToHtml(convertToRaw(editorState.getCurrentContent())));  
    // if(editMode) {
     
    // } else {
    //   const resposne = await request.create('billingreminder',  {Reminder: data});
    //   notification.success({message: "Reminders created successfully!", duration:3});
    //   Socket.emit('update-reminder')

    // }    
  }

  const handleChange =(content) => {
    setValue(content)
  }
  

  useEffect(() => {
    (async () => {
      const resposne = await request.read('billingreminder', 1);
      if(resposne.result[0].Reminder) {
          setID(resposne.result[0].ID)
          setValue(resposne.result[0].Reminder ?  resposne.result[0].Reminder : "Hello!")        
      } 

    })()
  }, [])

  return (
    <FullCalendarLayout style={styles}>
      <h3 className="calendar-header">Reminders</h3>
      <div  style={{height: "100%"}}>
      {/*  */}
      <div style={{height: "calc(100% - 90px)"}}>
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
        /> : 
        null
        }
        
        {/* <Editor
          editorState={editorState}
          toolbarClassName="toolbarClassName"
          wrapperClassName="editor-wrapper"
          editorClassName="editor"
          toolbar={{
            options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link','history'],
            inline: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
              options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript'],
              
            },
            blockType: {
              inDropdown: true,
              options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote'],
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
            },
            fontSize: {
              options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
            },
            fontFamily: {
              options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana', 'Are You Serious', 'Cookie','Lobster Two','Merienda'],
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
            },
            list: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
              options: ['unordered', 'ordered', 'indent', 'outdent'],
              
            },
            textAlign: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
              options: ['left', 'center', 'right', 'justify'],
             
            },
            colorPicker: {
              className: undefined,
              component: undefined,
              popupClassName: undefined,
              colors: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
                'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)', 'rgb(0,168,133)',
                'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)', 'rgb(40,50,78)', 'rgb(0,0,0)',
                'rgb(247,218,100)', 'rgb(251,160,38)', 'rgb(235,107,86)', 'rgb(226,80,65)', 'rgb(163,143,132)',
                'rgb(239,239,239)', 'rgb(255,255,255)', 'rgb(250,197,28)', 'rgb(243,121,52)', 'rgb(209,72,65)',
                'rgb(184,49,47)', 'rgb(124,112,107)', 'rgb(209,213,216)'],
            },
            link: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              popupClassName: undefined,
              dropdownClassName: undefined,
              showOpenOptionOnHover: true,
              defaultTargetOption: '_self',
              options: ['link', 'unlink'],
             
              linkCallback: undefined
            },
            history: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
              options: ['undo', 'redo'],
              
            },
          }}
          onEditorStateChange={onEditorStateChange}
        /> */}


  </div>
        <div className="text-right">
          <Button type="primary" onClick={onSaveReminder}>Save</Button>
        </div>
      </div>
    </FullCalendarLayout> 
  )

}
