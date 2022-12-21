const OCR = require('../OCR');

exports.upload = (req, res) => {


	try {

		let source = (req.file.path)
		let files = [req.file.originalname]
		let patient =  ( req.body.First + " "+ req.body.Last)
		OCR.upload(source,files, patient, cb => {
			if(cb.status) {
				return res.status(200).json({
					success: true,
					result: [],
					message: "Successfully upload all documents",
				});
			} else {
				return res.status(500).json({
					success: false,
					result: [],
					message: cb.message,
				});
			}

		})

	} catch (err) {
		console.log(err)
		res.send(err);
	}
}
