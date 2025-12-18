// ===============================================
// calculateOutcomes.js
// Logic converted from Excel formulas
// ===============================================

// ✅ Helper utilities
const yes = ["yes", "probably yes"];
const no = ["no", "probably no"];
const noInfo = ["no information"];

function isYes(v) {
  return yes.includes((v || "").toLowerCase());
}
function isNo(v) {
  return no.includes((v || "").toLowerCase());
}
function isNoInfo(v) {
  return noInfo.includes((v || "").toLowerCase());
}
function isNoLike(v) {
  return isNo(v) || isNoInfo(v);
}
function allYes(values) {
  return values.every(isYes);
}
function anyYes(values) {
  return values.some(isYes);
}
function anyNoLike(values) {
  return values.some(isNoLike);
}
function allLowRisk(values) {
  return values.every(v => v === "low risk");
}
function anyHighRisk(values) {
  return values.some(v => v === "high risk");
}
function anySomeConcerns(values) {
  return values.some(v => v === "some concerns");
}
function anyEmpty(values) {
  return values.some(v => !v || v === "not filled in");
}

// ===============================================
// DOMAIN 1
// ===============================================

// G4
export function domain1Study({ B, C, D, E, F }) {
  // Treat D as optional if C is no-like
  const Dvalue = isNoLike(C) ? D || "not filled in" : D;

  // Rule: If C is yes-like, D must be filled in
  if (isYes(C) && !D) return "not filled in";

  // High risk conditions
  if (
    isNo(F) ||
    (isNoLike(E) && isYes(F))
  ) return "high risk";

  // Some concerns conditions
  if (
    isNoLike(B) &&
    allYes([C, Dvalue, E, F])
  ) return "some concerns";

  if (
    anyNoLike([C, Dvalue]) &&
    anyYes([E, F])
  ) return "some concerns";

  // Low risk condition
  if (anyYes([B, C, Dvalue, E, F])) return "low risk";

  return "not filled in";
}

// M4 
export function domain1Policy({ G, H, I, J, K }) {
  // Rule 0: Not filled in
  if (anyEmpty([G, H, I, J, K])) return "not filled in";
  
  // Rule 1: If K is "no" or "probably no" → high risk
  if (isNo(K)) return "high risk";

  // Rule 2: If K is yes-like AND I is no-like → high risk
  if (isYes(K) && isNoLike(I)) return "high risk";

  // Rule 3: If K is yes-like AND J is no-like → some concerns
  if (isYes(K) && isNoLike(J)) return "some concerns";

  // Rule 4: If all answers are yes or probably yes → low risk
  if (allYes([G, H, I, J, K])) return "low risk";

  // Rule 5: Otherwise → some concerns
  return "some concerns";
}

// N4
export function domain1Combined(study, policy) {
  if (anyEmpty([study, policy])) return "";
  if (study === "high risk" || policy === "high risk") return "high risk";
  if (study === "some concerns" || policy === "some concerns") return "some concerns";
  if (study === "low risk" && policy === "low risk") return "low risk";
  return "Error: Review";
}

// ===============================================
// DOMAIN 2
// ===============================================

// Q4
export function domain2Study({ O, P }) {
  if (
    (isYes(O) && isYes(P)) ||
    (isYes(O) && P === "probably yes") ||
    (O === "probably yes" && isYes(P)) ||
    (O === "probably yes" && P === "probably yes")
  ) return "low risk";

  if (isNo(O) || O === "probably no") return "high risk";

  if (
    (isYes(O) && (isNo(P) || P === "probably no" || P === "no information")) ||
    (O === "probably yes" && (isNo(P) || P === "probably no" || P === "no information"))
  ) return "some concerns";

  return "not filled in";
}

// U4

export function domain2Policy({ R, S, T }) {
  // 1. If R or S is empty → not filled in
  if (!R || R === "not filled in" || !S || S === "not filled in") {
    return "not filled in";
  }

  // 2. If S is yes-like and T is empty → not filled in
  if (isYes(S) && (!T || T === "not filled in")) {
    return "not filled in";
  }

  // Now apply table-based logic:

  // ✅ Low risk
  if (isYes(R) && isYes(S) && isYes(T)) {
    return "low risk";
  }

  // ✅ Some concerns
  if (isYes(R) && isYes(S) && isNoLike(T)) {
    return "some concerns";
  }

 
  // ✅ High risk cases
  if (
    (isYes(R) && isNoLike(S) && (!T || isNoLike(T))) || // yes-like R, no-like S
-   (isNoLike(R) && isYes(S) && (!T || isYes(T))) ||    // no-like R, yes-like S
+   (isNoLike(R) && isYes(S)) ||                        // no-like R, yes-like S (T already required above)
    (isNoLike(R) && isNoLike(S))                        // both no-like
  ) {
    return "high risk";
  }

  // ✅ If nothing matches, fallback
  return "not filled in";
}


// V4
export function domain2Combined(study, policy) {
  if (anyEmpty([study, policy])) return "";
  if (anyHighRisk([study, policy])) return "high risk";
  if (anySomeConcerns([study, policy])) return "some concerns";
  if (allLowRisk([study, policy])) return "low risk";
  return "Error: Review";
}

// ===============================================
// DOMAIN 3
// ===============================================

// Y4
export function domain3Study({ W, X }) {
  if (
    (isYes(W) && isYes(X)) ||
    (isYes(W) && X === "probably yes") ||
    (W === "probably yes" && isYes(X)) ||
    (W === "probably yes" && X === "probably yes")
  ) return "low risk";

  if (isNoLike(W)) return "high risk";

  if (
    (isYes(W) && isNoLike(X)) ||
    (W === "probably yes" && isNoLike(X))
  ) return "some concerns";

  return "not filled in";
}

// AB4
export function domain3Policy({ Z, AA }) {
  if (
    (isYes(Z) && isYes(AA)) ||
    (isYes(Z) && AA === "probably yes") ||
    (Z === "probably yes" && isYes(AA)) ||
    (Z === "probably yes" && AA === "probably yes")
  ) return "low risk";

  if (isNoLike(Z)) return "high risk";

  if (
    (isYes(Z) && isNoLike(AA)) ||
    (Z === "probably yes" && isNoLike(AA))
  ) return "some concerns";

  return "not filled in";
}

// AC4
export function domain3Combined(study, policy) {
  if (anyEmpty([study, policy])) return "";
  if (anyHighRisk([study, policy])) return "high risk";
  if (anySomeConcerns([study, policy])) return "some concerns";
  if (allLowRisk([study, policy])) return "low risk";
  return "Error: Review";
}

// ===============================================
// DOMAIN 4
// ===============================================

// AF4
export function domain4Study({ AD, AE }) {
  if (
    (isYes(AD) && isYes(AE)) ||
    (isYes(AD) && AE === "probably yes") ||
    (AD === "probably yes" && isYes(AE)) ||
    (AD === "probably yes" && AE === "probably yes")
  ) return "low risk";

  if (isNoLike(AD)) return "high risk";

  if (
    (isYes(AD) && isNoLike(AE)) ||
    (AD === "probably yes" && isNoLike(AE))
  ) return "some concerns";

  return "not filled in";
}

// AH4
export function domain4Policy({ AG }) {
  const ag = (AG || "").trim().toLowerCase(); // normalize case and trim spaces

  if (ag === "no information") return "some concerns";
  if (["probably yes", "yes"].includes(ag)) return "low risk";
  if (["no", "probably no"].includes(ag)) return "high risk";
  return "not filled in";
}

// AI4
export function domain4Combined(study, policy) {
  if (anyEmpty([study, policy])) return "";
  if (study === "high risk" && policy === "high risk") return "high risk";
  if (anyHighRisk([study, policy]) || anySomeConcerns([study, policy])) return "some concerns";
  if (allLowRisk([study, policy])) return "low risk";
  return "Error: Review";
}

// ===============================================
// DOMAIN 5
// ===============================================

// AK4
export function domain5Study({ AJ }) {
  const aj = (AJ || "").trim().toLowerCase(); // normalize case and trim spaces

  if (aj === "no information") return "some concerns";
  if (["probably yes", "yes"].includes(aj)) return "low risk";
  if (["no", "probably no"].includes(aj)) return "high risk";
  return "not filled in";
}

// AN4
export function domain5Policy({ AL, AM }) {
  if (
    (isYes(AL) && isYes(AM)) ||
    (isYes(AL) && AM === "probably yes") ||
    (AL === "probably yes" && isYes(AM)) ||
    (AL === "probably yes" && AM === "probably yes")
  ) return "low risk";

  if (
    (isYes(AL) && isNoLike(AM)) ||
    (AL === "probably yes" && isNoLike(AM))
  ) return "some concerns";

  if (
    (isNoLike(AL) && isNoLike(AM)) ||
    (isNoLike(AL) && isYes(AM))
  ) return "high risk";

  return "not filled in";
}

// AO4
export function domain5Combined(study, policy) {
  if (anyEmpty([study, policy])) return "";
  if (study === "high risk" && policy === "high risk") return "high risk";
  if (anyHighRisk([study, policy]) || anySomeConcerns([study, policy])) return "some concerns";
  if (allLowRisk([study, policy])) return "low risk";
  return "Error: Review";
}

// ===============================================
// FINAL OUTCOME
// ===============================================

// AP4
export function finalOutcome(domains) {
  if (anyEmpty(domains)) return "";
  if (anyHighRisk(domains)) return "high risk";
  if (anySomeConcerns(domains)) return "some concerns";
  if (allLowRisk(domains)) return "low risk";
  return "Error: Review";
}
// ==============================
// Mapping Functions. 
// ==============================

// Domain 1: Inform not persuade
function mapDomain1Answers(studyAnswers = {}, policyAnswers = {}) {
  return {
    study: {
      B: studyAnswers["1.1"], // Were the aims/objectives for the study defined?
      C: studyAnswers["1.2"], // Were the limitations of the study findings reported?
      D: studyAnswers["1.2.1"], // If yes/probably yes to 1.2: Did the study propose ways to reduce limitations?
      E: studyAnswers["1.3"], // Were the study conclusions clearly connected to the findings?
      F: studyAnswers["1.4"]  // Was emotive language avoided in communicating study findings?
    },
    policy: {
      G: policyAnswers["1.5"], // Were the aims/objectives for the policy recommendations defined?
      H: policyAnswers["1.6"], // Were the limitations of the policy recommendations reported?
      I: policyAnswers["1.7"], // Were the policy recommendations clearly connected to the findings?
      J: policyAnswers["1.8"], // Was accessible language used for the policy recommendations?
      K: policyAnswers["1.9"]  // Was emotive language avoided in policy recommendations?
    }
  };
}

// Domain 2: Offer balance, not false balance
function mapDomain2Answers(studyAnswers = {}, policyAnswers = {}) {
  return {
    study: {
      O: studyAnswers["2.1"], // Were all aspects of the study findings reported?
      P: studyAnswers["2.2"]  // Was an appropriate reporting guideline used?
    },
    policy: {
      R: policyAnswers["2.3"], // Were multiple implications of the policy recommendations considered?
      S: policyAnswers["2.4"], // Was the existence of a current policy discussed?
      T: policyAnswers["2.4.1"] // If yes/probably yes to 2.4: Was not changing the current policy considered?
    }
  };
}

// Domain 3: Disclose uncertainties
function mapDomain3Answers(studyAnswers = {}, policyAnswers = {}) {
  return {
    study: {
      W: studyAnswers["3.1"], // Were uncertainties of the study findings reported?
      X: studyAnswers["3.1.1"] // If yes/probably yes to 3.1: Did the study propose ways to reduce uncertainties?
    },
    policy: {
      Z: policyAnswers["3.2"], // Were uncertainties of the policy recommendations reported?
      AA: policyAnswers["3.2.1"] // If yes/probably yes to 3.2: Did the study adopt a precautionary principle perspective?
    }
  };
}

// Domain 4: State evidence quality
function mapDomain4Answers(studyAnswers = {}, policyAnswers = {}) {
  return {
    study: {
      AD: studyAnswers["4.1"], // Was the quality of the evidence used in the analysis considered?
      AE: studyAnswers["4.1.1"]  // If yes/probably yes to 3.2: Were specific metrics of evidence quality used?
    },
    policy: {
      AG: policyAnswers["4.2"] // Was the quality of the study findings, that formulated the evidence base for the policy recommendations, considered?
    }
  };
}

// Domain 5: Pre-empt misunderstandings
function mapDomain5Answers(studyAnswers = {}, policyAnswers = {}) {
  return {
    study: {
      AJ: studyAnswers["5.1"] // Were potential misunderstandings about the study findings and conclusions pre-emptively addressed?
    },
    policy: {
      AL: policyAnswers["5.2"], // Was the targeted audience for policy recommendations defined?
      AM: policyAnswers["5.3"]  // Were potential misunderstandings for policy recommendations and potential concerns of the policy makers pre-emptively addressed?
    }
  };
}


// ==============================
// Wrapper Function
// ==============================
export function calculateOutcomes(answers) {
  // Domain 1
  const domain1Answers = answers["Domain 1: Inform not persuade"] || {};
  const mappedDomain1 = mapDomain1Answers(domain1Answers.study_level, domain1Answers.policy_level);
  const domain1StudyResult = domain1Study(mappedDomain1.study);
  const domain1PolicyResult = domain1Policy(mappedDomain1.policy);
  const domain1CombinedResult = domain1Combined(domain1StudyResult, domain1PolicyResult);

  // Domain 2
  const domain2Answers = answers["Domain 2: Offer balance, not false balance"] || {};
  const mappedDomain2 = mapDomain2Answers(domain2Answers.study_level, domain2Answers.policy_level);
  const domain2StudyResult = domain2Study(mappedDomain2.study);
  const domain2PolicyResult = domain2Policy(mappedDomain2.policy);
  const domain2CombinedResult = domain2Combined(domain2StudyResult, domain2PolicyResult);

  // Domain 3
  const domain3Answers = answers["Domain 3: Disclose uncertainties"] || {};
  const mappedDomain3 = mapDomain3Answers(domain3Answers.study_level, domain3Answers.policy_level);
  const domain3StudyResult = domain3Study(mappedDomain3.study);
  const domain3PolicyResult = domain3Policy(mappedDomain3.policy);
  const domain3CombinedResult = domain3Combined(domain3StudyResult, domain3PolicyResult);

  // Domain 4
  const domain4Answers = answers["Domain 4: State evidence quality"] || {};
  const mappedDomain4 = mapDomain4Answers(domain4Answers.study_level, domain4Answers.policy_level);
  const domain4StudyResult = domain4Study(mappedDomain4.study);
  const domain4PolicyResult = domain4Policy(mappedDomain4.policy);
  const domain4CombinedResult = domain4Combined(domain4StudyResult, domain4PolicyResult);

  // Domain 5
  const domain5Answers = answers["Domain 5: Pre-empt misunderstandings"] || {};
  const mappedDomain5 = mapDomain5Answers(domain5Answers.study_level, domain5Answers.policy_level);
  const domain5StudyResult = domain5Study(mappedDomain5.study);
  const domain5PolicyResult = domain5Policy(mappedDomain5.policy);
  const domain5CombinedResult = domain5Combined(domain5StudyResult, domain5PolicyResult);

  // Final combined outcome
  const finalCombined = finalOutcome([
    domain1CombinedResult,
    domain2CombinedResult,
    domain3CombinedResult,
    domain4CombinedResult,
    domain5CombinedResult
  ]);

  return {
    "Domain 1: Inform not persuade": {
      study_level: domain1StudyResult,
      policy_level: domain1PolicyResult,
      domain_outcome: domain1CombinedResult
    },
    "Domain 2: Offer balance, not false balance": {
      study_level: domain2StudyResult,
      policy_level: domain2PolicyResult,
      domain_outcome: domain2CombinedResult
    },
    "Domain 3: Disclose uncertainties": {
      study_level: domain3StudyResult,
      policy_level: domain3PolicyResult,
      domain_outcome: domain3CombinedResult
    },
    "Domain 4: State evidence quality": {
      study_level: domain4StudyResult,
      policy_level: domain4PolicyResult,
      domain_outcome: domain4CombinedResult
    },
    "Domain 5: Pre-empt misunderstandings": {
      study_level: domain5StudyResult,
      policy_level: domain5PolicyResult,
      domain_outcome: domain5CombinedResult
   
},
    "Overall Risk of Bias assessment": finalCombined
  };
}
