const pdfParse = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")


/**
 * @description Controller to generate interview report based on user Self Description, Job Description and resume
 */

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


/**
 *  @description Controller to get interview report by interview Id
 */


async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}



module.exports={generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController}