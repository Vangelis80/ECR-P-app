
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
    "finalcombinedoutcome", // super defensive
  ];

  // Try name-based detection
  for (const [key, value] of Object.entries(results)) {
    const nk = normalizeKey(key);
    if (candidates.includes(nk)) {
      return { key, value };
    }
  }

  // If none matched by name, try shape-based detection:
  // If exactly one non-object value exists, assume that's the overall.
  const nonObjects = Object.entries(results).filter(
    ([_, val]) => typeof val !== "object"
  );
  if (nonObjects.length === 1) {
    const [key, value] = nonObjects[0];
    return { key, value };
  }

  // If multiple non-objects exist, prefer the one whose key contains "overall" or "final"
  const heuristic = nonObjects.find(([key]) => {
    const nk = normalizeKey(key);
    return nk.includes("overall") || nk.includes("final");
  });
  if (heuristic) {
    const [key, value] = heuristic;
    return { key, value };
  }

  // Could not find an overall outcome
  return { key: null, value: null };
}

function App() {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);

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

  // Identify the overall outcome safely
  const { key: overallKey, value: overallOutcome } = findOverallOutcome(results);

  // Build the list of domain entries excluding the overall key (if detected)
  const domainEntries = Object.entries(results).filter(([k]) => k !== overallKey);

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
      {showResults && (
        <>
          {/* Overall Risk of Bias (separate box) */}
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

{/* --- Custom table-like graph (no grid lines) --- */}
<OutcomeMatrix results={results} overallOutcome={overallOutcome} />

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
                      {/* In case your object uses different keys */}
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
      )}
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

// A small colored circle
// Updated: dot with custom tooltip support
function OutcomeDot({ value }) {
  const label = String(value || "Not filled in");
  const cls = normalizeOutcome(value);

  return (
    <span
      className={`dot ${cls}`}
      data-tip={label}     // used by CSS ::after content
      tabIndex={0}         // focusable for keyboard/accessibility
      role="img"
      aria-label={label}   // screen reader text
    />
  );
}

// The matrix component
function OutcomeMatrix({ results, overallOutcome }) {
  // Build domain list excluding the overall key
  const domains = Object.entries(results).filter(
    ([k, v]) => typeof v === "object" // domain entries have objects
  );

  // Ensure we only show 5 domains as per your spec
  const firstFive = domains.slice(0, 5);

  // Extract study/policy outcomes per domain
  const studyOutcomes = firstFive.map(([_, res]) => res?.study_level);
  const policyOutcomes = firstFive.map(([_, res]) => res?.policy_level);

  return (
    <div className="outcome-matrix">
      {/* Row 1: headers */}
      <div className="cell header empty" />
      {firstFive.map((_, i) => (
        <div key={`h-${i}`} className="cell header">
          Domain {i + 1}
        </div>
      ))}
      <div className="cell header">Overall</div>

      {/* Row 2: Evidence + study level outcomes */}
      <div className="cell row-label">Evidence</div>
      {studyOutcomes.map((val, i) => (
        <div key={`study-${i}`} className="cell">
          <OutcomeDot value={val} />
        </div>
      ))}
      {/* Merged overall cell spans rows 2-3 */}
      <div className="cell overall merged">
        <OutcomeDot value={overallOutcome} />
      </div>

      {/* Row 3: Policies + policy level outcomes */}
      <div className="cell row-label">Policies</div>
      {policyOutcomes.map((val, i) => (
        <div key={`policy-${i}`} className="cell">
          <OutcomeDot value={val} />
        </div>
      ))}
      {/* Note: no cell here for last column; it's merged above */}
    </div>
  );
}

export default App;
