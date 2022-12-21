const { getDateTime, UpdateDaysTillDueDate,formatDate, getObject } = require('./utilController')
const sql = require('mssql')
const nodemailer = require('nodemailer')
const RAC_Model = 'RAC'
const NN_Model = 'NN'
const ADR_Model = 'ADR'
const CERT_Model = 'CERT'

const endpoints = {}

const mailer = (to, cc, subject, html) => {

    var transporter = nodemailer.createTransport(({
        host: 'smtp-mailrelay.coh.org',
        port: 25, // have tried 465
        requireTLS: true  
      }));

      var mailOptions = {
        from: process.env.SENDER_MAIL,
        to: to,
        cc: cc,
        subject: subject,
        html: html
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      
}

endpoints.mailer = mailer
module.exports = mailer

setInterval(async () => {

    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())
    const minutes = (new Date(date).getMinutes())

    
    if (hours == 08 && minutes == 5) {

    const {recordset: rac} = await sql.query(`SELECT *  from ${RAC_Model} where [Days till Due Date] = 7`)
    const {recordset: adr} = await sql.query(`SELECT *  from ${ADR_Model} where [Days till Due Date] = 7`)
    const {recordset: nn} = await sql.query(`SELECT *  from ${NN_Model} where [Days till Due Date] = 7`)
    const {recordset: cert} = await sql.query(`SELECT *  from ${CERT_Model} where [Days till Due Date] = 7`)


    let text =   `
    <h3>Greetings!</h3>
    <p>An update occurred- it's 7 days till due date.
    Please click on the link below to look up the necessary records.</p>

        
    `

    if (rac.length >0) {

        let t = ''
        let unique = []
        rac.map((r) => {
           let i =  unique.findIndex((u) =>  u['Internal Number'] == r['Internal Number'])
           if (i == -1) {
            unique.push({'Internal Number': r["Internal Number"]})
           }
        })

        unique.map((u) => {
            t += `<p> Internal Number: ${u['Internal Number']} </p>`
        })


        text += `


            <div>
                <a href="https://10.30.142.17:8004/rac">https://10.30.142.17:8004/rac</a>
            </div>

            ${t}
           
        `
    }

    if (rac.length > 0) {
        mailer(
            ['mjones@coh.org', 'joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '7 Days till Due Date!',
            text
        )
    }

    if (adr.length >0) {


        let t = ''
        let unique = []
        adr.map((r) => {
           let i =  unique.findIndex((u) =>  u['Internal Number'] == r['Internal Number'])
           if (i == -1) {
            unique.push({'Internal Number': r["Internal Number"]})
           }
        })

        unique.map((u) => {
            t += `<p> Internal Number: ${u['Internal Number']} </p>`
        })


        text += `
            <div>
                <a href="https://10.30.142.17:8004/adr">https://10.30.142.17:8004/adr</a>
            </div>

            ${t}
        `
    }

    if (adr.length > 0 ) {
        mailer(
            ['mjones@coh.org', 'joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '7 Days till Due Date!',
            text
        )
    }

    if (nn.length >0) {

        let t = ''
        let unique = []
        nn.map((r) => {
           let i =  unique.findIndex((u) =>  u['Internal Number'] == r['Internal Number'])
           if (i == -1) {
            unique.push({'Internal Number': r["Internal Number"]})
           }
        })

        unique.map((u) => {
            t += `<p> Internal Number: ${u['Internal Number']} </p>`
        })

        text += `
            <div>
                <a href="https://10.30.142.17:8004/nn">https://10.30.142.17:8004/nn</a>
            </div>
            
            ${t}
        `
    }

     if (nn.length > 0 ) {
        mailer(
            ['mjones@coh.org', 'joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '7 Days till Due Date!',
            text
        )
    }

    if (cert.length >0) {
        let t = ''
        let unique = []
        cert.map((r) => {
           let i =  unique.findIndex((u) =>  u['Internal Tracking No.'] == r['Internal Tracking No.'])
           if (i == -1) {
            unique.push({'Internal Tracking No.': r["Internal Tracking No."]})
           }
        })

        unique.map((u) => {
            t += `<p> Internal Tracking No.: ${u['Internal Tracking No.']} </p>`
        })

        text += `
            <div>
                <a href="https://10.30.142.17:8004/cert">https://10.30.142.17:8004/cert</a>
            </div>

            ${t}
        `

        
    }

    if (cert.length > 0) {
        mailer(
            ['mjones@coh.org', 'joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '7 Days till Due Date!',
            text
        )
    }




    const {recordset: rac120} = await sql.query(`SELECT *  from ${RAC_Model} where [Notifications] = 106`)
    const {recordset: adr120} = await sql.query(`SELECT *  from ${ADR_Model} where [Notifications] = 106`)
    const {recordset: nn120} = await sql.query(`SELECT *  from ${NN_Model} where [Notifications] = 106`)
    const {recordset: cert120} = await sql.query(`SELECT *  from ${CERT_Model} where [Notifications] = 106`)


    let text1 =   `
    <h3>Greetings!</h3>
    <p>An update occurred- it's 120 days Appeals Due Date.
    Please click on the link below to look up the necessary records.</p>

        
    `

    if (rac120.length >0) {

        let t = ''
        let unique = []
        rac120.map((r) => {
           let i =  unique.findIndex((u) =>  u['Internal Number'] == r['Internal Number'])
           if (i == -1) {
            unique.push({'Internal Number': r["Internal Number"]})
           }
        })

        unique.map((u) => {
            t += `<p> Internal Number: ${u['Internal Number']} </p>`
        })


        text1 += `


            <div>
                <a href="https://10.30.142.17:8004/rac">https://10.30.142.17:8004/rac</a>
            </div>

            ${t}
           
        `
    }


    if (rac120.length > 0 ) {
        mailer(
            ['mjones@coh.org', 'joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '14 Days Appeals Due Date!',
            text1
        )
    }

    if (adr120.length >0) {


        let t = ''
        let unique = []
        adr120.map((r) => {
           let i =  unique.findIndex((u) =>  u['Internal Number'] == r['Internal Number'])
           if (i == -1) {
            unique.push({'Internal Number': r["Internal Number"]})
           }
        })

        unique.map((u) => {
            t += `<p> Internal Number: ${u['Internal Number']} </p>`
        })


        text1 += `
            <div>
                <a href="https://10.30.142.17:8004/adr">https://10.30.142.17:8004/adr</a>
            </div>

            ${t}
        `
    }

    if ( adr120.length > 0) {
        mailer(
            ['mjones@coh.org', 'joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '14 Days Appeals Due Date!',
            text1
        )
    }

    if (nn120.length >0) {

        let t = ''
        let unique = []
        nn120.map((r) => {
           let i =  unique.findIndex((u) =>  u['Internal Number'] == r['Internal Number'])
           if (i == -1) {
            unique.push({'Internal Number': r["Internal Number"]})
           }
        })

        unique.map((u) => {
            t += `<p> Internal Number: ${u['Internal Number']} </p>`
        })

        text1 += `
            <div>
                <a href="https://10.30.142.17:8004/nn">https://10.30.142.17:8004/nn</a>
            </div>
            
            ${t}
        `
    }

    if ( nn120.length > 0 ) {
        mailer(
            ['mjones@coh.org', 'joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '14 Days Appeals Due Date!',
            text1
        )
    }

    if (cert120.length >0) {
        let t = ''
        let unique = []
        cert120.map((r) => {
           let i =  unique.findIndex((u) =>  u['Internal Tracking No.'] == r['Internal Tracking No.'])
           if (i == -1) {
            unique.push({'Internal Tracking No.': r["Internal Tracking No."]})
           }
        })

        unique.map((u) => {
            t += `<p> Internal Tracking No.: ${u['Internal Tracking No.']} </p>`
        })

        text1 += `
            <div>
                <a href="https://10.30.142.17:8004/cert">https://10.30.142.17:8004/cert</a>
            </div>

            ${t}
        `

        
    }

    if ( cert120.length > 0) {
        mailer(
            ['mjones@coh.org', 'joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '14 Days Appeals Due Date!',
            text1
        )
    }


    let {recordset: rac30} = await sql.query(`SELECT * from RAC Where CONVERT(VARCHAR(MAX),[Status]) = 'Records Submitted' and FORMAT(TRY_CAST([Date ADR Submitted to CMS] as date),'yyyy-MM-dd')= CAST(DATEADD(day,-14,GETDATE()) as DATE) `)

    if (rac30.length > 0) {
        mailer(
            ['joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '30 Days since Records Submitted in RAC',
            `
           <h3> Greetings Joan!</h3>
            <p>Please follow up- it’s been 30 Days since records were submitted in RAC. <br>
            Please click on the link below to look up the necessary records. <br>
            https://10.30.142.17:8004/rac <br>
            Thank you, <br>
            Automation Services</p>
            `
        )
    }
    

    let {recordset: adr30} = await sql.query(`SELECT * from ADR Where CONVERT(VARCHAR(MAX),[Status]) = 'Records Submitted' and FORMAT(TRY_CAST([Date ADR Submitted to Noridian] as date),'yyyy-MM-dd')= CAST(DATEADD(day,-14,GETDATE()) as DATE) `)

    if (adr30.length > 0) {
        mailer(
            ['mjones@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '30 Days since Records Submitted in ADR',
            `
           <h3> Greetings Michelle!</h3>
            <p>Please follow up- it’s been 30 Days since records were submitted in ADR. <br>
            Please click on the link below to look up the necessary records. <br>
            https://10.30.142.17:8004/adr <br>
            Thank you, <br>
            Automation Services</p>
            `
        )
    }


    let {recordset: rac5} = await sql.query(`SELECT * from RAC Where  FORMAT(TRY_CAST([RAC Due Date] as date),'yyyy-MM-dd')= CAST(DATEADD(day,4,GETDATE()) as DATE)  `)

    if (rac5.length > 0) {
        mailer(
            ['joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '5 Days till RAC Due Date',
            `
           <h2> Greetings Michelle!</h2>
            <p>Please follow up- it’s been 30 Days since records were submitted in RAC. <br>
            Please click on the link below to look up the necessary records. <br>

            ${rac5[0] ?  `Internal Number: ` + rac5[0]['Internal Number'] +  `<br>` : null} 

            https://10.30.142.17:8004/rac <br>
            Thank you, <br>
            Automation Services</p>
            `
        )
    }

    let {recordset: adr10} = await sql.query(`SELECT * from ADR Where  FORMAT(TRY_CAST([ADR Due Date] as date),'yyyy-MM-dd')= CAST(DATEADD(day,9,GETDATE()) as DATE) `)

    if (adr10.length > 0) {
        mailer(
            ['mjones@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '10 Days till ADR Due Date',
            `
           <h3> Greetings Michelle!</h3>
            <p>Please follow up- it’s been 10 Days till ADR Due Date in ADR.<br>
            Please click on the link below to look up the necessary records. <br>

            ${adr10[0] ? `Internal Number: ` + adr10[0]['Internal Number'] +  `<br>` : null} 
             
            https://10.30.142.17:8004/adr <br>
            Thank you, <br>
            Automation Services</p>
            `
        )
    }

    

    let {recordset: racA30} = await sql.query(`SELECT * from RAC Where  CONVERT(VARCHAR(MAX),[Status]) = 'Appeal Submitted' and FORMAT(TRY_CAST([Date ADR Submitted to CMS] as date),'yyyy-MM-dd') = CAST(DATEADD(day,-30,GETDATE()) as DATE)`)

    if (racA30.length > 0) {
        mailer(
            ['joawilliams@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '30 Days since Appeal Submitted in RAC',
            `
           <h3>Greetings Joan!</h3>
            <p>Please follow up- it’s been 30 Days since appeal was submitted in RAC. <br>
            Please click on the link below to look up the necessary records. <br>
            https://10.30.142.17:8004/rac <br>
            Thank you, <br>
            Automation Services</p>
            `
        )
    }


    let {recordset: adrA30} = await sql.query(`SELECT * from ADR Where  CONVERT(VARCHAR(MAX),[Status]) = 'Appeal Submitted'  and FORMAT(TRY_CAST([Date ADR Submitted to Noridian] as date),'yyyy-MM-dd') = CAST(DATEADD(day,-30,GETDATE()) as DATE) `)

    if (adrA30.length > 0) {
        mailer(
            ['mjones@coh.org'],
            // ['rgouri@coh.org'],
            [],
            '30 Days since Appeal Submitted in ADR',
            `
           <h3>Greetings Michelle!</h3>
            <p>Please follow up- it’s been 30 Days since appeal was submitted in ADR. <br>
            Please click on the link below to look up the necessary records. <br>
            https://10.30.142.17:8004/adr <br>
            Thank you, <br>
            Automation Services</p>
            `
        )
    }
}
        
   
}, 50000)

