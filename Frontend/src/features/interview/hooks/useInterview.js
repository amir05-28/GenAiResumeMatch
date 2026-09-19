import { getAllInterviewReports, generateInterviewReport, getinterviewReportById}  from "../services/interview.api"
import {useContext} from "react"
import {interviewContext} from "../interview.contex"


export const useInterview = () =>{

    const context = useContext(InterviewContext)

    if(!context){
        throw new Error("useInterview must be used withiin the InterviewProvider")
    }

    const {loading, setLoading, report, setReport, reports, setReports} = context

    const generateReport = async ({ jobDescription, jobDescription, resumeFile}) => {
        setLoading(true)
        try{
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile})
            setReport(response.interviewReport)
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false)
        }        
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try{
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    const getReports = async () =>{
        setLoading(true)
        try{
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    return (loading, report, reports, generateReport, getReportById, getReports)
}