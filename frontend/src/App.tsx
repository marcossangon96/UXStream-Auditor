import { useState, useEffect } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import "./App.css";

type Event = {
    timestamp: string;
    type: string;
    description: string;
    severity: string;
};

type Scenario = {
    score: number;
    risk: string;
};

type GeminiResponse = {
    events: Event[];
    scenarios: Record<string, Scenario>;
    recommendation: string[];
};

function App() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [data, setData] = useState<GeminiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        let timer: number;
        if (loading) {
            setProgress(0);
            timer = window.setInterval(() => {
                setProgress((prev) => (prev < 90 ? prev + Math.random() * 2 : prev));
            }, 300);
        } else {
            setProgress(100);
            const finishTimer = window.setTimeout(() => setProgress(0), 500);
            return () => clearTimeout(finishTimer);
        }
        return () => clearInterval(timer);
    }, [loading]);

    const handleUpload = async () => {
        if (!videoFile) return;
        setLoading(true);
        setError("");
        setData(null);

        try {
            const formData = new FormData();
            formData.append("file", videoFile);

            const res = await fetch("http://localhost:8000/analyze", {
                method: "POST",
                body: formData,
            });

            const json = await res.json();
            const parsed: GeminiResponse = JSON.parse(json.result);
            setData(parsed);
        } catch (err) {
            setError("Failed to analyze video. Check console.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const severityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "low": return "severity-low";
            case "medium": return "severity-medium";
            case "high": return "severity-high";
            default: return "severity-unknown";
        }
    };

    const severityBadgeColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "low": return "severity-low-badge";
            case "medium": return "severity-medium-badge";
            case "high": return "severity-high-badge";
            default: return "severity-unknown-badge";
        }
    };

    const toCamelCase = (str: string) =>
        str
            .toLowerCase()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

    const toggleHelp = () => setShowHelp((prev) => !prev);

    return (
        <div className="app-container">
            <h1 className="app-title">UXStream Auditor</h1>

            <div className="upload-card-wrapper">
                <div className="upload-card">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="file-input"
                    />
                    {videoFile && <div className="file-name">{videoFile.name}</div>}
                    <button
                        onClick={handleUpload}
                        disabled={loading || !videoFile}
                        className="analyze-button"
                    >
                        {loading ? "Analyzing..." : "Analyze Video"}
                    </button>

                    {loading && (
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                    {error && <div className="error-text">{error}</div>}
                </div>

                <div className="help-wrapper">
                    <button className="help-button" onClick={toggleHelp}>
                        <FaQuestionCircle size={20} />
                    </button>
                    <span className="help-tooltip">Help / Instructions</span>
                </div>
            </div>

            {data && (
                <div className="results-container">
                    <div className="events-card">
                        <h2>Detected Events</h2>
                        <ul>
                            {data.events.map((e, i) => (
                                <li key={i} className={`event-item ${severityColor(e.severity)}`}>
                                    <div className="event-content">
                                        <span className="event-timestamp">[{e.timestamp}]</span>
                                        <span className="event-type">{e.type}</span> - {e.description}
                                    </div>
                                    <div className={`event-badge ${severityBadgeColor(e.severity)}`}>
                                        {e.severity}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="recommendation-card">
                        <h2>Recommendations</h2>
                        <ul>
                            {data.recommendation.map((rec, idx) => (
                                <li key={idx} className="recommendation-item">
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="scenarios-card">
                        <h2>Scenarios</h2>
                        <table className="scenarios-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Score</th>
                                <th>Risk</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.entries(data.scenarios).map(([key, val]) => (
                                <tr key={key} className="scenario-item">
                                    <td className="scenario-name">{toCamelCase(key === "baseline" ? "current" : key)}</td>
                                    <td>{val.score}</td>
                                    <td>
                                        <span className={`scenario-badge ${severityBadgeColor(val.risk)}`}>
                                            {val.risk}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showHelp && (
                <div className="modal-backdrop" onClick={toggleHelp}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>How to use UXStream Auditor</h2>
                        <div className="modal-body">
                            <p>UXStream Auditor is an AI Tool that analyze the uploaded video and generates a report regarding the User Experience that the AI considers that could be improved.</p>
                            <br/>
                            <h3>Instructions</h3>
                            <ol>
                                <li>Upload a video of the user interacting with your web/app/game interface.</li>
                                <li>Click "Analyze Video" and wait until the process completes.</li>
                                <li>Review detected events and severity to understand usability issues.</li>
                                <li>Check scenarios and recommendations to improve the user experience.</li>
                                <li>Use this feedback to iteratively refine your product and reduce user friction.</li>
                            </ol>
                            <br/>
                            <h3>Understanding the report</h3>
                            <p>The report will have 3 columns: Events, Recommendations and Scenarios</p>
                            <h4>Events</h4>
                            <p>Events will show moments on the video where the tool detected something wrong. Each event will be detailed with timestamp, type, description and severity.</p>
                            <p>To understand the Events, you should know what types and severities exist and what does each of them imply.</p>
                            <ul><b>Type (classification of the user friction with the product)</b>
                                <li>Error: Action failed to meet goal</li>
                                <li>Pause: Unintended stop in activity</li>
                                <li>Repetition: Redundant actions due to lack of feedback or similar</li>
                                <li>Hesitation: Uncertainty or delay in decision making</li>
                            </ul>
                            <br/>
                            <ul><b>Severity (impact on User Experience)</b>
                                <li>High: Prevents task completion or causes significant frustration</li>
                                <li>Medium: Noticeable break of flow</li>
                                <li>Low: Minor annoyance</li>
                            </ul>
                            <h4>Recommendations</h4>
                            <p>This is where the AI Tool will explain you the recommendations that thinks that could help improve the degradations noted on the UX.</p>
                            <i><p>Please note that these are AI given recommendations. Always double check the recommendations and use it as a complement and not as the main tool</p></i>
                            <h4>Scenarios</h4>
                            <p>On this card, you will have the projected scenarios referenced to each change applicable.</p>
                            <p>To understand the card, the important values to read are <b>Score</b> and <b>Risk</b>:</p>
                            <ul><b>Score</b>
                                <li>A predictive metric (0-100) representing the overall usability and user satisfaction expected from the scenario.</li>
                            </ul>
                            <br/>
                            <ul><b>Risk (The potential for negative consequences)</b>
                                <li>High: Significant change that could alienate users or require high dev effort</li>
                                <li>Medium: May cause minor side effects</li>
                                <li>Low: Safe improvement</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
