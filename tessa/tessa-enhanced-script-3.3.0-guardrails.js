/* Tessa™ – Enhanced prelim analyzer with closing-first ACTION LIST + structured liens
   - Fixes: numbered-item parsing when PDFs lose line breaks
   - Adds: fallback scanner for "The Company will require..." blocks
   - Preserves: all original handlers, transfer tax, smart/legacy flows, UI, disclaimers
   - v3.3.1: GUARDRAILS v2 - Deterministic requirements + scoped validation
*/

let transferTaxData = null;
let preloadFailed = false;
const DEBUG_TESSA = true; // set to false in production to reduce console noise

async function preloadTransferTaxData() {
  try {
    // Use proxy to avoid CORS issues
    const response = await fetch("https://tessa-proxy.onrender.com/data.json", {
      cache: 'force-cache' // Cache for faster subsequent loads
    });
    transferTaxData = await response.json();
    if (DEBUG_TESSA) console.log('✅ Transfer tax data loaded successfully');
  } catch (e) {
    transferTaxData = null;
    preloadFailed = true;
    if (DEBUG_TESSA) console.warn('⚠️ Transfer tax lookup unavailable. Feature disabled.');
  }
}

// Preload once when the page loads
preloadTransferTaxData();

$(document).ready(function () {
  // ===== HOMEPAGE FUNCTIONALITY =====
  const $homepageFunctionSelect = $('#homepage-function-select');
  const $homepageTextInput = $('#pct-slider-search-input');
  const $homepagePdfInput = $('#homepage-pdf-input');
  const $homepageFileWrapper = $('#homepage-file-wrapper');
  const $homepageFileBtn = $('#homepage-file-btn');
  const $homepageSubmitBtn = $('#homepage-submit-btn');
  const $homepageStatus = $('#homepage-status');

  let homepagePdfFile = null;

  $homepageFunctionSelect.on('change', function() {
    const selectedFunction = $(this).val();
    if (selectedFunction === 'question') {
      $homepageTextInput.show().prop('required', true);
      $homepageFileWrapper.hide();
      $homepagePdfInput.prop('required', false).val('');
      $homepageFileBtn.text('📎 Choose PDF File');
      $homepageSubmitBtn.text('Ask Tessa™');
      $homepageStatus.html('');
      homepagePdfFile = null;
    } else if (selectedFunction === 'analyze') {
      $homepageTextInput.hide().prop('required', false).val('');
      $homepageFileWrapper.show();
      $homepagePdfInput.prop('required', true);
      $homepageSubmitBtn.text('📄 Summarize Report');
      $homepageStatus.html('<span style="color: white;">Select a Preliminary Title Report PDF to summarize</span>');
    }
  });

  // Initialize homepage UI state on load
  $homepageFunctionSelect.trigger('change');


  // File button hover effects
  $homepageFileBtn.on('mouseenter', function() {
    $(this).css({
      'background': 'linear-gradient(135deg, #218838 0%, #1e7e34 100%)',
      'transform': 'translateY(-1px)',
      'box-shadow': '0 4px 8px rgba(40,167,69,0.4)'
    });
  }).on('mouseleave', function() {
    $(this).css({
      'background': 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      'transform': 'translateY(0)',
      'box-shadow': '0 2px 4px rgba(40,167,69,0.3)'
    });
  });

  // Homepage PDF File Selection
  $homepagePdfInput.on('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        $homepageStatus.html('<span style="color: #dc3545;">❌ Please select a PDF file</span>');
        $homepageFileBtn.text('📎 Choose PDF File');
        homepagePdfFile = null;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        $homepageStatus.html('<span style="color: #dc3545;">❌ File too large. Please select a PDF under 10MB</span>');
        $homepageFileBtn.text('📎 Choose PDF File');
        homepagePdfFile = null;
        return;
      }
      homepagePdfFile = file;
      const fileSize = (file.size / 1024 / 1024).toFixed(2);
      const fileName = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
      $homepageFileBtn.text(`✅ ${fileName}`);
      $homepageStatus.html(`<span style="color: #28a745;">✅ Ready to summarize: ${file.name} (${fileSize} MB)</span>`);
    }
  });

  // ===== EXISTING TESSA FUNCTIONALITY =====
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded. Tessa form will not function.');
    return;
  }

  // ===== SYSTEM PROMPT: REQUIREMENTS FIRST =====
  let tessaHistory = [
    {
      role: "system",
      content: `You are Tessa™, an expert California Title & Escrow assistant.

PRIMARY GOAL (ALWAYS FIRST):
Identify and clearly list the TITLE REQUIREMENTS and the actions needed to close. Requirements are must-do items (provide, sign, record, payoff, obtain, clear). If the document says "The Company will require..." or similar, treat each as a requirement.

TRUST + FACTS RULE:
- When facts_json is provided, it is ground truth. Do not contradict it.
- Never invent amounts, parties, recording refs, or statuses. If not stated, write "Not stated" or "Unclear".

OUTPUT ORDER (DO NOT CHANGE):
1) **TITLE REQUIREMENTS**
2) **SUMMARY**
3) **PROPERTY INFORMATION**
4) **LIENS AND JUDGMENTS**
5) **TAXES AND ASSESSMENTS**
For Property Taxes (repeat this block for EACH Tax ID found):
- Tax ID: [Tax Identification Number or "Not stated"]
- Fiscal Year: [e.g., 2025-2026 or "Not stated"]
- 1st Installment: [amount and status or "Not stated"]
- 1st Installment Penalty: [penalty amount if shown, else "Not stated"]
- 2nd Installment: [amount and status or "Not stated"]
- 2nd Installment Penalty: [penalty amount if shown, else "Not stated"]
- Homeowners Exemption: [amount if shown, else "Not stated"]
- Code Area: [code area if shown, else "Not stated"]

For Tax Defaults / Redemptions (if any):
- Default No.: [default number or "Not stated"]
- Redemption schedule: [list each "Amount: $X, by Month YYYY" line]

For Other Assessments:
- Type: [supplemental/special/other]
- Total Amount: [if shown, else "Not stated"]
- Details: [brief description]
If none: "No outstanding taxes or assessments found in the critical section."

**OTHER FINDINGS**
7) **DOCUMENT STATUS**

CLOSING-FIRST MINDSET:
- Think like a closer: what blocks funding/recording, who owns the next step, and what to request.
- Prefer short, directive language (e.g., "Obtain payoff demand", "Provide trust certification", "Record reconveyance").

STRICT MONEY RULE:
- Use exact dollar amounts with $ and commas when present. No rounding.

SCHEDULE A PRIORITY RULE:
- If Schedule A states "SUBJECT TO ITEM NOS. …", treat those item numbers as priority requirements/exceptions and call them out at the top of TITLE REQUIREMENTS.

SEVERITY / IMPACT:
- Closing impact must be one of: Blocker, Material, Informational.`
    }
  ];

  // PDF Processing Variables
  let currentPdfFile = null;
  let extractedPdfText = null;

  const $modal = $('#tessaModal');
  const $inputField = $('#tessaModalInput');
  const $sendBtn = $('#tessaModalSendBtn');
  const $responseBox = $('#tessaResponses');
  const $typingIndicator = $('#tessaTyping');

  // Verify form exists
  const $form = $('#pct-slider-search-form');
  if ($form.length === 0) {
    console.error('Form #pct-slider-search-form not found in DOM.');
    return;
  }

  function scrollModal(toBottom = true) {
    const modalContent = $responseBox[0];
    if (modalContent) {
      modalContent.scrollTop = toBottom ? modalContent.scrollHeight : 0;
    }
  }

  function formatResponse(text) {
    return text.split(/\n\s*\n/).map(paragraph =>
      `<p>${paragraph.replace(/\n/g, '<br>')}</p>`
    ).join('');
  }

  function appendMessage(sender, message) {
    const messageClass = sender === "user" ? "user-message" : "tessa-response";
    const messageElement = document.createElement("div");
    messageElement.className = messageClass;

    const formattedMessage = (sender === "tessa") ? formatResponse(message) : message;

    messageElement.innerHTML = `<strong>${sender === "user" ? "You" : "Tessa"}:</strong> ${formattedMessage}`;
    $responseBox.append(messageElement);
    scrollModal(sender === "tessa");
  }

  async function fetchTransferTaxData(cityOrCounty) {
    try {
      if (!transferTaxData && !preloadFailed) {
        await preloadTransferTaxData();
      }
      if (!transferTaxData) return null;
      const lowerInput = cityOrCounty.toLowerCase();
      return transferTaxData.find(entry =>
        entry.City.toLowerCase() === lowerInput || entry.County.toLowerCase() === lowerInput
      );
    } catch (err) {
      console.error("Transfer tax fetch failed:", err);
      return null;
    }
  }

  async function handleTransferTaxQuestion(input) {
    console.time('handleTransferTax');
    if (!input.match(/\b(transfer|city|county|tax|rate)\b/i)) {
      console.timeEnd('handleTransferTax');
      return null;
    }
    
    // Check if transfer tax data is available
    if (preloadFailed) {
      console.timeEnd('handleTransferTax');
      return `<strong>Transfer tax lookup is temporarily unavailable.</strong><br><br>For transfer tax rates, please visit our <a href="city-transfer-tax.html" target="_blank" style="color: #f26b2b; text-decoration: underline;">City Transfer Tax page</a> or contact your title officer.`;
    }
    
    const match = input.match(/(?:transfer|city|county)?\s*(?:tax|rate)?\s*(?:in|for)?\s*([a-z\s]+)?/i);
    if (match && match[1]) {
      const location = match[1].trim();
      if (!location) {
        console.timeEnd('handleTransferTax');
        return null;
      }
      const result = await fetchTransferTaxData(location);
      if (result) {
        const reply = `Here's what I found for <strong>${result.City}</strong>, <strong>${result.County}</strong>:<br><br>` +
               `<strong>County Transfer Tax:</strong> ${result["County Transfer Tax"]}<br>` +
               `<strong>City Transfer Tax:</strong> ${result["City Transfer Tax (When Applicable)"]}`;
        console.timeEnd('handleTransferTax');
        return reply;
      } else {
        const reply = `I couldn't find transfer tax info for "<strong>${location}</strong>". Try another city or county in California, or visit our <a href="city-transfer-tax.html" target="_blank" style="color: #f26b2b;">City Transfer Tax page</a>.`;
        console.timeEnd('handleTransferTax');
        return reply;
      }
    }
    console.timeEnd('handleTransferTax');
    return null;
  }

  async function sendMessage() {
    console.time('sendMessage');
    const userInput = $inputField.val().trim();
    if (!userInput) {
      console.timeEnd('sendMessage');
      return;
    }

    scrollModal(false);
    appendMessage("user", userInput);
    $inputField.val('');
    $typingIndicator.show();

    try {
      const taxReply = await handleTransferTaxQuestion(userInput);
      if (taxReply && taxReply.indexOf("I couldn't find transfer tax info") === -1) {
        appendMessage("tessa", taxReply);
        $typingIndicator.hide();
        console.timeEnd('sendMessage');
        return;
      }

      tessaHistory.push({ role: "user", content: userInput });
      if (tessaHistory.length > 20) tessaHistory = tessaHistory.slice(-20);

      console.time('⏱️ API Response Time');
      const apiStartTime = performance.now();
      
      const response = await fetch("https://tessa-proxy.onrender.com/api/ask-tessa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: tessaHistory })
      });
      
      const fetchTime = performance.now() - apiStartTime;
      const data = await response.json();
      const totalTime = performance.now() - apiStartTime;
      
      console.timeEnd('⏱️ API Response Time');
      if (DEBUG_TESSA) {
        console.log(`📊 Performance: Network=${fetchTime.toFixed(0)}ms, Total=${totalTime.toFixed(0)}ms`);
        if (totalTime > 10000) console.warn('⚠️ SLOW RESPONSE: Consider upgrading Render.com plan or changing AI model');
      }
      const reply = data.choices?.[0]?.message?.content || "Hmm... I didn't quite get that.";

      tessaHistory.push({ role: "assistant", content: reply });
      appendMessage("tessa", reply);
    } catch (error) {
      console.error("Tessa error:", error);
      appendMessage("tessa", "Oops, I ran into an issue. Try again?");
    }

    $typingIndicator.hide();
    console.timeEnd('sendMessage');
  }

  // Form submit handler with explicit preventDefault
  $form.on('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (DEBUG_TESSA) console.log('Tessa form submit handler triggered');

    try {
      const selectedFunction = $homepageFunctionSelect.val();

      if (selectedFunction === 'question') {
        const question = $homepageTextInput.val().trim();
        if (!question) {
          $homepageStatus.html('<span style="color: #dc3545;">Please enter a question</span>');
          return;
        }

        $responseBox.empty();
        $modal.modal('show');
        $inputField.val(question);
        sendMessage();

      } else if (selectedFunction === 'analyze') {
        if (!homepagePdfFile) {
          $homepageStatus.html('<span style="color: #dc3545;">Please select a PDF file first</span>');
          return;
        }

        $responseBox.empty();
        $modal.modal('show');

        processPdfFile(homepagePdfFile);

        setTimeout(() => {
          $homepagePdfInput.val('');
          homepagePdfFile = null;
          $homepageStatus.html('');
        }, 1000);
      }

    } catch (err) {
      console.error('Error in form submit handler:', err);
    }
  });

  // Modal send button and Enter key
  $sendBtn.on('click', function () {
    if (DEBUG_TESSA) console.log('Modal send button clicked');
    sendMessage();
  });
  $inputField.on('keypress', function (e) {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (DEBUG_TESSA) console.log('Enter key pressed in modal input');
      sendMessage();
    }
  });

  // ===== PDF PROCESSING FUNCTIONALITY =====
  const $pdfUploadBtn = $('#tessaPdfUploadBtn');
  const $pdfInput = $('#tessaPdfInput');
  const $pdfAnalyzeBtn = $('#tessaPdfAnalyzeBtn');
  const $pdfStatus = $('#tessaPdfStatus');
  const $pdfProgress = $('#tessaPdfProgress');

  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // ===== SMART INPUT FUNCTIONALITY =====
  const $functionSelect = $('#tessaFunctionSelect');
  const $questionMode = $('#tessaQuestionMode');
  const $pdfMode = $('#tessaPdfMode');
  const $questionInput = $('#tessaQuestionInput');
  const $askBtn = $('#tessaAskBtn');
  const $uploadBtn = $('#tessaUploadBtn');
  const $analyzeBtn = $('#tessaAnalyzeBtn');
  const $status = $('#tessaStatus');

  $functionSelect.on('change', function() {
    const selectedFunction = $(this).val();
    if (selectedFunction === 'question') {
      $questionMode.show();
      $pdfMode.hide();
      resetPdfState();
    } else if (selectedFunction === 'analyze') {
      $questionMode.hide();
      $pdfMode.show();
    }
  });

  $askBtn.on('click', function() {
    const question = $questionInput.val().trim();
    if (question) {
      askTessaQuestion(question);
      $questionInput.val('');
    }
  });

  $questionInput.on('keypress', function(e) {
    if (e.which === 13) {
      const question = $(this).val().trim();
      if (question) {
        askTessaQuestion(question);
        $(this).val('');
      }
    }
  });

  $uploadBtn.on('click', function() {
    $pdfInput.click();
  });

  $analyzeBtn.on('click', function() {
    if (currentPdfFile) {
      processPdfFile(currentPdfFile);
    }
  });

  function handlePdfFileSelection(file) {
    if (file.type !== 'application/pdf') {
      updateStatus('❌ Please select a PDF file', '#dc3545');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      updateStatus('❌ File too large. Please select a PDF under 10MB', '#dc3545');
      return;
    }
    currentPdfFile = file;
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    updateStatus(`✅ Ready to analyze: ${file.name} (${fileSize} MB)`, '#28a745');
    $uploadBtn.hide();
    $analyzeBtn.show();
  }

  function updateStatus(message, color = '#6c757d') {
    $status.html(`<span style="color: ${color};">${message}</span>`);
  }

  function resetPdfState() {
    currentPdfFile = null;
    $uploadBtn.show();
    $analyzeBtn.hide();
    updateStatus('');
  }

  function askTessaQuestion(question) {
    tessaHistory.push({ role: "user", content: question });
    if (typeof displayMessage === 'function') displayMessage(question, 'user');
    const $typingIndicator = $('#tessaTyping');
    $typingIndicator.show();
    scrollModal();
    if (typeof sendToTessa === 'function') sendToTessa();
  }

  // ======== PRE-PARSER: extract hard facts before LLM ========
  let lastComputedFacts = null;

  function extractBetweenInclusive(text, startPattern, endPattern) {
    const start = text.search(startPattern);
    const end = text.search(endPattern);
    if (start === -1 || end === -1 || end <= start) return null;
    return text.slice(start, end);
  }

  // NEW: normalize bullets so "  21. " etc become new lines even if PDF lost EOLs
  function normalizeBullets(str) {
    if (!str) return str;
    return str
      // insert a break before number-dot that is preceded by >=2 spaces or a period + spaces
      .replace(/(\s{2,})(\d{1,3})\.\s/g, '\n$2. ')
      .replace(/([:;])\s*(\d{1,3})\.\s/g, '$1\n$2. ')
      .replace(/(?<=AT THE DATE HEREOF[\s\S]{0,400})\s*(\d{1,3})\.\s/gi, '\n$1. '); // early list start
  }

  function splitNumberedItems(sectionText) {
    if (!sectionText) return [];
    const text = normalizeBullets(sectionText);
    const items = [];
    const re = /(?:^|\n)\s*(\d{1,3})\.\s+([\s\S]*?)(?=(?:\n\s*\d{1,3}\.\s+)|$)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      items.push({ num: parseInt(m[1], 10), raw: m[2].trim() });
    }
    return items;
  }

  function parseTaxesFromItems(items) {
  const out = { 
    property_taxes: [], 
    tax_defaults: [], 
    other_assessments: [],
    // NEW v3.3.0 fields:
    total_delinquent_amount: 0,
    total_redemption_amount: 0,
    has_delinquent_taxes: false
  };

  const getLine = (raw, rx) => {
    const m = raw.match(rx);
    return m ? m[1].trim() : null;
  };

  for (const it of items) {
    const t = it.raw || "";

    if (/Property taxes/i.test(t) && /Tax Identification No\./i.test(t)) {
      const tax_id = getLine(t, /Tax Identification No\.?\s*:\s*([^\n]+)/i);
      const fiscal_year = getLine(t, /Fiscal Year:\s*([^\n]+)/i);
      const first_installment_raw = getLine(t, /1st Installment:\s*([^\n]+)/i);
      const second_installment_raw = getLine(t, /2nd Installment:\s*([^\n]+)/i);
      const exemption = (t.match(/Exemption:\s*\$?([0-9,]+\.[0-9]{2})/i) || [])[1] || null;
      const code_area = getLine(t, /Code Area:\s*([^\n]+)/i);

      // NEW: Parse status (DELINQUENT/PAID/OPEN)
      const first_status = /delinquent/i.test(first_installment_raw) ? 'DELINQUENT' : 
                          /paid/i.test(first_installment_raw) ? 'PAID' : 'OPEN';
      const second_status = /delinquent/i.test(second_installment_raw) ? 'DELINQUENT' : 
                           /paid/i.test(second_installment_raw) ? 'PAID' : 'OPEN';
      
      // Extract amounts
      const first_amount = (first_installment_raw?.match(/\$?([\d,]+\.\d{2})/) || [])[1];
      const second_amount = (second_installment_raw?.match(/\$?([\d,]+\.\d{2})/) || [])[1];
      
      // Track delinquent totals
      if (first_status === 'DELINQUENT' && first_amount) {
        out.total_delinquent_amount += parseFloat(first_amount.replace(/,/g, ''));
        out.has_delinquent_taxes = true;
      }
      if (second_status === 'DELINQUENT' && second_amount) {
        out.total_delinquent_amount += parseFloat(second_amount.replace(/,/g, ''));
        out.has_delinquent_taxes = true;
      }

      out.property_taxes.push({
        item_no: it.num,
        tax_id: tax_id || "Not stated",
        fiscal_year: fiscal_year || "Not stated",
        first_installment: first_installment_raw || "Not stated",
        first_installment_status: first_status,  // NEW
        first_installment_amount: first_amount ? `$${first_amount}` : null,  // NEW
        first_penalty: (t.match(/1st Installment[^$]*\$[\d,]+\.\d{2}[^$]*(\$[\d,]+\.\d{2})/i) || [])[1] || null,
        second_installment: second_installment_raw || "Not stated",
        second_installment_status: second_status,  // NEW
        second_installment_amount: second_amount ? `$${second_amount}` : null,  // NEW
        second_penalty: (t.match(/2nd Installment[^$]*\$[\d,]+\.\d{2}[^$]*(\$[\d,]+\.\d{2})/i) || [])[1] || null,
        homeowners_exemption: exemption || null,
        code_area: code_area || null
      });
      continue;
    }

    // Tax defaults (like Pomona prelim with 5 parcels)
    if (/declared tax defaulted/i.test(t) || /Amounts to redeem/i.test(t)) {
      const flat = t.replace(/\s+/g, " ").trim();
      const default_no = (flat.match(/Default No\.?\s*([0-9-]+)/i) || [])[1] || null;
      
      // NEW: Extract which APN this default applies to
      const apn_match = flat.match(/(\d{4}-\d{3}-\d{3}|\d{4}-\d{3}-\d{2}-\d{2})/);
      const apn = apn_match ? apn_match[1] : null;

      const schedule = [];
      const rx = /Amount:\s*\$?([0-9,]+\.[0-9]{2})\s*,\s*by\s*([A-Za-z]+\s+\d{4})/gi;
      let m;
      while ((m = rx.exec(flat)) !== null) {
        const amt = parseFloat(m[1].replace(/,/g, ''));
        schedule.push({ amount: `$${m[1]}`, by: m[2], amount_numeric: amt });
        // Track total redemption (use first/lowest amount as current month)
        if (schedule.length === 1) {
          out.total_redemption_amount += amt;
        }
      }

      out.tax_defaults.push({
        item_no: it.num,
        default_no: default_no,
        apn: apn,  // NEW
        message: flat,
        redemption_schedule: schedule
      });
      continue;
    }

    // Supplemental / special assessments
    if (/supplemental taxes|lien of supplemental taxes/i.test(t)) {
      out.other_assessments.push({
        item_no: it.num,
        type: "Supplemental taxes (if any)",
        details: t.replace(/\s+/g, " ").trim()
      });
    }
    
    // NEW: Special district assessments (Mello-Roos, CFD, etc.)
    if (/special district|community facility|mello-roos|assessment district/i.test(t)) {
      out.other_assessments.push({
        item_no: it.num,
        type: "Special District Assessment",
        details: t.replace(/\s+/g, " ").trim()
      });
    }
  }

  return out;
}

function classifyRequirement(text) {
  const t = text.replace(/\s+/g, ' ').trim();

  // All original classifications...
  if (/full reconveyance|reconvey.*requirement.*furnished.*confirmation/i.test(t)) {
    return { summary: "Confirm and process full reconveyance.", type: "reconveyance_confirmation", severity: "blocker" };
  }
  if (/original note|original deed of trust|request for full reconveyance/i.test(t)) {
    return { summary: "Provide original note/DOT and signed request for full reconveyance.", type: "reconveyance_package", severity: "blocker" };
  }
  if (/Statement of Information/i.test(t)) {
    // NEW: Enhanced to detect name search hits (like Ridgecrest prelim)
    if (/various Liens and Judgments|similar.*name/i.test(t)) {
      return { summary: "Complete SOI - NAME SEARCH HITS FOUND against similar names.", type: "statement_of_information_hits", severity: "blocker" };
    }
    return { summary: "Complete Statement of Information for named parties.", type: "statement_of_information", severity: "blocker" };
  }
  if (/spouse.*join.*conveyance|spouse of the vestee/i.test(t)) {
    return { summary: "Spousal joinder required prior to conveyance.", type: "spousal_joinder", severity: "blocker" };
  }
  if (/The Company will require.*(corporation|Name of Corporation)/i.test(t)) {
    return { summary: "Corporation authority package required.", type: "corp_authority", severity: "material" };
  }
  if (/Limited Liability Company|member-managed|Articles of Organization/i.test(t)) {
    return { summary: "LLC authority package required.", type: "llc_authority", severity: "material" };
  }
  if (/Probate Code\s*Section\s*18100\.5|Certification.*trust/i.test(t)) {
    return { summary: "Trust certification required per Prob. Code §18100.5.", type: "trust_docs", severity: "material" };
  }
  if (/suspended corporation|Certificate of Revivor|Relief from Voidability/i.test(t)) {
    return { summary: "Suspended corporation cure required.", type: "suspended_corp_cure", severity: "blocker" };
  }
  
  // NEW v3.3.0: HOA assessment requirement
  if (/homeowner['']?s? association|assessment.*current|association.*paid/i.test(t)) {
    return { summary: "Provide HOA clearance letter showing all assessments paid current.", type: "hoa_clearance", severity: "blocker" };
  }
  
  // NEW v3.3.0: Demand requirements for fractional beneficiaries (like LA prelim)
  if (/demands.*signed by all beneficiaries/i.test(t)) {
    return { summary: "Payoff demands must be signed by ALL beneficiaries (multiple lenders).", type: "multi_beneficiary_demand", severity: "blocker" };
  }

  return { summary: "Company-stated requirement.", type: "unspecified", severity: "material" };
}

  // Improved: also scan raw critical text if splitting fails (back-fill item # by looking backward)
  function parseRequirements(items, criticalText) {
    const reqs = [];

    // 1) Collect by item objects (preferred path)
    for (const it of items) {
      const t = it.raw;
      if (/The Company will require|requirement that this Company be furnished|spouse of the vestee|Statement of Information|suspended corporation|ALTA\/ACSM|Land Title Survey|Matters which may be disclosed by an inspection|inspection of said Land has been ordered|Corporate Underwriting Department|review and approval of the Company|Probate Code\s*Section\s*18100\.5|Certification.*trust|original note|request for full reconveyance|demands signed by all beneficiaries/i.test(t)) {
        reqs.push({
          item_no: it.num,
          text: t,
          classification: classifyRequirement(t)
        });
      }
    }

    // 2) Fallback scanner over the raw block (handles missing EOLs)
    if (reqs.length === 0 && criticalText) {
      const block = normalizeBullets(criticalText);
      const patterns = [
        /The Company will require[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /spouse of the vestee[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /Statement of Information[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /suspended corporation[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /requirement that this Company be furnished[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi
      ,
        /Matters which may be disclosed by an inspection[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /inspection of said Land has been ordered[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /review and approval of the Company[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /Probate Code\s*Section\s*18100\.5[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /Certification[\s\S]*?trust[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /original note[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi,
        /request for full reconveyance[\s\S]*?(?=(?:\n\s*\d{1,3}\.\s)|$)/gi
      ];
      const found = [];
      for (const rx of patterns) {
        let m;
        while ((m = rx.exec(block)) !== null) {
          const text = m[0].trim();
          // find nearest preceding item number
          const head = block.slice(0, m.index);
          const prev = head.match(/(\d{1,3})\.\s[^\n]*$/i);
          const num = prev ? parseInt(prev[1], 10) : null;
          found.push({ item_no: num, text, classification: classifyRequirement(text) });
        }
      }
      // de-dup by item_no + text
      const seen = new Set();
      for (const f of found) {
        const key = `${f.item_no}|${f.text.slice(0,60)}`;
        if (!seen.has(key)) { seen.add(key); reqs.push(f); }
      }
    }

    return reqs;
  }

  function parseForeclosureFlags(items) {
    const out = [];

    // Federal redemption / 28 USC 2410 style language
    const us = items.find(i => /United States.*redeem.*2410/i.test(i.raw));
    if (us) out.push({ item_no: us.num, type: "us_redemption", text: us.raw });

    // Trustee's Deed / sale-insufficiency exceptions
    const td = items.find(i => /Trustee.*Deed|insufficiency of the proceedings/i.test(i.raw));
    if (td) out.push({ item_no: td.num, type: "trustees_deed_exception", text: td.raw });

    // Notice of Trustee's Sale (foreclosure / default-track risk)
    const ntsItems = items.filter(i => /Notice of Trustee['']s Sale|Trustee['']s Sale/i.test(i.raw));
    for (const it of ntsItems) {
      const flat = (it.raw || "").replace(/\s+/g, " ").trim();
      const sale_date = (flat.match(/(?:scheduled|sale)\s*(?:to be held\s*)?on\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) || [])[1] || null;
      const sale_time = (flat.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i) || [])[1] || null;
      const sale_location = (flat.match(/(?:at|location:)\s*([^\.]{10,200})(?:\.|$)/i) || [])[1] || null;
      out.push({
        item_no: it.num,
        type: "notice_of_trustee_sale",
        text: it.raw,
        sale_date,
        sale_time,
        sale_location
      });
    }

    return out;
  }


// ================================
// v3.3.0 Parsers: DOTs / HOA / AOR / Easements / CCRs / Ownership / State / Type
// ================================
function parseDeedsOfTrust(items, fullText) {
  const dots = [];
  
  for (const it of items) {
    const t = it.raw || "";
    
    // Match Deed of Trust items
    if (/Deed of Trust to secure an indebtedness/i.test(t)) {
      const dot = {
        item_no: it.num,
        position: dots.length + 1,
        amount: null,
        dated: null,
        trustor: null,
        trustee: null,
        beneficiary: null,
        loan_no: null,
        recording_date: null,
        recording_no: null,
        assignments: [],
        substitutions: [],
        has_notice_of_default: false,
        has_notice_of_trustee_sale: false,
        sale_date: null,
        sale_time: null,
        sale_location: null,
        fractional_interests: []
      };
      
      // Extract core fields
      dot.amount = (t.match(/Amount:\s*\$?([\d,]+(?:\.\d{2})?)/i) || [])[1];
      if (dot.amount) dot.amount = '$' + dot.amount;
      
      dot.dated = (t.match(/Dated:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i) || [])[1];
      dot.trustor = (t.match(/Trustor(?:\/Grantor)?:\s*([^\n]+?)(?=\s*Trustee:|$)/i) || [])[1]?.trim();
      dot.trustee = (t.match(/Trustee:\s*([^\n]+?)(?=\s*Beneficiary:|$)/i) || [])[1]?.trim();
      dot.beneficiary = (t.match(/Beneficiary:\s*([^\n]+?)(?=\s*Loan No|Recording|$)/i) || [])[1]?.trim();
      dot.loan_no = (t.match(/Loan No\.?:\s*([^\n]+)/i) || [])[1]?.trim();
      dot.recording_date = (t.match(/Recording Date:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i) || [])[1];
      dot.recording_no = (t.match(/Recording No\.?:\s*(\d+)/i) || [])[1];
      
      // Check for fractional beneficiary interests (like in your LA prelim)
      const fractionalMatches = t.matchAll(/as to an undivided\s+\$?([\d,]+(?:\.\d{2})?)\s*\/\s*\$?([\d,]+(?:\.\d{2})?)\s+interest/gi);
      for (const fm of fractionalMatches) {
        dot.fractional_interests.push({
          numerator: fm[1],
          denominator: fm[2]
        });
      }
      
      // Check for assignments
      const assignmentMatch = t.match(/assignment of the beneficial interest[\s\S]*?Assignee:\s*([^\n]+?)(?=\s*Loan No|Recording|$)/i);
      if (assignmentMatch) {
        dot.assignments.push({
          assignee: assignmentMatch[1].trim(),
          recording_no: (t.match(/assignment[\s\S]*?Recording No\.?:\s*(\d+)/i) || [])[1]
        });
      }
      
      // Check for substitution of trustee
      const subMatch = t.match(/Substitution of Trustee[\s\S]*?Trustee:\s*([^\n]+?)(?=\s*Recording|$)/i);
      if (subMatch) {
        dot.substitutions.push({
          new_trustee: subMatch[1].trim(),
          recording_no: (t.match(/Substitution[\s\S]*?Recording No\.?:\s*(\d+)/i) || [])[1]
        });
      }
      
      // Check for Notice of Default
      if (/notice of default/i.test(t)) {
        dot.has_notice_of_default = true;
      }
      
      // Check for Notice of Trustee's Sale (like Phoenix prelim)
      if (/notice of trustee['']?s sale/i.test(t)) {
        dot.has_notice_of_trustee_sale = true;
        dot.sale_date = (t.match(/(?:Date.*?Sale|Sale.*?Date):\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) || [])[1];
        dot.sale_time = (t.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i) || [])[1];
        dot.sale_location = (t.match(/(?:at|Place.*?Sale):\s*([^\.]{10,200})/i) || [])[1]?.trim();
      }
      
      dots.push(dot);
    }
  }
  
  // Sort by recording date and assign positions
  dots.sort((a, b) => {
    if (!a.recording_date) return 1;
    if (!b.recording_date) return -1;
    return new Date(a.recording_date) - new Date(b.recording_date);
  });
  dots.forEach((d, i) => d.position = i + 1);
  
  return dots;
}

function parseHOALiens(items) {
  const liens = [];
  
  for (const it of items) {
    const t = it.raw || "";
    
    // Match HOA/Assessment lien items
    if (/delinquent assessments|notice of.*lien|homeowner['']?s? association/i.test(t)) {
      const lien = {
        item_no: it.num,
        type: 'HOA Assessment Lien',
        association_name: null,
        amount: null,
        recording_date: null,
        recording_no: null,
        status: 'Delinquent'
      };
      
      // Extract association name
      const assocMatch = t.match(/(?:payable to|Owners Association|Homeowners Association|HOA):\s*([^\n]+)/i);
      if (assocMatch) lien.association_name = assocMatch[1].trim();
      
      // Extract amount (like the $2,058.00 in Phoenix prelim)
      const amtMatch = t.match(/Amount:\s*\$?([\d,]+(?:\.\d{2})?)/i);
      if (amtMatch) lien.amount = '$' + amtMatch[1];
      
      // Extract recording info
      lien.recording_date = (t.match(/Recording Date:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) || [])[1];
      lien.recording_no = (t.match(/Recording No\.?:\s*(\d+)/i) || [])[1];
      
      liens.push(lien);
    }
  }
  
  return liens;
}

function parseAssignmentOfRents(items) {
  const assignments = [];
  
  for (const it of items) {
    const t = it.raw || "";
    
    if (/assignment of all moneys due.*rental|assignment of rents/i.test(t)) {
      const aor = {
        item_no: it.num,
        amount: (t.match(/Amount:\s*\$?([\d,]+(?:\.\d{2})?)/i) || [])[1],
        assigned_to: (t.match(/Assigned to:\s*([^\n]+)/i) || [])[1]?.trim(),
        assigned_by: (t.match(/Assigned By:\s*([^\n]+)/i) || [])[1]?.trim(),
        recording_date: (t.match(/Recording Date:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) || [])[1],
        recording_no: (t.match(/Recording No\.?:\s*(\d+)/i) || [])[1]
      };
      if (aor.amount) aor.amount = '$' + aor.amount;
      assignments.push(aor);
    }
  }
  
  return assignments;
}

function parseEasements(items, fullText) {
  const easements = [];
  
  for (const it of items) {
    const t = it.raw || "";
    
    if (/easement(?:s)?\s+(?:for|in favor)/i.test(t) || /right of way/i.test(t)) {
      const easement = {
        item_no: it.num,
        purpose: null,
        in_favor_of: null,
        affects: null,
        recording_no: null
      };
      
      easement.purpose = (t.match(/Purpose:\s*([^\n]+)/i) || [])[1]?.trim();
      easement.in_favor_of = (t.match(/(?:in favor of|Granted to):\s*([^\n]+)/i) || [])[1]?.trim();
      easement.affects = (t.match(/Affects:\s*([^\n]+)/i) || [])[1]?.trim();
      easement.recording_no = (t.match(/Recording No\.?:\s*([^\n,]+)/i) || [])[1]?.trim();
      
      // Also check for "The West 5 feet" style descriptions
      if (!easement.affects) {
        const affectsMatch = t.match(/(?:The|affecting)\s+((?:North|South|East|West)(?:erly)?\s+\d+\s*feet)/i);
        if (affectsMatch) easement.affects = affectsMatch[1];
      }
      
      easements.push(easement);
    }
  }
  
  return easements;
}

function parseCCRs(items) {
  const ccrs = [];
  
  for (const it of items) {
    const t = it.raw || "";
    
    if (/covenants,?\s*conditions\s*and\s*restrictions|CC&Rs?|declaration/i.test(t)) {
      const ccr = {
        item_no: it.num,
        recording_no: null,
        recording_book_page: null,
        modifications: [],
        violation_clause: false
      };
      
      // Check for book/page style recording (older documents)
      const bookPageMatch = t.match(/(?:in|recorded in)\s*Book\s+(\d+)\s+Page\s+(\d+)/i);
      if (bookPageMatch) {
        ccr.recording_book_page = `Book ${bookPageMatch[1]} Page ${bookPageMatch[2]}`;
      }
      
      // Check for instrument number style
      ccr.recording_no = (t.match(/Recording No\.?:\s*(\d+)/i) || [])[1];
      
      // Check for violation clause
      if (/violation.*shall not defeat.*lien/i.test(t)) {
        ccr.violation_clause = true;
      }
      
      ccrs.push(ccr);
    }
  }
  
  return ccrs;
}

function parseOwnershipStructure(fullText) {
  const structure = {
    vesting_type: 'individual', // individual, trust, corporate, llc, tic
    vestees: [],
    is_trust: false,
    trust_name: null,
    trust_date: null,
    is_tic: false,
    tic_interests: [],
    is_corporate: false,
    is_llc: false,
    requires_spousal_joinder: false,
    married_persons: []
  };
  
  // Extract vesting from "TITLE TO SAID ESTATE...VESTED IN:"
  const vestingMatch = fullText.match(/TITLE TO SAID ESTATE[\s\S]*?VESTED IN:\s*([\s\S]*?)(?=\n\s*\d\.|THE LAND REFERRED)/i);
  if (vestingMatch) {
    const vesting = vestingMatch[1].trim();
    structure.vestees.push(vesting);
    
    // Check for Trust (like LA prelim - John Humphries Trust)
    if (/trustee|trust/i.test(vesting)) {
      structure.is_trust = true;
      structure.vesting_type = 'trust';
      const trustMatch = vesting.match(/(?:of|under)\s+(?:the\s+)?([^,]+trust[^,]*)/i);
      if (trustMatch) structure.trust_name = trustMatch[1].trim();
      const dateMatch = vesting.match(/dated\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
      if (dateMatch) structure.trust_date = dateMatch[1];
    }
    
    // Check for TIC (Tenants in Common - like Pomona prelim)
    if (/tenants in common|as to an undivided/i.test(vesting)) {
      structure.is_tic = true;
      structure.vesting_type = 'tic';
      // Parse individual interests (e.g., "Brenda Kyle 26%")
      const interestMatches = vesting.matchAll(/([^,;]+?)\s*,?\s*as to an undivided\s+(\d+)%/gi);
      for (const im of interestMatches) {
        structure.tic_interests.push({
          party: im[1].trim(),
          percentage: parseInt(im[2])
        });
      }
    }
    
    // Check for Corporate ownership
    if (/corporation|inc\.|corp\./i.test(vesting) && !/limited liability/i.test(vesting)) {
      structure.is_corporate = true;
      structure.vesting_type = 'corporate';
    }
    
    // Check for LLC ownership
    if (/limited liability company|llc/i.test(vesting)) {
      structure.is_llc = true;
      structure.vesting_type = 'llc';
    }
    
    // Check for married persons (potential spousal joinder)
    if (/married\s+(man|woman)|husband and wife|as community property/i.test(vesting)) {
      // Check for sole and separate property (no spousal joinder needed)
      if (!/sole and separate property/i.test(vesting)) {
        structure.requires_spousal_joinder = true;
      }
    }
  }
  
  return structure;
}

function parseRecentConveyances(fullText) {
  const conveyances = [];
  
  // Look for conveyance history in NOTES section
  const conveyanceMatches = fullText.matchAll(/(?:conveyance|grantor|grantee)[\s\S]*?Grantor:\s*([^\n]+)[\s\S]*?Grantee:\s*([^\n]+)[\s\S]*?Recording Date:\s*([^\n]+)[\s\S]*?Recording No\.?:\s*(\d+)/gi);
  
  for (const cm of conveyanceMatches) {
    const recordingDate = cm[3].trim();
    const daysAgo = daysSince(recordingDate);
    
    conveyances.push({
      grantor: cm[1].trim(),
      grantee: cm[2].trim(),
      recording_date: recordingDate,
      recording_no: cm[4],
      days_ago: daysAgo,
      is_recent: daysAgo !== null && daysAgo <= 90,
      seasoning_concern: daysAgo !== null && daysAgo <= 90
    });
  }
  
  return conveyances;
}

function daysSince(dateStr) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return null;
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return null;
  }
}

function detectPropertyState(fullText) {
  const statePatterns = [
    { pattern: /,\s*CA\s+\d{5}/i, state: 'CA', name: 'California' },
    { pattern: /,\s*California\s*,/i, state: 'CA', name: 'California' },
    { pattern: /,\s*AZ\s+\d{5}/i, state: 'AZ', name: 'Arizona' },
    { pattern: /,\s*Arizona\s*,/i, state: 'AZ', name: 'Arizona' },
    { pattern: /,\s*NV\s+\d{5}/i, state: 'NV', name: 'Nevada' },
    { pattern: /County of Los Angeles|Los Angeles County/i, state: 'CA', name: 'California' },
    { pattern: /Maricopa County/i, state: 'AZ', name: 'Arizona' },
    { pattern: /Kern County/i, state: 'CA', name: 'California' }
  ];
  
  for (const sp of statePatterns) {
    if (sp.pattern.test(fullText)) {
      return { code: sp.state, name: sp.name, is_california: sp.state === 'CA' };
    }
  }
  
  return { code: 'UNKNOWN', name: 'Unknown', is_california: false };
}

function detectPropertyType(fullText) {
  const types = {
    is_sfr: false,
    is_multi_family: false,
    is_commercial: false,
    is_industrial: false,
    is_land: false,
    is_condo: false,
    is_pud: false,
    description: 'Unknown'
  };
  
  if (/Single Family Residence/i.test(fullText)) {
    types.is_sfr = true;
    types.description = 'Single Family Residence';
  } else if (/Multi-Family|Multi Family/i.test(fullText)) {
    types.is_multi_family = true;
    types.description = 'Multi-Family Residence';
  } else if (/Commercial\/Industrial|Commercial/i.test(fullText)) {
    types.is_commercial = true;
    types.description = 'Commercial/Industrial';
  } else if (/Condominium|Condo Unit/i.test(fullText)) {
    types.is_condo = true;
    types.description = 'Condominium';
  }
  
  return types;
}


function findScheduleASubjects(fullText) {
    const m = fullText.match(/SUBJECT TO ITEM NOS?\.\s*([0-9\sand,]+)/i);
    if (!m) return [];
    const nums = m[1].split(/[,and\s]+/i).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
    return nums;
  }

  function computeFacts(fullText) {
    const critical = extractBetweenInclusive(
      fullText,
      /AT THE DATE HEREOF[\s\S]+?WOULD BE AS FOLLOWS:/i,
      /END OF ITEMS/i
    );
    const criticalNorm = normalizeBullets(critical || "");
    const items = splitNumberedItems(criticalNorm);

    // Core parsers
    const taxes = parseTaxesFromItems(items);
    const requirements = parseRequirements(items, criticalNorm);
    const foreclosureFlags = parseForeclosureFlags(items);
    const scheduleASubject = findScheduleASubjects(fullText);

    // v3.3.0 parsers
    const deedsOfTrust = parseDeedsOfTrust(items, fullText);
    const hoaLiens = parseHOALiens(items);
    const assignmentOfRents = parseAssignmentOfRents(items);
    const easements = parseEasements(items, fullText);
    const ccrs = parseCCRs(items);
    const ownershipStructure = parseOwnershipStructure(fullText);
    const recentConveyances = parseRecentConveyances(fullText);
    const propertyState = detectPropertyState(fullText);
    const propertyType = detectPropertyType(fullText);

    // ================================
    // Special Flags (must-not-miss)
    // ================================
    const lcText = (fullText || "").toLowerCase();
    const lcCrit = (criticalNorm || "").toLowerCase();

    // Solar / UCC / Financing Statement style notices
    const solarFlag = /sunrun|solar energy system producer|independent solar energy system producer|solar\b/i.test(lcText);
    const uccFlag = /\bucc\b|financing statement|fixture filing/i.test(lcText);

    // Context window around solar references
    let solarContext = null;
    if (solarFlag) {
      const hit = fullText.search(/Sunrun|Solar Energy System Producer|Independent Solar Energy System Producer|Solar/i);
      if (hit !== -1) solarContext = fullText.slice(Math.max(0, hit - 250), Math.min(fullText.length, hit + 500));
    }

    const solarRecording = solarContext ? (solarContext.match(/Recording (?:No\.|Number|No)\s*:?\s*([0-9]{8,})/i) || [])[1] : null;
    const solarRecordingDate = solarContext ? (solarContext.match(/Recorded\s*:?\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) || [])[1] : null;

    // Trust / authority flags
    const trustFlag = ownershipStructure?.is_trust || /trustee\b|as trustee|\btrust\b/i.test(lcText);
    const trustCertRequired = /probate code\s*section\s*18100\.5|certification\s+of\s+trust|certification.*trust/i.test(lcText) ||
                              /probate code\s*section\s*18100\.5|certification\s+of\s+trust|certification.*trust/i.test(lcCrit);

    // Reconveyance package flags
    const reconveyancePkgRequired = /original note|original deed of trust|request for full reconveyance|demands signed by all beneficiaries/i.test(lcText) ||
                                    /original note|request for full reconveyance|demands signed by all beneficiaries/i.test(lcCrit);

    // Easement / multi-parcel estate flags (Schedule A / Exhibit A)
    const easementEstate = /parcel\s*2\s*:?\s*an\s+easement|easement\s+parcel\s*2|estate\s*:?\s*an\s+easement/i.test(lcText);

    const special_flags = {
      // Existing flags
      solar_flag: solarFlag,
      ucc_flag: uccFlag,
      solar_notice: solarFlag ? {
        company: (solarContext && (solarContext.match(/Sunrun/i) ? "Sunrun" : "Solar")) || "Solar",
        recording_no: solarRecording || null,
        recording_date: solarRecordingDate || null,
        context: solarContext ? solarContext.replace(/\s+/g, " ").trim() : null
      } : null,
      trust_flag: !!trustFlag,
      trust_cert_required: !!trustCertRequired,
      reconveyance_package_required: !!reconveyancePkgRequired,
      easement_estate: !!easementEstate,

      // NEW v3.3.0 flags
      has_active_foreclosure: (foreclosureFlags || []).some(f => f.type === "notice_of_trustee_sale") ||
                              (deedsOfTrust || []).some(d => d.has_notice_of_trustee_sale),
      has_hoa_lien: (hoaLiens || []).length > 0,
      has_tax_default: (taxes?.tax_defaults || []).length > 0,
      has_delinquent_taxes: !!taxes?.has_delinquent_taxes,
      is_out_of_state: propertyState ? !propertyState.is_california : false,
      has_tic_ownership: !!ownershipStructure?.is_tic,
      has_recent_conveyance: (recentConveyances || []).some(c => c.is_recent),
      has_multiple_dots: (deedsOfTrust || []).length > 1,
      has_fractional_beneficiaries: (deedsOfTrust || []).some(d => (d.fractional_interests || []).length > 0),
      has_assignment_of_rents: (assignmentOfRents || []).length > 0,
      has_easements: (easements || []).length > 0,
      has_ccrs: (ccrs || []).length > 0
    };

    // Property block (plus state/type)
    const property = {
      address: (fullText.match(/PROPERTY:\s*([^\n]+)/i) || [])[1] || null,
      apn: (fullText.match(/\bAPN:\s*([0-9-]+)/i) || [])[1] || null,
      effective_date: (fullText.match(/EFFECTIVE DATE:\s*([^\n]+)/i) || [])[1] || null,
      proposed_lender: (fullText.match(/Proposed Lender:\s*([^\n]+)/i) || [])[1] || null,
      proposed_loan_amount: (fullText.match(/Proposed Loan Amount:\s*(\$?[0-9,]+\.\d{2})/i) || [])[1] || null,
      state: propertyState || { code: "UNKNOWN", name: "Unknown", is_california: false },
      property_type: propertyType || { description: "Unknown" }
    };

    const facts = {
      property,
      scheduleA_subject_to_items: scheduleASubject,
      taxes,
      requirements,
      foreclosure_flags: foreclosureFlags,
      special_flags: special_flags,

      // v3.3.0 extracted facts
      deeds_of_trust: deedsOfTrust,
      hoa_liens: hoaLiens,
      assignment_of_rents: assignmentOfRents,
      easements: easements,
      ccrs: ccrs,
      ownership_structure: ownershipStructure,
      recent_conveyances: recentConveyances
    };

    if (DEBUG_TESSA) {
      console.group('Tessa Pre-Parser');
      console.log('Item count parsed:', items.length);
      console.log('Requirements found:', requirements.length, requirements.map(r => r.item_no));
      console.log('Schedule A subject-to items:', scheduleASubject);
      console.log('Taxes parsed:', facts.taxes);
      console.log('DOTs parsed:', (facts.deeds_of_trust || []).length);
      console.log('HOA liens parsed:', (facts.hoa_liens || []).length);
      console.groupEnd();
    }

    return facts;
  }

  // Agent-friendly explanations
  function agentExplanationByType(type) {
    switch (type) {
      case "reconveyance_confirmation":
        return "Proves an old loan/lien was actually released. Without it, a new buyer or lender could be behind that lien.";
      case "reconveyance_package":
        return "Title needs the payoff + reconveyance package (often including originals) to remove the Deed of Trust from title at closing.";
      case "multi_beneficiary_demand":
        return "When a loan has multiple beneficiaries or fractional interests, payoffs often require signatures from ALL parties—this can delay closing if not coordinated early.";
      case "hoa_clearance":
        return "HOA liens can block closing and may have their own payoff/clearance process. A current HOA demand/clearance letter prevents last‑minute surprises.";
      case "statement_of_information_hits":
        return "This indicates possible name-index hits. A completed Statement of Information helps title eliminate false matches so unrelated liens don’t attach.";
      case "statement_of_information":
        return "Clears name-index hits so unrelated liens don't attach. Title needs this to remove false matches.";
      case "unrecorded_docs_review":
        return "Unrecorded leases/agreements can create rights that must be insured or excepted. Title reviews them to avoid surprises.";
      case "survey_inspection":
        return "A survey/inspection can reveal encroachments, access, or possession issues that change what title can insure.";
      case "underwriting_review":
        return "Some deals require internal underwriting sign-off. Approval can affect timing and conditions.";
      case "trust_docs":
        return "Confirms trustees have authority to sell/encumber. Avoids challenges that the trust wasn't authorized.";
      case "spousal_joinder":
        return "Spouses can have community property rights. A signature avoids later claims and allows insurable conveyance.";
      case "corp_authority":
        return "Shows the corporation is authorized to sign. Title can't insure a sale/loan without corporate authority.";
      case "llc_authority":
        return "Confirms who can sign for the LLC and that it's in good standing. Prevents unauthorized signings.";
      case "suspended_corp_cure":
        return "A suspended company can't legally transfer property. Must revive before closing or title will not insure.";
      default:
        return "Needed so title can insure the transaction without unresolved risk.";
    }
  }


  // Build Realtor Cheat Sheet HTML under Requirements
  function escapeHTML(str) {
    return (str || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  // ================================
  // GUARDRAILS v2: Section helpers
  // ================================
  function getSectionBlock(text, header) {
    const re = new RegExp(`\\*\\*${header}\\*\\*[\\s\\S]*?(?=\\*\\*[A-Z]|$)`, "i");
    const m = (text || "").match(re);
    return m ? m[0] : null;
  }

  function replaceSectionBlock(original, header, newBlock) {
    const re = new RegExp(`\\*\\*${header}\\*\\*[\\s\\S]*?(?=\\*\\*[A-Z]|$)`, "i");
    if (!re.test(original || "")) {
      // If section isn't present, append it to the end
      return (original || "") + "\n\n" + newBlock.trim() + "\n";
    }
    return (original || "").replace(re, newBlock.trim() + "\n\n");
  }

  // ================================
  // GUARDRAILS v2: Deterministic Taxes Renderer (Markdown)
  // ================================
  
// ================================
// GUARDRAILS v3: Deterministic injections (Other Findings + Property Info)
// ================================
function injectPropertyInfoGuardrails(response, facts) {
  const flags = facts?.special_flags || {};
  const prop = facts?.property || {};
  const state = prop.state || { code: "UNKNOWN", name: "Unknown", is_california: false };
  const own = facts?.ownership_structure || {};

  const block = getSectionBlock(response, "PROPERTY INFORMATION");
  if (!block) return response;

  let updated = block.trim();

  // Easement estate note (Parcel 2 easement, etc.)
  if (flags.easement_estate && !/easement parcel|parcel\s*2\s*easement|easement estate/i.test(updated)) {
    updated += `\n- Estate note: Includes an easement parcel (Parcel 2). Confirm access/right-of-way terms.`;
  }

  // Out-of-state note
  if (flags.is_out_of_state && !/out[-\s]*of[-\s]*state|non[-\s]*california|\bAZ\b|\bNV\b|\bTX\b/i.test(updated)) {
    updated += `\n- State note: Property appears to be in ${state.name} (${state.code}). State-specific title and foreclosure rules apply.`;
  }

  // Tenants in Common (TIC) ownership note + percentages
  if (flags.has_tic_ownership && !/tenants in common|\bTIC\b/i.test(updated)) {
    let pct = "";
    if (own?.tic_interests && own.tic_interests.length) {
      pct = " " + own.tic_interests.map(x => `${x.party} ${x.percentage}%`).join(", ");
    }
    updated += `\n- Ownership note: Tenants in Common (TIC). All TIC parties must sign to convey/encumber.${pct ? " Interests:" + pct : ""}`;
  }

  // Property type hint
  if (prop.property_type?.description && prop.property_type.description !== "Unknown" && !/Property type:/i.test(updated)) {
    updated += `\n- Property type: ${prop.property_type.description}`;
  }

  return replaceSectionBlock(response, "PROPERTY INFORMATION", updated + "\n");
}


function injectOtherFindingsGuardrails(response, facts) {
  // Placeholder - returns response unchanged for now
  return response;
}


function injectLiensGuardrails(response, facts) {
  const flags = facts?.special_flags || {};
  const dots = facts?.deeds_of_trust || [];
  const hoa = facts?.hoa_liens || [];

  const block = getSectionBlock(response, "LIENS AND JUDGMENTS") || "**LIENS AND JUDGMENTS**\n";
  let updated = block;

  const hasHOA = /HOA|Homeowners Association|assessment lien/i.test(block);
  const dotMentions = (block.match(/Deed of Trust/gi) || []).length;

  // HOA liens (critical)
  if (hoa.length && !hasHOA) {
    for (const l of hoa) {
      updated += `\n- Priority: Unclear\n- Type: HOA Assessment Lien\n- Beneficiary/Creditor: ${l.association_name || "HOA"}\n- Recording ref: ${l.recording_no || "Not stated"}${l.recording_date ? ", " + l.recording_date : ""}\n- Amount: ${l.amount || "Not stated"}\n- Status: ${l.status || "Delinquent"}\n- Action: Obtain HOA payoff/clearance and release\n- Foreclosure/Default info: HOA lien may impact closing until cleared\n`;
    }
  }

  // Deeds of Trust count enforcement (append missing DOTs as needed)
  if (dots.length && dotMentions < dots.length) {
    const already = new Set();
    // Try to detect recording numbers already shown
    const rxRec = /Recording ref:\s*([0-9]{6,})/gi;
    let m;
    while ((m = rxRec.exec(block)) !== null) already.add(m[1]);

    for (const d of dots) {
      if (d.recording_no && already.has(d.recording_no)) continue;
      updated += `\n- Priority: Unclear\n- Type: Deed of Trust\n- Beneficiary/Creditor: ${d.beneficiary || "Not stated"}\n- Recording ref: ${d.recording_no || "Not stated"}${d.recording_date ? ", " + d.recording_date : ""}\n- Amount: ${d.amount || "Not stated"}\n- Status: Open\n- Action: Obtain payoff demand and reconveyance\n- Foreclosure/Default info: ${d.has_notice_of_trustee_sale ? `Notice of Trustee’s Sale${d.sale_date ? " (" + d.sale_date + ")" : ""}` : "None stated"}\n`;
    }
  }

  // Foreclosure sale details (if active)
  if (flags.has_active_foreclosure && !/Notice of Trustee/i.test(updated)) {
    const nts = (facts?.foreclosure_flags || []).find(f => f.type === "notice_of_trustee_sale");
    if (nts) {
      updated += `\n- Foreclosure/Default info: ACTIVE Notice of Trustee’s Sale${nts.sale_date ? " — Sale " + nts.sale_date : ""}${nts.sale_time ? " at " + nts.sale_time : ""}${nts.sale_location ? " (" + nts.sale_location + ")" : ""}.\n`;
    }
  }

  return replaceSectionBlock(response, "LIENS AND JUDGMENTS", updated);
}

function injectSummaryGuardrails(response, facts) {
  const flags = facts?.special_flags || {};
  const taxes = facts?.taxes || {};
  const state = facts?.property?.state || { code: "UNKNOWN", name: "Unknown", is_california: false };
  const recent = (facts?.recent_conveyances || []).filter(c => c.is_recent);

  const block = getSectionBlock(response, "SUMMARY");
  if (!block) return response;

  let updated = block.trim();

  // Add concise notes if missing
  if (flags.has_active_foreclosure && !/trustee\W?s sale|foreclosure/i.test(updated)) {
    updated += `\n- Note: Active foreclosure language detected. Confirm sale status and coordinate payoff/postponement immediately.`;
  }
  if (flags.has_tax_default && !/tax default|redemption/i.test(updated)) {
    updated += `\n- Note: Tax default / redemption amounts are present. Redemption payoff(s) must be cleared prior to closing.`;
  }
  if (flags.has_delinquent_taxes && !/delinquent/i.test(updated)) {
    updated += `\n- Note: Delinquent tax installments are shown and include penalties.`;
  }
  if (flags.is_out_of_state && !/out[-\s]*of[-\s]*state|non[-\s]*california|\bAZ\b|\bNV\b|\bTX\b/i.test(updated)) {
    updated += `\n- Note: Out-of-state property (${state.code}). State-specific requirements apply.`;
  }
  if (recent.length && !/recent conveyance|seasoning/i.test(updated)) {
    updated += `\n- Note: Recent conveyance detected. Confirm lender seasoning requirements and review chain of title timing.`;
  }

  return replaceSectionBlock(response, "SUMMARY", updated + "\n");
}


function renderTaxesMarkdown(facts) {
    const taxes = facts?.taxes || {};
    const propertyTaxes = taxes.property_taxes || [];
    const taxDefaults = taxes.tax_defaults || [];
    const other = taxes.other_assessments || [];

    let out = `**TAXES AND ASSESSMENTS**\n`;

  // Totals (if available)
  if (typeof taxes.total_delinquent_amount === 'number' && taxes.total_delinquent_amount > 0) {
    out += `\n- Total delinquent tax amount (est.): $${taxes.total_delinquent_amount.toFixed(2)}\n`;
  }
  if (typeof taxes.total_redemption_amount === 'number' && taxes.total_redemption_amount > 0) {
    out += `- Total current redemption (est., across parcels): $${taxes.total_redemption_amount.toFixed(2)}\n`;
  }

    // Property Taxes blocks
    if (propertyTaxes.length) {
      out += `For Property Taxes:\n`;
      propertyTaxes.forEach(t => {
        out += `- Tax ID: ${t.tax_id || "Not stated"}\n`;
        out += `- Fiscal Year: ${t.fiscal_year || "Not stated"}\n`;
        out += `- 1st Installment: ${t.first_installment || "Not stated"}\n`;
        out += `- 1st Installment Penalty: ${t.first_penalty || "Not stated"}\n`;
        out += `- 2nd Installment: ${t.second_installment || "Not stated"}\n`;
        out += `- 2nd Installment Penalty: ${t.second_penalty || "Not stated"}\n`;
        out += `- Homeowners Exemption: ${t.homeowners_exemption ?? "Not stated"}\n`;
        out += `- Code Area: ${t.code_area || "Not stated"}\n`;
      });
    } else {
      out += `For Property Taxes:\n- Tax ID: Not stated\n- Fiscal Year: Not stated\n- 1st Installment: Not stated\n- 1st Installment Penalty: Not stated\n- 2nd Installment: Not stated\n- 2nd Installment Penalty: Not stated\n- Homeowners Exemption: Not stated\n- Code Area: Not stated\n`;
    }

    // Tax Defaults / Redemptions
    if (taxDefaults.length) {
      out += `\nFor Tax Defaults / Redemptions:\n`;
      taxDefaults.forEach(d => {
        out += `- Default No.: ${d.default_no || "Not stated"}\n`;
        if (d.redemption_schedule?.length) {
          const lines = d.redemption_schedule
            .map(s => `Amount: ${s.amount}, by ${s.by}`)
            .join("; ");
          out += `- Redemption schedule: ${lines}\n`;
        } else {
          out += `- Redemption schedule: Not stated\n`;
        }
      });
    }

    // Other assessments
    if (other.length) {
      out += `\nFor Other Assessments:\n`;
      other.forEach(a => {
        out += `- Type: ${a.type || "Not stated"}\n`;
        out += `- Total Amount: ${a.total_amount || "Not stated"}\n`;
        out += `- Details: ${a.details || "Not stated"}\n`;
      });
    } else {
      out += `\nFor Other Assessments:\n- Type: Supplemental taxes (if any)\n- Total Amount: Not stated\n- Details: Not stated\n`;
    }

    return out;
  }

  // ================================
  // GUARDRAILS v2: Deterministic Requirements Renderer (NEW!)
  // ================================
  function renderCompanyRequirementsMarkdown(facts) {
    const reqs = facts?.requirements || [];
    
    if (!reqs.length) {
      return `REQUIREMENTS (Company stated)\n- No specific company-stated requirements found.\n`;
    }

    // Dedupe by classification.type (so identical requirements get merged)
    const groups = new Map();
    for (const r of reqs) {
      const type = r.classification?.type || "unspecified";
      const key = type !== "unspecified" ? type : (r.classification?.summary || (r.text || "").slice(0, 40));
      if (!groups.has(key)) groups.set(key, { sample: r, items: [] });
      groups.get(key).items.push(r);
    }

    let out = `REQUIREMENTS (Company stated)\n`;
    
    for (const [k, g] of groups) {
      const nums = g.items.map(x => x.item_no).filter(Boolean).sort((a, b) => a - b);
      const itemLabel = nums.length > 1 
        ? `Items #${nums.join(" & #")}` 
        : (nums.length === 1 ? `Item #${nums[0]}` : `Item`);

      const label = g.sample.classification?.summary
        || (g.sample.text || "").replace(/\s+/g, " ").trim().slice(0, 100)
        || "Company-stated requirement";

      const severity = g.sample.classification?.severity === "blocker" ? "[BLOCKER]" : "[Material]";

      out += `- ${itemLabel}: ${label} ${severity}\n`;
    }

    return out;
  }

  // ================================
  // GUARDRAILS v2: Scoped Validator (validates WITHIN Title Requirements)
  // ================================
  function validateRequirementsInTitleSection(facts, fullOut) {
    // Extract ONLY the Title Requirements section
    const tr = getSectionBlock(fullOut, "TITLE REQUIREMENTS") || "";
    const missing = [];

    (facts?.requirements || []).forEach(r => {
      if (!r.item_no) return;
      // Check if Item #N appears in the TITLE REQUIREMENTS section (not whole doc)
      const re = new RegExp(`Item\\s*#?\\s*${r.item_no}\\b|Items?\\s*#?\\s*${r.item_no}\\b`, "i");
      if (!re.test(tr)) {
        missing.push(r.item_no);
      }
    });

    return [...new Set(missing)];
  }

  function validatePrelimOutput(facts, outputText) {
    const out = outputText || "";
    const missing = {
      requirements_items: [],
      tax_default_numbers: [],
      tax_default_lines: [],
      property_tax_ids: [],
      foreclosure_flag: false,
      missing_tax_defaults_section: false,
      missing_solar_callout: false,
      missing_ucc_callout: false,
      missing_estate_note: false,
      missing_trust_requirement: false,
      missing_reconveyance_requirement: false
    ,
      missing_hoa_lien: false,
      missing_out_of_state_note: false,
      missing_tic_note: false,
      missing_dot_count: false,
      missing_assignment_of_rents: false,
      missing_easements: false,
      missing_ccrs: false,
      missing_recent_conveyance_note: false,
      missing_delinquent_tax_flag: false,
      missing_fractional_beneficiaries_flag: false
    };

    // FIX: Validate requirements INSIDE Title Requirements section only
    missing.requirements_items = validateRequirementsInTitleSection(facts, out);

    // Property Tax IDs presence (whole doc is fine for these)
    (facts?.taxes?.property_taxes || []).forEach(t => {
      const id = t.tax_id;
      if (id && id !== "Not stated" && !out.includes(id)) missing.property_tax_ids.push(id);
    });

    // Tax defaults presence
    const taxDefaults = facts?.taxes?.tax_defaults || [];
    if (taxDefaults.length) {
      if (!/For Tax Defaults\s*\/\s*Redemptions/i.test(out)) {
        missing.missing_tax_defaults_section = true;
      }
      taxDefaults.forEach(d => {
        const dn = (d.default_no || "").toString();
        if (dn && !out.includes(dn)) missing.tax_default_numbers.push(dn);

        (d.redemption_schedule || []).forEach(s => {
          const mustContainAmount = s.amount && out.includes(s.amount);
          const mustContainBy = s.by && new RegExp(s.by.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(out);
          if (!mustContainAmount || !mustContainBy) {
            missing.tax_default_lines.push({ default_no: dn || "Not stated", amount: s.amount, by: s.by });
          }
        });
      });
    }

    // Foreclosure enforcement
    const hasNTS = (facts?.foreclosure_flags || []).some(f => f.type === "notice_of_trustee_sale");
    if (hasNTS && !/Notice of Trustee['']?s Sale/i.test(out)) missing.foreclosure_flag = true;

    // Dedupe lists
    missing.requirements_items = [...new Set(missing.requirements_items)];
    missing.tax_default_numbers = [...new Set(missing.tax_default_numbers)];
    missing.property_tax_ids = [...new Set(missing.property_tax_ids)];

    
    // Special flags enforcement (scoped to correct sections)
    const flags = facts?.special_flags || {};
    const otherBlock = getSectionBlock(out, "OTHER FINDINGS") || "";
    const propBlock = getSectionBlock(out, "PROPERTY INFORMATION") || "";
    const trBlock = getSectionBlock(out, "TITLE REQUIREMENTS") || "";

    if (flags.solar_flag && !/solar|sunrun|solar energy/i.test(otherBlock)) missing.missing_solar_callout = true;
    if (flags.ucc_flag && !/\bucc\b|financing statement|fixture filing/i.test(otherBlock)) missing.missing_ucc_callout = true;
    if (flags.easement_estate && !/easement parcel|parcel\s*2\s*easement|easement estate/i.test(propBlock)) missing.missing_estate_note = true;

    if (flags.trust_cert_required && !/18100\.5|certification\s+of\s+trust|trust certification/i.test(trBlock)) missing.missing_trust_requirement = true;
    if (flags.reconveyance_package_required && !/original note|request for full reconveyance|reconveyance package|demands signed by all beneficiaries/i.test(trBlock)) missing.missing_reconveyance_requirement = true;


    // HOA / DOT / TIC / Out-of-state / Easements / CC&Rs / Assignment of Rents / Recent Conveyance checks
    const liensBlock = getSectionBlock(out, "LIENS AND JUDGMENTS") || "";
    const otherBlock2 = getSectionBlock(out, "OTHER FINDINGS") || "";
    const propBlock2 = getSectionBlock(out, "PROPERTY INFORMATION") || "";
    const summaryBlock = getSectionBlock(out, "SUMMARY") || "";

    // HOA lien must appear in LIENS
    if (flags.has_hoa_lien && !/HOA|Homeowners Association|assessment lien/i.test(liensBlock)) missing.missing_hoa_lien = true;

    // Out-of-state note must appear in PROPERTY INFORMATION or SUMMARY
    if (flags.is_out_of_state && !( /out[-\s]*of[-\s]*state|non[-\s]*california|\bAZ\b|\bNV\b|\bTX\b/i.test(propBlock2) || /out[-\s]*of[-\s]*state|non[-\s]*california|\bAZ\b|\bNV\b|\bTX\b/i.test(summaryBlock) )) {
      missing.missing_out_of_state_note = true;
    }

    // TIC note must appear in PROPERTY INFORMATION
    if (flags.has_tic_ownership && !/tenants in common|\bTIC\b|all\s+TIC\s+parties\s+must\s+sign/i.test(propBlock2)) {
      missing.missing_tic_note = true;
    }

    // DOT count: ensure at least as many DOT mentions as extracted
    if ((facts.deeds_of_trust || []).length > 0) {
      const dotMentions = (liensBlock.match(/Deed of Trust/gi) || []).length;
      if (dotMentions < facts.deeds_of_trust.length) missing.missing_dot_count = true;
    }

    // Fractional beneficiaries flag (if present, should be mentioned)
    if (flags.has_fractional_beneficiaries && !/fractional|undivided|multiple beneficiaries|all beneficiaries/i.test(out)) {
      missing.missing_fractional_beneficiaries_flag = true;
    }

    // Assignment of rents
    if (flags.has_assignment_of_rents && !/assignment of rents/i.test(otherBlock2) && !/assignment of rents/i.test(liensBlock)) {
      missing.missing_assignment_of_rents = true;
    }

    // Easements
    if (flags.has_easements && !/\beasement\b|right of way|r\/?w/i.test(otherBlock2)) {
      missing.missing_easements = true;
    }

    // CC&Rs
    if (flags.has_ccrs && !/cc&r|cc\&rs|covenants,? conditions/i.test(otherBlock2)) {
      missing.missing_ccrs = true;
    }

    // Recent conveyance
    if (flags.has_recent_conveyance && !/recent conveyance|seasoning/i.test(summaryBlock)) {
      missing.missing_recent_conveyance_note = true;
    }

    // Delinquent taxes should be called out (either in taxes section or summary)
    if (flags.has_delinquent_taxes && !( /delinquent/i.test(getSectionBlock(out,"TAXES AND ASSESSMENTS")||"") || /delinquent/i.test(summaryBlock) )) {
      missing.missing_delinquent_tax_flag = true;
    }


const ok =
      missing.requirements_items.length === 0 &&
      missing.tax_default_numbers.length === 0 &&
      missing.tax_default_lines.length === 0 &&
      missing.property_tax_ids.length === 0 &&
      !missing.foreclosure_flag &&
      !missing.missing_tax_defaults_section &&
    !missing.missing_solar_callout &&
    !missing.missing_ucc_callout &&
    !missing.missing_estate_note &&
    !missing.missing_trust_requirement &&
    !missing.missing_reconveyance_requirement &&
    !missing.missing_hoa_lien &&
    !missing.missing_out_of_state_note &&
    !missing.missing_tic_note &&
    !missing.missing_dot_count &&
    !missing.missing_assignment_of_rents &&
    !missing.missing_easements &&
    !missing.missing_ccrs &&
    !missing.missing_recent_conveyance_note &&
    !missing.missing_delinquent_tax_flag &&
    !missing.missing_fractional_beneficiaries_flag;

    return { ok, missing };
  }

  // ================================
  // GUARDRAILS v2: Repair Prompt Builder
  // ================================
  function buildRepairPrompt(facts, missing) {
    const req = JSON.stringify(facts?.requirements || [], null, 2);
    const pt = JSON.stringify(facts?.taxes?.property_taxes || [], null, 2);
    const td = JSON.stringify(facts?.taxes?.tax_defaults || [], null, 2);
    const ff = JSON.stringify(facts?.foreclosure_flags || [], null, 2);

    return `Your prior prelim summary is missing required closing data. Return ONLY the missing section blocks below using EXACT headers.

Missing:
- Requirements item numbers: ${missing.requirements_items.join(", ") || "none"}
- Missing Tax Defaults section: ${missing.missing_tax_defaults_section ? "YES" : "no"}
- Missing Default Nos: ${missing.tax_default_numbers.join(", ") || "none"}
- Missing tax schedule lines: ${missing.tax_default_lines.length ? "YES" : "no"}
- Missing property tax IDs: ${missing.property_tax_ids.join(", ") || "none"}
- Missing foreclosure flag: ${missing.foreclosure_flag ? "YES" : "no"}
- Missing solar callout: ${missing.missing_solar_callout ? "YES" : "no"}
- Missing UCC callout: ${missing.missing_ucc_callout ? "YES" : "no"}
- Missing easement estate note: ${missing.missing_estate_note ? "YES" : "no"}
- Missing trust requirement: ${missing.missing_trust_requirement ? "YES" : "no"}
- Missing reconveyance requirement: ${missing.missing_reconveyance_requirement ? "YES" : "no"}
- Missing HOA lien: ${missing.missing_hoa_lien ? "YES" : "no"}
- Missing out-of-state note: ${missing.missing_out_of_state_note ? "YES" : "no"}
- Missing TIC note: ${missing.missing_tic_note ? "YES" : "no"}
- Missing DOT count: ${missing.missing_dot_count ? "YES" : "no"}
- Missing assignment of rents: ${missing.missing_assignment_of_rents ? "YES" : "no"}
- Missing easements: ${missing.missing_easements ? "YES" : "no"}
- Missing CC&Rs: ${missing.missing_ccrs ? "YES" : "no"}
- Missing recent conveyance note: ${missing.missing_recent_conveyance_note ? "YES" : "no"}
- Missing delinquent tax flag: ${missing.missing_delinquent_tax_flag ? "YES" : "no"}
- Missing fractional beneficiaries flag: ${missing.missing_fractional_beneficiaries_flag ? "YES" : "no"}

GROUND TRUTH JSON (do not contradict; do not summarize tax schedules):
requirements_json:
${req}

property_taxes_json:
${pt}

tax_defaults_json:
${td}

foreclosure_flags_json:
${ff}

OUTPUT RULES:
- If tax_defaults_json is non-empty, you MUST output the full block:
**TAXES AND ASSESSMENTS**
For Tax Defaults / Redemptions:
- Default No.: ...
- Redemption schedule: Amount: $X, by Month YYYY; Amount: $Y, by Month YYYY; ...

- If requirements are missing, output:
**TITLE REQUIREMENTS**
REQUIREMENTS (Company stated)
- Items #...: ...

- If foreclosure flag is missing, output:
**SUMMARY**
- TOP CLOSING RISKS (ranked) ... including Notice of Trustee's Sale
AND
**LIENS AND JUDGMENTS** ... include Notice of Trustee's Sale details
`;
  }

  // ================================
  // GUARDRAILS v2: Inject Requirements into Title Requirements Section
  // ================================
  function injectDeterministicRequirements(tessaResponse, facts) {
    // Get the current TITLE REQUIREMENTS block
    let trBlock = getSectionBlock(tessaResponse, "TITLE REQUIREMENTS") || "**TITLE REQUIREMENTS**\n";
    
    // Render deterministic requirements
    const reqMd = renderCompanyRequirementsMarkdown(facts || {});
    
    // Replace or append REQUIREMENTS (Company stated) sub-block
    if (/REQUIREMENTS\s*\(Company stated\)/i.test(trBlock)) {
      // Replace existing REQUIREMENTS block
      trBlock = trBlock.replace(
        /REQUIREMENTS\s*\(Company stated\)[\s\S]*?(?=\n[A-Z][A-Z ]+\(|\n\*\*|CLEARING ITEMS|$)/i, 
        reqMd.trim() + "\n\n"
      );
    } else {
      // Append after ACTION LIST if present, or at the end
      if (/ACTION LIST/i.test(trBlock)) {
        // Insert after ACTION LIST section
        trBlock = trBlock.replace(
          /(ACTION LIST[\s\S]*?)(\n\n|\nCLEARING|\nPRIORITY|\n\*\*|$)/i,
          "$1\n\n" + reqMd.trim() + "\n$2"
        );
      } else {
        // Just append
        trBlock = trBlock.trim() + "\n\n" + reqMd.trim() + "\n";
      }
    }
    
    // Replace the TITLE REQUIREMENTS section in the full response
    return replaceSectionBlock(tessaResponse, "TITLE REQUIREMENTS", trBlock);
  }

  function buildRealtorCheatSheet(facts) {
    if (!facts) return '';

    const reqs = (facts.requirements || []).slice();

    // De-dupe: group by classification.type (or summary fallback) so Item 2/3 don't read like copy/paste
    const groups = new Map();
    for (const r of reqs) {
      const type = r.classification?.type || "unspecified";
      const key = type !== "unspecified" ? type : (r.classification?.summary || (r.text || "").slice(0, 40));
      if (!groups.has(key)) groups.set(key, { type, items: [], sample: r });
      groups.get(key).items.push(r);
    }

    function metaByType(type) {
      switch (type) {
        case "statement_of_information":
          return {
            who: "Seller(s) completes; Escrow collects",
            eta: "Same day (usually)",
            script: "Title needs a Statement of Information to clear name-based lien hits. It's confidential and helps us avoid false matches."
          };
        case "unrecorded_docs_review":
          return {
            who: "Agent/Seller provides copies (Escrow forwards)",
            eta: "1–2 days (depends on locating docs)",
            script: "Do you have any unrecorded leases, parking agreements, billboard licenses, or tenant deals? Title needs copies to insure without adding a broad exception."
          };
        case "survey_inspection":
          return {
            who: "Title/Escrow orders; Seller/Occupants cooperate",
            eta: "3–7 days",
            script: "A survey/inspection can reveal encroachments, access issues, or possession claims. Results can add requirements or exceptions."
          };
        case "underwriting_review":
          return {
            who: "Title (internal underwriting)",
            eta: "1–3 days",
            script: "This file requires underwriting review. It can add conditions, so we'll keep timing tight and respond quickly to any requests."
          };
        case "reconveyance_package":
        case "reconveyance_confirmation":
          return {
            who: "Escrow requests; Lender/Trustee supplies",
            eta: "2–7 days (lender dependent)",
            script: "We need the payoff + reconveyance package so the old loan is removed from title at closing."
          };
        default:
          return {
            who: "Varies",
            eta: "Varies",
            script: "This item must be satisfied for title to insure without adding exceptions."
          };
      }
    }

    const cards = [];
    for (const [key, g] of groups.entries()) {
      const type = g.type || "unspecified";
      const meta = metaByType(type);

      const itemNos = g.items.map(x => x.item_no).filter(Boolean).sort((a,b)=>a-b);
      const itemLabel = itemNos.length ? `Item${itemNos.length>1?'s':''} ${itemNos.join(', ')}` : 'Item —';

      // Prefer classification summary; fall back to a cleaned first line
      const label = g.sample.classification?.summary
        || (g.sample.text || '').replace(/\s+/g,' ').trim()
        || 'Company-stated requirement';

      const sev = g.sample.classification?.severity === 'blocker'
        ? 'BLOCKER'
        : (g.sample.classification?.severity === 'informational' ? 'INFO' : 'MATERIAL');

      const why = agentExplanationByType(type);

      cards.push(`<div style="border:1px solid rgba(0,0,0,.08); border-radius:10px; padding:12px; margin-bottom:10px; background:#ffffff;">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
          <div style="font-weight:900; color:#0b7285;">${escapeHTML(itemLabel)} <span style="font-weight:700; opacity:.75;">[${sev}]</span></div>
          <div style="font-size:12px; opacity:.8;">Who: ${escapeHTML(meta.who)}</div>
        </div>
        <div style="margin-top:6px; font-weight:800;">${escapeHTML(label)}</div>
        <div style="margin-top:6px; font-size:13px;"><em>Why it matters:</em> ${escapeHTML(why)}</div>
        <div style="margin-top:6px; font-size:13px;"><em>Typical timing:</em> ${escapeHTML(meta.eta)}</div>
        <div style="margin-top:8px; font-size:13px; padding:8px; background:rgba(23,162,184,.08); border-left:3px solid #17a2b8; border-radius:6px;">
          <strong>Agent script:</strong> ${escapeHTML(meta.script)}
        </div>
      </div>`);
    }

    const reqCards = cards.length ? cards.join('') : `<div style="opacity:.85;">No company-stated requirements detected for the cheat sheet.</div>`;

    // Tax default callout (agent facing)
    const taxDefaults = (facts.taxes && facts.taxes.tax_defaults) ? facts.taxes.tax_defaults : [];
    let taxCallout = '';
    if (taxDefaults.length) {
      const allSched = [];
      for (const d of taxDefaults) {
        for (const s of (d.redemption_schedule || [])) allSched.push({ default_no: d.default_no, amount: s.amount, by: s.by });
      }
      const first = allSched[0];
      taxCallout = `<div style="margin-top:12px; padding:12px; background:rgba(220,53,69,.06); border-left:4px solid #dc3545; border-radius:8px;">
        <div style="font-weight:900; color:#dc3545;">🔥 Tax Default / Redemption Alert</div>
        <div style="margin-top:6px; font-size:13px;">
          This file shows <strong>${taxDefaults.length}</strong> tax-default item(s). Redemption amounts and deadlines can change monthly.
          ${first ? ` Example: <strong>${escapeHTML(first.amount)}</strong> due by <strong>${escapeHTML(first.by)}</strong> (Default No. ${escapeHTML(first.default_no || 'Not stated')}).` : ''}
        </div>
        <div style="margin-top:8px; font-size:13px;"><strong>Agent script:</strong> "This property is in tax default. We'll need a redemption payoff from the county and it must be cleared before closing to avoid tax foreclosure risk."</div>
      </div>`;
    }

    return `<div class="agent-cheat-sheet" style="margin-top:15px; background:#ffffff; border-left:4px solid #17a2b8; padding:12px; border-radius:10px;">
      <h4 style="margin:0 0 10px; color:#0b7285; font-size:18px; font-weight:900; text-transform:uppercase;">🧭 Realtor Cheat Sheet — What To Say / Who To Ask</h4>
      <div style="font-size:13px; opacity:.9; margin-bottom:10px;">
        Use this as your quick talk track with sellers/buyers. It explains <strong>what</strong> is needed, <strong>who</strong> typically supplies it, and <strong>why</strong> it impacts closing.
      </div>
      ${reqCards}
      ${taxCallout}
    </div>`;
  }

  // ===== Extract text from PDF using PDF.js (preserve EOL + bullet heuristics) =====
  async function processPdfFile(file) {
    try {
      $pdfProgress.show();
      updateProgress(10, 'Loading PDF...');
      $pdfAnalyzeBtn.prop('disabled', true);

      const arrayBuffer = await file.arrayBuffer();
      updateProgress(30, 'Extracting text...');

      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      const totalPages = pdf.numPages;
      for (let i = 1; i <= totalPages; i++) {
        updateProgress(30 + (i / totalPages) * 40, `Processing page ${i} of ${totalPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Preserve line breaks where available, add spaces elsewhere
        let pageText = '';
        for (const item of textContent.items) {
          const chunk = item.str || '';
          pageText += chunk;
          if (item.hasEOL) pageText += '\n';
          else pageText += ' ';
        }

        // Heuristic: force a newline before "NN. " bullets if they got flattened
        pageText = pageText.replace(/(\s{2,})(\d{1,3})\.\s/g, '\n$2. ');
        fullText += pageText + '\n\n';
      }

      updateProgress(80, 'Preparing analysis...');
      extractedPdfText = fullText.trim();

      if (extractedPdfText.length < 100) {
        throw new Error('Unable to extract sufficient text from PDF. The document may be image-based or corrupted.');
      }

      // Compute hard facts before sending to LLM
      lastComputedFacts = computeFacts(extractedPdfText);

      updateProgress(90, 'Sending to Tessa for analysis...');
      await analyzePdfWithTessa(extractedPdfText, file.name);

      updateProgress(100, 'Analysis complete!');
      setTimeout(() => {
        $pdfProgress.hide();
        $pdfAnalyzeBtn.prop('disabled', false);
      }, 1500);

    } catch (error) {
      console.error('PDF processing error:', error);
      $pdfStatus.html(`<span style="color: #dc3545;">❌ Error processing PDF: ${error.message}</span>`);
      $pdfProgress.hide();
      $pdfAnalyzeBtn.prop('disabled', false);
    } finally {
      if (typeof resetSmartUIState === 'function') {
        setTimeout(resetSmartUIState, 2000);
      }
    }
  }

  function updateProgress(percent, message) {
    $pdfProgress.find('.progress-bar').css('width', percent + '%');
    $pdfStatus.html(`<span style="color: #007bff;">📊 ${message}</span>`);
  }

  // ===== Send PDF text to Tessa for analysis (with facts_json injection + GUARDRAILS v2) =====
  async function analyzePdfWithTessa(pdfText, fileName) {
    const factsJson = JSON.stringify(lastComputedFacts || {}, null, 2);
    // Build ground-truth tax blocks (so the model can't "forget" schedules under token pressure)
    const gtPropertyTaxes = (lastComputedFacts && lastComputedFacts.taxes && lastComputedFacts.taxes.property_taxes)
      ? lastComputedFacts.taxes.property_taxes
      : [];
    const gtTaxDefaults = (lastComputedFacts && lastComputedFacts.taxes && lastComputedFacts.taxes.tax_defaults)
      ? lastComputedFacts.taxes.tax_defaults
      : [];

    const propertyTaxesGroundTruth = JSON.stringify(gtPropertyTaxes, null, 2);
    const taxDefaultsGroundTruth = JSON.stringify(gtTaxDefaults, null, 2);


    // Keep payload manageable and be honest about truncation.
    const MAX_CHARS = 15000;
    const excerpt =
      pdfText.length > MAX_CHARS
        ? `${pdfText.substring(0, MAX_CHARS)}

[Excerpt truncated client-side for payload size. facts_json contains extracted critical facts.]`
        : pdfText;

    const analysisPrompt = `I've uploaded a Preliminary Title Report PDF titled "${fileName}".

YOU HAVE TWO INPUTS:
1) facts_json (auto-extracted by our parser) — treat as GROUND TRUTH.
2) Raw document text excerpt — use mainly for details, parties, and context.

facts_json:
${factsJson}

GROUND TRUTH TAX DATA (do not summarize; you must include it in TAXES AND ASSESSMENTS):
property_taxes_json:
${propertyTaxesGroundTruth}

tax_defaults_json:
${taxDefaultsGroundTruth}

NON-NEGOTIABLE SEPARATION RULE:
- The prelim usually has a "Requirements" section (Company stated must-do items). ONLY place those in:
  REQUIREMENTS (Company stated).
- Payoffs, liens, taxes due, foreclosure notices, and recorded exceptions that must be cleared to close go in:
  CLEARING ITEMS (Exceptions to address).
Do NOT label payoff actions as "Company Requirements" unless the report explicitly says "The Company will require..." for that item.
DEDUPLICATION RULE:
- If two requirement items are materially the same (e.g., both request unrecorded lease/agreements), merge into ONE entry and list both item numbers (e.g., "Items #2 & #3").

MUST-CAPTURE RULE (common in PCT prelims):
- If the Requirements section includes inspection/survey language (ALTA/ACSM survey, "inspection ordered") or underwriting review/approval, you MUST include those as REQUIREMENTS (Company stated) with clear next steps.
TAX DEFAULTS (NON-NEGOTIABLE):
- If tax_defaults_json contains entries, you MUST include the "For Tax Defaults / Redemptions" section inside TAXES AND ASSESSMENTS.
- You MUST list EACH Default No. and EACH redemption schedule line (Amount + by Month YYYY). Do not summarize.


OWNER GUIDANCE (use these unless the report explicitly states otherwise):
- Statement of Information: Seller completes; Escrow collects; Title reviews.
- Unrecorded agreements/leases: Agent/Seller provides copies; Escrow forwards; Title reviews.
- Survey/inspection: Title/Escrow orders; Seller/Occupants cooperate.
- Underwriting review: Title (internal).

ACTION LIST RULE:
- Only include "Review and clear Schedule A subject-to items" in ACTION LIST if Schedule A actually includes specific subject-to item numbers.


FORECLOSURE / DEFAULT ENFORCEMENT:
- If facts_json.foreclosure_flags contains type "notice_of_trustee_sale", you MUST:
  1) Put it as TOP CLOSING RISK #1 in SUMMARY (unless there is an even more urgent stated deadline).
  2) Include it under LIENS AND JUDGMENTS as a separate bullet or embedded under the related lien (if known).
  3) Include a clear action in ACTION LIST (e.g., "Confirm sale status / postpone / payoff immediately").

SCOPE RULE:
- For TITLE REQUIREMENTS, LIENS AND JUDGMENTS, TAXES AND ASSESSMENTS, OTHER FINDINGS:
  use facts_json + the critical items section ("AT THE DATE HEREOF…" to "END OF ITEMS") when available.
- For PROPERTY INFORMATION and DOCUMENT STATUS: you may also use Schedule A and the cover page.
- If Schedule A states "SUBJECT TO ITEM NOS. …", treat those item numbers as PRIORITY exceptions and call them out under PRIORITY SCHEDULE A ITEMS.

CRITICAL CLOSING-FIRST OUTPUT:
- Start with TITLE REQUIREMENTS. Include an ACTION LIST first (3–10 bullets) summarizing the next steps and owners.
- For EACH bullet in REQUIREMENTS and CLEARING ITEMS, include:
  Details + Next step + Owner + Closing impact + Why it matters.
- Never invent data. If missing, write "Not stated" or "Unclear".

FORMATTING REQUIREMENTS: Use EXACTLY this structure and order. Do not deviate:

**TITLE REQUIREMENTS**
ACTION LIST
- [Next step] ([Owner])
- [Next step] ([Owner])
- [Next step] ([Owner])

PRIORITY SCHEDULE A ITEMS
- Item #[number]: Review and clear Schedule A subject-to item.
  - Details: [what it appears to be, if stated; otherwise "Not stated"]
  - Next step: [what to do next]
  - Owner: [who should handle]
  - Closing impact: [Blocker/Material/Informational]
  - Why it matters: [one sentence]

REQUIREMENTS (Company stated)
- Item #[number]: [requirement in directive form]
  - Details: [brief, concrete detail]
  - Next step: [request/order/provide/pay/record]
  - Owner: [Escrow/Title/Agent/Seller/Lender/HOA/Buyer]
  - Closing impact: [Blocker/Material/Informational]
  - Why it matters: [one-sentence agent-friendly explanation]
[repeat for each requirement]
[If none: "No specific company-stated requirements found."]

CLEARING ITEMS (Exceptions to address)
- Item #[number if known]: [exception to clear in directive form, e.g., "Obtain payoff demand and payoff Deed of Trust", "Resolve HOA lien", "Pay delinquent taxes", "Address foreclosure notice"]
  - Details: [brief, concrete detail]
  - Next step: [request payoff / pay / release / reconvey / confirm status / etc]
  - Owner: [Escrow/Title/Agent/Seller/Lender/HOA/Buyer]
  - Closing impact: [Blocker/Material/Informational]
  - Why it matters: [one-sentence agent-friendly explanation]
[repeat for each clearing item]
[If none: "No additional clearing items found in the critical section."]

**SUMMARY**
- TOP CLOSING RISKS (ranked)
  - 1) [risk] — [why it can delay closing]
  - 2) [risk] — [why it can delay closing]
  - 3) [risk] — [why it can delay closing]
[Then write exactly 2–3 sentences summarizing overall title status and what must happen next.]

**PROPERTY INFORMATION**
- Property address: [exact address or "Not stated"]
- APN: [APN or "Not stated"]
- Effective date: [date or "Not stated"]
- Current owner/vesting: [if stated, otherwise "Not stated"]
- Transaction details: [proposed lender / proposed loan amount if shown, otherwise "Not stated"]

**LIENS AND JUDGMENTS**
For each lien/judgment found, use this exact structure:
- Priority: [1st/2nd/etc if known, else "Unclear"]
- Type: [Deed of Trust/Judgment/Mechanic's Lien/Tax Lien/HOA Lien/etc]
- Beneficiary/Creditor: [name or "Not stated"]
- Recording ref: [instrument # / date if shown, else "Not stated"]
- Amount: $[exact if shown, else "Not stated"]
- Status: [Open/Released/Unclear]
- Action: [Payoff/Release/Reconveyance/Confirm satisfaction/Subordination/Confirm foreclosure status/etc]
- Foreclosure/Default info: [include Notice of Trustee's Sale details if present, otherwise "None stated"]
If none: "No liens or judgments found in the critical section."

**TAXES AND ASSESSMENTS**
For Property Taxes:
- Tax ID: [Tax Identification Number or "Not stated"]
- Fiscal Year: [e.g., 2025-2026 or "Not stated"]
- 1st Installment: [amount and status or "Not stated"]
- 1st Installment Penalty: [penalty amount if shown, else "Not stated"]
- 2nd Installment: [amount and status or "Not stated"]
- 2nd Installment Penalty: [penalty amount if shown, else "Not stated"]
- Homeowners Exemption: [amount if shown, else "Not stated"]
- Code Area: [code area if shown, else "Not stated"]

For Other Assessments:
- Type: [supplemental/special/other]
- Total Amount: [if shown, else "Not stated"]
- Details: [brief description]
If none: "No outstanding taxes or assessments found in the critical section."

**OTHER FINDINGS**
List each easement/restriction/CCR/map/right in this exact structure:
- Type: [easement/restriction/covenant/CC&Rs/map/etc]
- Details: [brief description or "Not stated"]
- Impact: [Low/Medium/High]
- Action: [Review/Obtain map/Confirm location/Consult title officer/etc]
If none: "No other significant findings in the critical section."

**DOCUMENT STATUS**
This is a [preliminary/final] title report. Scope: [what it covers]. Date: [effective date if known].

CRITICAL FORMATTING RULES - DO NOT DEVIATE:
1) Use EXACTLY the section headers shown above with ** formatting.
2) Always include ALL sections in the EXACT order shown, even if empty.
3) Use bullet points (-) for ALL lists within sections.
4) Use exact dollar amounts with $ symbol when stated - NO rounding.
5) Do not add extra sections, do not reorder, do not rename headers.
6) If a value is missing, write "Not stated" or "Unclear" (do not guess).

Here is the document text excerpt:

${excerpt}`;

    tessaHistory.push({ role: "user", content: analysisPrompt });

    appendMessage("user", `📄 Uploaded and analyzing: ${fileName}`);

    $typingIndicator.show();
    scrollModal();

    try {
      console.time('⏱️ PDF Analysis API Time');
      const apiStartTime = performance.now();

      const response = await fetch("https://tessa-proxy.onrender.com/api/ask-tessa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: tessaHistory,
          max_tokens: 2400,
          temperature: 0.25
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const fetchTime = performance.now() - apiStartTime;
      const data = await response.json();
      const totalTime = performance.now() - apiStartTime;

      console.timeEnd('⏱️ PDF Analysis API Time');
      if (DEBUG_TESSA) {
        console.log(`📊 PDF Analysis Performance: Network=${fetchTime.toFixed(0)}ms, Total=${totalTime.toFixed(0)}ms`);
        if (totalTime > 15000) console.warn('⚠️ SLOW PDF ANALYSIS: Large document or slow API response');
      }

      if (data.choices && data.choices[0] && data.choices[0].message) {
        let tessaResponse = data.choices[0].message.content;

        // ================================
        // GUARDRAILS v2 STEP 1: Inject deterministic REQUIREMENTS into Title Requirements
        // ================================
        tessaResponse = injectDeterministicRequirements(tessaResponse, lastComputedFacts);
        
        if (DEBUG_TESSA) {
          console.log("✅ Deterministic requirements injected into TITLE REQUIREMENTS");
        }

        // ================================
        // GUARDRAILS v2 STEP 2: Inject deterministic TAXES (always wins)
        // ================================
        const taxesBlock = renderTaxesMarkdown(lastComputedFacts || {});
        tessaResponse = replaceSectionBlock(tessaResponse, "TAXES AND ASSESSMENTS", taxesBlock);

        if (DEBUG_TESSA) {
          console.log("✅ Deterministic taxes injected");

        // Deterministic guardrail injections (Solar/UCC + Easement estate + liens + summary)
        tessaResponse = injectOtherFindingsGuardrails(tessaResponse, lastComputedFacts || {});
        tessaResponse = injectPropertyInfoGuardrails(tessaResponse, lastComputedFacts || {});
        tessaResponse = injectLiensGuardrails(tessaResponse, lastComputedFacts || {});
        tessaResponse = injectSummaryGuardrails(tessaResponse, lastComputedFacts || {});

        }

        // ================================
        // GUARDRAILS v2 STEP 3: Validate output vs facts (scoped to sections)
        // ================================
        const validation = validatePrelimOutput(lastComputedFacts || {}, tessaResponse);

        if (!validation.ok) {
          if (DEBUG_TESSA) {
            console.warn("⚠️ Guardrails v2 triggered. Missing:", validation.missing);
          }

          // ================================
          // GUARDRAILS v2 STEP 4: One repair call (ONLY once)
          // ================================
          const repairPrompt = buildRepairPrompt(lastComputedFacts || {}, validation.missing);

          try {
            const repairResp = await fetch("https://tessa-proxy.onrender.com/api/ask-tessa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [
                  ...tessaHistory,
                  { role: "user", content: repairPrompt }
                ],
                max_tokens: 900,
                temperature: 0.1
              })
            });

            if (repairResp.ok) {
              const repairData = await repairResp.json();
              const repairText = repairData?.choices?.[0]?.message?.content || "";

              if (DEBUG_TESSA) {
                console.log("🔧 Repair response received:", repairText.substring(0, 200) + "...");
              }

              // ================================
              // GUARDRAILS v2 STEP 5: Stitch any returned section blocks into the original
              // ================================
              const tr = getSectionBlock(repairText, "TITLE REQUIREMENTS");
              const sm = getSectionBlock(repairText, "SUMMARY");
              const lj = getSectionBlock(repairText, "LIENS AND JUDGMENTS");
              const tx = getSectionBlock(repairText, "TAXES AND ASSESSMENTS");

              if (tr) tessaResponse = replaceSectionBlock(tessaResponse, "TITLE REQUIREMENTS", tr);
              if (sm) tessaResponse = replaceSectionBlock(tessaResponse, "SUMMARY", sm);
              if (lj) tessaResponse = replaceSectionBlock(tessaResponse, "LIENS AND JUDGMENTS", lj);
              if (tx) tessaResponse = replaceSectionBlock(tessaResponse, "TAXES AND ASSESSMENTS", tx);
            }
          } catch (repairError) {
            console.error("Repair call failed:", repairError);
            // Continue with original response if repair fails
          }
        }

        // ================================
        // GUARDRAILS v2 STEP 6: FINAL AUTHORITY - Re-inject deterministics after any repair
        // ================================
        // Re-inject requirements (in case repair overwrote them incorrectly)
        tessaResponse = injectDeterministicRequirements(tessaResponse, lastComputedFacts);
        
        // Re-inject taxes (final authority)
        tessaResponse = replaceSectionBlock(tessaResponse, "TAXES AND ASSESSMENTS", renderTaxesMarkdown(lastComputedFacts || {}));

        if (DEBUG_TESSA) {
          console.log("✅ Final deterministic injection complete (requirements + taxes)");

        // Final guardrail injections (Solar/UCC + Easement estate + liens + summary)
        tessaResponse = injectOtherFindingsGuardrails(tessaResponse, lastComputedFacts || {});
        tessaResponse = injectPropertyInfoGuardrails(tessaResponse, lastComputedFacts || {});
        tessaResponse = injectLiensGuardrails(tessaResponse, lastComputedFacts || {});
        tessaResponse = injectSummaryGuardrails(tessaResponse, lastComputedFacts || {});

        }

        // ================================
        // GUARDRAILS v2 STEP 7: Fix "Schedule A Action List" lie
        // ================================
        const sched = (lastComputedFacts?.scheduleA_subject_to_items || []);
        if (!sched.length) {
          tessaResponse = tessaResponse.replace(/^- .*Schedule A subject-to items.*$/gim, "");
        }

        // Push assistant response ONCE (avoid duplicate context bloat).
        tessaHistory.push({ role: "assistant", content: tessaResponse });

        $typingIndicator.hide();

        appendEnhancedAnalysis(tessaResponse, fileName);
      } else {
        throw new Error("Invalid response format from API");
      }

    } catch (error) {
      console.error('Error analyzing PDF:', error);
      $typingIndicator.hide();
      appendMessage("tessa", "I apologize, but I encountered an error while analyzing your document. Please try again or contact support if the issue persists.");
    }
  }

  // ===== Enhanced display function for PDF analysis - COLLAPSIBLE CARDS =====
  function appendEnhancedAnalysis(response, fileName) {
    // Section configuration with icons and colors
    const sectionConfig = {
      'TITLE REQUIREMENTS': { icon: '✅', class: 'section-requirements', preview: 'Action items needed to close', order: 1 },
      'SUMMARY': { icon: '📋', class: 'section-summary', preview: 'Overview and top closing risks', order: 2 },
      'PROPERTY INFORMATION': { icon: '🏠', class: 'section-property', preview: 'Address, APN, and vesting details', order: 3 },
      'LIENS AND JUDGMENTS': { icon: '🚨', class: 'section-liens', preview: 'Outstanding debts and encumbrances', order: 4 },
      'TAXES AND ASSESSMENTS': { icon: '💰', class: 'section-taxes', preview: 'Property tax status and amounts due', order: 5 },
      'OTHER FINDINGS': { icon: '📄', class: 'section-other', preview: 'Easements, restrictions, and exceptions', order: 6 },
      'DOCUMENT STATUS': { icon: 'ℹ️', class: 'section-status', preview: 'Report type and effective date', order: 7 }
    };

    // Build Realtor cheat sheet from lastComputedFacts
    const cheatSheetContent = buildRealtorCheatSheetContent(lastComputedFacts);

    // Parse sections from response
    const sections = [];
    const sectionRegex = /\*\*([A-Z][A-Z\s]+)\*\*([\s\S]*?)(?=\*\*[A-Z][A-Z\s]+\*\*|$)/g;
    let match;
    while ((match = sectionRegex.exec(response)) !== null) {
      const title = match[1].trim();
      let content = match[2].trim();
      if (sectionConfig[title]) {
        sections.push({ title, content, config: sectionConfig[title] });
      }
    }

    // Format item numbers to stand out
    function formatItemNumbers(text) {
      if (!text) return text;

      let out = text;

      // Handle plural grouped items first: "Items #2 & #3" (or "Items #2 and #3")
      out = out.replace(/Items\s*#\s*(\d{1,3})\s*(?:&|and)\s*#\s*(\d{1,3})/gi,
        '<span class="tessa-item-number">Item #$1</span> <span class="tessa-item-number">Item #$2</span>'
      );

      // Handle lists: "Items #2, #3, #4"
      out = out.replace(/Items\s*((?:#\s*\d{1,3}(?:\s*,\s*)?)+)/gi, (m, grp) => {
        const nums = [];
        const rx = /#\s*(\d{1,3})/g;
        let mm;
        while ((mm = rx.exec(grp)) !== null) nums.push(mm[1]);
        if (!nums.length) return m;
        return nums.map(n => `<span class="tessa-item-number">Item #${n}</span>`).join(' ');
      });

      // Handle single: "Item #1"
      out = out.replace(/(Item\s*#?\s*)(\d{1,3})/gi, '<span class="tessa-item-number">Item #$2</span>');

      return out;
    }

    // Format content helper
    function formatContent(content, sectionTitle, sectionClass) {
      let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\s*\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
      
      // Format item numbers
      formatted = formatItemNumbers(formatted);

      // Format severity tags like [BLOCKER] [Material] [INFO]
      formatted = formatted.replace(/\[(BLOCKER|MATERIAL|Material|INFO|Informational)\]/g, function(m, lvl) {
        const key = (lvl || '').toLowerCase();
        const norm = key.startsWith('block') ? 'blocker' : key.startsWith('info') ? 'info' : 'material';
        const label = norm === 'blocker' ? 'BLOCKER' : (norm === 'info' ? 'INFO' : 'MATERIAL');
        return `<span class="tessa-severity-pill sev-${norm}">${label}</span>`;
      });

      
      // Convert bullet lists
      formatted = formatted
        .replace(/^[-•*]\s*(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');
      
      // Format amounts
      formatted = formatted.replace(/\$[\d,]+(\.\d{2})?/g, '<span class="amount">$&</span>');
      
      // TAXES SECTION - Add parcel dividers for multiple Tax IDs
      if (sectionTitle === 'TAXES AND ASSESSMENTS') {
        // Find all Tax ID occurrences and add parcel headers/dividers
        let taxIdCount = 0;
        formatted = formatted.replace(/(- Tax ID:\s*)([^\<]+)/gi, function(match, prefix, taxId) {
          taxIdCount++;
          if (taxIdCount === 1) {
            return `<div class="parcel-header">📍 Parcel ${taxIdCount}</div>${prefix}<span class="tax-id-label">${taxId}</span>`;
          } else {
            return `<div class="parcel-divider"><div class="parcel-header">📍 Parcel ${taxIdCount}</div></div>${prefix}<span class="tax-id-label">${taxId}</span>`;
          }
        });
        
        // Style "For Property Taxes:" and "For Tax Defaults" headers
        formatted = formatted.replace(/(For Property Taxes:)/gi, '<strong style="font-size: 15px; color: var(--tessa-warning);">$1</strong>');
        formatted = formatted.replace(/(For Tax Defaults \/ Redemptions:)/gi, '<div style="margin-top: 20px; padding-top: 16px; border-top: 2px solid var(--tessa-danger);"><strong style="font-size: 15px; color: var(--tessa-danger);">🚨 $1</strong></div>');
        formatted = formatted.replace(/(For Other Assessments:)/gi, '<strong style="font-size: 15px; color: var(--tessa-text-light);">$1</strong>');
      }
      
      // OTHER FINDINGS - Enhance Type labels
      if (sectionTitle === 'OTHER FINDINGS') {
        formatted = formatted.replace(/(-\s*Type:\s*)([^<\n]+)/gi, function(match, prefix, typeValue) {
          return `<span class="finding-type">📋 ${typeValue.trim()}</span>`;
        });
      }
      
      // Add warning box for requirements section
      if (sectionTitle === 'TITLE REQUIREMENTS') {
        formatted += `
          <div class="warning-box" style="margin-top:24px;">
            <h5 style="margin:0 0 10px; font-size: 14px;">⚠️ Closing Warning</h5>
            <p style="margin:0; font-size: 14px;">
              Missing or incomplete requirements will <strong>stop this transaction from closing</strong>. 
              Resolve each item with the title officer before funding or recording.
            </p>
          </div>`;
      }
      
      return formatted;
    }

    // Get preview text (first line or sentence)
    function getPreview(content, defaultPreview) {
      const cleaned = content.replace(/\*\*/g, '').replace(/[-•*]/g, '').trim();
      const firstLine = cleaned.split('\n')[0].trim();
      if (firstLine.length > 55) {
        return firstLine.substring(0, 55) + '...';
      }
      return firstLine || defaultPreview;
    }

    // Count items in a section
    function countItems(content) {
      if (!content) return 0;

      // Count UNIQUE requirement item numbers within this section (supports merged Items #2 & #3)
      const nums = new Set();
      const lines = content.split(/\n/);
      for (const line of lines) {
        if (!/(^\s*[-•*]|\bItem\b|\bItems\b)/i.test(line)) continue;
        const rx = /#\s*(\d{1,3})/g;
        let m;
        while ((m = rx.exec(line)) !== null) nums.add(m[1]);
      }
      return nums.size;
    }

    // Build HTML for collapsible cards
    let cardsHTML = `
      <div class="tessa-analysis-response">
        <h3>📄 ${fileName}</h3>
        <div class="info-box" style="margin: 0 0 20px 0; padding: 16px 20px;">
          <strong>Analyzed by:</strong> Tessa™ AI Assistant &nbsp;|&nbsp;
          <strong>Date:</strong> ${new Date().toLocaleDateString()} &nbsp;|&nbsp;
          <strong>Version:</strong> 3.1.1 (Guardrails v2)
        </div>
    `;

    // Generate each section card
    sections.forEach((section, index) => {
      const isExpanded = index === 0; // First section (Requirements) expanded by default
      const preview = getPreview(section.content, section.config.preview);
      const itemCount = countItems(section.content);
      const countBadge = itemCount > 0 ? `<span style="background: ${section.config.class.includes('liens') ? 'var(--tessa-danger)' : section.config.class.includes('taxes') ? 'var(--tessa-warning)' : 'var(--tessa-text-light)'}; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; margin-left: 8px;">${itemCount}</span>` : '';
      
      cardsHTML += `
        <div class="tessa-section-card ${section.config.class} ${isExpanded ? 'expanded' : ''}" data-section="${section.title}">
          <div class="tessa-section-header" onclick="toggleTessaSection(this)">
            <div class="tessa-section-icon">${section.config.icon}</div>
            <div class="tessa-section-info">
              <div class="tessa-section-title">${section.title}${countBadge}</div>
              <p class="tessa-section-preview">${preview}</p>
            </div>
            <div class="tessa-section-toggle"></div>
          </div>
          <div class="tessa-section-body">
            <div class="tessa-section-content">
              ${formatContent(section.content, section.title, section.config.class)}
            </div>
          </div>
        </div>
      `;
    });

    // Add Realtor Cheat Sheet as its own section (if we have requirements)
    if (cheatSheetContent) {
      cardsHTML += `
        <div class="tessa-section-card section-cheatsheet" data-section="REALTOR CHEAT SHEET">
          <div class="tessa-section-header" onclick="toggleTessaSection(this)">
            <div class="tessa-section-icon">🧭</div>
            <div class="tessa-section-info">
              <div class="tessa-section-title">REALTOR CHEAT SHEET</div>
              <p class="tessa-section-preview">Plain-English explanations for your clients</p>
            </div>
            <div class="tessa-section-toggle"></div>
          </div>
          <div class="tessa-section-body">
            <div class="tessa-section-content">
              ${cheatSheetContent}
            </div>
          </div>
        </div>
      `;
    }

    // Add disclaimer at the end
    cardsHTML += `
        <div class="warning-box" style="margin-top: 20px;">
          <h4 style="margin-bottom: 10px;">⚠️ Important Disclaimer</h4>
          <p style="margin: 0;">
            This is only a <strong>summary</strong> of your Preliminary Title Report. You must read the entire preliminary title report for complete information. 
            If you have any questions, please contact your sales representative or title officer for clarification and guidance.
          </p>
        </div>
      </div>
    `;

    const $responseContainer = $('#tessaResponses');
    $responseContainer.append(`
      <div class="tessa-response" style="background: transparent; padding: 0; border: none; box-shadow: none;">
        ${cardsHTML}
      </div>
    `);

    scrollModal();

    setTimeout(() => {
      if (typeof resetPdfState === 'function') {
        resetPdfState();
      }
    }, 2000);
  }

  // Build cheat sheet content (without wrapper - for new card system)
  function buildRealtorCheatSheetContent(facts) {
    if (!facts || !facts.requirements || facts.requirements.length === 0) return null;

    // Group by requirement type so duplicates (e.g., Items 2 & 3) show once
    const groups = new Map();
    for (const r of facts.requirements) {
      const type = r.classification?.type || "unspecified";
      const key = type !== "unspecified" ? type : (r.classification?.summary || (r.text || "").slice(0, 40));
      if (!groups.has(key)) groups.set(key, { type, items: [], sample: r });
      groups.get(key).items.push(r);
    }

    const reqList = Array.from(groups.values()).map(g => {
      const itemNos = g.items.map(x => x.item_no).filter(Boolean).sort((a,b)=>a-b);
      const itemLabel = itemNos.length > 1 ? `Items #${itemNos.join(' & #')}` : `Item #${itemNos[0] || ''}`.trim();

      const label = g.sample.classification?.summary || 'Company requirement';
      const why = agentExplanationByType(g.sample.classification?.type);
      const sev = g.sample.classification?.severity === 'blocker' ? '🔴 BLOCKER' : '🟡 Material';

      return `
        <div style="padding: 16px; background: var(--tessa-bg-subtle); border-radius: 8px; margin-bottom: 12px; border-left: 3px solid #f59e0b;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span class="tessa-item-number" style="background: #f59e0b;">${escapeHTML(itemLabel)}</span>
            <span style="font-size: 12px; opacity: 0.8;">${sev}</span>
          </div>
          <div style="font-weight: 600; margin-bottom: 6px;">${escapeHTML(label)}</div>
          <div style="font-size: 13px; color: var(--tessa-text-light);"><em>Why it matters:</em> ${escapeHTML(why)}</div>
        </div>
      `;
    }).join('');

    return `
      <p style="margin-bottom: 16px; color: var(--tessa-text-light);">Here's what these requirements mean in plain English for your clients:</p>
      ${reqList}
    `;
  }



  // Global function to toggle section collapse
  window.toggleTessaSection = function(headerEl) {
    const card = headerEl.closest('.tessa-section-card');
    if (card) {
      card.classList.toggle('expanded');
    }
  };
});
