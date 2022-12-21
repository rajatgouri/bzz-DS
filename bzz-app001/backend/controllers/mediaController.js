
const fs = require('fs')
const path = require('path');

const dir = path.resolve("/home/node/faxtest");
const Model = "IncomingWQ";
var sql = require("mssql");
const util = require('util');
// const tesseract = require("node-tesseract-ocr")
// var pdf2img = require('pdf-img-convert');
// const nm = require('name-recognition')



const folder = {
	'Fax Completed': '/SmartApp Fax Completed/',
	'EMR To File': '/SmartApp Fax Completed/',
	'Fax Correction Letter': '/SmartApp Fax Correction Letter/',
	'New': '/',
	'Billable New': '/SmartApp Billable New/',
	'Not Billable': '/',
	'Not Form': '/',
	'Billable Correction Letter': '/SmartApp Billable Correction Letter/',
	'Billable Completed': '/SmartApp Billable Completed/',
	'Duplicate': '/SmartApp Fax Completed/',
	'Medical Forms New': '/SmartApp Medical Forms New/',
  	'Medical Forms Completed': '/SmartApp Medical Forms Completed/',
	'OCR': '/OCR/',
	'Medical Forms Correction Letter': '/SmartApp Medical Forms Correction Letter/',
	'Not Billable': '/',
	'Not Billable Completed': '/SmartApp Billable New/',
	'Not Billable Letter': '/SmartApp Billable New/',
	'Not Completed': '/',
	'Not Letter': '/',
	'Not Forms Completed': '/SmartApp Medical Forms New/'
}




exports.folder = folder

exports.show = (req, res) => {

	const { folder: fol, filename, load } = req.params;

	try {
		let source = dir + folder[fol] + filename

		console.log(source)
		let fileExists = fs.existsSync(source)

		console.log('file exits', fileExists)
		if (fileExists) {
			//file exists
			let file = fs.readFileSync(source, { encoding: 'base64' });

			setTimeout(() => {
				return res.status(200).json({
					success: true,
					result: {
						file,
						patients: []
					},
					message: "Success",
				});
			}, 1000)
		
		}


	} catch (err) {
		console.log(err)
		res.send(err);
	}
}

function copy(oldPath, newPath) {
	return new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(oldPath);
		const writeStream = fs.createWriteStream(newPath);

		readStream.on('error', err => reject(err));
		writeStream.on('error', err => reject(err));

		writeStream.on('close', function () {
			resolve();
		});

		readStream.pipe(writeStream);
	})
}


exports.transfer = (req, res) => {
	try {
		const { fileName, dest_folder, current_folder , cp_to_Billabe_new} = req.body;

		
		let dest = dir + folder[dest_folder] + fileName.trim()
		let source = dir + folder[current_folder] + fileName.trim()
		let billableDest = dir + folder['Billable New'] + fileName.trim()


		if (source == dest) {
			return res.status(200).json({
				success: true,
				result: {
					message: "same name!"
				},
				message: "Success",
			});
		}

	
		

		if(current_folder == 'Duplicate' && dest_folder == 'Not Billable') {
			dest = dest.replace(/ DUPLICATE/ig, '').trim()
		}

		copy(source, dest).then(async () => {

			if(cp_to_Billabe_new) {
				
				copy(source, billableDest).then(async () => {
					console.log('Copied to Billable New')
					await fs.unlinkSync(source)

				}).catch(err => {
					console.log(err)
				})
			} else {
				await fs.unlinkSync(source)

			}
			 

			setTimeout(() => {
				return res.status(200).json({
					success: true,
					result: {
						message: "File Renamed Succesfully!"
					},
					message: "Success",
				});

			}, 1000)


		}).catch(err => {
			console.log(err)
		})


	} catch (err) {
		console.log(err)
	}
}



exports.transferWithDifferentName = (req, res) => {
	try {
		const { fileName, dest_folder, current_folder, previousFilename } = req.body;

		let dest = dir + folder[dest_folder] + fileName
		let source = dir + folder[current_folder] + fileName


	} catch (err) {
		console.log(err)
	}
}



exports.rename = async(req, res) => {

	const { oldPath, newPath, folder: fol, noOfRequests: requests =0 } = req.body;


	let source = dir + folder[fol] + oldPath
	let dest = dir + folder[fol] + newPath


	if(+requests.length > 0) {
		let p= new Promise((resolve,reject)=> {
			for(let  i = 0; i< +requests - 1; i++) {
				// let d = source.replace('.PDF', ' V' + (i+1)) + ".PDF"
				let d = dir + folder[fol] + oldPath.split('.PDF')[0].substring(0,10) + 'V' + (i+1) + ".PDF"
				console.log(d)
				copy(source, d).then(async () => {
					resolve(true)
					console.log('copied!')
				}).catch(err => {
					console.log(err)
					resolve(true)
	
				})
			}
		})


		await p

	}
	

	if (source == dest) {
		return res.status(200).json({
			success: true,
			result: {
				message: "same name",
			},

			message: "Success",
		});
	}


	
	

	try {
		if (fs.existsSync(source)) {
			//file exists
			fs.rename(source, dest, (err) => {
				if (err) {
				
					return res.status(400).json({
						success: true,
						result: {
							message: "Something went wrong!",
							error: err
						},

						message: "Success",
					});
				}

					return res.status(200).json({
						success: true,
						result: {
							message: "File Renamed Succesfully!"
						},
						message: "Success",
					});


			});

		} else {
			return res.status(200).json({
				success: true,
				result: {
					message: "Unable to find file!"
				},
				message: "Success",
			});
		}
	} catch (err) {
		console.log(err)
		res.send(err);
	}
}