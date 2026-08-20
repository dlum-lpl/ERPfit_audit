const defaultCategories = [
  {
    id: "automation",
    title: "Process automation",
    description: "How consistently do routine tasks move forward without manual chasing?",
    questions: [
      { text: "How are recurring tasks, approvals and handovers managed?", signal: "Manual chasing and unclear ownership can slow work down.", improvement: "Map recurring work, assign owners and automate simple reminders." },
      { text: "How often is the same information copied from one step or file to another?", signal: "Repeated data entry creates avoidable effort and errors.", improvement: "Remove duplicate entry by standardising forms and connecting systems." }
    ]
  },
  {
    id: "systems",
    title: "Systems & integration",
    description: "Can your core systems share information reliably?",
    questions: [
      { text: "How connected are your CRM, accounting, inventory or operations systems?", signal: "Disconnected systems make it harder to act on a complete customer or order view.", improvement: "Prioritise one high-value connection between the systems your team uses most." },
      { text: "When a process changes, how easily can your systems and team follow the new workflow?", signal: "Workarounds often indicate that systems do not match the real process.", improvement: "Document the intended workflow before selecting or configuring more software." }
    ]
  },
  {
    id: "data",
    title: "Data quality",
    description: "Can people trust the information they use to make decisions?",
    questions: [
      { text: "How consistent are customer, product and supplier records across your files and systems?", signal: "Inconsistent records make reporting and follow-up less reliable.", improvement: "Set one source of truth and simple rules for creating and updating records." },
      { text: "How much time is spent checking, correcting or reconciling data?", signal: "Time spent cleaning data is a visible symptom of process friction.", improvement: "Add validation at the point where information first enters the business." }
    ]
  },
  {
    id: "sales",
    title: "Sales & customer processes",
    description: "Does every customer enquiry receive timely, visible and consistent follow-up?",
    questions: [
      { text: "How are leads, quotations and follow-ups tracked from first contact to close?", signal: "Untracked follow-up can mean warm opportunities depend on individual memory.", improvement: "Create a shared pipeline with clear stages, owners and next actions." },
      { text: "How quickly can a team member see a customer’s history, open requests and next step?", signal: "Scattered customer information can create inconsistent service.", improvement: "Bring customer interactions into one accessible record and define response triggers." }
    ]
  },
  {
    id: "operations",
    title: "Operations & finance",
    description: "Are core fulfilment and financial controls consistent enough to scale?",
    questions: [
      { text: "How standardised are purchasing, fulfilment, invoicing and payment processes?", signal: "Process variation can cause delays, rework and missed controls.", improvement: "Document the standard flow and automate repeatable checks and notifications." },
      { text: "How easy is it to see order status, cash position and operational exceptions?", signal: "Late visibility can make small issues more expensive to resolve.", improvement: "Define a short list of operational and finance indicators for weekly review." }
    ]
  },
  {
    id: "reporting",
    title: "Reporting & visibility",
    description: "Can leaders get a dependable view of performance without spreadsheet hunting?",
    questions: [
      { text: "How much manual work is needed to prepare regular management reports?", signal: "Manual reporting consumes time that could be spent interpreting results.", improvement: "Agree on the decisions the report supports, then automate the data pull." },
      { text: "Can you trace a report figure back to a clear, trusted source?", signal: "Unclear data lineage makes it difficult to act with confidence.", improvement: "Name report owners, sources and definitions for the measures that matter most." }
    ]
  },
  {
    id: "ai",
    title: "AI readiness",
    description: "Do your processes and data provide a safe foundation for useful AI?",
    questions: [
      { text: "How clearly are repeatable workflows, rules and responsibilities documented?", signal: "AI works best when the underlying process is understood and consistent.", improvement: "Start with a well-defined, low-risk workflow and a measurable outcome." },
      { text: "How confident are you that people can access accurate data with appropriate controls?", signal: "Poor data quality or unclear access can limit safe AI adoption.", improvement: "Improve data ownership, permissions and quality before scaling AI use cases." }
    ]
  }
];

const defaultAnswerLevels = [
  { label: "Not in place", score: 0 },
  { label: "Mostly manual", score: 33 },
  { label: "Partly consistent", score: 67 },
  { label: "Consistent & connected", score: 100 }
];

const categories = window.auditConfig?.categories || defaultCategories;
const answerLevels = window.auditConfig?.answerLevels || defaultAnswerLevels;

let currentStep = 0;
let latestResults = null;
const answers = {};

const introScreen = document.getElementById("intro-screen");
const auditScreen = document.getElementById("audit-screen");
const resultsScreen = document.getElementById("results-screen");
const questionList = document.getElementById("question-list");
const formMessage = document.getElementById("form-message");
const backButton = document.getElementById("back-button");
const nextButton = document.getElementById("next-button");

function getCategory() {
  return categories[currentStep];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCategory() {
  const category = getCategory();
  const stepNumber = String(currentStep + 1).padStart(2, "0");
  const percent = Math.round(((currentStep + 1) / categories.length) * 100);

  document.getElementById("category-number").textContent = stepNumber;
  document.getElementById("category-kicker").textContent = `Category ${stepNumber}`;
  document.getElementById("category-title").textContent = category.title;
  document.getElementById("category-description").textContent = category.description;
  document.getElementById("step-label").textContent = `${currentStep + 1} of ${categories.length}`;
  document.getElementById("progress-percent").textContent = `${percent}%`;
  document.getElementById("progress-bar").style.width = `${percent}%`;
  backButton.classList.toggle("hidden", currentStep === 0);
  nextButton.innerHTML = currentStep === categories.length - 1 ? "See my results <span aria-hidden=\"true\">→</span>" : "Next category <span aria-hidden=\"true\">→</span>";
  formMessage.textContent = "";

  questionList.innerHTML = category.questions.map((question, questionIndex) => {
    const questionId = `${category.id}-${questionIndex}`;
    const selected = answers[questionId];
    const questionOptions = category.questions[questionIndex].options || answerLevels;
    const options = questionOptions.map((level, levelIndex) => `
      <div class="answer-option">
        <input type="radio" id="${questionId}-${levelIndex}" name="${questionId}" value="${level.score}" ${selected === level.score ? "checked" : ""}>
        <label for="${questionId}-${levelIndex}">${escapeHtml(level.label)}</label>
      </div>
    `).join("");

    return `
      <article class="question-card">
        <span class="question-number">QUESTION ${questionIndex + 1}</span>
        <p class="question-text">${escapeHtml(question.text)}</p>
        <div class="answer-options">${options}</div>
      </article>
    `;
  }).join("");

  questionList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      answers[input.name] = Number(input.value);
      formMessage.textContent = "";
    });
  });
}

function categoryIsComplete() {
  const category = getCategory();
  return category.questions.every((_, questionIndex) => answers[`${category.id}-${questionIndex}`] !== undefined);
}

function showAudit() {
  introScreen.classList.add("hidden");
  resultsScreen.classList.add("hidden");
  auditScreen.classList.remove("hidden");
  renderCategory();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveCurrentCategory() {
  questionList.querySelectorAll("input:checked").forEach((input) => {
    answers[input.name] = Number(input.value);
  });
}

function handleNext() {
  saveCurrentCategory();
  if (!categoryIsComplete()) {
    formMessage.textContent = "Please answer both questions before continuing.";
    return;
  }
  if (currentStep < categories.length - 1) {
    currentStep += 1;
    renderCategory();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    showResults();
  }
}

function handleBack() {
  saveCurrentCategory();
  if (currentStep > 0) {
    currentStep -= 1;
    renderCategory();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function getCategoryScore(category) {
  return Math.round(category.questions.reduce((sum, _, questionIndex) => sum + answers[`${category.id}-${questionIndex}`], 0) / category.questions.length);
}

function getBand(score) {
  if (score >= 70) return { label: "Strong", className: "good" };
  if (score >= 50) return { label: "Developing", className: "watch" };
  return { label: "Priority", className: "priority" };
}

function scoreLabel(score) {
  if (score >= 80) return "Connected";
  if (score >= 60) return "Developing well";
  if (score >= 40) return "Developing";
  return "Foundational";
}

function getQuestionResponses() {
  return categories.map((category) => ({
    title: category.title,
    questions: category.questions.map((question, questionIndex) => {
      const score = answers[`${category.id}-${questionIndex}`];
      const options = question.options || answerLevels;
      const selectedOption = options.find((option) => option.score === score);
      return {
        question: question.text,
        response: selectedOption ? selectedOption.label : "Not answered",
        score
      };
    })
  }));
}

function showResults() {
  const scoredCategories = categories.map((category) => ({ ...category, score: getCategoryScore(category) }));
  const overall = Math.round(scoredCategories.reduce((sum, category) => sum + category.score, 0) / scoredCategories.length);
  const strong = scoredCategories.filter((category) => category.score >= 70);
  const priority = scoredCategories.filter((category) => category.score < 50);
  const developing = scoredCategories.filter((category) => category.score >= 50 && category.score < 70);

  introScreen.classList.add("hidden");
  auditScreen.classList.add("hidden");
  resultsScreen.classList.remove("hidden");
  document.getElementById("overall-score").innerHTML = `${overall}<span>/100</span>`;
  document.getElementById("overall-score-bar").style.width = `${overall}%`;
  document.getElementById("overall-status").textContent = scoreLabel(overall);
  document.getElementById("score-summary").textContent = overall >= 70 ? "A solid base to build on." : overall >= 50 ? "A workable base with clear opportunities." : "A strong case for simplifying the basics first.";
  document.getElementById("meaning-copy").textContent = overall >= 70 ? "Your foundations are in place. Focus on connecting the remaining gaps and making insight easier to access." : "The greatest opportunity is likely to come from reducing manual handovers, creating trusted information and focusing on a few high-value workflows first.";

  document.getElementById("category-results").innerHTML = scoredCategories.map((category) => {
    const band = getBand(category.score);
    return `<div class="category-result"><span class="category-result-name">${escapeHtml(category.title)}</span><div class="category-result-bar"><span class="${band.className}" style="width:${category.score}%"></span></div><span class="category-result-score">${category.score}</span></div>`;
  }).join("");

  const strengths = strong.length ? strong.slice(0, 3).map((category) => `${category.title} is a useful foundation for the next improvement.`) : ["You have started identifying where work happens today — that awareness is the first step to improving it.", "There are likely focused improvements available without changing everything at once."];
  const gaps = priority.length ? priority.slice(0, 3).map((category) => {
    const weakestQuestion = category.questions[category.questions.map((_, index) => answers[`${category.id}-${index}`]).indexOf(Math.min(...category.questions.map((_, index) => answers[`${category.id}-${index}`])) )];
    return `${category.title}: ${weakestQuestion.signal || "This area may be creating manual effort or inconsistency."}`;
  }) : developing.length ? developing.slice(0, 3).map((category) => `${category.title} is developing and could benefit from more consistency and visibility.`) : ["No category is currently a priority. Keep reviewing the workflows behind your strongest scores so the gains become repeatable."];
  fillList("strengths-list", strengths);
  fillList("gaps-list", gaps);

  const recommendations = buildRecommendations(scoredCategories);
  document.getElementById("recommendations-list").innerHTML = recommendations.map((recommendation, index) => `<article class="recommendation"><span class="recommendation-number">0${index + 1}</span><div><strong>${recommendation.title}</strong><p>${recommendation.text}</p></div></article>`).join("");

  const roadmap = buildRoadmap(scoredCategories, overall);
  fillList("roadmap-now", roadmap.now);
  fillList("roadmap-next", roadmap.next);
  fillList("roadmap-later", roadmap.later);
  latestResults = { overall, scoredCategories, strengths, gaps, recommendations, roadmap, questionResponses: getQuestionResponses() };
  ensureResultsActions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function fillList(elementId, items) {
  document.getElementById(elementId).innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function getLogoPath() {
  return document.querySelector(".brand-logo")?.getAttribute("src") || "applivon-logo-hor-web1.png";
}

function ensureResultsActions() {
  if (!document.getElementById("results-actions")) {
    const resultsFooter = document.querySelector(".results-footer");
    if (!resultsFooter) return;
    resultsFooter.insertAdjacentHTML("afterend", `
      <div id="results-actions" class="results-actions">
        <article class="results-action-card">
          <img class="action-card-logo" src="${escapeHtml(getLogoPath())}" alt="Applivon" />
          <div class="action-card-copy"><p class="eyebrow">Keep a copy</p><h3>Save this results page</h3><p>Save a self-contained HTML snapshot that you can open later.</p><p class="action-contact">enquiry@applivon.com · +65 6589 8939</p></div>
          <button id="save-results-button" class="button button-secondary" type="button">Save results page <span aria-hidden="true">↓</span></button>
          <p id="save-results-status" class="action-status" role="status"></p>
        </article>
      </div>
    `);
    document.getElementById("save-results-button").addEventListener("click", saveResultsPage);
  }
  ensureDiscussEmailForm();
}

function ensureDiscussEmailForm() {
  const resultsFooter = document.querySelector(".results-footer");
  const existingLink = resultsFooter?.querySelector("a.button");
  if (!resultsFooter || !existingLink || document.getElementById("discuss-email")) return;
  existingLink.outerHTML = `
    <div class="results-discuss-form">
      <label for="discuss-email">Enter your email to send your results<input id="discuss-email" type="email" autocomplete="email" placeholder="you@example.com" /></label>
      <button id="discuss-results-button" class="button button-primary" type="button">Discuss your results <span aria-hidden="true">→</span></button>
      <p id="discuss-email-status" class="discuss-email-status" role="status">Your default email app will open with the result summary ready to send.</p>
    </div>
  `;
  document.getElementById("discuss-results-button").addEventListener("click", sendDiscussEmail);
}

function buildResultsPlainText() {
  if (!latestResults) return "";
  const categoryLines = latestResults.scoredCategories.map((category) => `- ${category.title}: ${category.score}/100`);
  const questionLines = latestResults.questionResponses.flatMap((category) => [
    category.title,
    ...category.questions.map((item, index) => `  ${index + 1}. ${item.question}\n     Response: ${item.response} (${item.score}/100)`)
  ]);
  const recommendationLines = latestResults.recommendations.map((recommendation, index) => `${index + 1}. ${recommendation.title} — ${recommendation.text}`);
  return [
    "Applivon Business Automation Audit Results",
    "Applivon",
    "Email: enquiry@applivon.com",
    "Mobile: +65 6589 8939",
    `Overall digital operations score: ${latestResults.overall}/100`,
    "",
    "Category scores",
    ...categoryLines,
    "",
    "Questions and responses",
    ...questionLines,
    "",
    "What you are doing well",
    ...latestResults.strengths.map((item) => `- ${item}`),
    "",
    "Productivity gaps",
    ...latestResults.gaps.map((item) => `- ${item}`),
    "",
    "Recommended actions",
    ...recommendationLines,
    "",
    "Suggested roadmap",
    `Now: ${latestResults.roadmap.now.join("; ")}`,
    `Next: ${latestResults.roadmap.next.join("; ")}`,
    `Later: ${latestResults.roadmap.later.join("; ")}`
  ].join("\n");
}

function buildSavedResultsHtml() {
  const result = latestResults;
  const logoPath = escapeHtml(getLogoPath());
  const categoryRows = result.scoredCategories.map((category) => `<tr><td>${escapeHtml(category.title)}</td><td>${category.score}/100</td></tr>`).join("");
  const questionSections = result.questionResponses.map((category) => `<h3>Questions &amp; responses · ${escapeHtml(category.title)}</h3><table class="question-table">${category.questions.map((item, index) => `<tr><td>${index + 1}. ${escapeHtml(item.question)}</td><td>${escapeHtml(item.response)}<br><small>${item.score}/100</small></td></tr>`).join("")}</table>`).join("");
  const list = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const recommendations = result.recommendations.map((recommendation) => `<li><strong>${escapeHtml(recommendation.title)}</strong> — ${escapeHtml(recommendation.text)}</li>`).join("");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Applivon Audit Results · ${result.overall}/100</title>
<style>body{background:#f7f8f4;color:#183a3d;font-family:Arial,sans-serif;line-height:1.5;margin:0;padding:40px}main{background:#fff;border:1px solid #dfe7e2;border-radius:16px;margin:auto;max-width:820px;padding:36px}.saved-logo{display:block;height:auto;margin-bottom:18px;max-width:190px}.contact-line{color:#557073;font-size:13px;margin:0 0 18px}h1{font-size:34px;letter-spacing:-1px;margin:0 0 8px}h2{font-size:18px;margin:30px 0 10px}p{color:#557073}.score{color:#dc8051;font-size:58px;font-weight:800;margin:18px 0}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #dfe7e2;padding:10px;vertical-align:top}td:last-child{font-weight:800;text-align:right}.question-table td:first-child{width:70%}.question-table small{color:#849294;font-weight:normal}li{margin:8px 0}.note{color:#849294;font-size:12px;margin-top:35px}</style></head>
<body><main><img class="saved-logo" src="${logoPath}" alt="Applivon" /><p class="contact-line">enquiry@applivon.com · +65 6589 8939</p><p>APPLIVON · BUSINESS AUTOMATION AUDIT</p><h1>Your audit results</h1><div class="score">${result.overall}<small>/100</small></div><p>A practical snapshot of process automation, system connectivity, data quality, reporting and AI readiness.</p><h2>Category scores</h2><table>${categoryRows}</table>${questionSections}<h2>What you are doing well</h2><ul>${list(result.strengths)}</ul><h2>Productivity gaps</h2><ul>${list(result.gaps)}</ul><h2>Recommended actions</h2><ol>${recommendations}</ol><h2>Suggested roadmap</h2><ul><li><strong>Now:</strong> ${escapeHtml(result.roadmap.now.join("; "))}</li><li><strong>Next:</strong> ${escapeHtml(result.roadmap.next.join("; "))}</li><li><strong>Later:</strong> ${escapeHtml(result.roadmap.later.join("; "))}</li></ul><p class="note">Saved from the Applivon Business Automation Audit on ${escapeHtml(new Date().toLocaleString())}.</p></main></body></html>`;
}

function downloadTextFile(fileName, contents) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([contents], { type: "text/html;charset=utf-8" }));
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function saveResultsPage() {
  if (!latestResults) return;
  const fileName = `applivon-audit-results-${latestResults.overall}.html`;
  const contents = buildSavedResultsHtml();
  const status = document.getElementById("save-results-status");
  try {
    if (window.showSaveFilePicker) {
      const fileHandle = await window.showSaveFilePicker({ suggestedName: fileName, types: [{ description: "HTML file", accept: { "text/html": [".html"] } }] });
      const writable = await fileHandle.createWritable();
      await writable.write(contents);
      await writable.close();
      status.textContent = "Saved to your chosen location.";
    } else {
      downloadTextFile(fileName, contents);
      status.textContent = "Downloaded. Your browser controls the download location.";
    }
  } catch (error) {
    status.textContent = error.name === "AbortError" ? "Save cancelled." : "Could not save this page. Try again.";
  }
}

function sendDiscussEmail() {
  if (!latestResults) return;
  const emailInput = document.getElementById("discuss-email");
  const status = document.getElementById("discuss-email-status");
  const email = emailInput.value.trim();
  if (!email || !emailInput.checkValidity()) {
    status.textContent = "Enter a valid recipient email address.";
    emailInput.focus();
    return;
  }
  const subject = "Applivon ERP fit audit";
  const cc = "dawnlumkx@gmail.com";
  const mailto = `mailto:${encodeURIComponent(email)}?cc=${encodeURIComponent(cc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildResultsPlainText())}`;
  status.textContent = "Opening your email app...";
  window.location.href = mailto;
}

function buildRecommendations(scoredCategories) {
  const recommendations = [];
  const addIfLow = (id, title, text) => {
    const category = scoredCategories.find((item) => item.id === id);
    if (category && category.score < 70) recommendations.push({ title, text });
  };
  addIfLow("automation", "Make recurring work visible", "Map the top three repeatable workflows, assign clear owners and introduce simple triggers for reminders or approvals.");
  addIfLow("systems", "Connect the handover that matters most", "Choose one high-friction handover — such as sales to finance or order to fulfilment — and remove duplicate entry first.");
  addIfLow("data", "Create a trusted source of truth", "Agree where customer, product and supplier information lives, who owns it and what a complete record must contain.");
  addIfLow("sales", "Make follow-up a shared process", "Define pipeline stages, next actions and response expectations so customer follow-up does not depend on individual memory.");
  addIfLow("operations", "Standardise the core flow", "Document the normal purchasing, fulfilment and invoicing flow, then automate the repeatable checks and notifications.");
  addIfLow("reporting", "Design reporting around decisions", "Reduce reporting to the measures leaders actually use, name the source for each measure and automate the recurring data pull.");
  addIfLow("ai", "Earn the right to scale AI", "Start with one well-defined, low-risk workflow. Improve process documentation, data quality and access controls before expanding AI use.");
  return recommendations.length ? recommendations.slice(0, 5) : [{ title: "Protect what is working", text: "Document the processes behind your strongest categories and use them as the internal pattern for future improvements." }];
}

function buildRoadmap(scoredCategories, overall) {
  const sorted = [...scoredCategories].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const second = sorted[1];
  const strongest = [...scoredCategories].sort((a, b) => b.score - a.score)[0];
  return {
    now: [
      `Clarify the current ${weakest.title.toLowerCase()} workflow.`,
      `Choose one manual handover to simplify this month.`,
      overall < 50 ? "Set owners and a basic weekly review rhythm." : "Capture a baseline so improvement can be measured."
    ],
    next: [
      `Improve ${second.title.toLowerCase()} with a repeatable process.`,
      "Connect the systems or records involved in that workflow.",
      "Turn the agreed process into a simple dashboard or exception view."
    ],
    later: [
      `Build on the ${strongest.title.toLowerCase()} foundation.`,
      "Introduce targeted automation where the outcome is measurable.",
      "Test a focused AI use case only when the process and data are ready."
    ]
  };
}

document.getElementById("start-button").addEventListener("click", () => {
  currentStep = 0;
  showAudit();
});
nextButton.addEventListener("click", handleNext);
backButton.addEventListener("click", handleBack);
document.getElementById("restart-button").addEventListener("click", () => {
  Object.keys(answers).forEach((key) => delete answers[key]);
  currentStep = 0;
  showAudit();
});
