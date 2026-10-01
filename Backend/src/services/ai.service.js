const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

// Keep this schema inline and limited to Gemini's supported JSON Schema subset.
// Every array item is explicitly an object with required fields.
const interviewReportResponseSchema = {
    type: "object",
    properties: {
        matchScore: { type: "number", description: "A score from 0 to 100." },
        technicalQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" },
                },
                required: ["question", "intention", "answer"],
            },
        },
        behavioralQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" },
                },
                required: ["question", "intention", "answer"],
            },
        },
        skillGaps: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                },
                required: ["skill", "severity"],
            },
        },
        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: { type: "integer" },
                    focus: { type: "string" },
                    tasks: { type: "array", items: { type: "string" } },
                },
                required: ["day", "focus", "tasks"],
            },
        },
        title: { type: "string", description: "A concise job title." },
    },
    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
        "title",
    ],
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Create a complete interview preparation report using the candidate information below.

Return every field in the required JSON schema. Do not return empty arrays.
- matchScore: an integer from 0 to 100 based on evidence in the candidate profile.
- technicalQuestions: at least 5 role-specific questions. Each needs a useful intention and a concrete answer outline.
- behavioralQuestions: at least 5 relevant questions. Each needs a useful intention and a concrete answer outline.
- skillGaps: at least 3 actual gaps between the profile and job requirements, with severity low, medium, or high. If evidence is limited, identify reasonable gaps rather than returning an empty array.
- preparationPlan: exactly 7 days, numbered 1 through 7, each with a focus and at least 2 actionable tasks.
- title: a concise job title inferred from the job description, not a copied paragraph.

Candidate resume:
${resume || "Not provided"}

Candidate self-description:
${selfDescription || "Not provided"}

Job description:
${jobDescription}`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: interviewReportResponseSchema,
        }
    })

    const parsed = interviewReportSchema.safeParse(JSON.parse(response.text))
    if (!parsed.success) {
        throw new Error(`AI returned an invalid interview report: ${parsed.error.message}`)
    }

    const report = parsed.data
    const problems = []
    if (report.technicalQuestions.length < 5) problems.push("at least 5 technical questions")
    if (report.behavioralQuestions.length < 5) problems.push("at least 5 behavioral questions")
    if (report.skillGaps.length < 3) problems.push("at least 3 skill gaps")
    if (report.preparationPlan.length < 7) problems.push("a 7-day preparation plan")
    if (problems.length) {
        console.error("Gemini returned an incomplete interview report:", problems.join(", "))
        throw new Error(`AI report is incomplete; expected ${problems.join(", ")}.`)
    }

    console.info("Gemini interview report validated", {
        technicalQuestions: report.technicalQuestions.length,
        behavioralQuestions: report.behavioralQuestions.length,
        skillGaps: report.skillGaps.length,
        preparationDays: report.preparationPlan.length,
        hasMatchScore: Number.isFinite(report.matchScore),
    })

    return report


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }
