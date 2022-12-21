

const adminModel = require("../models/adminModel");
const bcrypt = require("bcryptjs");
var sql = require("mssql");
const methods = require("./crudController");
const endpoints = methods.crudController("JWT");
const cron = require('node-cron')

require('./JWTController')

delete endpoints["list"];
delete endpoints["update"];
const TeamMembersModel = "[COHTEAMS].[dbo].[COH_MasterStaff_PSoft]";
const adminData = require('../data/admins.json')
const Model = "JWT";
const Model1 = "[HIMSRB].[dbo].[JWT]"
const Model2 = "[HIMSDI].[dbo].[JWT]"
const Model3 = "[HIMSCDQ].[dbo].[JWT]"
const Model4 = "[HIMSOS].[dbo].[JWT]"
const Model5 = "[HIMSRI].[dbo].[JWT]"
const Model6 = "[HIMS].[dbo].[JWT]"
const Model7 = "[HIMSRC].[dbo].[JWT]"



// generating a hash

const generateHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};




exports.changePassword = async (req, res) => {
  try {
    const { EMPID, password } = req.body;
    const passwordHash = generateHash(password);
    await sql.query(
     ` update ${Model} set Password = '${passwordHash}' where EMPID = '${EMPID}'`
    );
    await sql.query(
      `update ${Model1} set Password = '${passwordHash}' where EMPID = '${EMPID}'`
    );
    await sql.query(
     `update ${Model2} set Password = '${passwordHash}' where EMPID = '${EMPID}'`
    );
    await sql.query(
      `update ${Model3} set Password = '${passwordHash}' where EMPID = '${EMPID}'`
    );
    await sql.query(
      `update ${Model4} set Password = '${passwordHash}' where EMPID = '${EMPID}'`
    );
    await sql.query(
      `update ${Model5} set Password = '${passwordHash}' where EMPID = '${EMPID}'`
    );
    await sql.query(
      `update ${Model6} set Password = '${passwordHash}' where EMPID = '${EMPID}'`
    );
    await sql.query(
      `update ${Model7} set Password = '${passwordHash}' where EMPID = '${EMPID}'`
    );
    return res.status(200).json({
      success: true,
      result:  [],
      message: "Password change successfully!",
    });
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ err: err, success: false, result: [], message: "Oops there is an Error" });
  }
}

exports.updateImage = async (req,res) => {
  const { id } = req.params;
  const values = req.body;
  try {
    let valuesQuery = "";
    for (key in values) {
      valuesQuery += key + "='" + values[key] + "',";
    }
    valuesQuery = valuesQuery.slice(0, -1);
    await sql.query(`update ${Model} set ${valuesQuery} where EMPID = ${id}`);
    await sql.query(`update ${Model1} set ${valuesQuery} where EMPID = ${id}`);
    await sql.query(`update ${Model2} set ${valuesQuery} where EMPID = ${id}`);
    await sql.query(`update ${Model3} set ${valuesQuery} where EMPID = ${id}`);
    await sql.query(`update ${Model4} set ${valuesQuery} where EMPID = ${id}`);
    await sql.query(`update ${Model5} set ${valuesQuery} where EMPID = ${id}`);
    await sql.query(`update ${Model6} set ${valuesQuery} where EMPID = ${id}`);
    await sql.query(`update ${Model7} set ${valuesQuery} where EMPID = ${id}`);

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

exports.getUserBySection = async (req, res) => {

  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 100;

    const { recordset } = await sql.query(
      `SELECT * FROM ${Model} where Section IN ('DS', 'DSB') or [Section] = 'AD' order by First `
    );

    const { recordset: arr } = await sql.query(
      `SELECT COUNT(*) from ${Model}`
    );
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object

    if (count > 0) {
      
      return res.status(200).json({
        success: true,
        result: recordset || [],
        pagination,
        message: "Successfully found all documents",
      });
    }
    else {
      
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: "Collection is Empty",
      });
    }


  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, result: [], message: "Oops there is an Error" });
  }
};

exports.findALL = async (req, res) => {

  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 100;

    const { recordset } = await sql.query(
      `SELECT * FROM ${Model}  `
    );

    const { recordset: arr } = await sql.query(
      `SELECT COUNT(*) from ${Model}`
    );
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object

    if (count > 0) {
      for (let admin of recordset) {
        admin.Password = undefined;
      }
      return res.status(200).json({
        success: true,
        result: recordset || [],
        pagination,
        message: "Successfully found all documents",
      });
    }
    else {
      
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: "Collection is Empty",
      });
    }


  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, result: [], message: "Oops there is an Error" });
  }
};

exports.one = async (req, res) => {
  try {

    var  { data } = req.body;

    let {EMPID} = JSON.parse(data)

    const { recordset } = await sql.query(
      `SELECT First, Last, ManagementAccess, StartDay FROM ${Model} where EMPID = ${EMPID} `
    );


    return res.status(200).json({
      success: true,
      result: recordset || [],
      message: "Successfully found user documents",
    });

  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ err: err, success: false, result: [], message: "Oops there is an Error" });
  }
}


exports.fullList = async (req, res) => {

  try {
    const page = req.query.page || 1;
    const all = req.query.all || null;
    


    const limit = parseInt(req.query.items) || 100;
    var records 

      const { recordset } = await sql.query(
        `SELECT * FROM ${Model} where (SubSection IN ('DS','DSB') or [Section] = 'AD') and  First NOT IN ('Admin') order by First `
      );

      records = recordset


    const { recordset: arr } = await sql.query(
      `SELECT COUNT(*) FROM ${Model} where (SubSection IN ('DS','DSB') or [Section] = 'AD') and  First NOT IN ('Admin') order by First `
     
    );
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object

    if (count > 0) {
      for (let admin of recordset) {
        admin.Password = undefined;
      }
      return res.status(200).json({
        success: true,
        result: records || [],
        pagination,
        message: "Successfully found all documents",
      });
    }
    else {
      
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: "Collection is Empty",
      });
    }


  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, result: [], message: "Oops there is an Error" });
  }
};

exports.getUser = async (EMPID) => {
  try {
    
   var {recordset: result} = await sql.query(`SELECT * from ${Model} where EMPID = '${EMPID}'`)
    return result.length > 0 ? result[0] : result;

  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, result: [], message: "Oops there is an Error" });
  }
}


exports.list = async (req, res) => {

  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 100;

    const { recordset } = await sql.query(
      `SELECT * FROM ${Model} where  (SubSection IN ('DS',  'DSB') or [Section] = 'AD') and EMPL_STATUS NOT IN ('T', 'Archive')   order by First `
    );

    const { recordset: arr } = await sql.query(
      `SELECT COUNT(*) from ${Model}`
    );
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object

    if (count > 0) {
      for (let admin of recordset) {
        admin.Password = undefined;
      }
      return res.status(200).json({
        success: true,
        result: recordset || [],
        pagination,
        message: "Successfully found all documents",
      });
    }
    else {
      
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: "Collection is Empty",
      });
    }


  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, result: [], message: "Oops there is an Error" });
  }
};



exports.fullList = async (req, res) => {

  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 100;

    const { recordset } = await sql.query(
      `SELECT * FROM ${Model} where First NOT IN ('jason', 'Admin') order by First `
    );

    const { recordset: arr } = await sql.query(
      `SELECT COUNT(*) from ${Model}`
    );
    const obj = arr[0];
    const count = obj[""];

    const pages = Math.ceil(count / limit);

    // Getting Pagination Object
    const pagination = { page, pages, count };
    // Getting Pagination Object

    if (count > 0) {
      for (let admin of recordset) {
        admin.Password = undefined;
      }
      return res.status(200).json({
        success: true,
        result: recordset || [],
        pagination,
        message: "Successfully found all documents",
      });
    }
    else {
      
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: "Collection is Empty",
      });
    }


  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, result: [], message: "Oops there is an Error" });
  }
};

exports.create = async (req, res) => {
  let { Email, Password } = req.body;
  if (!Email || !Password)
    return res.status(400).json({
      success: false,
      result: null,
      message: "Email or password fields they don't have been entered.",
    });
  const { recordset } = await sql.query(
    `SELECT * FROM ${Model} where Email = '${Email}'`
  );


  if (recordset.length > 0)
    return res.status(400).json({
      success: false,
      result: null,
      message: "An account with this email already exists.",
    });

  if (Password.length < 6)
    return res.status(400).json({
      success: false,
      result: null,
      message: "The password needs to be at least 6 characters long.",
    });

  const passwordHash = generateHash(Password);
  const values = req.body;

  values.Password = passwordHash;

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
  try {

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
      message: "Admin document save correctly",
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "there is error", error: e, params: req.body, query: insertQuery });
  }
};




exports.update = async (req, res) => {
  let { Email, Password, IDEmployee} = req.body;
  const { id } = req.params;
  const values = req.body;


    if (!Email)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Email or password fields they don't have been entered.",
      });

    const { recordset } = await sql.query(
      `SELECT * FROM ${Model} where Email = '${Email} and IDEmployee != ${IDEmployee}'`
    );

    if (recordset.length > 0)
      return res.status(400).json({
        success: false,
        result: null,
        message: "An account with this email already exists.",
      });


    if (req.body.Password) {
      const passwordHash = generateHash(Password);
      const values = req.body;
      values.Password = passwordHash;
    }

  try {
    let valuesQuery = "";
    for (key in values) {
      valuesQuery += key + "='" + values[key] + "',";
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

exports.delete = async (req, res) => {
  let { id } = req.params;
  
  try { 

    const deleteQuery = `Delete from ${Model} where ID= ${id}`;
    
    await sql.query(deleteQuery);

    return res.status(200).json({
      success: true,
      result: {},
      message: "Success",
    });

  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `Error in deleting the user where id = ${id}`});
  }
};





