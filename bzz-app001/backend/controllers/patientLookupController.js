const methods = require("./crudController");
const endpoints = methods.crudController("[FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT]");
var sql = require("mssql");
var sqlConnection = require('../sql')

delete endpoints["list"];
const Model = "[FI_DM_HIMS_ICD].[dbo].[CLARITY_PATIENT]";

endpoints.list = async (req, res,) => {
    try {

        let {value} = (req.query);

        let filter = (JSON.parse(value))

        if(value == "{}") {

                setTimeout(() => {
                    return res.status(200).json({
                        success: true,
                        result: [],
                        message: "Successfully found all documents",
                    });
                }, 1500)
                
        
            } else {

     
        let filterQuery = "";
        for (key in filter) {
            console.log(key)
            if(filter[key]) {

                if(filter[key][0] == '"' && filter[key][-0] == '"') {
                    filterQuery += filter[key] !== null ? ( key.split(" ").length > 1 ? '[' + key + ']': '[' + key + ']' ) + " =  '" + filter[key].replace(/'/g, "''").replace(/"/g,'') + "' and " : "" ;
                }  else if (key == 'BIRTH_DATE') {
                    let date = filter[key].split('/')

                    if(date[2] && date[0] && date[1]) {
                        date= date[2] + "-" + date[0] + "-" + date[1] 
                        filterQuery += filter[key] !== null ? ( key.split(" ").length > 1 ? '[' + key + ']': '[' + key + ']' ) + " =  '" + date + " 00:00:00.000' and " : "" ;  
                    }
                    
                } else if (key == 'NAME' && filter[key].length > 0  )  {
                    let values = filter[key]
                    filterQuery += filter[key] !== null ?  ` CONCAT(
                    COALESCE([PAT_FIRST_NAME] + ' ', '')
                    , COALESCE(PAT_MIDDLE_NAME + ' ', '')
                    , COALESCE(PAT_LAST_NAME, '')
                    )  like '%${values.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, ' ').replace(/ +/g, ' ' ).trim()}%'
                    OR 
                    CONCAT(
                    COALESCE([PAT_LAST_NAME] + ' ', '')
                    , COALESCE(PAT_MIDDLE_NAME + ' ', '')
                    , COALESCE(PAT_FIRST_NAME, '')
                    )  like '%${values.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, ' ').replace(/ +/g, ' ' ).trim()}%'
                    OR 
                    CONCAT(
                    COALESCE([PAT_LAST_NAME] + ' ', '')
                    , COALESCE(PAT_FIRST_NAME, '')
                    )  like '%${values.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, ' ').replace(/ +/g, ' ' ).trim()}%'
                    OR 
                    CONCAT(
                        COALESCE([PAT_FIRST_NAME] + ' ', '')
                        , COALESCE(PAT_LAST_NAME, '')
                        )  like '%${values.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, ' ').replace(/ +/g, ' ' ).trim()}%'
                  
                        
                    
                    and ` : "" ;
                    
                }else {
                    filterQuery += filter[key] !== null ? ( key.split(" ").length > 1 ? '[' + key + ']': '[' + key + ']' ) + " like  '%" + filter[key].replace(/'/g, "''") + "%' and " : "" ;
                }
            } 
        }

        filterQuery = filterQuery.slice(0, -4);

        var query = `select TOP (500) *, ID= PAT_ID  from ${Model} where ${filterQuery} ORDER BY PAT_FIRST_NAME ASC, PAT_LAST_NAME ASC `
       
        if(filterQuery.trim() == "") {
            return res.status(200).json({
                success: true,
                result: [],
                message: "Successfully found all documents",
            });
        }
        
        let result = []
        const {recordset} =  await sqlConnection.query(query)
        result = recordset

        // if (!recordset) {
        //     let localQuery = `select * from ${localModel} where ${filterQuery} ORDER BY PAT_FIRST_NAME ASC, PAT_LAST_NAME ASC `
       
        //     const {recordset} =  await sql.query(localQuery)
        //     result = recordset
        // }

        return res.status(200).json({
            success: true,
            result: result,
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


endpoints.create = async (req, res,) => {
    try {

        var {patients} = req.body;


        // let {recordset: result} = await sqlConnection.query(`
        //     select * from ${Model} where 
        //     PAT_FIRST_NAME IN (${patients.map(p => "'" + p.first + "'")}) or PAT_MIDDLE_NAME  IN (${patients.map(p => "'" + p.first + "'")}) or PAT_LAST_NAME IN (${patients.map(p => "'" + p.first + "'")}) and 
        //     PAT_FIRST_NAME  IN (${patients.map(p => "'" + p.last + "'")}) or PAT_MIDDLE_NAME IN (${patients.map(p => "'" + p.last + "'")}) or PAT_LAST_NAME IN (${patients.map(p => "'" + p.last + "'")})
        // `)
        
        return res.status(200).json({
            success: true,
            result: [],
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

module.exports = endpoints;
