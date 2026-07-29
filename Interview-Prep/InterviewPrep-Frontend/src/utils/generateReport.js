/**
 * Shared interview-report PDF generator.
 *
 * Opens a clean, print-optimized window for a completed interview session and
 * triggers the browser's "Save as PDF" flow. Dependency-free — uses the native
 * print dialog so the output is crisp vector text, not a rasterized screenshot.
 *
 * Usage:
 *   import { downloadInterviewReport } from "../utils/generateReport";
 *   downloadInterviewReport(session);
 *
 * `session` is the InterviewSession shape returned by the backend:
 *   { role, experience, interviewType, completedAt, overallScore,
 *     strengths[], weaknesses[], recommendations[], questions[] }
 */

// Escape user/AI-generated text before injecting into the report HTML.
const esc = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const scoreHexColor = (score) =>
    score >= 7 ? "#2e7d32" : score >= 4 ? "#f57f17" : "#c62828";

export const downloadInterviewReport = (session) => {
    if (!session) return;

    const answered = (session.questions || []).filter((q) => q.answer);
    const completedDate = session.completedAt
        ? new Date(session.completedAt).toLocaleDateString()
        : new Date().toLocaleDateString();

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        // Popup blocked — surface a friendly hint to the caller's UI layer.
        alert("Please allow pop-ups for this site to download the PDF report.");
        return;
    }

    printWindow.document.write(`
        <html>
            <head>
                <title>Interview Report - ${esc(session.role)}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.6; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
                    .header h1 { font-size: 28px; color: #6366f1; margin-bottom: 8px; }
                    .header p { color: #666; font-size: 14px; }
                    .meta { display: flex; gap: 20px; justify-content: center; margin: 15px 0; flex-wrap: wrap; }
                    .meta span { background: #f0f0ff; padding: 4px 12px; border-radius: 6px; font-size: 13px; }
                    .section { margin-bottom: 25px; }
                    .section h2 { font-size: 18px; color: #6366f1; margin-bottom: 12px; border-left: 3px solid #6366f1; padding-left: 12px; }
                    .scores { display: flex; gap: 20px; justify-content: center; margin: 20px 0; }
                    .score-item { text-align: center; padding: 15px 20px; border-radius: 10px; background: #f8f8ff; border: 1px solid #e0e0ff; }
                    .score-item .value { font-size: 28px; font-weight: 700; color: #6366f1; }
                    .score-item .label { font-size: 12px; color: #666; margin-top: 4px; }
                    .qa-item { padding: 15px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e0e0e0; page-break-inside: avoid; }
                    .qa-item .q-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .qa-item .question { font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
                    .qa-item .answer { color: #555; font-size: 14px; background: #f9f9f9; padding: 10px; border-radius: 6px; }
                    .qa-item .feedback { font-size: 13px; color: #6366f1; margin-top: 8px; font-style: italic; }
                    .tags { display: flex; gap: 10px; flex-wrap: wrap; }
                    .tag { padding: 6px 14px; border-radius: 6px; font-size: 13px; }
                    .tag-green { background: #e8f5e9; color: #2e7d32; }
                    .tag-yellow { background: #fff8e1; color: #f57f17; }
                    .tag-blue { background: #e3f2fd; color: #1565c0; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎯 Interview Performance Report</h1>
                    <p>InterviewPrep - AI Mock Interview Platform</p>
                    <div class="meta">
                        <span>📋 ${esc(session.role)}</span>
                        <span>📊 ${esc(session.interviewType)} Mode</span>
                        <span>🎓 ${esc(session.experience)}</span>
                        <span>📅 ${esc(completedDate)}</span>
                    </div>
                </div>

                <div class="section">
                    <h2>Overall Performance</h2>
                    <div class="scores">
                        <div class="score-item">
                            <div class="value">${session.overallScore?.overall || 0}</div>
                            <div class="label">Overall</div>
                        </div>
                        <div class="score-item">
                            <div class="value">${session.overallScore?.technicalAccuracy || 0}</div>
                            <div class="label">Technical</div>
                        </div>
                        <div class="score-item">
                            <div class="value">${session.overallScore?.communication || 0}</div>
                            <div class="label">Communication</div>
                        </div>
                        <div class="score-item">
                            <div class="value">${session.overallScore?.depth || 0}</div>
                            <div class="label">Depth</div>
                        </div>
                    </div>
                </div>

                ${session.strengths?.length ? `
                <div class="section">
                    <h2>💪 Strengths</h2>
                    <div class="tags">${session.strengths.map((s) => `<span class="tag tag-green">✓ ${esc(s)}</span>`).join("")}</div>
                </div>` : ""}

                ${session.weaknesses?.length ? `
                <div class="section">
                    <h2>🔧 Areas to Improve</h2>
                    <div class="tags">${session.weaknesses.map((w) => `<span class="tag tag-yellow">• ${esc(w)}</span>`).join("")}</div>
                </div>` : ""}

                ${session.recommendations?.length ? `
                <div class="section">
                    <h2>📋 Recommendations</h2>
                    <div class="tags">${session.recommendations.map((r, i) => `<span class="tag tag-blue">${i + 1}. ${esc(r)}</span>`).join("")}</div>
                </div>` : ""}

                <div class="section">
                    <h2>📝 Question-by-Question Review</h2>
                    ${answered.map((q, i) => `
                    <div class="qa-item">
                        <div class="q-header">
                            <strong>Question ${i + 1}</strong>
                            <span style="color: ${scoreHexColor(q.scores.overall)}; font-weight: 700;">
                                ${q.scores.overall}/10
                            </span>
                        </div>
                        <div class="question">${esc(q.question)}</div>
                        <div class="answer">${esc(q.answer)}</div>
                        ${q.feedback ? `<div class="feedback">💡 ${esc(q.feedback)}</div>` : ""}
                    </div>`).join("") || "<p>No answered questions.</p>"}
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
                    Generated by InterviewPrep • ${esc(new Date().toLocaleDateString())}
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
};
