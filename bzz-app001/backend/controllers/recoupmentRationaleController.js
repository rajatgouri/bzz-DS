const methods = require("./crudController");
const Model = "RecoupmentRationale"
const sql = require('mssql')
let endpoints = methods.crudController("RecoupmentRationale");
// module.exports = methods.crudController("WQ5508_CONSOLIDATED");


endpoints.list = async (req, res) => {
  try {
  
    const { recordset } = await sql.query(
      
        `select  * from ${Model} ORDER BY [Order]`
     
    );

   
    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      pagination: 1,
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
};



endpoints.create = async (req, res) => {
    try {

       const values = req.body;

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



module.exports = endpoints

