export function calculateOutcomes(answers) {
  const outcome = {
    domain1: "Pending calculation",
  };

  // Example: Using mock logic until real calculation formulas are added
  if (!answers || Object.keys(answers).length === 0) {
    outcome.domain1 = "No answers provided";
    return outcome;
  }

  // Extract relevant answers for Domain 1 (example)
  const getAnswer = (id) => answers[id]?.toLowerCase?.() || "";

  // Example: Study Level (G4)
  const E4 = getAnswer("E4");
  const F4 = getAnswer("F4");
  const B4 = getAnswer("B4");
  const C4 = getAnswer("C4");
  const D4 = getAnswer("D4");

  // Simplified version of your Excel logic for now
  if (
    ["no", "probably no"].includes(F4) ||
    (["no", "probably no", "no information"].includes(E4) &&
      ["yes", "probably yes"].includes(F4))
  ) {
    outcome.domain1 = "High risk";
  } else if (
    ["no", "probably no", "no information"].includes(B4) &&
    ["yes", "probably yes"].includes(C4) &&
    ["yes", "probably yes"].includes(D4) &&
    ["yes", "probably yes"].includes(E4) &&
    ["yes", "probably yes"].includes(F4)
  ) {
    outcome.domain1 = "Some concerns";
  } else if (
    (["no", "probably no", "no information"].includes(C4) ||
      ["no", "probably no", "no information"].includes(D4)) &&
    ["yes", "probably yes"].includes(E4) &&
    ["yes", "probably yes"].includes(F4)
  ) {
    outcome.domain1 = "Some concerns";
  } else if (
    ["yes", "probably yes"].includes(B4) ||
    ["yes", "probably yes"].includes(C4) ||
    ["yes", "probably yes"].includes(D4) ||
    ["yes", "probably yes"].includes(E4) ||
    ["yes", "probably yes"].includes(F4)
  ) {
    outcome.domain1 = "Low risk";
  } else {
    outcome.domain1 = "Not filled in";
  }

  return outcome;
}