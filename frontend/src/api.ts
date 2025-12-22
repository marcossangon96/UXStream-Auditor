export interface AnalyzeDecisionResponse {
    result: string;
}

export async function analyzeDecision(data: { decision: string }): Promise<AnalyzeDecisionResponse> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    return res.json();
}
