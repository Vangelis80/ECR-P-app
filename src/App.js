
import React, { useState } from "react";
import data from "./data/decision_tree_questions_final.json";
import { calculateOutcomes } from "./utils/calculateOutcomes";
import "./App.css";

function normalizeKey(key) {
  return String(key).trim().toLowerCase().replace(/\s+/g, "_");
}

function findOverallOutcome(results) {
  if (!results || typeof results !== "object") return { key: null, value: null };

  const candidates = [
    "final_combined_outcome",
    "final_outcome",
    "overall",
    "overall_outcome",
    "overall_risk",
    "overall_risk_of_bias",
    "risk_of_bias_overall",
    "overallassessment",
    "finalcombinedoutcome",
  ];

  for (const [key, value] of Object.entries(results)) {
    const nk = normalizeKey(key);
    if (candidates.includes(nk)) {
      return { key, value };
    }
  }

  const nonObjects = Object.entries(results).filter(([_, val]) => typeof val !== "object");
  if (nonObjects.length === 1) {
    const [key, value] = nonObjects[0];
    return { key, value };
  }

  const heuristic = nonObjects.find(([key]) => {
    const nk = normalizeKey(key);
    return nk.includes("overall") || nk.includes("final");
  });
  if (heuristic) {
    const [key, value] = heuristic;
    return { key, value };
  }

  return { key: null, value: null };
}

function App() {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false); // ✅ Added state for instructions

  const handleAnswerChange = (domain, level, qid, value) => {
    setAnswers((prev) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        [level]: {
          ...((prev[domain] && prev[domain][level]) || {}),
          [qid]: value,
        },
      },
    }));
  };

  const computeResults = () => {
    const computed = calculateOutcomes(answers, data);
    console.log("[computeResults] computed:", computed);
    setResults(computed || {});
    setShowResults(true);
  };

  const { key: overallKey, value: overallOutcome } = findOverallOutcome(results);
  const domainEntries = Object.entries(results).filter(([k]) => k !== overallKey);

  // ✅ CSV Download Function
  const downloadCSV = (data) => {
    if (!data || Object.keys(data).length === 0) return;

    const q = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = [];

    for (const [domain, res] of Object.entries(data)) {
      if (normalizeKey(domain) === normalizeKey(overallKey)) continue;

      const study = res && typeof res === "object" ? (res.study_level ?? "") : "";
      const policy = res && typeof res === "object" ? (res.policy_level ?? "") : "";
      const domainOutcome =
        res && typeof res === "object"
          ? (res.domain_outcome ?? "")
          : (typeof res === "string" ? res : "");

      rows.push([domain, study, policy, domainOutcome]);
    }

    if (overallOutcome !== null && overallOutcome !== undefined) {
      rows.push(["Overall Outcome", "", "", overallOutcome]);
    }

    const headers = ["Domain", "Study Level", "Policy Level", "Domain Outcome"];
    const lines = [
      headers.map(q).join(","),
      ...rows.map((r) => r.map(q).join(",")),
    ];

    const csvContent = lines.join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ECR-P-results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      {/* Header */}
      <div
        style={{
          backgroundColor: "#A3C1AD", // Cambridge Blue
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          marginBottom: "24px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px", color: "#2c4f3e" }}>ECR-P</h1>
        <div style={{ fontSize: "16px", color: "#2c4f3e" }}>
          Evidence Communication Rules for Policy
        </div>
      </div>

      {/* ✅ Instructions Toggle */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          cursor: "pointer",
          color: "#2c4f3e",
          fontWeight: "bold",
        }}
        onClick={() => setShowInstructions(!showInstructions)}
      >
        Click here for instructions {showInstructions ? "▲" : "▼"}
      </div>

      {/* ✅ Collapsible Instructions */}
      <div
        style={{
          maxHeight: showInstructions ? "500px" : "0",
          overflow: "hidden",
          transition: "max-height 0.5s ease",
          backgroundColor: "#f9f9f9",
          padding: showInstructions ? "15px" : "0 15px",
          borderRadius: "8px",
          boxShadow: showInstructions ? "0 2px 6px rgba(0, 0, 0, 0.1)" : "none",
          marginBottom: "24px",
          fontSize: "14px",
          color: "#333",
        }}
      >
        {showInstructions && (
          <div>
            Welcome to <strong>ECR-P!</strong> This tool can help you appraise
            the quality of evidence and policy recommendations. Answer the
            questions in each domain using the drop down menus and then click {" "}
            <strong>Compute Results</strong>. You can also Download the Results
            in a CSV file. More information on the tool can be found on the open
            access paper{" "}
            <a
              href="https://link.springer.com/article/10.1186/s13643-025-02757-8"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2c4f3e", fontWeight: "bold" }}
            >
              Evidence Communication Rules for Policy (ECR-P) critical appraisal tool
            </a>
            .
          </div>
        )}
      </div>

      {/* Question cards */}
      {Object.entries(data).map(([domain, content]) => {
        if (normalizeKey(domain) === "final_combined_outcome") return null;

        return (
          <div key={domain} className="domain-card">
            <h2>{domain}</h2>

            {/* Study Level Section */}
            <h3 className="section-title">Study Level</h3>
            {content.study_level.questions.map((q) => (
              <div key={q.id} className="question">
                <label>
                  {q.id}. {q.question}
                </label>
                <select
                  value={answers[domain]?.study_level?.[q.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(domain, "study_level", q.id, e.target.value)
                  }
                  className="select"
                >
                  <option value="">Select an answer</option>
                  {q.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Policy Recommendations Section */}
            <h3 className="section-title">Policy Recommendations Level</h3>
            {content.policy_level.questions.map((q) => (
              <div key={q.id} className="question">
                <label>
                  {q.id}. {q.question}
                </label>
                <select
                  value={answers[domain]?.policy_level?.[q.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(domain, "policy_level", q.id, e.target.value)
                  }
                  className="select"
                >
                  <option value="">Select an answer</option>
                  {q.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );
      })}

      {/* Compute button */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={computeResults} className="button">
          Compute Results
        </button>
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
          Scroll down for results
        </p>
      </div>

      {/* Results */}
      {showResults ? (
        <>
          {/* Overall Risk of Bias */}
          {overallOutcome !== null && overallOutcome !== undefined ? (
            <div className="overall-outcome-card">
              <h2>Overall Risk of Bias</h2>
              <p>
                <span
                  className={`outcome ${String(overallOutcome)
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`}
                >
                  {String(overallOutcome)}
                </span>
              </p>
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "14px",
                  color: "#555",
                  fontWeight: "normal",
                  lineHeight: "1.6",
                }}
              >
                <div>low risk of bias = high quality</div>
                <div>some concerns = moderate quality</div>
                <div>high risk of bias = low quality</div>
              </div>
            </div>
          ) : (
            <div className="overall-outcome-card missing">
              <h2>Overall Risk of Bias</h2>
              <p style={{ color: "#b71c1c" }}>
                Could not determine the overall outcome. Check the shape/key of the
                result from <code>calculateOutcomes</code>.
              </p>
              <details>
                <summary>Debug: results object</summary>
                <pre style={{ textAlign: "left", overflow: "auto" }}>
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Matrix */}
          <OutcomeMatrix results={results} overallOutcome={overallOutcome} />

          {/* Download CSV Button */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={() => downloadCSV(results)} className="button">
              Download Results (CSV)
            </button>
          </div>

          {/* Domain-by-domain results */}
          <div className="results">
            <h2>Results by Domain</h2>
            {domainEntries.length === 0 ? (
              <p>No domain results to display.</p>
            ) : (
              domainEntries.map(([domain, res]) => (
                <div key={domain} style={{ marginBottom: "15px" }}>
                  <h3>{domain}</h3>
                  {res && typeof res === "object" ? (
                    <>
                      {res.study_level && (
                        <p>
                          <strong>Study Level Outcome:</strong>{" "}
                          <span
                            className={`outcome ${String(res.study_level)
                              .replace(/\s+/g, "-")
                              .toLowerCase()}`}
                          >
                            {res.study_level}
                          </span>
                        </p>
                      )}
                      {res.policy_level && (
                        <p>
                          <strong>Policy Recommendations Outcome:</strong>{" "}
                          <span
                            className={`outcome ${String(res.policy_level)
                              .replace(/\s+/g, "-")
                              .toLowerCase()}`}
                          >
                            {res.policy_level}
                          </span>
                        </p>
                      )}
                      {res.domain_outcome && (
                        <p>
                          <strong>Domain Combined Outcome:</strong>{" "}
                          <span
                            className={`outcome ${String(res.domain_outcome)
                              .replace(/\s+/g, "-")
                              .toLowerCase()}`}
                          >
                            {res.domain_outcome}
                          </span>
                        </p>
                      )}
                      {Object.entries(res)
                        .filter(
                          ([k]) =>
                            !["study_level", "policy_level", "domain_outcome"].includes(
                              normalizeKey(k)
                            )
                        )
                        .map(([k, v]) => (
                          <p key={k}>
                            <strong>{k}:</strong>{" "}
                            <span
                              className={`outcome ${String(v)
                                .replace(/\s+/g, "-")
                                .toLowerCase()}`}
                            >
                              {String(v)}
                            </span>
                          </p>
                        ))}
                    </>
                  ) : (
                    <p>
                      <strong>Outcome:</strong>{" "}
                      <span
                        className={`outcome ${String(res)
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`}
                      >
                        {String(res)}
                      </span>
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

// Helper: normalize outcome into classes
function normalizeOutcome(value) {
  const v = String(value || "not filled in").trim().toLowerCase();
  if (v.includes("high")) return "high-risk";
  if (v.includes("some")) return "some-concerns";
  if (v.includes("low")) return "low-risk";
  return "not-filled-in";
}

// A small colored circle with tooltip
function OutcomeDot({ value }) {
  const label = String(value || "Not filled in");
  const cls = normalizeOutcome(value);

  return (
    <span
      className={`dot ${cls}`}
      data-tip={label}
      tabIndex={0}
      role="img"
      aria-label={label}
    />
  );
}

// The matrix component
function OutcomeMatrix({ results, overallOutcome }) {
  const domains = Object.entries(results).filter(([k, v]) => typeof v === "object");
  const firstFive = domains.slice(0, 5);
  const studyOutcomes = firstFive.map(([_, res]) => res?.study_level);
  const policyOutcomes = firstFive.map(([_, res]) => res?.policy_level);

  return (
    <div className="outcome-matrix">
      <div className="cell header empty" />
      {firstFive.map((_, i) => (
        <div key={`h-${i}`} className="cell header">
          Domain {i + 1}
        </div>
      ))}
      <div className="cell header">Overall</div>

      <div className="cell row-label">Evidence</div>
      {studyOutcomes.map((val, i) => (
        <div key={`study-${i}`} className="cell">
          <OutcomeDot value={val} />
        </div>
      ))}
      <div className="cell overall merged">
        <OutcomeDot value={overallOutcome} />
      </div>

      <div className="cell row-label">Policies</div>
      {policyOutcomes.map((val, i) => (
        <div key={`policy-${i}`} className="cell">
          <OutcomeDot value={val} />
        </div>
      ))}
    </div>
  );
}

export default App;
