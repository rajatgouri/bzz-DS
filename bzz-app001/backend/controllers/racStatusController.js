const methods = require("./crudController");
const endpoints = methods.crudController("RAC_Status");
const utilController = require('./utilController')
var sql = require("mssql");

delete endpoints["list"];
delete endpoints["update"];
delete endpoints['create']

const Model = "RAC_Status";

endpoints.list = async (req, res,) => {
    try {

        let  {data} = req.query
        data =  JSON.parse(data)
        let condition = ''
        for (let i in data) {
            condition += i + `= '${data[i]}'`   
        }

       const {recordset: result} = await sql.query(`SELECT * from ${Model} where ${condition} ORDER BY [Order]`)

        return res.status(200).json({
            success: true,
            result: result,
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


endpoints.create = async (req, res) => {
    try {

       const values = req.body;

       const {recordset: exists} = await sql.query(`SELECT * from ${Model} where Name = '${values.Name}'`)
     
       if (exists.length > 0) {

            let obj = ''
            for (let i in values) {
                if (i != 'Name') {
                    obj += i  
                }
            }

            let updateQuery = `UPDATE ${Model} set ${obj} = 'Y' where Name = '${values.Name}'`
            await sql.query(updateQuery)

            return res.status(200).json({
                success: true,
                result: null,
                message: "document updated correctly",
              });
       } else {

       const columnsQ = "(" + Object.keys(values).toString() + ")"
     
       let valuesQuery = "";
       for (key in values) {
         if (values[key] === "null") {
           valuesQuery += "NULL" + ",";
         } else {
           valuesQuery += "'" + values[key] + "',";
         }
       }
       valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";
     
     
       const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`


         const result = await sql.query(insertQuery);
     
         if (!result) {
           return res.status(403).json({
             success: false,
             result: null,
             message: "document couldn't save correctly",
           });
         }
         return res.status(200).send({
           success: true,
           result: {},
           message: " document save correctly",
         });

       }
      
    
}
    catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            result: null,
            message: "Oops there is an Error",
            error: err,
        });
    } 
}


;


// endpoints.delete = async (req, res) => {
//     let { id } = req.params;
//     let { value } = req.body

//     try {


//         const deleteQuery = `update ${Model} set Archive = ${value}  where ID= ${id}`;
//         await sql.query(deleteQuery);


//         return res.status(200).json({
//             success: true,
//             result: {},
//             message: "Success",
//         });

//     } catch (e) {
//         console.log(e)
//         return res
//             .status(500)
//             .json({ success: false, error: e, message: `Error in deleting the user where id = ${id}` });
//     }
// };

// endpoints.update = async (req, res) => {
//     try {
//         // Find document by id and updates with the required fields
//         const values = req.body;

//         const id = req['params']['id'];// please do not update this line
//         let valuesQuery = "";
//         for (key in values) {
//             if (values[key] == null) {
//                 valuesQuery += (key == 'User' ? "[User]" : "[" + key + "]") + "=" + values[key] + ",";

//             } else if (values[key]) {
//                 valuesQuery += (key == 'User' ? "[User]" : "[" + key + "]") + "='" + values[key].toString().replace(/'/, "''") + "',";
//             } else {
//                 valuesQuery += "[" + key + "]" + "=" + null + ",";

//             }
//         }

//         let valuesT = values
//         valuesT.User = req.admin.Nickname
//         valuesT.ActionTimeStamp = getDateTime()
//         values.RA= 'RA'

//        let response =  await InsertItem(valuesT)
//        if (response.success) {
//         valuesQuery = valuesQuery.slice(0, -1);

//         let updateQ = `update ${Model} set ${valuesQuery} where ID = ${id}`
//         console.log(updateQ)
//         await sql.query(updateQ);

//         return res.status(200).json({
//             success: true,
//             result: {},
//             message: "RAC updated successfully!",
//         });
//        } else {
        
//         return res.status(200).json({
//             success: false,
//             result: {},
//             message: `Number of Claims entered is lesser than existing Number of Claims for the Internal Number  ${response.number}, please check all entries for the Internal Number ${response.number} and archive data rows that are no longer required.`
//         });
//        }
       
//     } catch (err) {

//         console.log(err)
//         return res.status(500).json({
//             success: false,
//             result: null,
//             message: "Oops there is an Error",
//             error: err,
//         });
//     }
// };




module.exports = endpoints;
