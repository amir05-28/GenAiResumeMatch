const { GoogleGenAI, Behavior } = require("@google/genai")
const {z} = require("zod")
const {zodToJsonSchema} = require("zod-to-json-schema")


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({


    matchScore: z.number().describe("The match score between the candidate and the job describe, can be a number between 0 and 100"),

    
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked during the interview"),
        intention: z.string().describe("The intention of interviwer behind the question"),
        answer: z.string().describe("how to answer this question, what points to cover, what approach to take ")
    })).describe("List of technical questions that can be asked during the interview"),
    
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked during the interview"),
        intention: z.string().describe("The intention of interviwer behind the question"),
        answer: z.string().describe("how to answer this question, what points to cover, what approach to take ")

    })).describe("List of behavioral questions that can be asked during the interview"),

    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill that the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap, can be low, medium, high"),
    })).describe("List of skill gaps that the candidate has, along with the severity of the gap"),

    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number of the preparation plan"),
        focus: z.string().describe("The focus areas for the day, can be technical or behavioral skills"),
        tasks: z.array(z.string()).describe("The tasks to be completed for the day, can be reading, practicing, or any other task"),
    })).describe("The preparation plan for the candidate, along with the focus areas and tasks for each day"),
    title: z.string().describe("The title of the job for which the interview report is generated")
})


function sanitizeForGemini(schema) {
    if (Array.isArray(schema)) {
        return schema.map(sanitizeForGemini)
    }
    if (schema && typeof schema === "object") {
        const { additionalProperties, $schema, ...rest } = schema
        const cleaned = {}
        for (const key of Object.keys(rest)) {
            cleaned[key] = sanitizeForGemini(rest[key])
        }
        return cleaned
    }
    return schema
}

const rawJsonSchema = zodToJsonSchema(interviewReportSchema)
const geminiSchema = sanitizeForGemini(rawJsonSchema)






async function generateContentWithRetry(params, maxRetries = 4) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await ai.models.generateContent(params);
        } catch (err) {
            const is503 = err?.status === 503 || err?.message?.includes('UNAVAILABLE');
            const isLastAttempt = attempt === maxRetries - 1;

            if (!is503 || isLastAttempt) throw err;

            const delay = Math.min(1000 * 2 ** attempt, 10000) + Math.random() * 500;
            console.log(`Gemini overloaded, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview report for a candidate with the following details: 
        Resume: ${resume} 
        Self describe: ${selfDescription} 
        Job describe: ${jobDescription}`;

    const baseParams = {
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: geminiSchema,
        }
    };

    let response;
    try {
        // Try primary model with retries
        response = await generateContentWithRetry({ ...baseParams, model: "gemini-3.6-flash" });
    } catch (err) {
        const is503 = err?.status === 503 || err?.message?.includes('UNAVAILABLE');
        if (is503) {
            console.log("gemini-3.6-flash still unavailable, falling back to gemini-3.7-flash");
            response = await generateContentWithRetry({ ...baseParams, model: "gemini-3.7-flash" });
        } else {
            throw err;
        }
    }

    console.log("RAW GEMINI RESPONSE:", response.text);

    try {
        return JSON.parse(response.text);
    } catch (parseErr) {
            console.error("Failed to parse Gemini response as JSON:", response.text);
            throw new Error("AI returned an invalid report format");
        }
}

module.exports = generateInterviewReport
