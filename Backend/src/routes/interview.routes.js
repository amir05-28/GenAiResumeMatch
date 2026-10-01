const express = require('express');
const authmiddleware = require('../middlewares/auth.middleware');
const interviewController = require('../controllers/interview.controller');
const upload = require("../middlewares/file.middleware")


const interviewRouter = express.Router();



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description, resume pdf and job description
 * @access Private
 */

interviewRouter.post("/", authmiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId
 * @accessPrivate
 */

interviewRouter.get("/report/:interviewId", authmiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview report of logged in user
 * @access private
 */

interviewRouter.get("/", authmiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @routes GET /api/interview/resume/pdf
 */

interviewRouter.post("/resume/pdf/:interviewReportId", authmiddleware.authUser,interviewController.generateResumePdfController)


module.exports = interviewRouter;