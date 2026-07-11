import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;
console.log("Using key:", key ? `${key.substring(0,10)}...` : "MISSING");

const genAI = new GoogleGenerativeAI(key);

const modelsToTest = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

for (const modelName of modelsToTest) {
  try {
    console.log(`\nTesting model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello in one word.");
    console.log(`SUCCESS with ${modelName}:`, result.response.text());
    break;
  } catch (err) {
    console.error(`FAILED ${modelName}: ${err.message.substring(0, 100)}`);
  }
}
