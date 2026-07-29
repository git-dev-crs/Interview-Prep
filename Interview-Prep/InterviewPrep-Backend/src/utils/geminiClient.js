import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Centralized, resilient Gemini client.
 *
 * WHY THIS EXISTS:
 * The app previously hardcoded the model "gemini-2.0-flash". On some API keys
 * that model has a free-tier quota of 0, so every call returned HTTP 429 and the
 * feature broke with a generic "Failed to..." message. This client:
 *   1. Tries a chain of models and skips ones that are rate-limited (429),
 *      unavailable (404), or temporarily overloaded (503) — so one model's
 *      quota can't take the whole feature down.
 *   2. Translates raw Gemini errors into clear, user-facing messages.
 *
 * The primary model is configurable via the GEMINI_MODEL env var and defaults
 * to "gemini-flash-latest" (verified available on the current key).
 */

// IMPORTANT: initialize LAZILY, not at import time.
// index.js calls dotenv.config() after its route imports, and ES module imports
// are evaluated before that line runs — so reading process.env.GEMINI_API_KEY at
// import time yields undefined ("API key invalid"). Reading it on first use (after
// dotenv has populated process.env) fixes this regardless of import order.
let _genAI = null;
const getGenAI = () => {
    if (!_genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const e = new Error("GEMINI_API_KEY is not set");
            e.httpStatus = 500;
            e.userMessage = "The AI service is not configured (missing GEMINI_API_KEY). Please check the server .env.";
            throw e;
        }
        _genAI = new GoogleGenerativeAI(apiKey);
    }
    return _genAI;
};

// Ordered preference list. First entry wins; the rest are fallbacks.
// De-duplicated and empties removed so GEMINI_MODEL can safely equal a default.
// NOTE: "gemini-2.0-flash" was the old hardcoded model — it has a free-tier
// quota of 0 on the current key (429). The "-latest" aliases always resolve to
// a currently-available model, which is why they lead the chain.
export const MODEL_CHAIN = [
    process.env.GEMINI_MODEL,
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3-flash-preview",
    "gemini-2.0-flash",
].filter(Boolean).filter((m, i, arr) => arr.indexOf(m) === i);

// Transient (503/overloaded) retries on the SAME model before advancing.
const MAX_TRANSIENT_RETRIES = 1;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Errors worth retrying on the NEXT model in the chain (not fatal to the request).
const isRetriableOnNextModel = (err) => {
    const status = err?.status ?? err?.response?.status;
    const msg = (err?.message || "").toLowerCase();
    return (
        status === 429 || status === 404 || status === 503 ||
        msg.includes("quota") ||
        msg.includes("resource_exhausted") ||
        msg.includes("rate limit") ||
        msg.includes("not found") ||
        msg.includes("overloaded") ||
        msg.includes("unavailable")
    );
};

// Transient errors worth retrying on the SAME model (server hiccup, not quota).
const isTransient = (err) => {
    const status = err?.status ?? err?.response?.status;
    const msg = (err?.message || "").toLowerCase();
    return status === 503 || msg.includes("overloaded") || msg.includes("unavailable") || msg.includes("try again");
};

/**
 * Turn a raw Gemini/network error into an Error carrying a `.userMessage`
 * (safe to show a user) and an `.httpStatus` the route can return.
 */
const classifyError = (err) => {
    const status = err?.status ?? err?.response?.status;
    const msg = (err?.message || "").toLowerCase();
    const out = new Error(err?.message || "Gemini request failed");

    if (status === 429 || msg.includes("quota") || msg.includes("resource_exhausted") || msg.includes("rate limit")) {
        out.httpStatus = 429;
        out.userMessage = "The AI service is temporarily rate-limited (quota reached). Please wait a minute and try again.";
    } else if (status === 400 && (msg.includes("api key") || msg.includes("api_key"))) {
        out.httpStatus = 500;
        out.userMessage = "The AI service API key is invalid. Please check the server's GEMINI_API_KEY.";
    } else if (status === 403) {
        out.httpStatus = 500;
        out.userMessage = "The AI service key is not authorized for this model. Please check the server configuration.";
    } else {
        out.httpStatus = 503;
        out.userMessage = "The AI service is currently unavailable. Please try again in a moment.";
    }
    return out;
};

/**
 * Generate text with automatic model fallback.
 *
 * @param {Object}  opts
 * @param {string}  opts.prompt               The user/content prompt (required).
 * @param {string} [opts.systemInstruction]   Optional system prompt.
 * @returns {Promise<{ text: string, model: string }>}
 * @throws  {Error} classified error with `.userMessage` and `.httpStatus`
 */
export const generateContent = async ({ prompt, systemInstruction } = {}) => {
    if (!prompt) throw classifyError(new Error("Missing prompt"));

    const genAI = getGenAI();
    let lastError;
    for (const modelName of MODEL_CHAIN) {
        const model = genAI.getGenerativeModel(
            systemInstruction ? { model: modelName, systemInstruction } : { model: modelName }
        );

        // Try this model, retrying briefly on transient (503) hiccups.
        for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt++) {
            try {
                const result = await model.generateContent(prompt);
                return { text: result.response.text(), model: modelName };
            } catch (err) {
                lastError = err;
                if (isTransient(err) && attempt < MAX_TRANSIENT_RETRIES) {
                    console.warn(`[gemini] model "${modelName}" transient error (${err?.status || err?.message}); retrying once...`);
                    await sleep(600);
                    continue; // retry same model
                }
                if (isRetriableOnNextModel(err)) {
                    console.warn(`[gemini] model "${modelName}" unavailable (${err?.status || err?.message}); trying next in chain...`);
                    break; // move to next model
                }
                // Non-retriable (e.g. invalid key) — fail fast with a clear message.
                throw classifyError(err);
            }
        }
    }
    // Every model in the chain failed (all rate-limited / unavailable).
    console.error("[gemini] all models in chain failed. Last error:", lastError?.message || lastError);
    throw classifyError(lastError || new Error("All Gemini models unavailable"));
};
