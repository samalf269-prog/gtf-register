/**
 * Gateway to Future — Registration Funnel Interactivity & Scoring Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initConditionalFields();
  initScoreCalculator();
  initFormSubmit();
});

// Configure Webhook Target URL
// TODO: Replace with your Make.com, Zapier, or server webhook endpoint URL
const WEBHOOK_URL = 'https://example.com/notion-webhook';

/**
 * Toggle Ausbildung fields visibility depending on Goal select selection
 */
function initConditionalFields() {
  const goalSelect = document.getElementById('goal');
  const ausbildungGroup = document.getElementById('ausbildung-field-group');
  const ausbildungSelect = document.getElementById('ausbildung_field');

  function toggleField() {
    if (goalSelect.value === 'Ausbildung') {
      ausbildungGroup.style.display = 'flex';
      ausbildungSelect.setAttribute('required', 'true');
    } else {
      ausbildungGroup.style.display = 'none';
      ausbildungSelect.removeAttribute('required');
      ausbildungSelect.value = 'Other'; // reset default value
    }
  }

  // Bind listener & evaluate initial load state
  goalSelect.addEventListener('change', toggleField);
  toggleField();
}

/**
 * Dynamic Real-Time Lead Score Computation
 */
function calculateLeadScore() {
  let score = 0;

  // 1. German Level Level (B1, B2, or C1 = +20)
  const germanLevel = document.getElementById('german_level').value;
  if (['B1', 'B2', 'C1'].includes(germanLevel)) {
    score += 20;
  }

  // 2. Goal & Ausbildung Field (Pflege Ausbildung interest = +15)
  const goal = document.getElementById('goal').value;
  const ausbildungField = document.getElementById('ausbildung_field').value;
  if (goal === 'Ausbildung' && ausbildungField === 'Pflege') {
    score += 15;
  }

  // 3. Certificate Held (Yes = +10)
  const certificate = document.getElementById('certificate_held').value;
  if (certificate === 'Yes') {
    score += 10;
  }

  // 4. Timeline ASAP or 3 months (+20)
  const timeline = document.getElementById('timeline').value;
  if (['ASAP', '3 months'].includes(timeline)) {
    score += 20;
  }

  // 5. Budget 500€+ (500-1000€ or 1000€+ = +15)
  const budget = document.getElementById('budget').value;
  if (['500-1000€', '1000€+'].includes(budget)) {
    score += 15;
  }

  // 6. Source = Referral (+10)
  const source = document.getElementById('source').value;
  if (source === 'Referral') {
    score += 10;
  }

  // Set score values to form inputs
  document.getElementById('lead_score').value = score;
  return score;
}

/**
 * Bind score calculator updates to form controls change events
 */
function initScoreCalculator() {
  const inputs = document.querySelectorAll('#gtf-lead-form select');
  inputs.forEach(input => {
    input.addEventListener('change', calculateLeadScore);
  });
}

/**
 * Handle AJAX Form Submission & Webhook integration
 */
function initFormSubmit() {
  const form = document.getElementById('gtf-lead-form');
  const submitBtn = document.getElementById('submit-btn');
  const thankYouView = document.getElementById('thank-you-view');
  const displayScore = document.getElementById('display-score');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable submit to prevent double posts
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Application...';

    // Calculate final lead score
    const finalScore = calculateLeadScore();

    // Assemble form data object
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });
    
    // Add additional submission details
    payload.lead_score = finalScore;
    payload.date_submitted = new Date().toISOString();
    payload.status = 'New';

    try {
      // POST form payload data to webhook endpoint
      console.log('[API POST] Submitting lead details:', payload);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Note: We gracefully process mock responses or status warnings 
      // to avoid blocking user flows if the webhook is not yet configured.
      if (!response.ok) {
        console.warn(`[WEBHOOK WARNING] Server returned status ${response.status}`);
      }
    } catch (err) {
      console.error('[WEBHOOK ERROR] Failed to deliver webhook payload:', err.message);
    } finally {
      // Hide standard form elements
      form.style.display = 'none';
      
      // Update display score & reveal Thank You screen
      displayScore.textContent = finalScore;
      thankYouView.classList.remove('hidden-view');
      
      // Scroll to view
      thankYouView.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
