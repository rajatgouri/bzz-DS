const methods = require("./crudController");
const endpoints = methods.crudController("ADR");
const { getDateTime, UpdateDaysTillDueDate,formatDate, getObject } = require('./utilController')
const {fitToColumn} = require('./utilController')
const {getFilters} = require('../Utils/applyFilter')
const utilController = require('./utilController')
var XLSX = require("xlsx");

var sql = require("mssql");
const mailer = require("./mailController");

delete endpoints["list"];
delete endpoints['update']
const Model = "ADR";
const ColumnModel = "ADRColumns"


endpoints.list = async (req, res,) => {
    try {

        var page = req.body.page || 1;
        var filter = (req.body.filter);
        var sorter = (req.body.sorter);

        delete filter['sort']

        let filterQuery = "";
        let sorterQuery = "";

        if (!filter['Archive']) {
            filter['Archive'] = {value: [1], type: "boolean"}
        }

        // for (key in filter) {
        //     if (filter[key]) {

        //         switch (key) {

        //             case "Notes": {

        //                 let values = filter[key];
        //                 if (values.length < 2 && values[0] == 0) {
        //                     filterQuery +=  `CONVERT(varchar, ${key})  NOT IN ( '' )  and `
        //                 } else if ((values.length < 2 && values[0] == 1)) {
        //                     filterQuery +=  `(  CONVERT(varchar, ${key})   IN ( '' ) or ${key} IS NULL) and `;
        //                 }
        //                 break;
        //             }

        //             case "Findings": {

        //                 let values = filter[key];
        //                 if (values.length < 2 && values[0] == 0) {
        //                     filterQuery +=  `CONVERT(varchar, ${key})  NOT IN ( '' )  and `
        //                 } else if ((values.length < 2 && values[0] == 1)) {
        //                     filterQuery +=  `(  CONVERT(varchar, ${key})   IN ( '' ) or ${key} IS NULL) and `;
        //                 }
        //                 break;
        //             }

                   

        //             case "Open/Closed": {
        //                 let values = filter[key];
        //                 valueQuery = values.map(v => ("'" + v + "'"))
        //                 filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

        //                 if (values.indexOf(null) > -1) {
        //                     filterQuery += `or [${key}] IS NULL) and `
        //                 } else {
        //                     filterQuery += ") and "
        //                 }

        //                 break;
        //             }

        //             case "Patient Name": {
        //                 let values = filter[key];
        //                 valueQuery = values.map(v => ("'" + v + "'"))
        //                 filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

        //                 if (values.indexOf(null) > -1) {
        //                     filterQuery += `or [${key}] IS NULL) and `
        //                 } else {
        //                     filterQuery += ") and "
        //                 }

        //                 break;
        //             }


        //             case "Status": {
        //                 let values = filter[key];
        //                 valueQuery = values.map(v => ("'" + v + "'"))
        //                 filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

        //                 if (values.indexOf(null) > -1) {
        //                     filterQuery += `or [${key}] IS NULL) and `
        //                 } else {
        //                     filterQuery += ") and "
        //                 }

        //                 break;
        //             }


        //             case "ADR Reason Code": {
        //                 let values = filter[key];
        //                 valueQuery = values.map(v => ("'" + v + "'"))
        //                 filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

        //                 if (values.indexOf(null) > -1) {
        //                     filterQuery += `or [${key}] IS NULL) and `
        //                 } else {
        //                     filterQuery += ") and "
        //                 }

        //                 break;
        //             }

        //             case "Service Type": {
        //                 let values = filter[key];
        //                 valueQuery = values.map(v => ("'" + v + "'"))
        //                 filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

        //                 if (values.indexOf(null) > -1) {
        //                     filterQuery += `or [${key}] IS NULL) and `
        //                 } else {
        //                     filterQuery += ") and "
        //                 }

        //                 break;
        //             }

        //             case "MD": {
        //                 let values = filter[key];
        //                 valueQuery = values.map(v => ("'" + v + "'"))
        //                 filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

        //                 if (values.indexOf(null) > -1) {
        //                     filterQuery += `or [${key}] IS NULL) and `
        //                 } else {
        //                     filterQuery += ") and "
        //                 }

        //                 break;
        //             }

        //             case "CPT": {
        //                 let values = filter[key];
        //                 valueQuery = values.map(v => ("'" + v + "'"))
        //                 filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

        //                 if (values.indexOf(null) > -1) {
        //                     filterQuery += `or [${key}] IS NULL) and `
        //                 } else {
        //                     filterQuery += ") and "
        //                 }

        //                 break;
        //             }


                    
        //             case "User": {
        //                 let values = filter[key];
        //                 valueQuery = values.map(v => ("'" + v + "'"))
        //                 filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

        //                 if (values.indexOf(null) > -1) {
        //                     filterQuery += `or [${key}] IS NULL) and `
        //                 } else {
        //                     filterQuery += ") and "
        //                 }

        //                 break;
        //             }


        //             case "Drug/Procedure": {
        //                 let values = filter[key];
        //                 valueQuery = values.map(v => ("'" + v + "'"))
        //                 filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

        //                 if (values.indexOf(null) > -1) {
        //                     filterQuery += `or [${key}] IS NULL) and `
        //                 } else {
        //                     filterQuery += ") and "
        //                 }

        //                 break;
        //             }

        //             case "Archive": {

        //                 let values = filter[key];
        //                 if (values.length < 2 && values[0] == 0) {
        //                     filterQuery +=  key + " NOT IN ( '' )  and " 
        //                 } else if ((values.length < 2 && values[0] == 1)) {
        //                     filterQuery += "("+ key + " IN ( '' ) or Archive IS NULL) and " ;
        //                 } 
        //                 break;
        //             } 

        //             case "ADR Due Date": {

        //                 filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? 'CAST([' + key + '] AS DATE)'  : key) + " =  CAST('" + filter[key] + "' AS DATE)" + " and " : "";
                       
        //                 break;
        //             }
                    
                  
        //             case "Date ADR Submitted to Noridian": {

        //                 filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? 'CAST([' + key + '] AS DATE)'  : key) + " =  CAST('" + filter[key] + "' AS DATE)" + " and " : "";
                       
        //                 break;
        //             }

        //             case "Closed Date": {

        //                 filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? 'CAST([' + key + '] AS DATE)'  : key) + " =  CAST('" + filter[key] + "' AS DATE)" + " and " : "";
                       
        //                 break;
        //             }

        //             case "Date ADR Rec'd": {

        //                 // filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? 'CAST([' + key + '] AS DATE)'  : key) + " =  CAST('" + filter[key] + "' AS DATE)" + " and " : "";
        //                 filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " =  FORMAT(TRY_CAST('"+ filter[key] +"' as date),'yyyy-MM-dd')" + " and " : "";
                       
        //                 break;
        //             }

        //             case "Demand Letter Date": {

        //                 filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? 'CAST([' + key + '] AS DATE)'  : key) + " =  CAST('" + filter[key] + "' AS DATE)" + " and " : "";
                       
        //                 break;
        //             }


        //             case "DOS From": {

        //                 filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? 'CAST([' + key + '] AS DATE)'  : key) + " =  CAST('" + filter[key] + "' AS DATE)" + " and " : "";
                       
        //                 break;
        //             }

        //             case "DOS To": {

        //                 filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? 'CAST([' + key + '] AS DATE)'  : key) + " =  CAST('" + filter[key] + "' AS DATE)" + " and " : "";
                       
        //                 break;
        //             }

        //             default: {
        //                 filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " Like '%" + filter[key].toString().replace(/'/, "''") + "%' and " : "";
        //                 break
        //             }
        //         }
        //     }
        // }

        const customSwitch = []
        for ( f in filter) {
          
            let {value, type} = filter[f]
            
            if (value && value.length > 0) {
                customSwitch.push({
                    condition: f,
                    value: value,
                    type: type
                })
            }
            
        }

        filterQuery = await getFilters(filter, customSwitch)
        
        filterQuery = filterQuery.slice(0, -4);
            
    

        if (sorter.length >0 ) {
            sorter.map((sort) => {
                sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
            })
    
        } else {
            sorter.push({
                field: 'ActionTimeStamp',
                order: 'desc',
                column: {
                    filters: {}
                }
            })

            sorter.map((sort) => {
                sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
            })

        }

        

        let sq = sorterQuery.slice(0, -1)

        const limit = parseInt(req.query.items) || 100;
        const skip = page * limit - limit;

        var recordset;


        var query = `select  * from ${Model} `;
        var totalQuery = `select count(*) from ${Model} `;

        if (filterQuery || sorterQuery) {
            if (filterQuery) {
                query += "where " + filterQuery + " "
                totalQuery += "where " + filterQuery + " "
            }

            if (sorterQuery) {
                query += " ORDER BY " + sq + " "
            }


        } else {
            query += " ORDER BY ID DESC OFFSET " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
        }

        console.log(query)
        const { recordset: result } = await sql.query(query);

        recordset = result
        const { recordset: coun } = await sql.query(totalQuery);
        arr = coun

        const obj = arr[0];
        var count = obj[""];


        const pages = Math.ceil(count / limit);
        const pagination = { page, pages, count };

        const filters = filter;
        const sorters = sorter;

        for (i in filters) {
            filters[i] = filters[i].value
        }

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


const logger = async (values) => {

    
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
  
    const insertQuery = `insert into ADR_Logger ${columnsQ} values ${valuesQuery}`

    await sql.query(insertQuery);
}


endpoints.update = async ( req, res) => {
    try {
      // Find document by id and updates with the required fields
      const values = req.body;
  
      const id = req['params']['id'];// please do not update this line
      let valuesQuery = "";

      values.User = req.admin.Nickname
      values.ActionTimeStamp = getDateTime()
      for (key in values) {
        if (values[key] == null) {
          valuesQuery += ( key == 'User' ? "[User]" : "[" + key  + "]")  + "=" +   values[key] + ",";
  
        }else if(values[key]) {
          valuesQuery += ( key == 'User' ? "[User]" : "[" + key  + "]")  + "='" +   values[key].toString().replace(/'/, "''")  + "',";
        } else {
          valuesQuery +=  "[" + key  + "]"+ "=" + null  + ",";
  
        }
      }
  
      valuesQuery = valuesQuery.slice(0, -1);
  
      await sql.query(`update ${Model} set ${valuesQuery} where ID = ${id}`);
      values.ADR_ID = id
      delete values['ADR']
      logger(values)

      if(values.Status == 'Compliance Review Complete Okay to SEND') {

        const {recordset: result} = await sql.query(`SELECT [Internal Number] from ${Model} where ID = ${id}`)

        mailer(
            'mjones@coh.org',
            [],
            'Compliance Review Complete Okay to SEND!',
            `
            <p>
                An update occurred in ADR- compliance review was completed and it’s okay to send.
                Please click on the link below to look up the necessary records. <br>

                Internal Number: ${result[0]['Internal Number']} <br><br>
                https://10.30.142.17:8004/adr
            </p>
            `
        ) 
    // } else if (values.Status == 'Audit Request Received' ) {
    //     const {recordset: result} = await sql.query(`SELECT [Internal Number] from ${Model} where ID = ${id}`)

    //     mailer(
    //         ['mjones@coh.org', 'melilopez@coh.org', 'adelatorre@coh.org','joawilliams@coh.org'],
    //         ['shrogers@coh.org','lborden@coh.org','mknox@coh.org','kjohnson@coh.org', 'agrigsby@coh.org','cleung@coh.org'],
    //         'New Audit Request Received!',
    //         `

    //             <h2>Greetings!</h2>
    //            <p> New Audit Request Received.
    //             Please click on the link below to look up the necessary records. \n

    //             Internal Number: ${result[0]['Internal Number']} \n
    //             https://10.30.142.17:8004/adr
    //         </p>
    //         `
    //     )
    }

  
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

endpoints.delete = async (req, res) => {
    let { id } = req.params;
    let {value} = req.body 

    try { 
        
      
        const deleteQuery = `update ${Model} set Archive = ${value}  where ID= ${id}`;
        await sql.query(deleteQuery);

  
      return res.status(200).json({
        success: true,
        result: {},
        message: "Success",
      });
  
    } catch (e) {
        console.log(e)
      return res
        .status(500)
        .json({ success: false, error: e, message: `Error in deleting the user where id = ${id}`});
    }
};



endpoints.create = async (req, res) => {
    try {
      const values = req.body;
      values.User = req.admin.Nickname; 
      values.ADR = 'ADR'

      var usDate = getDateTime();

      values.ActionTimeStamp = usDate;
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


endpoints.filters = async (req, res) => {
    try {

        let {filter} = req.query
        filter = JSON.parse(filter)
        let hasNull = filter.includes(null)

        const [{ recordset: Patient }, { recordset: Status }, { recordset: Description }, { recordset: ARDREASONCODE }, { recordset: CPT },{ recordset: MD},{ recordset: ServiceType},{ recordset: User},{ recordset: OpenClosed}, { recordset: InternalNumber },  {recordset: RecoupmentRationale}] = await Promise.all([
            (
                filter ?
                await sql.query(`Select DISTINCT([Patient Name]) from ${Model} where ${ hasNull ? `[Open/Closed] IN  (${ filter.map((f) =>  f ? "'" + f+ "'": "'null'")}) or [Open/Closed] IS NULL` : `[Open/Closed] IN  (${ filter.map((f) => "'" + f+ "'")})`} `)
                :
                    await sql.query(`Select DISTINCT([Patient Name]) from ${Model} where [Open/Closed] IS NULL`)
            ),
            (
                filter ?
                await sql.query(`Select DISTINCT CONVERT(VARCHAR(MAX), Status) as Status from ${Model} where ${ hasNull ? `[Open/Closed] IN  (${ filter.map((f) =>  f ? "'" + f+ "'": "'null'")}) or [Open/Closed] IS NULL` : `[Open/Closed] IN  (${ filter.map((f) => "'" + f+ "'")})`}`)
                :
                await sql.query(`Select DISTINCT CONVERT(VARCHAR(MAX), Status) as Status from ${Model} where [Open/Closed] IS NULL`)

            ),
            (
                filter ?
                await sql.query(`Select DISTINCT([Description]) from ${Model}  where  ${ hasNull ? `[Open/Closed] IN  (${ filter.map((f) =>  f ? "'" + f+ "'": "'null'")}) or [Open/Closed] IS NULL` : `[Open/Closed] IN  (${ filter.map((f) => "'" + f+ "'")})`}`)
                :
                 await sql.query(`Select DISTINCT([Description]) from ${Model}  where [Open/Closed] IS NULL`)

            ),
            (
                filter ?
                await sql.query(`Select DISTINCT([ADR Reason Code]) from ${Model} where  ${ hasNull ? `[Open/Closed] IN  (${ filter.map((f) =>  f ? "'" + f+ "'": "'null'")}) or [Open/Closed] IS NULL` : `[Open/Closed] IN  (${ filter.map((f) => "'" + f+ "'")})`}`)
                :
                await sql.query(`Select DISTINCT([ADR Reason Code]) from ${Model} where [Open/Closed] IS NULL`)
            
            ),
            (
                filter ?
                await sql.query(`Select DISTINCT([CPT]) from ${Model} where ${ hasNull ? `[Open/Closed] IN  (${ filter.map((f) =>  f ? "'" + f+ "'": "'null'")}) or [Open/Closed] IS NULL` : `[Open/Closed] IN  (${ filter.map((f) => "'" + f+ "'")})`}`)
                :
                await sql.query(`Select DISTINCT([CPT]) from ${Model} where [Open/Closed] IS NULL`)

            ),
            (
                filter ?
                await sql.query(`Select DISTINCT([MD]) from ${Model} where ${ hasNull ? `[Open/Closed] IN  (${ filter.map((f) =>  f ? "'" + f+ "'": "'null'")}) or [Open/Closed] IS NULL` : `[Open/Closed] IN  (${ filter.map((f) => "'" + f+ "'")})`}`)
                :
                await sql.query(`Select DISTINCT([MD]) from ${Model} where [Open/Closed] IS NULL`)
            ), 
            (
                filter ?
                await sql.query(`Select DISTINCT([Service Type]) from ${Model} where ${ hasNull ? `[Open/Closed] IN  (${ filter.map((f) =>  f ? "'" + f+ "'": "'null'")}) or [Open/Closed] IS NULL` : `[Open/Closed] IN  (${ filter.map((f) => "'" + f+ "'")})`}`)
                :
                await sql.query(`Select DISTINCT([Service Type]) from ${Model} where [Open/Closed] IS NULL`)
            ),
            (
                filter ? 
                await sql.query(`Select DISTINCT([User]) from ${Model}  where ${ hasNull ? `[Open/Closed] IN  (${ filter.map((f) =>  f ? "'" + f+ "'": "'null'")}) or [Open/Closed] IS NULL` : `[Open/Closed] IN  (${ filter.map((f) => "'" + f+ "'")})`}` )
                : 
                await sql.query(`Select DISTINCT([User]) from ${Model}  where [Open/Closed] IS NULL`)
            ), 
            await sql.query(`Select DISTINCT([Open/Closed]) from ${Model}`),
            (
                filter ? 
                await sql.query(`Select DISTINCT([Internal Number]) from ${Model} where ${ hasNull ? `[Open/Closed] IN  (${ filter.map((f) =>  f ? "'" + f+ "'": "'null'")})  or [Open/Closed] IS NULL` : `[Open/Closed] IN  (${ filter.map((f) => "'" + f+ "'")})`}`)
                :
                await sql.query(`Select DISTINCT([Internal Number]) from ${Model} where [Open/Closed] IS NULL`)

            )   ,
            (
                filter ? 
                await sql.query(`Select DISTINCT([Recoupment Rationale]) from ${Model} where [Open/Closed] IN (${filter.map((f) => "'" + f + "'")})`)
                :
                await sql.query(`Select DISTINCT([Recoupment Rationale]) from ${Model} where [Open/Closed] IS NULL`)
            )   
        ])

        let results = {
            Patient,
            Status,
            Description,
            ARDREASONCODE,
            CPT,
            MD,
            ServiceType,
            User,
            OpenClosed,
            InternalNumber,
            RecoupmentRationale

        }


        return res.status(200).json({
            success: true,
            result: results,
            message: "Filter Fetch Successfully",
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
}



endpoints.exports = async (req, res) => {
    try {
        
        

        var workbook = XLSX.utils.book_new();
        let { recordset: objects } = await sql.query(`select * from ${Model}  `)

        let data = getObject(objects)
        let worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!autofilter']={ref:"A1:AD1"};
        worksheet['!cols'] = fitToColumn(data[0])
        await XLSX.utils.book_append_sheet(workbook, worksheet, 'All');
        


        let { recordset: status } = await sql.query(`select DISTINCT([Open/Closed]) from ${Model} `)

        let p = await new Promise (async (resolve, reject) => {
            
            blank = status.filter((s) => s['Open/Closed'] == null)[0]
            status = status.filter((s) => s['Open/Closed'] != null)
            if (blank) {status.push(blank)}
            

            for (let i = 0; i< status.length ; i++ ) {
                
                let name = status[i]['Open/Closed'] ? status[i]['Open/Closed'] : 'Blank'
                let s = status[i]['Open/Closed']
                let objects1 = []

                if (s) {
                    let  { recordset: objects } = await sql.query(`select * from ${Model}  where [Open/Closed] IN ('${s}') `)
                    objects1 = objects
                } else {
                    let  { recordset: objects } = await sql.query(`select * from ${Model}  where [Open/Closed] IS NULL `)
                    objects1 = objects
                }


            
                if (objects1.length > 0) {
                    data = await getObject(objects1)
                    worksheet = XLSX.utils.json_to_sheet(data);
                    worksheet['!autofilter']={ref:"A1:AD1"};
                    worksheet['!cols'] = fitToColumn(data[0])
                    await XLSX.utils.book_append_sheet(workbook, worksheet, name);
                    
                }
                
                if (i == status.length -1) {
                    resolve(true)
                }
            }
        })

        await p
        
     
        let date = utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]
        date = await    utilController.formatter(date)

        console.log(date)
        let file = `SmartApp_ADR_${date}.xlsx`

        let filename = `./public/WQ/` + file

        XLSX.writeFile(workbook, filename);

        return res.status(200).json({
            success: true,
            result: {
                name: file,
                file: 'https://' + (process.env.SERVER + ":" + process.env.SERVER_PORT + "/WQ/" + file)
            },
            message: "Successfully exports",
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


endpoints.tabs = async (req, res) => {
    try {


        const [ { recordset: OpenClosed }] = await Promise.all([
            await sql.query(`Select DISTINCT([Open/Closed]) from ${Model} order by [Open/Closed]     Desc`),
        ])

        let results = {
           
            OpenClosed
        }


        return res.status(200).json({
            success: true,
            result: results,
            message: "Filter Fetch Successfully",
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            result: null,
            message: "Oops there is an Error",
            error: err,
        });
    }
}


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
