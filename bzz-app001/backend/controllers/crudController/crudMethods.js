var sql = require("mssql");

exports.list = async (Model, req, res, id_col = 'id', order = 'ASC') => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 100;
    const skip = page * limit - limit;

    //  Query the database for a list of all results
    const { recordset } = await sql.query(
      
        `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, * from ${Model}
        ORDER BY ${id_col} OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY`
      // `select * from ${Model}
      // ORDER BY ${id_col} ${order}`
    );

      //   `select * from ${Model}
      //   ORDER BY ${id_col} OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY`
    const { recordset: arr } = await sql.query(
      `SELECT COUNT(*) from  ${Model}`
    );
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object
    return res.status(200).json({
      success: true,
      result: recordset,
      pagination,
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

exports.update = async (Model, req, res, id_col = 'id') => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;

    const id = req['params']['id'];// please do not update this line
    let valuesQuery = "";
    for (key in values) {
      if (values[key] == null) {
        valuesQuery += ( key == 'User' ? "[User]" : "[" + key  + "]")  + "=" +   values[key] + ",";

      }else if(values[key]) {
        valuesQuery += ( key == 'User' ? "[User]" : "[" + key  + "]")  + "='" +   values[key].replace(/'/g, "''") + "',";
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