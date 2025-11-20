
import React, { useState } from "react";
import data from "./data/decision_tree_questions_final.json"; // adjust path if needed
import { calculateOutcomes } from "./utils/calculateOutcomes";

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
  const computed = calculateOutcomes(answers, data); // Use your logic here
  setResults(computed);
  setShowResults(true);
};


  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h1 style=
{{ textAlign: "center" }}>
  <span>ECR-P</span>
  <div>Evidence Communication Rules for Policy</div>
</h1>

      {Object.entries(data).map(([domain, content]) => {
        if (domain === "final_combined_outcome") return null;

        return (
          <div key={domain} style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "20px", marginBottom: "20px" }}>
            <h2>{domain}</h2>

            {/* Study Level Section */}
            <h3>Study Level</h3>
            {content.study_level.questions.map((q) => (
              <div key={q.id} style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {q.id}. {q.question}
                </label>
                <select
                  value={
                    answers[domain]?.study_level?.[q.id] || ""
                  }
                  onChange={(e) => handleAnswerChange(domain, "study_level", q.id, e.target.value)}
                  style={{ width: "100%", padding: "8px" }}
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
            <h3>Policy Recommendations Level</h3>
            {content.policy_level.questions.map((q) => (
              <div key={q.id} style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {q.id}. {q.question}
                </label>
                <select
                  value={
                    answers[domain]?.policy_level?.[q.id] || ""
                  }
                  onChange={(e) => handleAnswerChange(domain, "policy_level", q.id, e.target.value)}
                  style={{ width: "100%", padding: "8px" }}
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
        <button
          onClick={computeResults}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Compute Results
        </button>
      </div>

      {showResults && (
        <div style={{ marginTop: "30px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
          <h2>Results</h2>
          {Object.entries(results).map(([domain, res]) => (
            <div key={domain} style={{ marginBottom: "15px" }}>
              <h3>{domain}</h3>
              {typeof res === "object" ? (
                <>
                  <p><strong>Study Level Outcome:</strong> {res.study_level}</p>
                  <p><strong>Policy Recommendations Outcome:</strong> {res.policy_level}</p>
                  <p><strong>Domain Combined Outcome:</strong> {res.domain_outcome}</p>
                </>
              ) : (
                <p><strong>Final Combined Outcome:</strong> {res}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App; 