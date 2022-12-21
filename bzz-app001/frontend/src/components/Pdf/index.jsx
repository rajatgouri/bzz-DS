


import React, {useState, useEffect, useMemo, useRef} from "react";
import { Modal, notification } from "antd";
import { Document, Page } from 'react-pdf';
import {  Button, Input} from "antd";
import { EyeOutlined, SearchOutlined , RightOutlined, LeftOutlined, ZoomOutOutlined, ZoomInOutlined, DownOutlined, UpOutlined} from "@ant-design/icons";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { pdfjs } from 'react-pdf';
import { request } from "@/request";
pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

const { Search } = Input;

function highlightPattern(text, pattern) {


  const splitText = text.toLowerCase().replace(',', '').split(pattern.toLowerCase());

  if (splitText.length <= 1) {
    return text;
  }

  var matches = text.match(new RegExp(pattern, 'ig'));

  matches = matches || []
  return splitText.reduce((arr, element, index) => (matches[index] ? [
    ...arr,
    element,
    <mark key={index} style={{backgroundColor: '#000', color: "yellow", border: "2px solid"}}>
      {matches[index]}
    </mark>,
  ] : [...arr, element]), []);
}

export default function PdfModal({ config}) {
  let { title,  openModal, handleCancel , width = 400, style = {}, centered = true, minHeight="0px" , close, pdf, page= 1, patient = '',  } = config;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [zoom, setZoom] = useState(2);
  const [searchText, setSearchText] = useState(patient);
  const eventListeners = useRef();
  
  
  useEffect(() => {
    setSearchText(patient)
  }, [patient])



  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    localStorage.setItem('numPages', numPages)
  }
 

  function changePage(offset) {
    setPageNumber( prevPageNumber => {
      localStorage.setItem('page', prevPageNumber +offset)
      return prevPageNumber + offset
    });

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

  useEffect(() => {
    if(page) {
      setPageNumber(+page)    
      localStorage.setItem('page', +page)

    } 
    
  }, [page])


  function onSearch(value) {
    setSearchText(value);
  }

  useEffect(() => {
      if(openModal) {
        addKeyEvent()
      }
  }, [pdf])

  useEffect(() => {
    if(!openModal) {
      removeKeyEvent()
    }
  }, [openModal])


  const keyhandler = (e) => {
    if(e.code == 'ArrowRight') {

    let n= localStorage.getItem('numPages')
    let p= localStorage.getItem('page')

      if(p < n) {
        nextPage()

      }

    
    } else if(e.code == 'ArrowLeft') {
        let p = localStorage.getItem('page')
        if(p > 1){
          previousPage()
        }

    } else if (e.code == 'ArrowUp') {
      populatevalueforRow('Yes')
    } else if (e.code == 'ArrowDown') {
      populatevalueforRow('No')
    }
  }

  const removeKeyEvent = () => {

    let viewer = document.getElementsByClassName('pdf-viewer2')[0]

    if(viewer) {
      document.removeEventListener('keyup', eventListeners.current, true)
    }
    
  }


  const populatevalueforRow = async(Found) => {
    let filename = localStorage.getItem('filename')
    let page = localStorage.getItem('page')
    
    await request.update('misfilecheckbyfilename', page, {filename, Found})
    notification.success({message: `Document is set to ${Found == 'Yes' ? 'found' : 'not found'}`})

  }

  const addKeyEvent= () => {
    
    eventListeners.current = keyhandler
    document.addEventListener('keyup', eventListeners.current, true)
  }

  return (
    <>
    <Modal maskClosable={false} centered={centered} bodyStyle={{minHeight: minHeight}}  style={style} title={title} visible={openModal} onCancel={() => {
       setSearchText(patient) 
      handleCancel()
    }} footer={null} closeIcon={close ?  <span style={{visibility: "hidden"}} >"."</span> : "" }  width={width}>
   <div className="pdf-viewer2">

    {

            pdf ?
              <div className="pdf-viewer1">

                <div className="zoom-container">

                <p style={{position: "absolute" ,marginTop: "1px"}}>
                  Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
                </p>

                <Button
                    style={{marginRight: "10px", marginLeft: "90px"}}
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
                    type="button"
                    shape="circle"
                    style={{marginRight: "10px", marginLeft: "10px"}}

                    onClick={() => 
                      populatevalueforRow('Yes')

                    }
                  >
                   <UpOutlined />
                  </Button>

                  <Button
                    type="button"
                    shape="circle"

                    onClick={() => populatevalueforRow('No')}
                   
                  >
                    <DownOutlined />
                  </Button>

                  <Button
                    style={{marginRight: "10px" , marginLeft: "10px"}}
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

                  <Search placeholder="input search text" onSearch={onSearch} style={{ width: "200px", marginLeft: "20px" }} />

                </div>

                <Document
                  file={pdf}
                  onLoadSuccess={onDocumentLoadSuccess}
                >

                  <Page
                    scale={zoom} pageNumber={pageNumber}
                    renderAnnotationLayer={true}
                    customTextRenderer={({ str, itemIndex }) =>
                    (
                      highlightPattern(str, searchText)
                    )}
                  />

                </Document>
                {/* <p>Page {pageNumber} of {numPages}</p> */}


                

              </div>
              : 
              <h4>Loading..</h4>

          }
   </div>


      </Modal>
    </> 
  );
}
