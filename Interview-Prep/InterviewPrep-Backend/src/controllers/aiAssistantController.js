import { generateContent } from "../utils/geminiClient.js";

const SYSTEM_INSTRUCTION = `You are an expert Interview Preparation Assistant embedded inside an interview prep platform. 
You help software engineering students prepare for technical interviews.
You specialize in: Data Structures & Algorithms (DSA), Operating Systems (OS), Database Management Systems (DBMS), Computer Networks (CN), Object-Oriented Programming (OOP), System Design (LLD & HLD), coding patterns, time/space complexity analysis, and company-specific interview tips.
Keep answers concise, well-structured, and beginner-friendly. Use bullet points, code snippets in markdown, and examples where helpful.
If a question is unrelated to technical interviews or programming, politely redirect back to interview prep topics.`;

export const askAIAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    const { text: reply } = await generateContent({
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt: message.trim(),
    });

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI Assistant Error:", error.message || error);
    return res.status(error.httpStatus || 500).json({
      error: error.userMessage || "Failed to get a response from the AI. Please try again later.",
    });
  }
};
