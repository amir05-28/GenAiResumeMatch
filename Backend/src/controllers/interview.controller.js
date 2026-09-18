const pdfParse = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")


async function generateInterViewReportController(req, res){


    try{
        const resumeContent = await (new pdfParse.PDFParse(new Uint8Array(req.file.buffer))).getText()
        const {selfDescription, jobDescription} = req.body

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview Report generated successfuly",
            interviewReport: interviewReport.toObject()
        })

    }
    catch(err){
        console.error("CONTROLLER ERROR:", err)
        res.status(500).json({
            message: "Failed to generate interview report",
            err: err.message
        })
        
    }
    

}


module.exports={generateInterViewReportController}