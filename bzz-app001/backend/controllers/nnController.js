const methods = require("./crudController");
const endpoints = methods.crudController("NN");
var sql = require("mssql");
const { getDateTime, UpdateDaysTillDueDate,formatDate, getObject } = require('./utilController')
const {fitToColumn} = require('./utilController')
const {getFilters} = require('../Utils/applyFilter')
const utilController = require('./utilController')

var XLSX = require("xlsx");
const mailer = require("./mailController");

delete endpoints["list"];
delete endpoints['update']

const Model = "NN";
const ColumnModel = "NNColumns"


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

      

        const customSwitch = []
        for ( f in filter) {
            console.log(f)
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

        const { recordset: result } = await sql.query(query);

        recordset = result
        const { recordset: coun } = await sql.query(totalQuery);
        arr = coun

        const obj = arr[0];
        var count = obj[""];


        const pages = Math.ceil(count / limit);
        const pagination = { page, pages, count };

        const filters = filter;
        const sorters = sorter

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
  
    const insertQuery = `insert into NN_Logger ${columnsQ} values ${valuesQuery}`

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
      const all = values.All
      delete values['All']
      for (key in values) {
        if (values[key] == null) {
          valuesQuery += ( key == 'User' ? "[User]" : "[" + key  + "]")  + "=" +   values[key] + ",";
  
        }else if(values[key]) {
          valuesQuery += ( key == 'User' ? "[User]" : "[" + key  + "]")  + "='" +   values[key].toString().replace(/'/, "''")  + "',";
        } else {
          valuesQuery +=  "[" + key  + "]"+ "=" + null  + ",";
  
        }
      }
  
  
      let valuesT = values
      valuesT.User = req.admin.Nickname
      valuesT.ActionTimeStamp = getDateTime()
      values.NN = 'NN'
     let response =  await InsertItem(valuesT)


      if (response.success) {
        valuesQuery = valuesQuery.slice(0, -1);

        if (all == 'Yes') {
            let v = {}
            v['Open/Closed'] = values['Open/Closed']
            v['NN Due Date'] = values['NN Due Date']
            v['Compliance Due Date'] = values['Compliance Due Date']
            v['Appeals Due Date'] = values['Appeals Due Date']
            v['Status'] = values['Status']
            v['DOS From'] = values['DOS From']
            v['DOS To'] = values['DOS To']
            v['ActionTimeStamp'] = values['ActionTimeStamp']
            v['User'] = values['User']

            let vQuery = ''
            for (key in v) {
                if (v[key] == null) {
                    vQuery += (key == 'User' ? "[User]" : "[" + key + "]") + "=" + v[key] + ",";
    
                } else if (v[key]) {
                    vQuery += (key == 'User' ? "[User]" : "[" + key + "]") + "='" + v[key].toString().replace(/'/, "''") + "',";
                } else {
                    vQuery += "[" + key + "]" + "=" + null + ",";
    
                }
            }
            vQuery = vQuery.slice(0, -1);

            let updateQ = `update ${Model} set ${vQuery} where [Internal Number] = ${values['Internal Number']}`
            await sql.query(updateQ)

        }
        await sql.query(`update ${Model} set ${valuesQuery} where ID = ${id}`);

        values.NN_ID = id
        delete values['NN']
        logger(values)

        if(values.Status == 'Compliance Review Complete Okay to SEND') {

            const {recordset: result} =await  sql.query(`SELECT [Internal Number] from ${Model} where ID = ${id}`)

            mailer(
                'mjones@coh.org',
                [],
                'Compliance Review Complete Okay to SEND!',
                `
                <p>
                    An update occurred in NN- compliance review was completed and it’s okay to send.
                    Please click on the link below to look up the necessary records. <br>
                    
                    Internal Number: ${result[0]['Internal Number']} <br><br>
                    https://10.30.142.17:8004/nn
                </p>
                `
            )
        // } else if (values.Status == 'Audit Request Received' ) {
        //     const {recordset: result} =await sql.query(`SELECT [Internal Number] from ${Model} where ID = ${id}`)

        //     mailer(
        //         ['mjones@coh.org', 'melilopez@coh.org', 'adelatorre@coh.org','joawilliams@coh.org'],
        //         ['shrogers@coh.org','lborden@coh.org','mknox@coh.org','kjohnson@coh.org', 'agrigsby@coh.org','cleung@coh.org'],
        //         'New Audit Request Received!',
        //         `
                

        //            <h2> Greetings!</h2>
        //             <p>New Audit Request Received.
        //             Please click on the link below to look up the necessary records. \n

        //             Internal Number: ${result[0]['Internal Number']} \n
        //             https://10.30.142.17:8004/nn
        //         </p>
        //         `
        //     )
        }

        return res.status(200).json({
            success: true,
            result: {},
            message: "NN updated successfully!",
        });
       } else {
        
        return res.status(200).json({
            success: false,
            result: {},
            message: `Number of Claims entered is lesser than existing Number of Claims for the Internal Number  ${response.number}, please check all entries for the Internal Number ${response.number} and archive data rows that are no longer required.`
        });
     }
   
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

  endpoints.tabs = async (req, res) => {
    try {


        const [ { recordset: OpenClosed }] = await Promise.all([
            await sql.query(`Select DISTINCT([Open/Closed]) from ${Model} order by  [Open/Closed] Desc`),
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



const InsertItem = async (values) => {


    return new Promise(async (resolve, reject) => {


        if (!values['Internal Number'] && values['Internal Number'] == undefined) {
            return resolve({success: true})         
         }

       
         await sql.query(`Update NN set [Number of Claims] = (
            SELECT COUNT(*) from NN where [Internal Number] = '${values['Internal Number']}' and ([Archive] = '0' or [Archive] IS NULL)
         and [Internal Number] = '${values['Internal Number']}')`)
        

        const { recordset: result } = await sql.query(`
            SELECT * from ${Model} where 
            [Internal Number]='${values['Internal Number']}' 
            and (Archive IS NULL or [Archive] = '0')
         `)

       
        columnsQ = "(" + Object.keys(values).map(v => ('[' + v + ']')).toString() + ")"

        if (result.length > 0) {

            if ((+values['Number of Claims'] - result.length) > 0) {
                let counter = +values['Number of Claims'] - result.length
                for (let i = 0; i < counter; i++) {
                    let valuesQuery = "";

                    delete values['Patient Name']
                    delete values['MRN']
                    delete values['Claim Number']
                    delete values['HAR No.']
                    delete values['DOS From']
                    delete values['DOS To']
                    delete values['CPT Charge Amount']
                    delete values['CPT']
                    delete values['Findings']
                    delete values['FILE AND RESOLVE']
                    delete values['Paid Amount']
                    delete values['Recouped Amount']

                   


                    columnsQ = "(" + Object.keys(values).map(v => ('[' + v + ']')).toString() + ")"



                    for (key in values) {
                        if (values[key] === "null" || values[key] === null) {
                            valuesQuery += "NULL" + ",";
                        } else {
                            valuesQuery += "'" + values[key] + "',";
                        }
                    }
                    valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";

                    const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`

                    await sql.query(insertQuery);

                    if (i == counter - 1) {

                        const { recordset: result } = await sql.query(`
                                SELECT COUNT(*) as count from ${Model} where 
                                [Internal Number]='${values['Internal Number']}' 
                                and Archive IS NULL
                        `)

                        sql.query(`UPDATE ${Model} set [Number of Claims] = ${result[0].count} where 
                        [Internal Number]='${values['Internal Number']}' 
                        and Archive IS NULL ` )

                        resolve({
                            success: true
                        })
                    }

                }
            } else if ((+values['Number of Claims'] - result.length) == 0) {
                resolve({
                    success: true,
                    number: result.length
                })
            }  else {
                resolve({
                    success: false,
                    number: result.length
                })

            }
        } else {
            let counter = +values['Number of Claims'] - result.length

            if (!values['Number of Claims'] ) {
                counter = 1
            }
                for (let i = 0; i < counter; i++) {
                   
                    let valuesQuery = "";

                    if (i > 0) {
                        delete values['Patient Name']
                        delete values['MRN']
                        delete values['Claim Number']
                        delete values['HAR No.']
                        delete values['DOS From']
                        delete values['DOS To']
                        delete values['CPT Charge Amount']
                        delete values['CPT']
                        delete values['Findings']
                        delete values['FILE AND RESOLVE']
                        delete values['Paid Amount']
                        delete values['Recouped Amount']
    
                        columnsQ = "(" + Object.keys(values).map(v => ('[' + v + ']')).toString() + ")"
    
                    }

                   
                
                    for (key in values) {
                        if (values[key] === "null" || values[key] === null) {
                            valuesQuery += "NULL" + ",";
                        } else {
                            valuesQuery += "'" + values[key] + "',";
                        }
                    }
                    valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";

                    const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`

                    await sql.query(insertQuery);

                    if (i == counter - 1) {
                        resolve({
                            success: true
                        })
                    }

                }
        }


    })

}


endpoints.exports = async (req, res) => {
    try {
        
        
        var workbook = XLSX.utils.book_new();
        let { recordset: objects } = await sql.query(`select * from ${Model}  `)

        let data = getObject(objects)
        let worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!autofilter']={ref:"A1:AG1"};
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
                    worksheet['!autofilter']={ref:"A1:AG1"};
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

        let file = `SmartApp_NN_${date}.xlsx`

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

endpoints.create = async (req, res) => {
    try {
        const values = req.body;
        values.User = req.admin.Nickname;
        values.NN = 'NN'
        var usDate = getDateTime();
        values.ActionTimeStamp = usDate;

        let result = await InsertItem(values)

        if (result.success) {
            return res.status(200).json({
                success: true,
                result: {},
                message: `NN  added successfully!`
            });
        } else {
            return res.status(200).json({
                success: false,
                result: {},
                message: `Number of Claims entered is lesser than existing Number of Claims for the Internal Number  ${result.number}, please check all entries for the Internal Number ${result.number} and archive data rows that are no longer required.`
            });
        }

     



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
        const [{ recordset: Patient }, { recordset: Status }, { recordset: User } , { recordset: OpenClosed },{ recordset: InternalNumber }, {recordset: RecoupmentRationale}] = await Promise.all([
            (
                filter ? 
                await sql.query(`Select DISTINCT([Patient Name]) from ${Model} where [Open/Closed] IN (${filter.map((f) => "'" + f+ "'")})`)
                : 
                await sql.query(`Select DISTINCT([Patient Name]) from ${Model} where [Open/Closed] IS NULL`)
            ),
            (
                filter ? 
                await sql.query(`Select DISTINCT CONVERT(VARCHAR(MAX), Status) as Status from ${Model} where [Open/Closed] IN (${filter.map((f) => "'" + f+ "'")})`)
                : 
                await sql.query(`Select DISTINCT CONVERT(VARCHAR(MAX), Status) as Status from ${Model} where [Open/Closed] IS NULL`)
            ),
            (
                filter ?
                await sql.query(`Select DISTINCT([User]) from ${Model} where [Open/Closed] IN (${filter.map((f) => "'" + f+ "'")})`)

                :
                await sql.query(`Select DISTINCT([User]) from ${Model} where [Open/Closed] IS NULL`)

            ),
            await sql.query(`Select DISTINCT([Open/Closed]) from ${Model} `),
            (
                filter ? 
                await sql.query(`Select DISTINCT([Internal Number]) from ${Model} where [Open/Closed] IN (${filter.map((f) => "'" + f + "'")})`)
                :
                await sql.query(`Select DISTINCT([Internal Number]) from ${Model} where [Open/Closed] IS NULL`)

            ),
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
