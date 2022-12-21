const { getDateTime } = require('./controllers/utilController');
var sql = require("mssql");
const path = require('path');
const Model = "IncomingWQ";
var fs = require('fs');
const dir = path.resolve("/home/node/faxtest");
const endpoints = {}

const watcherFunc = async () => {
  
    let files = (fs.readdirSync(dir));

    files = (files.filter(file => file.indexOf('.PDF') > -1 ))

    if (files.length == 0) {
      await sql.query (`DELETE from ${Model} where [ROI Status] IN ('New', 'Not Billable','Not Completed', 'Not Lettre', 'Not Form')`)
      
      setTimeout(() => {
        watcherFunc()
      }, 5000)
    } else {

    let {recordset: exists} = await sql.query(`select * from ${Model} where FileName  IN  (${files.map((f) => "'"+ f +"'")}) and [ROI Status] IN ('New', 'Not Billable','Not Completed', 'Not Lettre', 'Not Form')`)
    
    let dbFiles = (exists.map((e) => e.FileName))

    files = files.filter( function( el ) {
      return dbFiles.indexOf( el ) < 0;
    });


    if (files.length == 0) {
      
      // let f1 = dbFiles.filter( function( el ) {
      //   return files.indexOf( el ) < 0;
      // });

      // console.log(f1)
      setTimeout(() => {
        watcherFunc()
      }, 5000)
    }

    var counter = 0;

    for (let i=0 ; i<files.length ; i++) {

      let filePath = files[i];
      let selectQuery = `select * from ${Model} where FileName= '${filePath}' and [ROI Status] IN  ('New', 'Not Billable','Not Completed', 'Not Lettre', 'Not Form')`
      const {recordset: arr} = await sql.query(selectQuery);

       
      if (arr.length > 0) {
        counter += 1

        if(i == files.length -1) {
          
          deleteFilesFunction()   
          watcherFunc()
        }
        continue 
      }

      let insertQuery = `insert into ${Model} (FileName, [ROI Status] ,Location, [Date Modified]) values ('${filePath}' , 'New' , '${filePath}', '${getDateTime()}' )` 
      await sql.query(insertQuery);

      counter += 1

      if(i == files.length -1) {
        deleteFilesFunction()      
        watcherFunc()
      }      

    }
  }
}


    
const getLocalFiles = () => {
    return (fs.readdirSync(dir));
  }
  
  
  const getDBFiles = async () => {
    let selectQuery = `select FileName from ${Model} `        
    const {recordset: files} = await sql.query(selectQuery);
    var DBFILES = files.map(({FileName}) => (FileName))
    return DBFILES
  }
  
  const deleteFilesFunction = async () => {
    const [dbFiles, localfiles  ] = await Promise.all([ await getDBFiles(), await getLocalFiles()])
  
      let filesTOBeDeleted = dbFiles.filter( function( el ) {
        return localfiles.indexOf( el ) < 0;
      });
  
      filesTOBeDeleted.map(async (filePath) => {
  
        let deleteQuery = `delete from ${Model} where FileName IN ('${filePath}') and [ROI Status] IN ('New', 'Not Billable') `
        await sql.query(deleteQuery);
      })
  
  } 
  
  

endpoints.watch = async () => {
    try {
      
      watcherFunc()
      
    } catch (err) {
        console.log(err)
    }
  };
  
  
 
    
  module.exports = endpoints;
    