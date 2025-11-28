
import React, { useState } from "react";
import data from "./data/decision_tree_questions_final.json";
import { calculateOutcomes } from "./utils/calculateOutcomes";
import "./App.css";

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
    setResults(computed);
    setShowResults(true);
  };

  return (
    <div className="app">
     
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
      {Object.entries(data).map(([domain, content]) => {
        if (domain === "final_combined_outcome") return null;

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

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={computeResults} className="button">
          Compute Results
        </button>
      </div>

      {showResults && (
        <div className="results">
          <h2>Results</h2>
          {Object.entries(results).map(([domain, res]) => (
            <div key={domain} style={{ marginBottom: "15px" }}>
              <h3>{domain}</h3>
              {typeof res === "object" ? (
                <>
                  <p>
  <strong>Study Level Outcome:</strong>{" "}
  <span className={`outcome ${res.study_level.replace(/\s+/g, '-').toLowerCase()}`}>
    {res.study_level}
  </span>
</p>
<p>
  <strong>Policy Recommendations Outcome:</strong>{" "}
  <span className={`outcome ${res.policy_level.replace(/\s+/g, '-').toLowerCase()}`}>
    {res.policy_level}
  </span>
</p>
<p>
  <strong>Domain Combined Outcome:</strong>{" "}
  <span className={`outcome ${res.domain_outcome.replace(/\s+/g, '-').toLowerCase()}`}>
    {res.domain_outcome}
  </span>
                  </p>
                </>
              ) : (
                <p>
  <strong>Final Combined Outcome:</strong>{" "}
  <span className={`outcome ${res.replace(/\s+/g, '-').toLowerCase()}`}>
    {res}
  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
