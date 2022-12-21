var sql = require("mssql");
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat'];

const DailyCheckmarkModal = "DailyCheckmark"
const LoggerModel = 'IncomingWQLogger'

// var date = new Date();
// date.setDate(date.getDate('2021-12-06') - 1);
// console.log(date)

exports.GetSortOrder = (prop) => {    
  return function(a, b) {    
      if (a[prop] > b[prop]) {    
          return 1;    
      } else if (a[prop] < b[prop]) {    
          return -1;    
      }    
      return 0;    
  }    
}

exports.getDateTime = () => {
  
    var date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    var hours = (new Date(date).getHours())
    var minutes = (new Date(date).getMinutes())
    var seconds = (new Date(date).getSeconds())
    var offset = (new Date(date).getTimezoneOffset())

    var year = (new Date(date).getFullYear())
    var month = (new Date(date).getMonth())
    var currentDate = (new Date(date).getDate())

    var fullDate = year

    if (month < 9) {
      month = ('0' + (month + 1))
      fullDate += "-" + month

    } else {
      month = (month + 1)
      fullDate += "-" + month
    }

    if (hours < 10) {
      hours = ('0' + hours.toString() )
    } else {
      hours = (hours)
    }

    if (minutes < 10) {
      minutes = ('0' + minutes)
    } else {
      minutes = (minutes )
    }

    if (seconds < 10) {
      seconds = ('0' + seconds)
    } else {
      seconds = (seconds )
    }


    if (currentDate < 10) {
      currentDate = ('-0' + currentDate)
      fullDate += currentDate
    } else {
      currentDate = ('-' + currentDate)
      fullDate += currentDate
    }


    return (fullDate+ "T"+ hours + ":" + minutes + ":" + seconds  + "." + offset + "Z" )

}


exports.fitToColumn = (columnObject) => {

  let obj = []
 
  columns  = Object.keys(columnObject)
  for (let i in columns) {      
      obj.push({width: columns[i].length + 5})
  }

  return obj
}  


exports.getObject = (columns) => {

 return  columns.map ((c) => {
      c['ActionTimeStamp'] =  ( c['ActionTimeStamp'] ? new Date(c['ActionTimeStamp'] ).toISOString().split('.')[0].split('T').join(' ').substring(0,19) : '')
      c['Days till Due Date'] = (c['Days till Due Date'] < 0 ? '' : c['Days till Due Date'])
      c['Recouped Amount'] =  c['Recouped Amount'] ? '$ ' +   c['Recouped Amount'] :  ''
      c['Paid Amount'] =  c['Paid Amount'] ? '$ ' +  c['Recouped Amount'] : ''
      c['CPT Charge Amount'] =  c['CPT Charge Amount'] ? '$ ' + c['CPT Charge Amount'] : ''
      c['Total Charges'] =  c['Total Charges'] ? '$ ' + c['Total Charges'] : ''
      c['Denied Amount'] = c['Denied Amount'] ? '$ ' + c['Denied Amount'] : ''

      return c
  })
}


exports.formatter = (date) => {

  let [yy, mm, dd] = date.split('_')

  return mm + "_" + dd.split('T')[0] + "_" + yy
}
    
exports.checkmark =  async (Model, EMPID, cb) =>  {
  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())
    const minutes = (new Date(date).getMinutes())

    if (hours == 23 && minutes == 50) {
      let { recordset: arr } = await sql.query(
        `select * from ${Model} where EMPID = ${EMPID}`
      );

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].Total < 4) {

          let sum = (arr[i]['Mon'] ? arr[i]['Mon'] : 0) + (arr[i]['Tue'] ? arr[i]['Tue'] : 0) + (arr[i]['Wed'] ? arr[i]['Wed'] : 0) + (arr[i]['Thu'] ? arr[i]['Thu'] : 0) + (arr[i]['Fri'] ? arr[i]['Fri'] : 0) + (arr[i]['Sat'] ? arr[i]['Sat'] : 0) + (arr[i]['Sun'] ? arr[i]['Sun'] : 0);
          let updateQuery = `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week${(arr[i].Total == null || arr[i].Total == 0) ? 1 : arr[i].Total + 1}=${sum >= 5 ? 1 : 0}, Total=${((arr[i].Total == null || arr[i].Total == 0) ? 1 : arr[i].Total + 1)} where ID = ${arr[i].ID}`
          await sql.query(updateQuery);
        }

        if (arr[i].Total + 1 >= 4) {

          let { recordset: arr1 } = await sql.query(
            `select * from ${Model} where EMPID = ${EMPID}`
          );
    
          let sum = (arr1[i]['Week1'] ? arr1[i]['Week1'] : 0) + (arr1[i]['Week2'] ? arr1[i]['Week2'] : 0) + (arr1[i]['Week3'] ? arr1[i]['Week3'] : 0) + (arr1[i]['Week4'] ? arr1[i]['Week4'] : 0);
          let badge = 0
          if (sum == 4) {
            badge = 1
          }
          await sql.query(
            `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week1 = 0 , Week2= 0 , Week3 = 0, Week4 = 0, Total=0, Badge=${badge}  where ID = ${arr1[i].ID}`
          );
        }

      }
      cb(true)
    }
}



exports.UpdateDaysTillDueDate = async () => {
  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const day = (new Date(date).getDay())
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if (hours == 00 && minutes == 05) {
  
    await sql.query(`


    

    update t
		set [Days till Due Date] = 
		CASE WHEN CONVERT(NVARCHAR(MAX), t.[Status]) = 'Appeal in Progress' AND  t.[Appeals Due Date] IS NOT NULL
		Then  DATEDIFF(day, CURRENT_TIMESTAMP , t.[Appeals Due Date])
		WHEN CONVERT(NVARCHAR(MAX), t.[Status]) = 'Appeal in Progress' AND t.[Appeals Due Date] IS NULL
		Then  NULL
		Else DATEDIFF(day, CURRENT_TIMESTAMP, t.[NN Due Date])
		END
    from [HIMSDS].[dbo].[NN] t


    update t
    set [Days till Due Date] = DATEDIFF(day, CURRENT_TIMESTAMP, t.[CERT Due Date]) 
    from [HIMSDS].[dbo].[CERT] t 

    update t
		set [Days till Due Date] = 
		CASE WHEN CONVERT(NVARCHAR(MAX), t.[Status]) = 'Appeal in Progress' AND  t.[Appeals Due Date] IS NOT NULL
		Then  DATEDIFF(day, CURRENT_TIMESTAMP , t.[Appeals Due Date])
		WHEN CONVERT(NVARCHAR(MAX), t.[Status]) = 'Appeal in Progress' AND t.[Appeals Due Date] IS NULL
		Then  NULL
		Else DATEDIFF(day, CURRENT_TIMESTAMP, t.[RAC Due Date])
		END
    from [HIMSDS].[dbo].[RAC] t

    update t
    set [Days till Due Date] = DATEDIFF(day, CURRENT_TIMESTAMP, t.[ADR Due Date]) 
    from [HIMSDS].[dbo].[ADR] t 
    
    
    Update t1 set Notifications =  DATEDIFF(DAY, [ADR Due Date], CAST(GETDATE() as Date)) from ADR t1

    Update t2 set Notifications =  DATEDIFF(DAY, [Appeals Due Date], CAST(GETDATE() as Date)) from NN t2

    Update t3 set Notifications =  DATEDIFF(DAY, [Appeals Due Date], CAST(GETDATE() as Date)) from RAC t3

    Update t4 set Notifications =  DATEDIFF(DAY, [CERT Due Date], CAST(GETDATE() as Date)) from CERT t4


    `)
  }
}


exports.formatDate = async (date, cb) => {
  if (date) {

    if (date.includes('-')) {
      return date
    } else  if (date.includes('/')){
      let [month, d, year] = date.split('/')
      
      return cb(year.toString().trim()+ "-" + month.toString().trim() + "-" + d.toString().trim())
    } else {
      return null
    }
     
  } 
  return cb(null)
}

exports.checkmark1 =  async (Model) =>  {

    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const day = (new Date(date).getDay())
    const hours = (new Date(date).getHours())
    const minutes = (new Date(date).getMinutes())

    if (day == 5 && hours == 23 && minutes == 58) {

      const { recordset : result} = await sql.query(
        `select * from ${userModel} where ManagementAccess != 1`
      );

      result.map(async (user) => {

      let EMPID = user.EMPID;
      let { recordset: arr } = await sql.query(
        `select * from ${Model} where EMPID = ${EMPID}`
      );

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].Total < 4) {
          
          let sum = (arr[i]['Mon'] ? arr[i]['Mon'] : 0) + (arr[i]['Tue'] ? arr[i]['Tue'] : 0) + (arr[i]['Wed'] ? arr[i]['Wed'] : 0) + (arr[i]['Thu'] ? arr[i]['Thu'] : 0) + (arr[i]['Fri'] ? arr[i]['Fri'] : 0) + (arr[i]['Sat'] ? arr[i]['Sat'] : 0) + (arr[i]['Sun'] ? arr[i]['Sun'] : 0);
          if(sum > 0) {
            let updateQuery = `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week${(arr[i].Total == null || arr[i].Total == 0) ? 1 : arr[i].Total + 1}=${sum >= 5 ? 1 : 0}, Total=${((arr[i].Total == null || arr[i].Total == 0) ? 1 : arr[i].Total + 1)} where ID = ${arr[i].ID}`
            await sql.query(updateQuery);
          }
          
        }

        if (arr[i].Total + 1 == 4) {
          let { recordset: arr1 } = await sql.query(
            `select * from ${Model} where EMPID = ${EMPID}`
          );
    
          let sum = (arr1[i]['Week1'] ? arr1[i]['Week1'] : 0) + (arr1[i]['Week2'] ? arr1[i]['Week2'] : 0) + (arr1[i]['Week3'] ? arr1[i]['Week3'] : 0) + (arr1[i]['Week4'] ? arr1[i]['Week4'] : 0);
          let badge = 0
          if (sum == 4) {
            badge = 1
          }
          await sql.query(
            `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week1 = 0 , Week2= 0 , Week3 = 0, Week4 = 0, Total=0, Badge=${badge}  where ID = ${arr1[i].ID}`
          );
        }
      }
      })
    }
}


exports.BadgeDisappearAfter48Hours = async (Model, cb) => {
  // badge disappers code
  var date1 = new Date();
  var utcDate1 = new Date(date1.toUTCString());
  utcDate1.setHours(utcDate1.getHours() - 7);
  var usDate = new Date(utcDate1)

  const { recordset: arr } = await sql.query(
    `select * from ${Model}`
  );


  for (let i = 0; i < arr.length; i++) {
    if ((usDate - arr[i].ActionTimeStamp) > 0) {
      await sql.query(
        `update ${Model} set AdminAssignedBadge = ${null}, ActionTimeStamp = ${null} where ID = ${arr[i].ID}`
      );
    }
  }
}

exports.ResetDays = async (userModel, Model) => {
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())
    const minutes = (new Date(date).getMinutes())
    const day = (new Date(date).getDay())
    const year = (new Date(date).getFullYear())

    if (day == 5 && hours == 23 && minutes == 55) {

      const { recordset: user } = await sql.query(
        `select * from ${userModel}`
      );

      user.map(async (u) => {
        const { recordset } = await sql.query(
          `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0 where EMPID = ${u.EMPID}`
        );
      })
    }
}

exports.Absent = async (calendarModel , userModel, Model, cb) => {
 
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())
    const minutes = (new Date(date).getMinutes())
    const day = (new Date(date).getDay())
    const year = (new Date(date).getFullYear())
    var month = (new Date(date).getMonth())
    var currentDate = (new Date(date).getDate())

    var fullDate = year

    if (month < 9) {
      month = ('0' + month + 1)
    } else {
      month = (month + 1)
      fullDate += "-" + month
    }

    if (currentDate < 10) {
      currentDate = ('-0' + currentDate)
      fullDate += currentDate
    } else {
      currentDate = ('-' + currentDate)
      fullDate += currentDate
    }

    if (hours == 23 && minutes == 50) {
      const { recordset: result } = await sql.query(
        `SELECT * FROM  ${calendarModel} WHERE month(WhenPosted) = ${month} and year(WhenPosted)= ${year}`
      );

      let getTodayResults = (result.filter(res => res['WhenPosted'].toISOString().split("T")[0] == fullDate));

      getTodayResults.map(async (res) => {
        const { recordset: user } = await sql.query(
          `select * from ${userModel}  where EMPID = '${res.LoginNumber}'`
        );

        if (user[0]) {

        const EMPID = (user[0].EMPID)

        let firstDay = user[0].StartDay;
        let lastDay = (days[days.indexOf(firstDay) + 4])

        let workingDays = days.slice(days.indexOf(firstDay), days.indexOf(firstDay) + 5)

        if (workingDays.indexOf(days[day]) < 0) {
          return
        }

        await sql.query(
          `update ${Model} set ${days[day]} = 1  where EMPID = ${EMPID}`
        );

        if (days[day] == lastDay) {
          cb(EMPID)
        }
      }

      })
    }
}

exports.UpdateHoursData = async (progressModel, userModel, Model, LoggerModel) => {


  
  const update =  async () => {
    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementAccess != 1 and SubSection IN ('DS', 'DSB')`
    );
    
   
    
    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) -1);
    date1 = date1.toISOString().split('T')[0]
    
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())


    recordset.map(async (u) => {
     
      var [{ recordset: chargesProcessedCount }, { recordset: chargesLeftCount },{recordset: totalProcess }] = await Promise.all([
        (
        
          await sql.query(`SELECT COUNT(DISTINCT(Filename)) as count from  ${LoggerModel} where EMPID = '${u.EMPID}'  `)
        ),
        await sql.query(`Select count(*) as count from ${Model} where [StartTimeStamp] IS  NULL and [FinishTimeStamp] IS NULL `),
        (
       
          await sql.query(`SELECT COUNT(DISTINCT(Filename)) as count from  ${LoggerModel} where EMPID = '${u.EMPID}' and   DateTime >'${this.getDateTime().split('T')[0]}' `)
        )
    ])

    let data = {
        chargesProcessedCount,
        chargesLeftCount,
        totalCharges: ((chargesLeftCount[0]['count'] ? chargesLeftCount[0]['count'] : 0) +(chargesProcessedCount[0]['count'] ? chargesProcessedCount[0]['count'] : 0) ) ,
        totalProcess
    }
   
      chargesLeftCount = chargesLeftCount[0]['count'] ? chargesLeftCount[0]['count'] : 0
      chargesProcessedCount = chargesProcessedCount[0]['count'] ?chargesProcessedCount[0]['count'] : 0
      totalProcess = totalProcess[0]['count'] ? totalProcess[0]['count'] : 0 
      let totalCharges = data.totalCharges
      let dP = (chargesProcessedCount) / totalCharges;
      let pP = (chargesLeftCount )/ totalCharges;

      await sql.query(
        `update ${progressModel} set ChargesProcessed = ${(dP * 100).toFixed(2)}, ChargesToReview = ${(dP * 100).toFixed(2)} , [Fax Processed] = '${totalProcess}'    where EMPID = ${u.EMPID}`
      );

    })
  }

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const minutes = (new Date(date).getMinutes())
  if( minutes % 10 == 0  ) {
    update()
  }

  
}


exports.addDataToKPIs = async (userModel, progressModel) => {

 

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if(hours == 23 && minutes == 50) {
    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementAccess != 1  and SubSection = 'DS' and EMPL_STATUS NOT IN ('T' , 'Archive')`
    );
  
    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) - 1);

    let day = date1.getDay()
    date1 = date1.toISOString().split('T')[0]
      
    recordset.map(async (u) => {
  
      let workingDays = days.slice(days.indexOf(u.StartDay), days.indexOf(u.StartDay) + 5)
  
      // console.log(u)
      if (workingDays.indexOf(days[day]) < 0) {
        return 
      }

      const [{recordset: wq1}]= await Promise.all([
        await sql.query(`Select [Fax Processed], EMPID from ${progressModel} where EMPID = ${u.EMPID}` ),
      ])
  

      if(wq1.length>0 ) {
        let wq1Data = wq1[0]['Fax Processed'] ? wq1[0]['Fax Processed'] : 0
  

       let {recordset: entry } =  await sql.query(`Select EMPID from TotalKPIs where EMPID = ${u.EMPID} and ActionTimeStamp In ('${date1}')` )
        if(entry.length > 0) {
          return 
        }

        await sql.query(`Insert into TotalKPIs (EMPID, [User],  [Fax Processed], ActionTimeStamp) values 
        (
          '${u.EMPID}',
          '${u.Nickname}',
          '${wq1Data}',
          '${date1}'  
        )`)
  
      }
    })
  }

}




exports.UpdateDailyData = async (progressModel, userModel, wqModel) => {

  const update =  async () => {
    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementAccess != 1 and SubSection IN ('DS', 'DSB')`
    );
    
   
    
    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) -1);
    date1 = date1.toISOString().split('T')[0]
    
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())


    recordset.map(async (u) => {
     
      var [{ recordset: chargesProcessedCount }, { recordset: chargesLeftCount },{recordset: totalProcess }] = await Promise.all([
        (
        
          await sql.query(`SELECT COUNT(DISTINCT(Filename)) as count from  ${LoggerModel} where EMPID = '${u.EMPID}'  `)
        ),
        await sql.query(`Select count(*) as count from ${Model} where [StartTimeStamp] IS  NULL and [FinishTimeStamp] IS NULL `),
        (
       
          await sql.query(`SELECT COUNT(DISTINCT(Filename)) as count from  ${LoggerModel} where EMPID = '${u.EMPID}' and   DateTime >'${this.getDateTime().split('T')[0]}' `)
        )
    ])

    let data = {
        chargesProcessedCount,
        chargesLeftCount,
        totalCharges: ((chargesLeftCount[0]['count'] ? chargesLeftCount[0]['count'] : 0) +(chargesProcessedCount[0]['count'] ? chargesProcessedCount[0]['count'] : 0) ) ,
        totalProcess
    }
   
      chargesLeftCount = chargesLeftCount[0]['count'] ? chargesLeftCount[0]['count'] : 0
      chargesProcessedCount = chargesProcessedCount[0]['count'] ?chargesProcessedCount[0]['count'] : 0
      totalProcess = totalProcess[0]['count'] ? totalProcess[0]['count'] : 0 
      let totalCharges = data.totalCharges
      let dP = (chargesProcessedCount) / totalCharges;
      let pP = (chargesLeftCount )/ totalCharges;

      await sql.query(
        `update ${progressModel} set ChargesProcessed = ${(dP * 100).toFixed(2)}, ChargesToReview = ${(dP * 100).toFixed(2)} , [Fax Processed] = null    where EMPID = ${u.EMPID}`
      );

    })
  }

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if(hours == 00 && minutes == 15) {
    
    update()

  }
    
  if(hours == 2 && minutes == 59) {
    update()
  }
}


exports.UpdateOriginalUserAssigned = async (Model) => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  let day = new Date(date).getDay()

  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())


  if(hours == 7 && minutes == 05) {
    const {recordset: result} = await sql.query(`select * from ${Model} where (Status IN ('Review', '' ) or Status IS NULL)`);

    for (let i=0; i<result.length ; i++) {
      await sql.query(`update ${Model} set OriginalUserAssigned = '${result[i].UserAssigned}' where   OriginalUserAssigned IS NULL `);
    }
  }

 
}


exports.DailyCheckmark = async () => {
  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  let day = new Date(date).getDay()

  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())


  if(hours == 23 && minutes == 50) {
    const [{recordset: wq5508checkmark} ,{recordset: wq1075checkmark} ] = await  Promise.all([
      await sql.query(
        `select * from WQ5508Checkmark`
      ),
      await sql.query(
        `select * from WQ1075Checkmark`
      )
  
    ])
    
    var currentDate =  this.getDateTime().split('T')[0]
  
    let count = wq5508checkmark.length
    
    
    
    for(let i=0;i<count; i++) {
      if (wq5508checkmark[i][days[day]] && wq1075checkmark[i][days[day]]) {
        sql.query(`insert into ${DailyCheckmarkModal} (EMPID,Date, Checked) values ('${wq5508checkmark[i].EMPID}', '${currentDate}', 1)`);
      } else {
          sql.query(`insert into ${DailyCheckmarkModal} (EMPID,Date, Checked) values ('${wq5508checkmark[i].EMPID}', '${currentDate}', 0)`);
      }
    
    }  
  }
  

}