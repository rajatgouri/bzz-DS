const methods = require("./crudController");
var sql = require("mssql");
const endpoints = methods.crudController("WQ5508Progress");


delete endpoints["list"];
const WQProgressModel = "IncomingWQProgress";
const WQCheckmarkModel = "IncomingWQCheckmark";
const WQFeedback = "Feedback"
const UserModel = "JWT"
const KPIs = 'TotalKPIs'


endpoints.list = async (req, res,) => {
    try {

        let result =  [{recordset: wqProgress} , {recordset: feedbackProgress}, { recordset: adminlist},{ recordset: wqWorkProgress}] = await Promise.all([
            await sql.query(`select * from ${WQProgressModel}`),
            await sql.query(`select * from ${WQFeedback}`),
            await sql.query(`SELECT * FROM ${UserModel} where   (SubSection IN ('DS', 'DSB') or [ManagementCard] = '1')  and SubSection NOT IN ('DSA') and EMPL_STATUS NOT IN ('T', 'Archive')   order by First `),
            await sql.query(`SELECT * FROM ${WQCheckmarkModel} `)            
        ])

        let queriesToExecute = []
        let EMPID = (adminlist).map(li => {
            if(! li.ManagementCard) {
               return  li.EMPID 
            } 
        }).filter(item => item != undefined)

        queriesToExecute.push(await sql.query(`select * from ${KPIs} where EMPID IN (${EMPID.map(id => "'" + id + "'")}) ORDER BY ActionTimeStamp DESC OFFSET  0  ROWS FETCH NEXT ${EMPID.length * 6 }  ROWS ONLY`))

        result = {
            wqProgress,
            feedbackProgress,
            adminlist,
            wqWorkProgress,
            kpi: (queriesToExecute[0]['recordset'])
        }

        return res.status(200).json({
            success: true,
            result: result,
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