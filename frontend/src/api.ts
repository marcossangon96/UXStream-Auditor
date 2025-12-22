export interface AnalyzeDecisionResponse {
    result: string;
}

export async function analyzeDecision(data: { decision: string }): Promise<AnalyzeDecisionResponse> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    return res.json();
}
