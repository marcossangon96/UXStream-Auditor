export interface AnalyzeDecisionResponse {
    result: string;
}

export async function analyzeDecision(data: { decision: string }): Promise<AnalyzeDecisionResponse> {
    const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    return res.json();
}
