const path = require('path')
const dir = path.resolve("/home/node/faxtest/OCR");
var textract = require('textract');
const fs = require('fs')
var sql = require("mssql");
const { getDateTime } = require('./controllers/utilController');
var Model = "PatientMisfile"
var Model1 = "PatientMisfileData"



var stringSimilarity = require("string-similarity");

const timer = () => new Promise((resolve, reject) => setTimeout(() => resolve(true), 10000))

const locations = (substring, string) => {
    var a = [], i = -1;
    while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i);
    return a;
}


const copy = (oldPath, newPath) => {
    return new Promise(async (resolve, reject) => {
        await fs.copyFileSync(oldPath, newPath )
        resolve(true)
    })
}


const logic = async (source, dest, error, files, dup,  patientName1, cb) => {

    const {recordset: fileExist} = await sql.query(`select * from ${Model} where Filename = '${files[0]}'`)
    
    if(fileExist.length > 0) {
        copy(source, dup).then(async () => {
            await fs.unlinkSync(source)
            cb({
                status: false,
                message: 'File is already in database.'
            })
            setTimeout(() => {   
                console.log('Duplicate move to dups')
                watcherFunc()
           }, 60000)
        })
       
    
} else {

    try {

        textract.fromFileWithPath(source, async function( err, text ) {
            if(err) throw error
            
            let outputImages = (text.split(/page \d*/i)).filter((txt) =>  txt.trim() != '')
            var finalData = []
            var move = false
    
            const startTime = new Date()
            for(i=0; i< outputImages.length ;i++) {
                let text = outputImages[i].trim()
             
                let Names = [ ]
                
                let convertedText = text.split(' ')
                let similarfound = convertedText.filter((txt, index) => {
                                       
                    if((stringSimilarity.compareTwoStrings(txt, 'Dr.') > 0.5 )) {
                        Names.push(convertedText.slice(index , index+ 2 ).join(' ').replace(/\r\n/g, ''))
                    } 
    
                     txt1 = convertedText[index -1] + " " + txt + " " + convertedText[index  + 1]
                    if (txt1) { 

                        return  (stringSimilarity.compareTwoStrings(txt1.toLowerCase(), patientName1.toLowerCase()) > 0.5)

                    }
                    
                })
    
                let count = parseInt(similarfound.length / 2)
                let found = (similarfound.length > 0 ?  'Yes': 'No')
                if (count == 0) {
                    move = true
                } else {
                    Names.push(patientName1)
                }
    
                let indexesMD = (locations(', MD', text))
    
                for (let l = 0; l < indexesMD.length; l++) {
                    let startPoint = (text.slice(0, indexesMD[l]))
                    let arr = startPoint.split(' ')
                    if (arr) {
                        Names.push(arr.slice((-2)).join(' ') + ', MD')
                    }
                }
    
                Names = ([...new Set( Names.map((m) => m.replace(/[^a-zA-Z ]/g, "")))]).join(', ')
                // Names = [...new Set(Names.map((m) => m.replace(/[^a-zA-Z ]/g, ""))].join(', '))
    
                finalData.push({
                    FileName: files[0],
                    Page: i + 1,
                    Patient: patientName1,
                    Found: found,
                    Count: count,
                    Names: Names
                })
    
                if (i == outputImages.length -1 ) {
                    let link = ''
                    


                    if(move) {
                        link = error
                        copy(source, error).then(async () => {
                            await fs.unlinkSync(source)
                        })
                    } else {
                        link = dest
                        copy(source, dest).then(async () => {
                            await fs.unlinkSync(source)
                        })
                    }
    
                    finalData  = (finalData.sort((a, b) => a['Page'] - b['Page']))

                    var date1 = new Date(startTime.toISOString().substring(0, 19));
                    var date2 = new Date(new Date().toISOString().substring(0, 19));
                    
                    var diff = date2.getTime() - date1.getTime();

                    await  sql.query(`
                        INSERT INTO ${Model} 
                        (FileName, Patient,  ActionTimeStamp, Found, Validate, Link, ProcessTime)
                        values (
                            '${files[0]}',
                            '${patientName1}',
                            '${getDateTime()}',
                            ${finalData.filter((data) => data.Found == 'No' || data.Found == null).length > 0 ? `'No'`: `'Yes'`}  ,
                            'No',
                            '${link}',
                            '${diff}'
                        )
                    `)
    
                    let {recordset: result} = await sql.query(`
                    select top (1) * from ${Model} where Filename = '${files[0]}' Order by ActionTimeStamp desc`)            
    
    
                    let MisfileId = (result[0].ID)
                    let valuesQuery = '';

                    for(let i=0; i< finalData.length ; i++) {
                    
                        valuesQuery += `(
                            '${finalData[i].FileName}',
                            '${MisfileId}',
                            '${finalData[i].Patient}' ,  
                            '${finalData[i].Page}',
                            '${finalData[i].Found}',
                            '${finalData[i].Count}',
                            '${finalData[i].Names}',
                            '${getDateTime()}'

                            ) ,`
                            
                    }

                    valuesQuery = valuesQuery.slice(0, -1)

        
                    if(valuesQuery.length > 0) {
                        await  sql.query(`
                        INSERT INTO ${Model1} 
                        (FileName, MisfileID, Patient, Page, Found, Count, NamesFound, ActionTimeStamp )
                        values ${valuesQuery}`
                    )
                
                    setTimeout(() => {
                        watcherFunc()
                    }, 10000)
                    
                    cb({
                        status: true,
                        message: 'Done'
                    })

                }

                     
              
                }                
        

                
    
             }
    
        })
    } catch (err) { 
        cb({
            status: false,
            message: err
        })
    }
}



}


const convertFile = async (source, dest,  files, cb) => {
    

    try {

     

        let fileContent = ''
        textract.fromFileWithPath(source, async function( err, text ) {
            if(err) throw err
            
            fs.writeFileSync(dest,(text ))

            let outputImages = (text.split(/page \d*/i)).filter((txt) =>  txt.trim() != '')
    
            for(i=0; i< outputImages.length ;i++) {
                let text = outputImages[i].trim()
                
                fileContent += text + "\n\n\n"
    
                if (i == outputImages.length -1 ) {
                   

                    // fs.writeFileSync(dest,(fileContent ))

                        await fs.unlinkSync(source)
                        cb({
                            status: true,
                            message: 'File is already in database.'
                        })
                        setTimeout(() => {   
                            convertFunc()
                       }, 10000)
                   
                
                    
                }                
        
             }
    
        })
    } catch (err) { 
        cb({
            status: false,
            message: err
        })
        console.log(err)
    }


}


const generateTxt = async () => {

    let files = (fs.readdirSync(dir + '/FilestoText/'));

    if (files.length == 0) {
        setTimeout(() => {
            generateTxt()
        }, 5000)
    } else {

  
    let source = dir + "/FilesToText/" + files[0];
    let dest = dir + "/Out/" + files[0]
    let curr = dir + "/Currupted/" + files[0]


        textract.fromFileWithPath(source, async function( err, text ) {
                if (err) {

                    console.log(curr)
                    copy(source, curr).then(async () => {
                        await fs.unlinkSync(source)
                      
                        setTimeout(() => {   
                            generateTxt()
                       }, 60000)
    
                    })
                }

                let d = dest.slice()
                d = d.split('.')[0]
                fs.writeFileSync((d + ".txt"), text)


                copy(source, dest).then(async () => {
                    await fs.unlinkSync(source)
                  
                    setTimeout(() => {   
                        generateTxt()
                   }, 60000)

                })
        })      

        return

    }
}

const watcherFunc = async () => {

    let files = (fs.readdirSync(dir + '/In/'));

    files = (files.filter(file => file.toLocaleLowerCase().indexOf('.pdf') > 0))

    if (files.length == 0) {
        setTimeout(() => {
            watcherFunc()
        }, 5000)
    } else {

  
    let source = dir + "/In/" + files[0];
    let error = dir + "/Error/" + files[0]
    let dest = dir + "/Out/" + files[0]
    let dup = dir + "/Dups/" + files[0]

    let patientName1 = (files[0].slice(files[0].indexOf('_'), files[0].indexOf(' ')).replace(/_/g, ' ').trim())
    patientName1=  (patientName1.split(' ')[0] + " "+ patientName1.split(' ')[1])

    logic(source, dest, error, files, dup, patientName1, cb => {
        console.log('exported!')
    })
}
   
}

const convertFunc = async () => {

    let files = (fs.readdirSync(dir + '/TextractTestIn/'));
    files = (files.filter(file => file.toLowerCase().indexOf('.pdf') > 0))

    if (files.length == 0) {
        // console.log('refreshing.. ')
        setTimeout(() => {
            convertFunc()
        }, 5000)
    } else {

  
    let source = dir + "/TextractTestIn/" + files[0];
    let dest = dir + "/TextractTestOut/" + files[0].replace('.PDF', '.txt').replace('.pdf','.txt')

    
    convertFile(source, dest, files, cb => {
        console.log('exported!')
    })


}
   
}

exports.upload = (source, files, patientName1, cb1) => {

    let error = dir + "/Error/" + files[0]
    let dest = dir + "/Out/" + files[0]
    let dup = dir + "/Dups/" + files[0]

  logic(source, dest, error, files, dup, patientName1, cb => {
         cb1(cb)
    })


}


setTimeout(() => {
    generateTxt()
    watcherFunc()
    convertFunc()
}, 5000)


