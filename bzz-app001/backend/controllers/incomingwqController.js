const methods = require("./crudController");
const endpoints = methods.crudController("IncomingWQ");
var sql = require("mssql");
const fs = require('fs')
const path = require('path');

const {getDateTime} = require('./utilController');
const { folder } = require("./mediaController");
const dir = path.resolve("/home/node/faxtest");

delete endpoints["update"];
delete endpoints["list"];
const Model = "IncomingWQ";
const LoggerModel = 'IncomingWQLogger'
const ColumnModel = "IncomingWQColumns"



endpoints.read = async (req,res) => {
    try {
        const {fileName, id} = req.params;

        const {recordset: result} = await sql.query(`select * from ${Model} where FileName = '${fileName}' and ID NOT IN (${id})`)
       
        if(result.length > 0) {
            return res.status(200).json({
                success: true,
                result: result,
                message: "file already exists",
              });    
        } else {
            return res.status(200).json({
                success: false,
                result: result,
                message: "file not exists",
              });
        }
       
      } catch (err) {
          console.log(err)
        return res.status(500).json({
          success: false,
          result: [],
          message: "Oops there is error",
          error: err,
        });
      }
}



endpoints.create = async (req, res) => {
    try {
      const values = req.body;
      var usDate = getDateTime();

      values['Date Modified'] = usDate;
      const columnsQ = "(" + Object.keys(values).map(v => ('[' + v + ']')).toString() + ")"

  
      let valuesQuery = "";
      for (key in values) {
            if (values[key] === "null" || values[key] === null) {
                valuesQuery += "NULL" + ",";
            } else {
                valuesQuery += "'" + values[key] + "',";
            }
        }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
    
      const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`
  
      await sql.query(insertQuery);
  
      return res.status(200).json({
        success: true,
        result: {},
        message: "Success",
      });
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        success: false,
        result: null,
        message: "Oops there is an Error",
        error: err,
      });
    }

  };

endpoints.list = async (req, res,) => {
    try {

        var page = req.query.page || 1;
        var filter = JSON.parse(req.query.filter);
        var sorter = JSON.parse(req.query.sorter);
            
        var top10 = false;
        
        let filterQuery = "";
        let sorterQuery = "";

        for (key in filter) {
            if(filter[key]) {

                switch (key) {
                    case "Status" : {
                        let values = filter[key];
                        
                        if(values.indexOf('Review') > -1) {
                            values.push('')
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            filterQuery +=  +filter[key] !== null ?  "(" + key + " IN (" + valueQuery + ") or " : "" ;
                            filterQuery += 'Status IS NULL) and '

                        } else {
                            
                            valueQuery = values.map(v => ( "'" + v  + "'"))
                            if(values.length > 0) {
                                filterQuery +=  +filter[key] !== null ?  key + " IN (" + valueQuery + ") and " : "" ;
                            }
                        }
                        break
                    }

                    case "ROI Status": {
                        let values = filter[key];
                            
                           

                            valueQuery = values.map(v => ( "'" + v  + "'"))

                            if(values.length > 0) {
                                filterQuery +=  +filter[key] !== null ? "["+ key + "] IN (" + valueQuery + ") and " : "" ;
                            }

                            break
                            
                        }
                    
                    case "UserAssigned" : {
                        let values = filter[key];
                        valueQuery = values.map(v => ( "'" + v + "'"))
                        if(valueQuery.length > 0) {
                            filterQuery += filter[key] !== null ?  key + " IN (" + valueQuery + ") and " : "" ;
                        }
                        break
                    }
                    
                    case "Comments": {

                        let values = filter[key];
                        if (values.length < 2 && values[0] == 0) {
                            filterQuery +=  key + " NOT IN ( '' )  and " 
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "("+ key + " IN ( '' ) or Comments IS NULL) and " ;
                        } 
                        break;
                    } 



                    

                    case "MRN": {

                        let values = filter[key];
                        valueQuery = values.map(v => ( "'" + v  + "'"))
                        filterQuery +=  +filter[key] != null ?  "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "" ;
                        
                        if(values.indexOf(null) > -1 ) {
                            filterQuery +='or [MRN] IS NULL) and '
                        } else {
                            filterQuery += ") and "
                        }

                        break;
                    } 

                    
                    case "ID": {

                        let value = filter[key];
                        
                        filterQuery +=  +filter[key] != null ?  "(Convert(varchar, [" + key + "]) = (" + value + ")  " : "" ;
                        
                        filterQuery += ") and "
                        
                        break;
                    } 


                    
                    default: {
                        filterQuery += filter[key] !== null ? ( key.split(" ").length > 1 ? '[' + key + ']': key ) + " Like '%" + filter[key] + "%' and " : "" ;
                        break
                    } 
                }
            } 
        }

        filterQuery = filterQuery.slice(0, -4);

       
        if(sorter.filter((s) => s.field == 'ID').length < 1) {
         
          sorter.push({
            field: 'ROI Status',
            order: 'descend'
          })

          sorter.push({
            field: 'ID',
            order: 'descend'
          })
        }
        
        

        sorter.map((sort) => {


            sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
        })


        let sq = sorterQuery.slice(0, -1)
         
        const limit = parseInt(req.query.items) || 100;
        const skip = page * limit - limit;

        var recordset;
        
        // if (managementAccess) { 
            //  Query the database for a list of all results
            var query = `select  * from ${Model} `;    
            var totalQuery = `select count(*) from ${Model} `;    

            if(filterQuery || sorterQuery) {
                if(filterQuery ) {
                    query += "where " + filterQuery + " "
                    totalQuery += "where " + filterQuery + " "
                }  
                
                if (sorterQuery) {
                    query += " ORDER BY " + sq +  " "   
                } 


            } else {
                query +="ORDER BY ID Desc OFFSET "+ skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "   
            }
            
            const { recordset: result } = await sql.query(query);
        
                recordset = result
            const { recordset: coun } = await sql.query(totalQuery);
            arr = coun
       
         
        const obj = arr[0];
        var count = obj[""];

        if (top10) {
            count = 10
        }
  
        const pages = Math.ceil(count / limit);

        // Getting Pagination Object
        const pagination = { page, pages, count };

        const filters = filter;
        const sorters = sorter
        // Getting Pagination Object

        
        return res.status(200).json({
            success: true,
            result: recordset,
            pagination,
            filters,
            sorters,
            message: "Successfully found all documents",
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            result: [],
            message: "Oops there is error",
            error: err,
        });
    }
};


endpoints.delete = async (req,res) => {
    try {
        const {fileName} = req.params;

        await sql.query(`delete from ${Model} where FileName = '${fileName}'`)
        return res.status(200).json({
          success: true,
          result: "Item deleted successfully!",
          message: "Successfully found all documents",
        });
      } catch (err) {
          console.log(err)
        return res.status(500).json({
          success: false,
          result: [],
          message: "Oops there is error",
          error: err,
        });
      }
}

endpoints.update = async (req, res) => {
    try {
      // Find document by id and updates with the required fields
      const values = req.body;
      values['User'] = req.admin.Nickname
 


      const id = req['params']['id'];// please do not update this line

      
        if(values.FileName) {
            const {recordset: file} = await sql.query(`select * from ${Model} where FileName = '${values.FileName}' and ID NOT IN ('${id}')`);
            console.log(file)
          
            if (file.length > 0) {
                return res.status(200).json({
                    success: false,
                    result: {},
                    message: "File Already Exists " ,
                  });
            }
        }

      let valuesQuery = "";
      for (key in values) {
        if (values[key] == null) {
          valuesQuery +=  "[" + key  + "]"  + "=" +   values[key] + ",";
  
        }else if(values[key]) {
          valuesQuery +=  "[" + key  + "]"  + "='" +   values[key].replace(/'/g, "''") + "',";
        } else {
          valuesQuery +=  "[" + key  + "]"+ "=" + null  + ",";
  
        }
      }
  
      valuesQuery = valuesQuery.slice(0, -1);
  
      await sql.query(`update ${Model} set ${valuesQuery} where ID = ${id}`);
  
      return res.status(200).json({
        success: true,
        result: {},
        message: "we update this document by this id: " + id,
      });
    } catch (err) {
  
      console.log(err)
      return res.status(500).json({
        success: false,
        result: null,
        message: "Oops there is an Error",
        error: err,
      });
    }
  };


  endpoints.filters = async (req, res) => {
    try {

      let [
          {recordset: New}, 
          {recordset: FaxCompleted}, 
          {recordset: FaxCorrectionLetter}, 
          {recordset: BillableNew}, 
          {recordset: BillableCompleted}, 
          {recordset: BillableCorrectionLetter}, 
          {recordset: MedicalFormsNew}, 
          {recordset: MedicalFormsCompleted}, 
          {recordset: MedicalFormsCorrectionLetter} 
        ]  =
        await Promise.all([
            await sql.query(`SELECT DISTINCT ([ROI Status]) from ${Model} where [RoI Status] IN ('New', 'Non-Billable', 'Not Form','Not Billable','Not Completed','Not Letter')`),
            await sql.query(`SELECT DISTINCT ([ROI Status]) from ${Model} where [RoI Status] IN ('Fax Completed', 'Duplicate', 'EMR To File')`),
            await sql.query(`SELECT DISTINCT ([ROI Status]) from ${Model} where [RoI Status] IN ('Fax Correction Letter')`),
            await sql.query(`SELECT DISTINCT ([ROI Status]) from ${Model} where [RoI Status] IN ('Billable New','Not Billable Completed','Not Billable Letter')`),
            await sql.query(`SELECT DISTINCT ([ROI Status]) from ${Model} where [RoI Status] IN ('Billable Completed')`),
            await sql.query(`SELECT DISTINCT ([ROI Status]) from ${Model} where [RoI Status] IN ('Billable Correction Letter')`),
            await sql.query(`SELECT DISTINCT ([ROI Status]) from ${Model} where [RoI Status] IN ('Medical Forms New','Not Forms Completed')`),
            await sql.query(`SELECT DISTINCT ([ROI Status]) from ${Model} where [RoI Status] IN ('Medical Forms Completed')`),
            await sql.query(`SELECT DISTINCT ([ROI Status]) from ${Model} where [RoI Status] IN ('Medical Forms Correction Letter')`),
        ])

        let result = {
            'New': New,
            'Fax Completed': FaxCompleted,
            'Fax Correction Letter': FaxCorrectionLetter,
            'Billable New': BillableNew,
            'Billable Completed': BillableCompleted,
            'Billable Correction Letter': BillableCorrectionLetter,
            'Medical Forms New': MedicalFormsNew,
            'Medical Forms Completed': MedicalFormsCompleted,
            'Medical Forms Correction Letter': MedicalFormsCorrectionLetter
        }

      return res.status(200).json({
        success: true,
        result: result,
        message: "successfully fetch filters " ,
      });
    } catch (err) {
  
      console.log(err)
      return res.status(500).json({
        success: false,
        result: null,
        message: "Oops there is an Error",
        error: err,
      });
    }
  };

endpoints.fullList = async (req, res) => {
    try {
      const ID = req.admin.ID;
      const First = req.admin.Nickname;
      const EMPID = req.admin.EMPID
      const managementAccess = req.admin.ManagementAccess
      const page = req.query.page || 1;

      const limit = parseInt(req.query.items) || 100;
      const skip = page * limit - limit;

      var recordset;
      var arr;

        const [{ recordset: chargesProcessedCount }, { recordset: chargesLeftCount },{recordset: totalProcess }] = await Promise.all([
          (
            managementAccess ? 
            await sql.query(`SELECT COUNT(DISTINCT(Filename)) as count from  ${LoggerModel}  `)
            : 
            await sql.query(`SELECT COUNT(DISTINCT(Filename)) as count from  ${LoggerModel} where EMPID = '${EMPID}'  `)
          ),
          await sql.query(`Select count(*) as count from ${Model} where [StartTimeStamp] IS  NULL and [FinishTimeStamp] IS NULL `),
          (
            managementAccess ? 
            await sql.query(`SELECT COUNT(DISTINCT(Filename)) as count from  ${LoggerModel} where   DateTime >'${getDateTime().split('T')[0]}' and [Status] = 'Finish'`)
            : 
            await sql.query(`SELECT COUNT(DISTINCT(Filename)) as count from  ${LoggerModel} where EMPID = '${EMPID}' and   DateTime >'${getDateTime().split('T')[0]}' and [Status] = 'Finish' `)
          )
      ])

      let data = {
          chargesProcessedCount,
          chargesLeftCount,
          totalCharges: ((chargesLeftCount[0]['count'] ? chargesLeftCount[0]['count'] : 0) +(chargesProcessedCount[0]['count'] ? chargesProcessedCount[0]['count'] : 0) ) ,
          totalProcess
      }

      result1 = {
          data,
          username: First
      }
     
     
    
      // Getting Pagination Object
      return res.status(200).json({
        success: true,
        result: result1,
        pagination: 1,
        message: "Successfully found all documents",
      });
    } catch (err) {
        console.log(err)
      return res.status(500).json({
        success: false,
        result: [],
        message: "Oops there is error",
        error: err,
      });
    }
};



endpoints.check = async (req, res) => {
  try {
   
    const {ID, FileName, Folder} = req.query;
    const User = req.admin.Nickname

    let result = await sql.query(`SELECT * from ${Model} where ID = ${ID} and InProgress = 1 and UserAssigned IS NOT NULL `);
    result = result.recordset

    if (result.length == 0) {

    let source = (dir + folder[Folder] + FileName)
    console.log(source)
		let fileExists = fs.existsSync(source)

    if (!fileExists) {
      return res.status(200).json({
        success: false,
        result: true,
        pagination: 1,
        message: "File already processed or not found, Please refresh your page.",
      });
    }

      await sql.query(`Update ${Model} set InProgress = 1 , UserAssigned = '${User}' where ID = ${ID}`)

      return res.status(200).json({
        success: true,
        result: true,
        pagination: 1,
        message: "Found Successfully",
      });
      
    } else {

      
      await sql.query(`Update ${Model} set InProgress = 0, UserAssigned = NULL  where ID = ${ID} and UserAssigned = '${User}'`)

      return res.status(200).json({
        success: false,
        result: true,
        pagination: 1,
        message: "Fax is currently worked on by another team memeber",
      });
     
    }

   
  } catch (err) {
      console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
};



endpoints.columns = async (req,res) => {
  try {

     
      const {id} = req.query
     
      let {recordset: columns} = await sql.query(
        `
        SELECT * from ${ColumnModel} where EMPID = ${id}
        `
    );


      return res.status(200).json({
        success: true,
        result: columns,
        message: "Successfully found all documents",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        result: [],
        message: "Oops there is error",
        error: err,
      });
    }
}

endpoints.createColumns = async (req, res) => {
  try {
      const values = req.body;
     values.EMPID = req.admin.EMPID
          const {recordset: exists } = await sql.query(`SELECT * from ${ColumnModel} where EMPID = '${values.EMPID}'`)

          if (exists.length > 0) {

            // values.EMPID = +req.admin.EMPID;
            const { id } = req.params;
            let valuesQuery = "";
            for (key in values) {
        
              if (values[key] == 0) {
                valuesQuery += "[" + key + "]='" + values[key] + "',";
        
              } else if (  values[key] == null || values[key] == "null" || values[key] == "") {
                valuesQuery += "[" + key + "]= NULL" + ",";
              } else {
                valuesQuery += "[" + key + "]='" + values[key] + "',";
              }
            }
        
            valuesQuery = valuesQuery.slice(0, -1);
          
            let updateQ = `update ${ColumnModel} set ${valuesQuery} where EMPID = ${values.EMPID}`
            await sql.query(updateQ);
        
            return res.status(200).json({
              success: true,
              result: {},
              message: "we update this document by this id: " + req.params.id,
            });
          } else {
              const columnsQ = "(" + Object.keys(values).map((m) => "[" + m + "]").toString() + ")"


              let valuesQuery = "";
              for (key in values) {
                    if (values[key] === "null") {
                        valuesQuery += "NULL" + ",";
                    } else {
                        valuesQuery += "'" + values[key] + "',";
                    }
                }
              valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
            
              const insertQuery = `insert into ${ColumnModel} ${columnsQ} values ${valuesQuery}`
          
              await sql.query(insertQuery);
          
              return res.status(200).json({
                  success: true,
                  result: {},
                  message: "we added document" ,
                });
             
          }
  } catch (err) {
      return res.status(500).json({
          success: false,
          result: null,
          message: "Oops there is an Error",
          error: err,
      });
  }
};

module.exports = endpoints;
