import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent(message.trim());
    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI Assistant Error:", error.message || error);
    
    // Check if it's a rate limit or key error from Gemini
    const errorMsg = error.message?.toLowerCase() || "";
    if (errorMsg.includes("429") || errorMsg.includes("too many requests") || errorMsg.includes("exhausted")) {
      return res.status(429).json({ 
        error: "The AI is currently receiving too many requests. Please wait a moment and try again." 
      });
    }

    return res.status(500).json({
      error: "Failed to get a response from the AI. Please verify your API key is active or try again later.",
    });
  }
};
