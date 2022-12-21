const methods = require("./crudController");
const endpoints = methods.crudController("PatientMisfileData");
var sql = require("mssql");
const { getDateTime } = require("./utilController");

delete endpoints["list"];
delete endpoints["update"];

const Model = "PatientMisfile";
const DataModel = "PatientMisfileData"


endpoints.list = async (req, res) => {
    try {
      const page = req.query.page || 1;
  
      const limit = parseInt(req.query.items) || 100;
      const skip = page * limit - limit;
      const order = req.query.order || "DESC";
  
      var filter = JSON.parse(req.query.filter);
      var sorter = JSON.parse(req.query.sorter);
  
  
  
      let filterQuery = "";
      let filterQuery1 = "";
  
      for (key in filter) {
        if (filter[key]) {
  
          switch (key) {

            case "Patient": {
                let values = filter[key];
                filterQuery += filter[key] !== null ? ( key.split(" ").length > 1 ? '[' + key + ']': key ) + " Like '%" + filter[key] + "%' and " : "" ;
                
                break
              }

              

            default: {
              let values = filter[key];
              if(values.indexOf('') > -1) {
                  values.push('')
                  values.splice(values.indexOf(null), 1)
                  valueQuery = values.map(v => ( "'" + v  + "'"))
                  filterQuery +=  filter[key] != null ?  "(" + "["+ key + "] IN (" + valueQuery + ") or " : "" ;
                  filterQuery +=  '['+ key + '] IS NULL) and '
  
              } else {
                  
                  valueQuery = values.map(v => ( "'" + v  + "'"))
                  if(values.length > 0) {
                      filterQuery +=  +filter[key] !== null ? "["+ key + "] IN (" + valueQuery + ") and " : "" ;
                  }
              }
  
              break
              // filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " Like '%" + filter[key] + "%' and " : "";
              // break
            }
          }
        }
      }
      filterQuery = filterQuery.slice(0, -4);
      let sorterQuery = "";
  
      sorter.map((sort) => {
        sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
    })
  
    
      let sq = sorterQuery.slice(0, -1)
  
      var query = `select ID, ProcessTime from ${Model} `;
      var totalQuery = `select count(*) from ${Model}  `;
  
      if (filterQuery || sorterQuery) {
        if (filterQuery) {
          query +=  " " 
          totalQuery += "where   " +  filterQuery + " "
        }
  
        if (sorterQuery) {
          query += " ORDER BY " + sq + " Offset " + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
        } else {
          query += ` ORDER BY ${Model}.ID OFFSET `  + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
        }
  
      } else {
        query += `ORDER BY ${Model}.ID OFFSET ` + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "
      }
  
  
      var recordset;
      var arr;
  
      const { recordset: result } = await sql.query(query);
      // recordset = result;
      const { recordset: coun } = await sql.query(totalQuery);
      arr = coun
     

      var query1 = ''

      if(result.length == 0 ) {
        return res.status(200).json({
          success: true,
          result: [],
          pagination: { page: 0, pages :0, count: 0 },
          message: "Successfully found all documents",
        });

      } else {
        query1= `select  * from  ${DataModel} where MisfileID IN (${result.map((id) =>  id.ID ?  "'" +  id.ID  + "'" : "''")})  `;


      if (filterQuery || sorterQuery) {
        if (filterQuery) {
          query1 +=  " and " +  filterQuery + " "
        }
  
      
      } else {
        query1 += `ORDER BY ${DataModel}.ID `
      }
  
      const { recordset: result1 } = await sql.query(query1);
      recordset = result1;      

      const obj = arr[0];
      const count = obj[""];
  
      const pages = Math.ceil(count / limit);
  
      // Getting Pagination Object
      const pagination = { page, pages, count };
      // Getting Pagination Object

      const IDs = [...new Set(result.map((record) => record.ID))];

      let finalData = [];


      let promise = new Promise((resolve, reject) => {

         
        const getValidate = (items) =>  {
          
          if (items.filter((record) =>  record['Validate'] == 'Not Found').length > 0) {
            return 'Not Found'
          } else if (items.filter((record) =>  record['Validate'] == 'Found').length == items.length ) {
            return 'Found'
          }  else {
            return ''
          } 
        }

        IDs.map(async (ID, index) => {

         let ProcessTime =  result.filter((record) => record.ID == ID )[0].ProcessTime 

          let childrens = result1.filter((record) => record.MisfileID == ID )
          let items = []
          let splits = []
          let lastIndex = 0
          let splitResult = []
       
          for (let i=0; i< childrens.length ; i++) {
               
            if (i == childrens.length - 1) {
              items.push(childrens.slice(lastIndex, childrens.length))
              break
            }            

            if (i == 0) {
              lastIndex = i
              continue
            } 
            if(childrens[i].Found != childrens[i-1].Found) {
              let child = childrens
              items.push(child.slice(lastIndex, i))

              lastIndex = i
              continue
            }
          } 

        for (let j =0 ; j < items.length ; j ++) {

          finalData.push({
            ID: ID + items[j][0].ID ,
            FileName: items[j][0].FileName, 
            Patient: items[j][0].Patient,
            ActionTimeStamp: items[j][0].ActionTimeStamp,
            Found: items[j].map((m) => m.Found != 'Yes' ).length  == items[j].length ? 'No' : 'Yes',
            Found: items[j].filter((record) => record['Found'] == 'No' || record['Found'] == null).length > 0 ? 'No' :'Yes' ,
            Names: '-',
            UserName: '-',
            Parent: true,
            ProcessTime: ProcessTime,
            Page: items[j][0].Page + "-" + items[j][items[j].length - 1].Page,
            Validate: getValidate(items[j]) ,
            Count: items[j].reduce((a,b) => (a) + parseInt(b['Count']), 0),
            children: items[j].map((c)=> ({...c, key: c.ID, Link: c.Link}))  

        })
        }
            
          if(index == IDs.length - 1) {
              resolve(finalData)
          }
        })
      })
        
      await promise
      return res.status(200).json({
        success: true,
        result: finalData,
        pagination,
        message: "Successfully found all documents",
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

 
  endpoints.filenames = async(req,res) => {
    try {
      // Find document by id and updates with the required fields
      const {recordset: result} = await sql.query(`select FileName from ${Model}`);

      return res.status(200).json({
        success: true,
        result: result,
        message: "fetch sucessfully",
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


  endpoints.delete = async (req,res) => {
    try {

      await sql.query(`delete ${Model}  `);
      await sql.query(`delete ${DataModel}  `);

      return res.status(200).json({
        success: true,
        result: {},
        message: "table deleted successfully!",
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

  endpoints.update = async (req,res) => {
    try {
        // Find document by id and updates with the required fields
        const values = req.body;
        const id = req['params']['id'];// please do not update this line
        values.UserName = req.admin.Nickname
        let ID = values['ID'];
        delete values['ID']
        let valuesQuery = "";
        for (key in values) {
          valuesQuery += key + "='" + values[key] + "',";
        }

        valuesQuery = valuesQuery.slice(0, -1);

        await sql.query(`update ${DataModel} set ${valuesQuery} where ID = ${id}`);

        const {recordset: result} =  await sql.query(`select * from ${DataModel} where ID ='${id}'`);
        let Validate = result.map(m=> m.Validate == 'Not Found'  || m.Validate == '' ).length > 0 ? 'Not Found' : 'Found'

        await sql.query(`update ${Model} set Validate= '${Validate}' , ActionTimeSTamp = '${getDateTime()}' where ID ='${result[0].MisfileID}' `);

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
}


endpoints.updateByFilename = async (req,res) => {
  try {
      // Find document by id and updates with the required fields
      const values = req.body;
      const id = req['params']['id'];// please do not update this line
      values.UserName = req.admin.Nickname
   

      await sql.query(`UPDATE ${DataModel} set [Found]= '${values.Found}' where [FileName]='${values.filename}' and [Page] = ${id}`)

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
}

module.exports = endpoints;
