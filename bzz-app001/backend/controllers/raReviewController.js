const methods = require("./crudController");
const endpoints = methods.crudController("RAC");
var sql = require("mssql");
const { getDateTime } = require('./utilController')

delete endpoints["list"];
delete endpoints['update']

const RAC_Model = "RAC";
const ADR_Model = "ADR";
const NN_Model = "NN";
const CERT_Model = "CERT";


const getFormattedData = (data, result) => {

    return data.map((d, i) => {

        

        if (d.Name.trim() == 'Favorable Outcome') {

            return (
                {
                    type: 'Favorable Outcome',
                    value: +((d.Count / result.total) * 100).toFixed(2),
                    count: d.Count,
                    year: d.Year,
                    color: '#C5E0B4',
                    order: 1
                }
            )
        }

        if (d.Name.trim() == 'Unfavorable Outcome') {

            return (
                {
                    type: 'Unfavorable Outcome',
                    value: +((d.Count / (result.total)) * 100).toFixed(2),
                    count: d.Count,
                    year: d.Year,
                    color: '#FF9999',
                    order: 2
                }
            )
        }

        if (d.Name.trim() == 'Total Recouped') {
            return (
                {
                    type: 'Total Recouped',
                    value: '',
                    count: d.Count ? "$" + new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format((d.Count).toFixed(2)) : '$0',
                    year: d.Year,
                    color: '#FF9999',
                    order: 3

                }
            )
        }
    
        if (d.Name.trim() == 'Total Denied') {
            return (
                {
                    type: 'Total Denied',
                    value: '',
                    count: d.Count ? "$" + new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format((d.Count).toFixed(2)) : '$0',
                    year: d.Year,
                    color: '#FF9999',
                    order: 3

                }
            )
        }


        if (d.Name.trim() == 'Total Appeals') {
            return (
                {
                    type: 'Total Appeals',
                    value: '',
                    count: d.Count ? "$" + new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }).format((d.Count).toFixed(2)) : '$0',
                    year: d.Year,
                    color: '#FFF79F',
                    order: 4

                }
            )
        }

        if (d.Name.trim() == 'Closed Audit Rescinded') {
            return (
                {
                    type: 'Closed Audit Rescinded',
                    value: +((d.Count / (result.total)) * 100).toFixed(2),
                    count: d.Count,
                    year: d.Year,
                    color: '#D0CECE',
                    order: 5

                }
            )
        }
   
}).filter((d) => d != null) 
}


endpoints.list = async (req, res,) => {
    try {


        let { dates } = req.query;

        dates = JSON.parse(dates).filter((d) => d != '')


        var result = {
            RAC: [],
            ADR: [],
            NN: [],
            CERT: [],
            RACC: [],
            ADRC: [],
            NNC: [],
            CERTC: [],
            RA_RAC: [],
            RA_ADR: [],
            RA_NN: [],
            RA_CERT: [],
            favorableOutcomeRAC: [],
            favorableOutcomeADR: [],
            favorableOutcomeNN: [],
            favorableOutcomeCERT: [],
            unFavorableOutcomeRAC: [],
            unFavorableOutcomeADR: [],
            unFavorableOutcomeNN: [],
            unFavorableOutcomeCERT: [],
            AuditRescindedRAC: [],
            AuditRescindedADR: [],
            AuditRescindedNN: [],
            AuditRescindedCERT: [],
            RACStatusOpen: [],
            ADRStatusOpen: [],
            NNStatusOpen: [],
            CERTStatusOpen: [],
            RACStatusClosed: [],
            ADRStatusOpenClosed: [],
            NNStatusOpenClosed: [],
            CERTStatusOpenClosed: [],
            RAC_RR: [],
            ADR_RR: [],
            NN_RR: [],
            CERT_RR: []
        }


        

        if (dates.length > 0) {

            let [{ recordset: rac },
                { recordset: adr },
                { recordset: nn },
                { recordset: cert },
                { recordset: racc },
                { recordset: adrc },
                { recordset: nnc },
                { recordset: certc },
                { recordset: ra_rac },
                { recordset: ra_adr },
                { recordset: ra_nn },
                { recordset: ra_cert },
                { recordset: favorableOutcomerac },
                { recordset: favorableOutcomeadr },
                { recordset: favorableOutcomenn },
                { recordset: favorableOutcomecert },
                { recordset: unFavorableOutcomerac },
                { recordset: unFavorableOutcomeadr },
                { recordset: unFavorableOutcomenn },
                { recordset: unFavorableOutcomecert },
                { recordset: EA_rac },
                { recordset: EA_adr },
                { recordset: AuditRescindedrac },
                { recordset: AuditRescindedadr },
                { recordset: AuditRescindednn },
                { recordset: AuditRescindedcert },
                { recordset: racStatusOpen },
                { recordset: adrStatusOpen },
                { recordset: nnStatusOpen },
                { recordset: certStatusOpen },
                { recordset: racStatusClosed },
                { recordset: adrStatusClosed },
                { recordset: nnStatusClosed },
                { recordset: certStatusClosed },
                { recordset: rac_RR },
                { recordset: adr_RR },
                { recordset: nn_RR },
                { recordset: cert_RR }] = await Promise.all([
                    await sql.query(`
                    SELECT COUNT(*)
                    from ${RAC_Model} where [Open/Closed] = 'Open' and ([Archive] = '0' or [Archive] IS NULL) and [Date Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    Union All
                    SELECT COUNT(*)
                    from ${RAC_Model} where [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                    SELECT COUNT(*)
                    from ${ADR_Model} where [Open/Closed] = 'Open' and ([Archive] = '0' or [Archive] IS NULL) and [Date ADR Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    Union All
                    SELECT COUNT(*)
                    from ${ADR_Model} where [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                    SELECT COUNT(*) 
                    from ${NN_Model} where [Open/Closed] = 'Open' and ([Archive] = '0' or [Archive] IS NULL) and [Date NN Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                    Union All
                    SELECT COUNT(*)
                    from ${NN_Model} where [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL) and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                `),
                    await sql.query(`
                    SELECT COUNT(*)
                    from ${CERT_Model} where [Open/Closed] = 'Open' and ([Archive] = '0' or [Archive] IS NULL) and [Date CERT Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                    Union All
                    SELECT COUNT(*)
                    from ${CERT_Model} where [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL) and  [Closed Date ] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                `),

                    // Total
                    await sql.query(`
                    SELECT COUNT(*) as count from ${RAC_Model} where  ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    `),
                    await sql.query(`
                        SELECT COUNT(*) as count from ${ADR_Model} where ([Archive] = '0' or [Archive] IS NULL) and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    `),
                    await sql.query(`
                        SELECT COUNT(*) as count from ${NN_Model} where ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    `),
                    await sql.query(`
                    SELECT COUNT(*) as count from ${CERT_Model} where ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    `),

                    // - Recouped Amount
                    await sql.query(`
                        SELECT SUM([Recouped Amount]) as count from ${RAC_Model} where  [Open/Closed] = 'Closed'  and  ([Archive] = '0' or [Archive] IS NULL) and CONVERT(VARCHAR,[Status]) IN (
                        'Closed Appeal Denied',
                        'Closed Finding Accepted'

                        ) and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    `),
                    await sql.query(`
                    SELECT SUM(CONVERT(FLOAT,[Denied Amount])) as count from ${ADR_Model} where  [Open/Closed] = 'Closed'  and ([Archive] = '0' or [Archive] IS NULL) and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') and ([Archive] = '0' or [Archive] IS NULL)
                    `),
                    await sql.query(`
                    SELECT SUM([Recouped Amount]) as count from ${NN_Model} where  [Open/Closed] = 'Closed'  and ([Archive] = '0' or [Archive] IS NULL) and  CONVERT(VARCHAR,[Status]) IN (
                        'Closed Appeal Denied',
                        'Closed Finding Accepted'

                        ) and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    `),
                    await sql.query(`
                    SELECT SUM([Recouped Amount]) as count from ${CERT_Model} where  [Open/Closed] > 'Closed'  and ([Archive] = '0' or [Archive] IS NULL) and  CONVERT(VARCHAR,[Status]) IN (
                        'Closed Appeal Denied',
                        'Closed Finding Accepted'

                        ) and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    `),

                    // Favorable 
                    await sql.query(`
                    SELECT COUNT(*) as count from ${RAC_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ( 'Closed Finding Overturned','Closed No Finding') and [Open/Closed] = 'Closed'   and ([Archive] = '0' or [Archive] IS NULL) and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                    SELECT COUNT(*) as count from ${ADR_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed No Finding', 'Closed Finding Overturned') and [Open/Closed] = 'Closed'  and  ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                    SELECT COUNT(*) as count from ${NN_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ( 'Closed Finding Overturned','Closed No Finding') and [Open/Closed] = 'Closed'  and ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                SELECT COUNT(*) as count from ${CERT_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed Finding Overturned','Closed No Finding') and [Open/Closed] = 'Closed'  and ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),


                    await sql.query(`
                    SELECT COUNT(*) as count from ${RAC_Model} where CONVERT(VARCHAR(MAX),[Status]) IN (
    
                        'Closed Appeal Denied',
                        'Closed Finding Accepted'

                    ) and [Open/Closed] = 'Closed'   and ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                SELECT COUNT(*) as count from ${ADR_Model} where CONVERT(VARCHAR(MAX),[Status]) IN (

                    'Closed Appeal Denied',
                    'Closed Finding Accepted'
                ) and [Open/Closed] = 'Closed'  and ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                        SELECT COUNT(*) as count from ${NN_Model} where CONVERT(VARCHAR(MAX),[Status]) IN (
        
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
    
                        ) and [Open/Closed] = 'Closed'  and ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                    `), await sql.query(`
                    SELECT COUNT(*) as count from ${CERT_Model} where CONVERT(VARCHAR(MAX),[Status]) IN (
    
                        'Closed Appeal Denied',
                        'Closed Finding Accepted'

                    ) and [Open/Closed] = 'Closed'  and ([Archive] = '0' or [Archive] IS NULL) and [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),


                    // Expected amount 
                    await sql.query(`
            SELECT SUM([Expected Amount]) as count from ${RAC_Model} where  ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Open'   and [Date Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
            `),
                    await sql.query(`
            SELECT SUM([Expected Amount]) as count from ${ADR_Model} where  ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Open' and [Date ADR Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
            `),

                    await sql.query(`
                    SELECT COUNT(*) as count from ${RAC_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed Audit Rescinded') and  ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Closed'   and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                    SELECT COUNT(*) as count from ${ADR_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed Audit Rescinded') and  ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Closed'  and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                    SELECT COUNT(*) as count from ${NN_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed Audit Rescinded') and ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Closed'  and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),
                    await sql.query(`
                    SELECT COUNT(*) as count from ${CERT_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed Audit Rescinded') and ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Closed' and  [Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd') 
                `),


                    await sql.query(`
                SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${RAC_Model} t1
                Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                 t1.[Date Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                 and  (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Open'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                `),
                    await sql.query(`
                SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${ADR_Model} t1
                Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                 t1.[Date ADR Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                 and  (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Open'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name]) 
                `),
                    await sql.query(`
                SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${NN_Model} t1
                Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                 t1.[Date NN Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                 and  (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Open'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                `),
                    await sql.query(`
                SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${CERT_Model} t1
                Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                 t1.[Date CERT Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                 and  (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Open'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                `),


                    await sql.query(`
                SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${RAC_Model} t1
                Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                 t1.[Date Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                 and  (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Closed'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                `),
                    await sql.query(`
                SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${ADR_Model} t1
                Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                 t1.[Date ADR Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                 and  (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Closed'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name]) 
                `),
                    await sql.query(`
                SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${NN_Model} t1
                Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                 t1.[Date NN Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                 and  (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Closed'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                `),
                    await sql.query(`
                SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${CERT_Model} t1
                Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                 t1.[Date CERT Rec'd] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                 and  (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Closed'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                `),
                    await sql.query(`
                
                SELECT CONVERT(VARCHAR(MAX),t2.[Name]) as [RecoupmentRationale] , COUNT(CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale])) as count from ${RAC_Model} t1
                Right JOIN RecoupmentRationale  t2 on  CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]) = t2.[Name]
                AND  t1.[Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                AND (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]), CONVERT(VARCHAR(MAX),t2.[Name])  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                
                
                
                
                `),
                    await sql.query(`
                SELECT CONVERT(VARCHAR(MAX),t2.[Name]) as [RecoupmentRationale] , COUNT(CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale])) as count from ${ADR_Model} t1
                Right JOIN RecoupmentRationale  t2 on  CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]) = t2.[Name]
                AND  t1.[Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                AND (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]), CONVERT(VARCHAR(MAX),t2.[Name])  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                `),
                    await sql.query(`
                SELECT CONVERT(VARCHAR(MAX),t2.[Name]) as [RecoupmentRationale] , COUNT(CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale])) as count from ${NN_Model} t1
                Right JOIN RecoupmentRationale  t2 on  CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]) = t2.[Name]
                AND  t1.[Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                AND (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]), CONVERT(VARCHAR(MAX),t2.[Name])  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                `),
                    await sql.query(`
                
                SELECT CONVERT(VARCHAR(MAX),t2.[Name]) as [RecoupmentRationale] , COUNT(CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale])) as count from ${CERT_Model} t1
                Right JOIN RecoupmentRationale  t2 on  CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]) = t2.[Name]
                AND  t1.[Closed Date] between   FORMAT(TRY_CAST('${dates[0]}' as date),'yyyy-MM-dd') and FORMAT(TRY_CAST('${dates[1]}' as date),'yyyy-MM-dd')
                AND (t1.[Archive] = '0' or t1.[Archive] IS NULL)
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]), CONVERT(VARCHAR(MAX),t2.[Name])  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
                `),

                ])


            result.RAC = rac,
                result.ADR = adr,
                result.NN = nn,
                result.CERT = cert,
                result.RACC = racc,
                result.ADRC = adrc,
                result.NNC = nnc,
                result.CERTC = certc,
                result.RA_RAC = ra_rac,
                result.RA_ADR = ra_adr,
                result.RA_NN = ra_nn,
                result.RA_CERT = ra_cert,
                result.favorableOutcomeRAC = favorableOutcomerac,
                result.favorableOutcomeADR = favorableOutcomeadr,
                result.favorableOutcomeNN = favorableOutcomenn,
                result.favorableOutcomeCERT = favorableOutcomecert,
                result.unFavorableOutcomeRAC = unFavorableOutcomerac,
                result.unFavorableOutcomeADR = unFavorableOutcomeadr,
                result.unFavorableOutcomeNN = unFavorableOutcomenn,
                result.unFavorableOutcomeCERT = unFavorableOutcomecert,
                result.EA_RAC = EA_rac,
                result.EA_ADR = EA_adr,
                result.AuditRescindedRAC = AuditRescindedrac,
                result.AuditRescindedADR = AuditRescindedadr,
                result.AuditRescindedNN = AuditRescindednn,
                result.AuditRescindedCERT = AuditRescindedcert,
                result.RACStatusOpen = racStatusOpen,
                result.ADRStatusOpen = adrStatusOpen,
                result.NNStatusOpen = nnStatusOpen,
                result.CERTStatusOpen = certStatusOpen,
                result.RACStatusClosed = racStatusClosed,
                result.ADRStatusClosed = adrStatusClosed,
                result.NNStatusClosed = nnStatusClosed,
                result.CERTStatusClosed = certStatusClosed,
                result.RAC_RR = rac_RR,
                result.ADR_RR = adr_RR,
                result.NN_RR = nn_RR,
                result.CERT_RR = cert_RR

        } else {


            let [{ recordset: rac },
                { recordset: adr },
                { recordset: nn },
                { recordset: cert },
                { recordset: racc },
                { recordset: adrc },
                { recordset: nnc },
                { recordset: certc },
                { recordset: ra_rac },
                { recordset: ra_adr },
                { recordset: ra_nn },
                { recordset: ra_cert },
                { recordset: favorableOutcomerac },
                { recordset: favorableOutcomeadr },
                { recordset: favorableOutcomenn },
                { recordset: favorableOutcomecert },
                { recordset: unFavorableOutcomerac },
                { recordset: unFavorableOutcomeadr },
                { recordset: unFavorableOutcomenn },
                { recordset: unFavorableOutcomecert },
                { recordset: EA_rac },
                { recordset: EA_adr },
                { recordset: AuditRescindedrac },
                { recordset: AuditRescindedadr },
                { recordset: AuditRescindednn },
                { recordset: AuditRescindedcert },
                { recordset: racStatusOpen },
                { recordset: adrStatusOpen },
                { recordset: nnStatusOpen },
                { recordset: certStatusOpen },
                { recordset: racStatusClosed },
                { recordset: adrStatusClosed },
                { recordset: nnStatusClosed },
                { recordset: certStatusClosed },
                { recordset: rac_RR },
                { recordset: adr_RR },
                { recordset: nn_RR },
                { recordset: cert_RR }] = await Promise.all([
                    await sql.query(`
                SELECT COUNT(*)
                from ${RAC_Model} where [Open/Closed] = 'Open' and ([Archive] = '0' or [Archive] IS NULL) 
                Union All
                SELECT COUNT(*)
                from ${RAC_Model} where [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                SELECT COUNT(*)
                from ${ADR_Model} where [Open/Closed] = 'Open' and ([Archive] = '0' or [Archive] IS NULL)
                Union All
                SELECT COUNT(*)
                from ${ADR_Model} where [Open/Closed] = 'Closed' and  ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                SELECT COUNT(*) 
                from ${NN_Model} where [Open/Closed] = 'Open' and ([Archive] = '0' or [Archive] IS NULL)
                Union All
                SELECT COUNT(*)
                from ${NN_Model} where [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                SELECT COUNT(*)
                from ${CERT_Model} where [Open/Closed] = 'Open' and ([Archive] = '0' or [Archive] IS NULL)
                Union All
                SELECT COUNT(*)
                from ${CERT_Model} where [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                SELECT COUNT(*) as count from ${RAC_Model}  where ([Archive] = '0' or [Archive] IS NULL)
                `),
                    await sql.query(`
                    SELECT COUNT(*) as count from ${ADR_Model} where ([Archive] = '0' or [Archive] IS NULL)
                `),
                    await sql.query(`
                    SELECT COUNT(*) as count from ${NN_Model} where ([Archive] = '0' or [Archive] IS NULL)
                `),
                    await sql.query(`
                SELECT COUNT(*) as count from ${CERT_Model} where ([Archive] = '0' or [Archive] IS NULL)
                `),

                    // - Recouped Amount
                    await sql.query(`
                    SELECT SUM([Recouped Amount]) as count from ${RAC_Model} where  [Open/Closed] = 'Closed'  and  CONVERT(VARCHAR,[Status]) IN (
                    'Closed Appeal Denied',
                    'Closed Finding Accepted'
                    ) and ([Archive] = '0' or [Archive] IS NULL)
                `),
                    await sql.query(`
                SELECT SUM(CONVERT(FLOAT,[Denied Amount])) as count from ${ADR_Model} where  [Open/Closed] = 'Closed'   and ([Archive] = '0' or [Archive] IS NULL)
                `),
                    await sql.query(`
                SELECT SUM([Recouped Amount]) as count from ${NN_Model} where  [Open/Closed] = 'Closed'  and  CONVERT(VARCHAR,[Status]) IN (
                    'Closed Appeal Denied',
                    'Closed Finding Accepted'
                    ) and ([Archive] = '0' or [Archive] IS NULL)
                `),
                    await sql.query(`
                SELECT SUM([Recouped Amount]) as count from ${CERT_Model} where  [Open/Closed] > 'Closed'  and  CONVERT(VARCHAR,[Status]) IN (
                    'Closed Appeal Denied',
                    'Closed Finding Accepted'
                    ) and ([Archive] = '0' or [Archive] IS NULL)
                `),

                    await sql.query(`
                SELECT COUNT(*) as count from ${RAC_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ( 'Closed Finding Overturned','Closed No Finding') and [Open/Closed] = 'Closed'   and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                SELECT COUNT(*) as count from ${ADR_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ( 'Closed No Finding', 'Closed Finding Overturned') and [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                SELECT COUNT(*) as count from ${NN_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ( 'Closed Finding Overturned','Closed No Finding') and [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
            SELECT COUNT(*) as count from ${CERT_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ( 'Closed Finding Overturned','Closed No Finding') and [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),

                    await sql.query(`
                SELECT COUNT(*) as count from ${RAC_Model} where CONVERT(VARCHAR(MAX),[Status]) IN (

                    'Closed Appeal Denied',
                    'Closed Finding Accepted'
                ) and [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
            SELECT COUNT(*) as count from ${ADR_Model} where CONVERT(VARCHAR(MAX),[Status]) IN (
                'Closed Appeal Denied',
                'Closed Finding Accepted'
            ) and [Open/Closed] = 'Closed'  and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                    SELECT COUNT(*) as count from ${NN_Model} where CONVERT(VARCHAR(MAX),[Status]) IN (
    
                        'Closed Appeal Denied',
                        'Closed Finding Accepted'

                    ) and [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
                `), await sql.query(`
                SELECT COUNT(*) as count from ${CERT_Model} where CONVERT(VARCHAR(MAX),[Status]) IN (

                    'Closed Appeal Denied',
                    'Closed Finding Accepted'
                ) and [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),

                    // Expected amount 
                    await sql.query(`
            SELECT SUM([Expected Amount]) as count from ${RAC_Model} where  ([Archive] = '0' or [Archive] IS NULL)  and [Open/Closed] = 'Open'
            `),
                    await sql.query(`
            SELECT SUM([Expected Amount]) as count from ${ADR_Model} where  ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Open'
            `),


                    await sql.query(`
                SELECT COUNT(*) as count from ${RAC_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed Audit Rescinded') and [Open/Closed] = 'Closed'  and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                SELECT COUNT(*) as count from ${ADR_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed Audit Rescinded') and [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                SELECT COUNT(*) as count from ${NN_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed Audit Rescinded') and [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
                SELECT COUNT(*) as count from ${CERT_Model} where CONVERT(VARCHAR(MAX),[Status]) IN ('Closed Audit Rescinded') and [Open/Closed] = 'Closed' and ([Archive] = '0' or [Archive] IS NULL)
            `),
                    await sql.query(`
            SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${RAC_Model} t1 Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                ( t1.[Archive]  = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Open'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
            `),
                    await sql.query(`
            SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${ADR_Model} t1 Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
            ( t1.[Archive]  = '0' or t1.[Archive] IS NULL)
            where t2.[Open/Closed] = 'Open'
            GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])

            `),

                    await sql.query(`
            SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${NN_Model} t1 Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
            ( t1.[Archive]  = '0' or t1.[Archive] IS NULL)
            where t2.[Open/Closed] = 'Open'
            GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])

            `),
                    await sql.query(`
            
            SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${CERT_Model} t1 Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
            ( t1.[Archive]  = '0' or t1.[Archive] IS NULL)
            where t2.[Open/Closed] = 'Open'
            GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])

            `),


                    await sql.query(`
            SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${RAC_Model} t1 Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
                ( t1.[Archive]  = '0' or t1.[Archive] IS NULL)
                where t2.[Open/Closed] = 'Closed'
                GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
            `),
                    await sql.query(`
            SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${ADR_Model} t1 Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
            ( t1.[Archive]  = '0' or t1.[Archive] IS NULL)
            where t2.[Open/Closed] = 'Closed'
            GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])

            `),

                    await sql.query(`
            SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${NN_Model} t1 Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
            ( t1.[Archive]  = '0' or t1.[Archive] IS NULL)
            where t2.[Open/Closed] = 'Closed'
            GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])

            `),
                    await sql.query(`
            
            SELECT  CONVERT(VARCHAR(MAX),t2.[Name]) as [Status], t2.[Open/Closed] as [Open/Closed], COUNT(CONVERT(VARCHAR(MAX),t1.[Status])) as count from ${CERT_Model} t1 Right JOIN  RAC_Status t2 on  CONVERT(VARCHAR(MAX),t1.[Status]) = t2.[Name] AND
            ( t1.[Archive]  = '0' or t1.[Archive] IS NULL)
            where t2.[Open/Closed] = 'Closed'
            GROUP BY CONVERT(VARCHAR(MAX),t1.[Status]), CONVERT(VARCHAR(MAX),t2.[Name]) , t2.[Open/Closed]  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])

            `),

                    await sql.query(`
                
            SELECT CONVERT(VARCHAR(MAX),t2.[Name]) as [RecoupmentRationale] , COUNT(CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale])) as count from ${RAC_Model} t1
            Right JOIN RecoupmentRationale  t2 on  CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]) = t2.[Name]
            AND (t1.[Archive] = '0' or t1.[Archive] IS NULL)
            GROUP BY CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]), CONVERT(VARCHAR(MAX),t2.[Name])  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])        `),

                    await sql.query(`
        SELECT CONVERT(VARCHAR(MAX),t2.[Name]) as [RecoupmentRationale] , COUNT(CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale])) as count from ${ADR_Model} t1
        Right JOIN RecoupmentRationale  t2 on  CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]) = t2.[Name]
        AND (t1.[Archive] = '0' or t1.[Archive] IS NULL)
        GROUP BY CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]), CONVERT(VARCHAR(MAX),t2.[Name])  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
        `),
                    await sql.query(`
        SELECT CONVERT(VARCHAR(MAX),t2.[Name]) as [RecoupmentRationale] , COUNT(CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale])) as count from ${NN_Model} t1
        Right JOIN RecoupmentRationale  t2 on  CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]) = t2.[Name]
        AND (t1.[Archive] = '0' or t1.[Archive] IS NULL)
        GROUP BY CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]), CONVERT(VARCHAR(MAX),t2.[Name])  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
        `),
                    await sql.query(`
        
        SELECT CONVERT(VARCHAR(MAX),t2.[Name]) as [RecoupmentRationale] , COUNT(CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale])) as count from ${CERT_Model} t1
        Right JOIN RecoupmentRationale  t2 on  CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]) = t2.[Name]
        AND (t1.[Archive] = '0' or t1.[Archive] IS NULL)
        GROUP BY CONVERT(VARCHAR(MAX),t1.[Recoupment Rationale]), CONVERT(VARCHAR(MAX),t2.[Name])  ORDER BY CONVERT(VARCHAR(MAX),t2.[Name])
        `),
                ])


            result.RAC = rac,
                result.ADR = adr,
                result.NN = nn,
                result.CERT = cert,
                result.RACC = racc,
                result.ADRC = adrc,
                result.NNC = nnc,
                result.CERTC = certc,
                result.RA_RAC = ra_rac,
                result.RA_ADR = ra_adr,
                result.RA_NN = ra_nn,
                result.RA_CERT = ra_cert,
                result.favorableOutcomeRAC = favorableOutcomerac,
                result.favorableOutcomeADR = favorableOutcomeadr,
                result.favorableOutcomeNN = favorableOutcomenn,
                result.favorableOutcomeCERT = favorableOutcomecert,
                result.unFavorableOutcomeRAC = unFavorableOutcomerac,
                result.unFavorableOutcomeADR = unFavorableOutcomeadr,
                result.unFavorableOutcomeNN = unFavorableOutcomenn,
                result.unFavorableOutcomeCERT = unFavorableOutcomecert,
                result.EA_RAC = EA_rac,
                result.EA_ADR = EA_adr,
                result.AuditRescindedRAC = AuditRescindedrac,
                result.AuditRescindedADR = AuditRescindedadr,
                result.AuditRescindedNN = AuditRescindednn,
                result.AuditRescindedCERT = AuditRescindedcert,
                result.RACStatusOpen = racStatusOpen,
                result.ADRStatusOpen = adrStatusOpen,
                result.NNStatusOpen = nnStatusOpen,
                result.CERTStatusOpen = certStatusOpen,
                result.RACStatusClosed = racStatusClosed,
                result.ADRStatusClosed = adrStatusClosed,
                result.NNStatusClosed = nnStatusClosed,
                result.CERTStatusClosed = certStatusClosed,
                result.RAC_RR = rac_RR,
                result.ADR_RR = adr_RR,
                result.NN_RR = nn_RR,
                result.CERT_RR = cert_RR
        }


        let allRecoupmentRationale = []
        let openStatus = []
        let closedStatus = []

        for (i in result.RAC_RR) {
            allRecoupmentRationale[i] = { 'RecoupmentRationale': result.RAC_RR[i]['RecoupmentRationale'], count: result.RAC_RR[i].count + result.ADR_RR[i].count + result.NN_RR[i].count + result.CERT_RR[i].count }
        }

     

        openStatus = result.RACStatusOpen.map((c, i) => {

            let ADRS = result.ADRStatusOpen.filter((a) => a.Status == c.Status)[0]
            let NNS = result.NNStatusOpen.filter((a) => a.Status == c.Status)[0]
            let CERTS = result.CERTStatusOpen.filter((a) => a.Status == c.Status)[0]

            return { 'Status': c['Status'], count: (c ? c.count : 0) + (ADRS ? ADRS.count : 0) + (NNS ? NNS.count : 0) + (CERTS ? CERTS.count : 0), 'Open/Closed': c['Open/Closed'] }
        })

        closedStatus = result.RACStatusClosed.map((c, i) => {
            let ADRS = result.ADRStatusClosed.filter((a) => a.Status == c.Status)[0]
            let NNS = result.NNStatusClosed.filter((a) => a.Status == c.Status)[0]
            let CERTS = result.CERTStatusClosed.filter((a) => a.Status == c.Status)[0]

            return { 'Status': c['Status'], count: (c ? c.count : 0) + (ADRS ? ADRS.count : 0) + (NNS ? NNS.count : 0) + (CERTS ? CERTS.count : 0), 'Open/Closed': c['Open/Closed'] }

            // return  {'Status': c['Status'], count : c.count +  ADRStatus[i].count + NNStatus[i].count + CERTStatus[i].count, 'Open/Closed': c['Open/Closed'] }
        })


        obj = {
            RAC: {
                open: result.RAC[0][""],
                closed: result.RAC[1][""],
                total: result.RAC[1][""] + result.RAC[0][""],
                status: {
                    open: result.RACStatusOpen,
                    closed: result.RACStatusClosed
                },
                recoupmentRationale: result.RAC_RR,
                data: [
                    {
                        type: 'Favorable Outcome',
                        value: +((result.favorableOutcomeRAC[0]['count'] / (result.RAC[1][""])) * 100).toFixed(2),
                        count: result.favorableOutcomeRAC[0]['count'],
                        color: '#C5E0B4'
                    },
                    {
                        type: 'Unfavorable Outcome',
                        value: +((result.unFavorableOutcomeRAC[0]['count'] / (result.RAC[1][""])) * 100).toFixed(2),
                        count: result.unFavorableOutcomeRAC[0]['count'],
                        color: '#FF9999'
                    },


                    {
                        type: 'Total Recouped',
                        value: '',
                        // count: "$ "+  RA_RAC[0]['count'],
                        count: result.RA_RAC[0]['count'] ? "$" + new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format((result.RA_RAC[0]['count']).toFixed(2)) : '$0',

                        color: '#FF9999'
                    },
                    {
                        type: 'Total Appeals',
                        value: '',
                        count: result.EA_RAC[0]['count'] ? "$" + new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format((result.EA_RAC[0]['count']).toFixed(2)) : '$0',
                        color: ' #FFF79F'
                    },
                    {
                        type: 'Closed Audit Rescinded',
                        value: +((result.AuditRescindedRAC[0]['count'] / (result.RAC[1][""])) * 100).toFixed(2),
                        count: result.AuditRescindedRAC[0]['count'],
                        color: '#D0CECE'
                    }
                ]
            },
            ADR: {
                open: result.ADR[0][""],
                closed: result.ADR[1][""],
                total: result.ADR[1][""] + result.ADR[0][""],
                status: {
                    open: result.ADRStatusOpen,
                    closed: result.ADRStatusClosed
                },
                recoupmentRationale: result.ADR_RR,
                data: [
                    {
                        type: 'Favorable Outcome',
                        value: +((result.favorableOutcomeADR[0]['count'] / (result.ADR[1][""])) * 100).toFixed(2),
                        count: result.favorableOutcomeADR[0]['count'],
                        color: '#C5E0B4'
                    },
                    {
                        type: 'Unfavorable Outcome',
                        value: +((result.unFavorableOutcomeADR[0]['count'] / (result.ADR[1][""])) * 100).toFixed(2),
                        count: result.unFavorableOutcomeADR[0]['count'],
                        color: '#FF9999'

                    },

                    {
                        type: 'Total Denied',
                        value: '',
                        count: result.RA_ADR[0]['count'] ? "$" + new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format((result.RA_ADR[0]['count']).toFixed(2)) : '$0',
                        color: '#FF9999'
                    },
                    {
                        type: 'Total Appeals',
                        value: '',
                        count: result.EA_ADR[0]['count'] ? "$" + new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format((result.EA_ADR[0]['count']).toFixed(2)) : '$0',
                        color: ' #FFF79F'
                    },
                    {
                        type: 'Closed Audit Rescinded',
                        value: +((result.AuditRescindedADR[0]['count'] / (result.ADR[1][""])) * 100).toFixed(2),
                        count: result.AuditRescindedADR[0]['count'],
                        color: '#D0CECE'

                    }
                ]


            },
            NN: {
                open: result.NN[0][""],
                closed: result.NN[1][""],
                total: result.NN[1][""] + result.NN[0][""],
                status: {
                    open: result.NNStatusOpen,
                    closed: result.NNStatusClosed
                },
                recoupmentRationale: result.NN_RR,
                data: [
                    {
                        type: 'Favorable Outcome',
                        value: +((result.favorableOutcomeNN[0]['count'] / (result.NN[1][""])) * 100).toFixed(2),
                        count: result.favorableOutcomeNN[0]['count'],
                        color: '#C5E0B4'

                    },
                    {
                        type: 'Unfavorable Outcome',
                        value: +((result.unFavorableOutcomeNN[0]['count'] / (result.NN[1][""])) * 100).toFixed(2),
                        count: result.unFavorableOutcomeNN[0]['count'],
                        color: '#FF9999'

                    },
                    {
                        type: 'Total Recouped',
                        value: '',
                        count: result.RA_NN[0]['count'] ? "$" + new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(((result.RA_NN[0]['count']).toFixed(2))) : '$0',
                        color: '#FF9999'
                    },
                    {
                        type: 'Closed Audit Rescinded',
                        value: +((result.AuditRescindedNN[0]['count'] / (result.NN[1][""])) * 100).toFixed(2),
                        count: result.AuditRescindedNN[0]['count'],
                        color: '#D0CECE'


                    }
                ]

            },
            CERT: {
                open: result.CERT[0][""],
                closed: result.CERT[1][""],
                total: result.CERT[1][""] + result.CERT[0][""],
                status: {
                    open: result.CERTStatusOpen,
                    closed: result.CERTStatusClosed
                },
                recoupmentRationale: result.CERT_RR,
                data: [
                    {
                        type: 'Favorable Outcome',
                        value: +((result.favorableOutcomeCERT[0]['count'] / (result.CERT[1][""])) * 100).toFixed(2),
                        count: result.favorableOutcomeCERT[0]['count'],
                        color: '#C5E0B4'
                    },
                    {
                        type: 'Unfavorable Outcome',
                        value: +((result.unFavorableOutcomeCERT[0]['count'] / (result.CERT[1][""])) * 100).toFixed(2),
                        count: result.unFavorableOutcomeCERT[0]['count'],
                        color: '#FF9999'
                    },
                    {
                        type: 'Total Recouped',
                        value: '',
                        count: result.RA_CERT[0]['count'] ? "$" + new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format((result.RA_CERT[0]['count']).toFixed(2)) : '$0',
                        color: '#FF9999'
                    },
                    {
                        type: 'Closed Audit Rescinded',
                        value: +((result.AuditRescindedCERT[0]['count'] / (result.CERT[1][""])) * 100).toFixed(2),
                        count: result.AuditRescindedCERT[0]['count'],
                        color: '#D0CECE'

                    }
                ]

            },
            All: {
                open: result.RAC[0][""] + result.ADR[0][""] + result.NN[0][""] + result.CERT[0][""],
                closed: result.RAC[1][""] + result.ADR[1][""] + result.NN[1][""] + result.CERT[1][""],
                total: result.RAC[0][""] + result.RAC[1][""] + result.ADR[0][""] + result.ADR[1][""] + result.NN[1][""] + result.NN[0][""] + result.CERT[0][""] + result.CERT[1][""],
                status: {
                    open: openStatus,
                    closed: closedStatus

                },
                recoupmentRationale: allRecoupmentRationale,
                statuses: [
                    {
                        type: 'Open',
                        value: result.RAC[0][""] + result.ADR[0][""] + result.NN[0][""] + result.CERT[0][""],
                        count: 0,
                        color: '#C5E0B4'
                    },
                    {
                        type: 'Closed',
                        value: result.RAC[1][""] + result.ADR[1][""] + result.NN[1][""] + result.CERT[1][""],
                        count: 0,
                        color: '#FF9999'
                    },

                ],
                outcome: [

                    {
                        type: 'Favorable Outcome',
                        value: (result.favorableOutcomeRAC[0]['count'] + result.favorableOutcomeADR[0]['count'] + result.favorableOutcomeNN[0]['count'] + result.favorableOutcomeCERT[0]['count']),
                        count: 0,
                        color: '#C5E0B4'

                    },
                    {
                        type: 'Unfavorable Outcome',
                        value: (result.unFavorableOutcomeRAC[0]['count'] + result.unFavorableOutcomeADR[0]['count'] + result.unFavorableOutcomeNN[0]['count'] + result.unFavorableOutcomeCERT[0]['count']),
                        count: 0,
                        color: '#FF9999'

                    },
                    {
                        type: 'Closed Audit Rescinded',
                        value: (result.AuditRescindedRAC[0]['count'] + result.AuditRescindedADR[0]['count'] + result.AuditRescindedNN[0]['count'] + result.AuditRescindedCERT[0]['count']),
                        count: 0,
                        color: '#D0CECE'
                    }
                ],

                data: [
                    {
                        type: 'Favorable Outcome',
                        value: +((result.favorableOutcomeRAC[0]['count'] + result.favorableOutcomeADR[0]['count'] + result.favorableOutcomeNN[0]['count'] + result.favorableOutcomeCERT[0]['count']) / (result.RAC[1][""] + result.ADR[1][""] + result.NN[1][""] + result.CERT[1][""]) * 100).toFixed(2),
                        count: result.favorableOutcomeRAC[0]['count'] + result.favorableOutcomeADR[0]['count'] + result.favorableOutcomeNN[0]['count'] + result.favorableOutcomeCERT[0]['count'],
                        color: '#C5E0B4'

                    },
                    {
                        type: 'Unfavorable Outcome',
                        value: +((result.unFavorableOutcomeRAC[0]['count'] + result.unFavorableOutcomeADR[0]['count'] + result.unFavorableOutcomeNN[0]['count'] + result.unFavorableOutcomeCERT[0]['count']) / (result.RAC[1][""] + result.ADR[1][""] + result.NN[1][""] + result.CERT[1][""]) * 100).toFixed(2),
                        count: result.unFavorableOutcomeRAC[0]['count'] + result.unFavorableOutcomeADR[0]['count'] + result.unFavorableOutcomeNN[0]['count'] + result.unFavorableOutcomeCERT[0]['count'],
                        color: '#FF9999'

                    },
                    {
                        type: 'Total Recouped',
                        value: "",
                        count: "$" + new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(((result.RA_RAC[0]['count'] ? result.RA_RAC[0]['count'] : 0) + (result.RA_NN[0]['count'] ? result.RA_NN[0]['count'] : 0) + (result.RA_CERT[0]['count'] ? result.RA_CERT[0]['count'] : 0)).toFixed(2)),
                        color: '#FF9999'
                    },
                    {
                        type: 'Total Denied',
                        value: 0,
                        count: "$" + new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(((result.RA_ADR[0]['count'] ? result.RA_ADR[0]['count'] : 0)).toFixed(2)),
                        color: '#FF9999'
                    },
                    {
                        type: 'Total Appeals',
                        value: '',
                        count: "$" + new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(((result.EA_ADR[0]['count'] ? result.EA_ADR[0]['count'] : 0) + (result.EA_RAC[0]['count'] ? result.EA_RAC[0]['count'] : 0)).toFixed(2)),
                        color: ' #FFF79F'
                    },
                    {
                        type: 'Closed Audit Rescinded',
                        value: +((result.AuditRescindedRAC[0]['count'] + result.AuditRescindedADR[0]['count'] + result.AuditRescindedNN[0]['count'] + result.AuditRescindedCERT[0]['count']) / (result.RAC[1][""] + result.ADR[1][""] + result.NN[1][""] + result.CERT[1][""]) * 100).toFixed(2),
                        count: result.AuditRescindedRAC[0]['count'] + result.AuditRescindedADR[0]['count'] + result.AuditRescindedNN[0]['count'] + result.AuditRescindedCERT[0]['count'],
                        color: '#D0CECE'
                    }
                ]

            },

        }



        return res.status(200).json({
            success: true,
            result: obj,
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



endpoints.total = async (req, res,) => {
    try {


        let { model, date } = req.query;

        var result = {
            total: [],
            openClosed: [],
            year: [],
            totalyear: []
        }


        if (date) {

            if (model == 'RAC') {
                let [{ recordset: total }, { recordset: openClosed }, { recordset: year }, { recordset: totalyear }] = await Promise.all([

                    // Total
                    await sql.query(`
                        SELECT COUNT(*) as count  from ${RAC_Model} where  ([Archive] = '0' or [Archive] IS NULL) and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy')
                        `),

                    // Open/Closed
                    await sql.query(`
                            SELECT COUNT(*)
                            from ${RAC_Model} where   ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Open' and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy')
                            Union All
                            SELECT COUNT(*)
                            from ${RAC_Model} where ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Closed' and  FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy') 
                        `),

                    // year
                    await sql.query(`
                    DECLARE @Start VARCHAR(4)='${date}'
                    DECLARE @End VARCHAR(4)='${date}'
                                    
                    
                     DROP Table IF EXISTS #Temp
                    CREATE TABLE  #Temp
                    ( [Count]  INT,
                    [Year] VARCHAR(4),
                    [Name] VARCHAR(MAX)
                    )
                    INSERT INTO #Temp
                    SELECT
                    Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Favorable Outcome'   as Name
                    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))--DATEPART(Year,[Date Rec'd]
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date Rec'd] IS NOT NULL
                    and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    SUM([Expected Amount]) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Total Appeals' as Name
                    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                    and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                    and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                    WHILE( @Start <= @End)
                    BEGIN
                            INSERT INTo #Temp
                            SELECT 0  as Count,@Start as [Year],'Favorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                                SELECT * FROM (SELECT
                                                Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as [Year], 'Favorable Outcome'   as Name
                                                from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                                and  (CONVERT(VARCHAR, [Status])) IN (
                                                'Closed Finding Overturned','Closed No Finding'
                                                )
                                                and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))) C
                                                WHERE C.[Year]=@Start
                                        )
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Unfavorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                                                            from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Appeal Denied','Closed Finding Accepted'
                                                            ) and [Date Rec'd] IS NOT NULL
                                                            and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                                                ) C
                                                WHERE C.[Year]=@Start)
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Closed Audit Rescinded' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                                                            from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Audit Rescinded'
                                                            )
                                                            and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                                UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Total Appeals' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                                SELECT
                                                                SUM([Expected Amount]) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Total Appeals' as Name
                                                                from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                                                and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                                Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                                UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Total Recouped' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                                                            from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and CONVERT(VARCHAR, [Status]) IN  (
                                                                    'Closed Appeal Denied',
                                                                    'Closed Finding Accepted'
                                                            )
                                                            and FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                    SET @Start =@Start +1
                    END
                    SELECT  Count, [Year], Name
                    FROM #Temp
                    ORDER BY [year] 
                    DROP TABLE  #Temp
                        `),

                    // Total Year
                    await sql.query(`
                    SELECT * FROM RAC where ID < 0                            
                    `)


                ])



                result.total = total[0]['count']
                result.openClosed = openClosed
                result.year = year
                result.totalyear = totalyear
            } else if (model == 'ADR') {
                let [{ recordset: total }, { recordset: openClosed }, { recordset: year }, { recordset: totalyear }] = await Promise.all([

                    //      Total
                    await sql.query(`
                            SELECT COUNT(*) as count  from ${ADR_Model} where  ([Archive] = '0' or [Archive] IS NULL) and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy')
                            `),

                    // Open/Closed
                    await sql.query(`
                                SELECT COUNT(*)
                                from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Open' and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy') 
                                Union All
                                SELECT COUNT(*)
                                from ${ADR_Model} where ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Closed' and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy') 
                            `),

                    // year
                    await sql.query(`
                    DECLARE @Start VARCHAR(4)='${date}'
                    DECLARE @End VARCHAR(4)='${date}'
                                    
                    
                     DROP Table IF EXISTS #Temp
                    CREATE TABLE  #Temp
                    ( [Count]  INT,
                    [Year] VARCHAR(4),
                    [Name] VARCHAR(MAX)
                    )
                    INSERT INTO #Temp
                    SELECT
                    Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Favorable Outcome'   as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'UnFavorable Outcome'   as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date ADR Rec'd] IS NOT NULL
                    and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    SUM([Expected Amount]) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Total Appeals' as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    SUM(CONVERT(FLOAT,[Denied Amount])) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Total Denied' as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                    and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                    WHILE( @Start <= @End)
                    BEGIN
                            INSERT INTo #Temp
                            SELECT 0  as Count,@Start as [Year],'Favorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                                SELECT * FROM (SELECT
                                                Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as [Year], 'Favorable Outcome'   as Name
                                                from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                and  (CONVERT(VARCHAR, [Status])) IN (
                                                'Closed Finding Overturned','Closed No Finding'
                                                )
                                                and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))) C
                                                WHERE C.[Year]=@Start
                                        )
                            UNION ALL
                            ----INSERT INTO #Temp
                            SELECT 0  as Count,@Start as [Year],'UnFavorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'UnFavorable Outcome'   as Name
                                                            from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Appeal Denied','Closed Finding Accepted'
                                                            ) and [Date ADR Rec'd] IS NOT NULL
                                                            and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                                                ) C
                                                WHERE C.[Year]=@Start)
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Closed Audit Rescinded' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                                                            from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Audit Rescinded'
                                                            )
                                                           and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                                UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Total Appeals' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                                SELECT
                                                                SUM([Expected Amount]) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Total Appeals' as Name
                                                                from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                                and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                                Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                                UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Total Denied' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            SUM(CONVERT(FLOAT,[Denied Amount])) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Total Total Denied' as Name
                                                            from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                           
                                                            and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                    SET @Start =@Start +1
                    END
                    SELECT  Count, [Year], Name
                    FROM #Temp
                    ORDER BY [year] 
                    DROP TABLE  #Temp
                            `),

                    // Total year
                    await sql.query(`
                    SELECT * FROM ADR where ID < 0                            
                    `)

                ])


                result.total = total[0]['count']
                result.openClosed = openClosed
                result.year = year
                result.totalyear = totalyear
            } else if (model == 'NN') {
                let [{ recordset: total }, { recordset: openClosed }, { recordset: year }, { recordset: totalyear }] = await Promise.all([

                    //      Total
                    await sql.query(`
                                SELECT COUNT(*) as count  from ${NN_Model} where  ([Archive] = '0' or [Archive] IS NULL) and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy')
                                `),

                    // Open/Closed
                    await sql.query(`
                                    SELECT COUNT(*)
                                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Open' and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy') 
                                    Union All
                                    SELECT COUNT(*)
                                    from ${NN_Model} where ([Archive] = '0' or [Archive] IS NULL)  and [Open/Closed] = 'Closed' and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy') 
                                `),

                    // year
                    await sql.query(`
                    DECLARE @Start VARCHAR(4)='${date}'
                    DECLARE @End VARCHAR(4)='${date}'
                                    
                    
                     DROP Table IF EXISTS #Temp
                    CREATE TABLE  #Temp
                    ( [Count]  INT,
                    [Year] VARCHAR(4),
                    [Name] VARCHAR(MAX)
                    )
                    INSERT INTO #Temp
                    SELECT
                    Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Favorable Outcome'   as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))--DATEPART(Year,[Date NN Rec'd]
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date NN Rec'd] IS NOT NULL
                    and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                    UNION ALL
                  
                    SELECT
                    SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                    and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                    WHILE( @Start <= @End)
                    BEGIN
                            INSERT INTo #Temp
                            SELECT 0  as Count,@Start as [Year],'Favorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                                SELECT * FROM (SELECT
                                                Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as [Year], 'Favorable Outcome'   as Name
                                                from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                and  (CONVERT(VARCHAR, [Status])) IN (
                                                'Closed Finding Overturned','Closed No Finding'
                                                )
                                                and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))) C
                                                WHERE C.[Year]=@Start
                                        )
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Unfavorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                                                            from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Appeal Denied','Closed Finding Accepted'
                                                            ) and [Date NN Rec'd] IS NOT NULL
                                                            and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                                                ) C
                                                WHERE C.[Year]=@Start)
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Closed Audit Rescinded' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                                                            from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Audit Rescinded'
                                                            )
                                                            and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                                UNION ALL
                           
                            SELECT 0  as Count,@Start as [Year],'Total Recouped' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                                                            from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and CONVERT(VARCHAR, [Status]) IN  (
                                                                    'Closed Appeal Denied',
                                                                    'Closed Finding Accepted'
                                                            )
                                                            and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                    SET @Start =@Start +1
                    END
                    SELECT  Count, [Year], Name
                    FROM #Temp
                    ORDER BY [year] 
                    DROP TABLE  #Temp
                                `),

                    // Total year
                    await sql.query(`
                    SELECT * FROM NN where ID < 0                            
                    `)

                ])


                result.total = total[0]['count']
                result.openClosed = openClosed
                result.year = year
                result.totalyear = totalyear


                
            } else {
                let [{ recordset: total }, { recordset: openClosed }, { recordset: year }, { recordset: totalyear }] = await Promise.all([
                    //      Total
                    await sql.query(`
                                    SELECT COUNT(*) as count  from ${CERT_Model} where  ([Archive] = '0' or [Archive] IS NULL) and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy')
                                    `),

                    // Open/Closed
                    await sql.query(`
                                        SELECT COUNT(*)
                                        from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Open' and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy')
                                        Union All
                                        SELECT COUNT(*)
                                        from ${CERT_Model} where ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Closed' and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST('${date}' as date),'yyyy')
                                    `),

                    // year
                    await sql.query(`
                    DECLARE @Start VARCHAR(4)='${date}'
                    DECLARE @End VARCHAR(4)='${date}'
                                    
                    
                     DROP Table IF EXISTS #Temp
                    CREATE TABLE  #Temp
                    ( [Count]  INT,
                    [Year] VARCHAR(4),
                    [Name] VARCHAR(MAX)
                    )
                    INSERT INTO #Temp
                    SELECT
                    Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Favorable Outcome'   as Name
                    from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))--DATEPART(Year,[Date CERT Rec'd]
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                    from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date CERT Rec'd] IS NOT NULL
                    and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                    from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                    UNION ALL
                  
                    SELECT
                    SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                    from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                    and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                    WHILE( @Start <= @End)
                    BEGIN
                            INSERT INTo #Temp
                            SELECT 0  as Count,@Start as [Year],'Favorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                                SELECT * FROM (SELECT
                                                Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as [Year], 'Favorable Outcome'   as Name
                                                from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                and  (CONVERT(VARCHAR, [Status])) IN (
                                                'Closed Finding Overturned','Closed No Finding'
                                                )
                                                and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))) C
                                                WHERE C.[Year]=@Start
                                        )
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Unfavorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                                                            from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Appeal Denied','Closed Finding Accepted'
                                                            ) and [Date CERT Rec'd] IS NOT NULL
                                                            and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                                                ) C
                                                WHERE C.[Year]=@Start)
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Closed Audit Rescinded' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                                                            from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Audit Rescinded'
                                                            )
                                                            and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                              
                                UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Total Recouped' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                                                            from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and CONVERT(VARCHAR, [Status]) IN  (
                                                                    'Closed Appeal Denied',
                                                                    'Closed Finding Accepted'
                                                            )
                                                            and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                    SET @Start =@Start +1
                    END
                    SELECT  Count, [Year], Name
                    FROM #Temp
                    ORDER BY [year] 
                    DROP TABLE  #Temp
                                    `),

                    // Total year
                    await sql.query(`
                                    SELECT * FROM RAC where ID < 0                            
                    `)


                ])


                result.total = total[0]['count']
                result.openClosed = openClosed
                result.year = year
                result.totalyear = totalyear
            }


// Breakdown 
        } else {


            if (model == 'RAC') {



                let [{ recordset: total }, { recordset: openClosed }, { recordset: year }, { recordset: totalyear }] = await Promise.all([


                    await sql.query(`
                        SELECT COUNT(*) as count  from ${RAC_Model} where  ([Archive] = '0' or [Archive] IS NULL) 
                        `),

                    // Open/Closed
                    await sql.query(`
                            SELECT COUNT(*)
                            from ${RAC_Model} where   ([Archive] = '0' or [Archive] IS NULL)  and [Open/Closed] = 'Open'
                            Union All
                            SELECT COUNT(*)
                            from ${RAC_Model} where ([Archive] = '0' or [Archive] IS NULL) and [Open/Closed] = 'Closed'
                        `),

                    // year
                    await sql.query(`
                  
                    DECLARE @Start VARCHAR(4)='2021'
                    DECLARE @End VARCHAR(4)='2021'
    
     DROP Table IF EXISTS #Temp
                    CREATE TABLE  #Temp
    ( [Count]  INT,
    [Year] VARCHAR(4),
    [Name] VARCHAR(MAX)
    )
    INSERT INTO #Temp
    SELECT
    Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Favorable Outcome'   as Name
    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
    and  (CONVERT(VARCHAR, [Status])) IN (
    'Closed Finding Overturned','Closed No Finding'
    )
    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))--DATEPART(Year,[Date Rec'd]
    UNION ALL
    SELECT
    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
    and  (CONVERT(VARCHAR, [Status])) IN (
    'Closed Appeal Denied','Closed Finding Accepted'
    ) and [Date Rec'd] IS NOT NULL
    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
    UNION ALL
    SELECT
    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
    and  (CONVERT(VARCHAR, [Status])) IN (
    'Closed Audit Rescinded'
    )
    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
    UNION ALL
    SELECT
    SUM([Expected Amount]) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Total Appeals' as Name
    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
    UNION ALL
    SELECT
    SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
    from RAC where   ([Archive] = '0' or [Archive] IS NULL)
    and CONVERT(VARCHAR, [Status]) IN  (
            'Closed Appeal Denied',
            'Closed Finding Accepted'
    )
    Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
    WHILE( @Start <= @End)
    BEGIN
            INSERT INTo #Temp
            SELECT 0  as Count,@Start as [Year],'Favorable Outcome'   as Name
            WHERE NOT  EXISTS(
                                SELECT * FROM (SELECT
                                Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as [Year], 'Favorable Outcome'   as Name
                                from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                and  (CONVERT(VARCHAR, [Status])) IN (
                                'Closed Finding Overturned','Closed No Finding'
                                )
                                Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))) C
                                WHERE C.[Year]=@Start
                        )
            UNION ALL
            ----INSERT INTO #Temp
            SELECT 0  as Count,@Start as [Year],'Unfavorable Outcome'   as Name
            WHERE NOT  EXISTS(
                            SELECT * FROM (
                                            SELECT
                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                                            from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                            'Closed Appeal Denied','Closed Finding Accepted'
                                            ) and [Date Rec'd] IS NOT NULL
                                            Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                                ) C
                                WHERE C.[Year]=@Start)
            UNION ALL
            SELECT 0  as Count,@Start as [Year],'Closed Audit Rescinded' as Name
            WHERE NOT  EXISTS(
                            SELECT * FROM (		
                                            SELECT
                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                                            from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                            'Closed Audit Rescinded'
                                            )
                                            Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                                    ) C
                                WHERE C.[Year]=@Start)
                UNION ALL
            SELECT 0  as Count,@Start as [Year],'Total Appeals' as Name
            WHERE NOT  EXISTS(
                            SELECT * FROM (		
                                                SELECT
                                                SUM([Expected Amount]) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Total Appeals' as Name
                                                from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                                Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                                    ) C
                                WHERE C.[Year]=@Start)
                UNION ALL
            SELECT 0  as Count,@Start as [Year],'Total Recouped' as Name
            WHERE NOT  EXISTS(
                            SELECT * FROM (		
                                            SELECT
                                            SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                                            from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                                            and CONVERT(VARCHAR, [Status]) IN  (
                                                    'Closed Appeal Denied',
                                                    'Closed Finding Accepted'
                                            )
                                            Group BY  (Year(FORMAT(TRY_CAST([Date Rec'd] as date),'yyyy')))
                                    ) C
                                WHERE C.[Year]=@Start)
    SET @Start =@Start +1
    END
    SELECT  Count, [Year], Name
    FROM #Temp
    ORDER BY [year] 
    DROP TABLE  #Temp
                        `),

                    // Total Year
                    await sql.query(`
                         
                        SELECT
                        Count(*) as Count,   'Favorable Outcome'   as Name
                        from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                        and  (CONVERT(VARCHAR, [Status])) IN (
                        'Closed Finding Overturned','Closed No Finding'
                        )
                        UNION ALL
                        SELECT
                        Count(*) as Count,  'Unfavorable Outcome'   as Name
                        from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                        and  (CONVERT(VARCHAR, [Status])) IN (
                        'Closed Appeal Denied','Closed Finding Accepted'
                        ) and [Date Rec'd] IS NOT NULL

                        UNION ALL
                        SELECT
                        Count(*) as Count,  'Closed Audit Rescinded' as Name
                        from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                        and  (CONVERT(VARCHAR, [Status])) IN (
                        'Closed Audit Rescinded'
                        )

                        UNION ALL
                        SELECT
                        SUM([Expected Amount]) as Count,  'Total Appeals' as Name
                        from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                        UNION ALL
                        SELECT
                        SUM([Recouped Amount]) as Count,  'Total Recouped' as Name
                        from RAC where   ([Archive] = '0' or [Archive] IS NULL)
                        and CONVERT(VARCHAR, [Status]) IN  (
                                'Closed Appeal Denied',
                                'Closed Finding Accepted'
                        )

                    `)

                ])


                result.total = total[0]['count']
                result.openClosed = openClosed
                result.year = year
                result.totalyear = totalyear
            } else if (model == 'ADR') {
                let [{ recordset: total }, { recordset: openClosed }, { recordset: year }, { recordset: totalyear }] = await Promise.all([
                    await sql.query(`
                            SELECT COUNT(*) as count  from ${ADR_Model} where  ([Archive] = '0' or [Archive] IS NULL) 
                            `),

                    // Open/Closed
                    await sql.query(`
                                SELECT COUNT(*)
                                from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)  and [Open/Closed] = 'Open'
                                Union All
                                SELECT COUNT(*)
                                from ${ADR_Model} where ([Archive] = '0' or [Archive] IS NULL)  and [Open/Closed] = 'Closed'
                            `),

                    // year
                    await sql.query(`
                    DECLARE @Start VARCHAR(4)='2021'
                    DECLARE @End VARCHAR(4)='2021'
                                    
                    
                     DROP Table IF EXISTS #Temp
                    CREATE TABLE  #Temp
                    ( [Count]  INT,
                    [Year] VARCHAR(4),
                    [Name] VARCHAR(MAX)
                    )
                    INSERT INTO #Temp
                    SELECT
                    Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Favorable Outcome'   as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))--DATEPART(Year,[Date ADR Rec'd]
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'UnFavorable Outcome'   as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date ADR Rec'd] IS NOT NULL
                    --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    SUM([Expected Amount]) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Total Appeals' as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    SUM(CONVERT(FLOAT,[Denied Amount])) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Total Denied' as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                   -- and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                    WHILE( @Start <= @End)
                    BEGIN
                            INSERT INTo #Temp
                            SELECT 0  as Count,@Start as [Year],'Favorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                                SELECT * FROM (SELECT
                                                Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as [Year], 'Favorable Outcome'   as Name
                                                from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                and  (CONVERT(VARCHAR, [Status])) IN (
                                                'Closed Finding Overturned','Closed No Finding'
                                                )
                                               -- and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))) C
                                                WHERE C.[Year]=@Start
                                        )
                            UNION ALL
                            ----INSERT INTO #Temp
                            SELECT 0  as Count,@Start as [Year],'UnFavorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'UnFavorable Outcome'   as Name
                                                            from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Appeal Denied','Closed Finding Accepted'
                                                            ) and [Date ADR Rec'd] IS NOT NULL
                                                           -- and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                                                ) C
                                                WHERE C.[Year]=@Start)
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Closed Audit Rescinded' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                                                            from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Audit Rescinded'
                                                            )
                                                           -- and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                                UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Total Appeals' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                                SELECT
                                                                SUM([Expected Amount]) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Total Appeals' as Name
                                                                from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                               -- and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                                Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                                UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Total Denied' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            SUM(CONVERT(FLOAT,[Denied Amount])) as Count, (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy'))) as Year, 'Total Total Denied' as Name
                                                            from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                           
                                                            --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                    SET @Start =@Start +1
                    END
                    SELECT  Count, [Year], Name
                    FROM #Temp
                    ORDER BY [year] 
                    DROP TABLE  #Temp
                            `),

                    // Total Recinded
                    await sql.query(`
                    DECLARE @START VARCHAR(MAX) = 2021
                    SELECT
                    Count(*) as Count,   'Favorable Outcome'   as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    UNION ALL
                    SELECT
                    Count(*) as Count,  'Unfavorable Outcome'   as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date ADR Rec'd] IS NOT NULL
                    --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    
                    UNION ALL
                    SELECT
                    Count(*) as Count,  'Closed Audit Rescinded' as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    
                    UNION ALL
                    SELECT
                    SUM([Expected Amount]) as Count,  'Total Appeals' as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    UNION ALL
                    SELECT
                    SUM(CONVERT(FLOAT,[Denied Amount])) as Count,  'Total Denied' as Name
                    from ${ADR_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                    --and FORMAT(TRY_CAST([Date ADR Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy')
                        `)



                ])


                result.total = total[0]['count']
                result.openClosed = openClosed
                result.year = year
                result.totalyear = totalyear
            } else if (model == 'NN') {
                let [{ recordset: total }, { recordset: openClosed }, { recordset: year }, { recordset: totalyear }] = await Promise.all([

                    //      Total
                    await sql.query(`
                                SELECT COUNT(*) as count  from ${NN_Model} where  ([Archive] = '0' or [Archive] IS NULL)  
                                `),

                    // Open/Closed
                    await sql.query(`
                                    SELECT COUNT(*)
                                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)  and [Open/Closed] = 'Open'
                                    Union All
                                    SELECT COUNT(*)
                                    from ${NN_Model} where ([Archive] = '0' or [Archive] IS NULL)  and [Open/Closed] = 'Closed'
                                `),

                    // year
                    await sql.query(`
                    DECLARE @Start VARCHAR(4)='2021'
                    DECLARE @End VARCHAR(4)='2021'
                                    
                    
                     DROP Table IF EXISTS #Temp
                    CREATE TABLE  #Temp
                    ( [Count]  INT,
                    [Year] VARCHAR(4),
                    [Name] VARCHAR(MAX)
                    )
                    INSERT INTO #Temp
                    SELECT
                    Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Favorable Outcome'   as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))--DATEPART(Year,[Date NN Rec'd]
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date NN Rec'd] IS NOT NULL
                    --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                    UNION ALL
                  
                    SELECT
                    SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                    --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                    WHILE( @Start <= @End)
                    BEGIN
                            INSERT INTo #Temp
                            SELECT 0  as Count,@Start as [Year],'Favorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                                SELECT * FROM (SELECT
                                                Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as [Year], 'Favorable Outcome'   as Name
                                                from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                and  (CONVERT(VARCHAR, [Status])) IN (
                                                'Closed Finding Overturned','Closed No Finding'
                                                )
                                                --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))) C
                                                WHERE C.[Year]=@Start
                                        )
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Unfavorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                                                            from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Appeal Denied','Closed Finding Accepted'
                                                            ) and [Date NN Rec'd] IS NOT NULL
                                                            --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                                                ) C
                                                WHERE C.[Year]=@Start)
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Closed Audit Rescinded' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                                                            from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Audit Rescinded'
                                                            )
                                                            --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                                UNION ALL
                           
                            SELECT 0  as Count,@Start as [Year],'Total Recouped' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                                                            from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and CONVERT(VARCHAR, [Status]) IN  (
                                                                    'Closed Appeal Denied',
                                                                    'Closed Finding Accepted'
                                                            )
                                                            --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                    SET @Start =@Start +1
                    END
                    SELECT  Count, [Year], Name
                    FROM #Temp
                    ORDER BY [year] 
                    DROP TABLE  #Temp
                                `),

                    // Total Recinded
                    await sql.query(`
                    SELECT
                    Count(*) as Count,   'Favorable Outcome'   as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    UNION ALL
                    SELECT
                    Count(*) as Count,  'Unfavorable Outcome'   as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date NN Rec'd] IS NOT NULL
                    --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    
                    UNION ALL
                    SELECT
                    Count(*) as Count,  'Closed Audit Rescinded' as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    --and FORMAT(TRY_CAST([Date NN Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    
                    
                    UNION ALL
                    SELECT
                    SUM(CONVERT(FLOAT,[Recouped Amount])) as Count,  'Total Recouped Amount' as Name
                    from ${NN_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                            `)


                ])


                result.total = total[0]['count']
                result.openClosed = openClosed
                result.year = year
                result.totalyear = totalyear
            } else {
                let [{ recordset: total }, { recordset: openClosed }, { recordset: year }, { recordset: totalyear }] = await Promise.all([



                    //      Total
                    await sql.query(`
                                    SELECT COUNT(*) as count  from ${CERT_Model} where  ([Archive] = '0' or [Archive] IS NULL) 
                                    `),

                    // Open/Closed
                    await sql.query(`
                                        SELECT COUNT(*)
                                        from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)  and [Open/Closed] = 'Open'
                                        Union All
                                        SELECT COUNT(*)
                                        from ${CERT_Model} where ([Archive] = '0' or [Archive] IS NULL)  and [Open/Closed] = 'Closed'
                                    `),

                    // year
                    await sql.query(`
                    DECLARE @Start VARCHAR(4)='2021'
                    DECLARE @End VARCHAR(4)='2021'
                                    
                    
                     DROP Table IF EXISTS #Temp
                    CREATE TABLE  #Temp
                    ( [Count]  INT,
                    [Year] VARCHAR(4),
                    [Name] VARCHAR(MAX)
                    )
                    INSERT INTO #Temp
                    SELECT
                    Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Favorable Outcome'   as Name
                    from CERT where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    --and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =   FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))--DATEPART(Year,[Date CERT Rec'd]
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                    from CERT where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date CERT Rec'd] IS NOT NULL
                    --and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                    UNION ALL
                    SELECT
                    Count(*) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                    from CERT where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    --and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                    UNION ALL
                  
                    SELECT
                    SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                    from CERT where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                    --and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                    Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                    WHILE( @Start <= @End)
                    BEGIN
                            INSERT INTo #Temp
                            SELECT 0  as Count,@Start as [Year],'Favorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                                SELECT * FROM (SELECT
                                                Count(*) as Count,  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as [Year], 'Favorable Outcome'   as Name
                                                from CERT where   ([Archive] = '0' or [Archive] IS NULL)
                                                and  (CONVERT(VARCHAR, [Status])) IN (
                                                'Closed Finding Overturned','Closed No Finding'
                                                )
                                                --and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))) C
                                                WHERE C.[Year]=@Start
                                        )
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Unfavorable Outcome'   as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Unfavorable Outcome'   as Name
                                                            from CERT where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Appeal Denied','Closed Finding Accepted'
                                                            ) and [Date CERT Rec'd] IS NOT NULL
                                                            --and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                                                ) C
                                                WHERE C.[Year]=@Start)
                            UNION ALL
                            SELECT 0  as Count,@Start as [Year],'Closed Audit Rescinded' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            Count(*) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Closed Audit Rescinded' as Name
                                                            from CERT where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and  (CONVERT(VARCHAR, [Status])) IN (
                                                            'Closed Audit Rescinded'
                                                            )
                                                            --and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                                UNION ALL
                           
                            SELECT 0  as Count,@Start as [Year],'Total Recouped' as Name
                            WHERE NOT  EXISTS(
                                            SELECT * FROM (		
                                                            SELECT
                                                            SUM([Recouped Amount]) as Count, (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy'))) as Year, 'Total Recouped' as Name
                                                            from CERT where   ([Archive] = '0' or [Archive] IS NULL)
                                                            and CONVERT(VARCHAR, [Status]) IN  (
                                                                    'Closed Appeal Denied',
                                                                    'Closed Finding Accepted'
                                                            )
                                                            --and FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy') =    FORMAT(TRY_CAST(@Start as date),'yyyy') 
                                                            Group BY  (Year(FORMAT(TRY_CAST([Date CERT Rec'd] as date),'yyyy')))
                                                    ) C
                                                WHERE C.[Year]=@Start)
                    SET @Start =@Start +1
                    END
                    SELECT  Count, [Year], Name
                    FROM #Temp
                    ORDER BY [year] 
                    DROP TABLE  #Temp
                                    `),

                    // Total Recinded
                    await sql.query(`
                    DECLARE @START VARCHAR(MAX) = 2021
                    SELECT
                    Count(*) as Count,   'Favorable Outcome'   as Name
                    from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Finding Overturned','Closed No Finding'
                    )
                    UNION ALL
                    SELECT
                    Count(*) as Count,  'Unfavorable Outcome'   as Name
                    from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Appeal Denied','Closed Finding Accepted'
                    ) and [Date CERT Rec'd] IS NOT NULL
                    
                    UNION ALL
                    SELECT
                    Count(*) as Count,  'Closed Audit Rescinded' as Name
                    from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and  (CONVERT(VARCHAR, [Status])) IN (
                    'Closed Audit Rescinded'
                    )
                    
                    
                    UNION ALL
                    SELECT
                    SUM(CONVERT(FLOAT,[Recouped Amount])) as Count,  'Total Recouped Amount' as Name
                    from ${CERT_Model} where   ([Archive] = '0' or [Archive] IS NULL)
                    and CONVERT(VARCHAR, [Status]) IN  (
                            'Closed Appeal Denied',
                            'Closed Finding Accepted'
                    )
                                `)



                ])


                result.total = total[0]['count']
                result.openClosed = openClosed
                result.year = year
                result.totalyear = totalyear
            }
        }




        let obj = {
            open: result.openClosed[0][""],
            closed: result.openClosed[1][""],
            total: result.total,
            totalyear: await getFormattedData(result.totalyear, result),
            year: await getFormattedData(result.year, result) 

        }





        return res.status(200).json({
            success: true,
            result: obj,
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



