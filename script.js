/**
 * Gateway to Future — Registration Funnel Interactivity & Scoring Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initConditionalFields();
  initScoreCalculator();
  initFormSubmit();
  initProgramModal();
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

/**
 * Program Information Database for the Lightbox Modal Details
 */
const programData = {
  pflege: {
    title: 'Nursing & Healthcare Ausbildung',
    subtitle: 'Dein Weg in die Zukunft: Ausbildung in der Pflege in Deutschland',
    poster: 'pflege_poster.png',
    highlights: [
      'Premium counseling and German language path from India to Berlin.',
      'Earn a monthly stipend of €1,000 to €1,400 during the 3-year dual program.',
      '100% tuition-free program with guaranteed job placement after graduation.',
      'Full guidance for visa, housing in Berlin, and workplace adaptation.'
    ],
    tracks: [
      { icon: '🏥', name: 'General Nursing' },
      { icon: '👶', name: 'Pediatric Care' },
      { icon: '👵', name: 'Geriatric Care' }
    ],
    website: 'https://gatewaytofuture.com/pflege',
    email: 'counseling@gatewaytofuture.com',
    phone: '+49 152 2837 2894',
    formField: 'Pflege',
    whatsappMessage: 'Hi Gateway to Future, I am interested in the Nursing & Healthcare Ausbildung program!'
  },
  it: {
    title: 'IT & Software Development',
    subtitle: 'Start Your Tech Career in Germany (Dual Vocational Training)',
    poster: 'it_poster.png',
    highlights: [
      'Master software engineering, web technologies, and systems integration in Berlin.',
      'Work at leading German startups and tech companies while receiving a stipend.',
      'Intense German language training (A1 to B2) in just 6 months.',
      'Permanent job offers in Germany with a starting salary of €40,000+.'
    ],
    tracks: [
      { icon: '💻', name: 'Software Dev' },
      { icon: '🌐', name: 'Web Engineering' },
      { icon: '📊', name: 'Data Systems' }
    ],
    website: 'https://gatewaytofuture.com/it',
    email: 'tech.career@gatewaytofuture.com',
    phone: '+49 152 2837 2894',
    formField: 'IT',
    whatsappMessage: 'Hi Gateway to Future, I am interested in the IT & Software Development Ausbildung program!'
  },
  hospitality: {
    title: 'Hospitality & Gastronomy',
    subtitle: 'Master Culinary Arts and Luxury Hotel Management in Germany',
    poster: 'hospitality_poster.png',
    highlights: [
      'Get hands-on training at 5-star partner hotels and award-winning kitchens.',
      'Receive paid dual-training salary up to €1,200/month during education.',
      'Worldwide recognized hospitality degrees with excellent career growth.',
      'No university tuition fee — learn hospitality from world-class mentors.'
    ],
    tracks: [
      { icon: '🍳', name: 'Culinary Arts' },
      { icon: '🛎️', name: 'Hotel Ops' },
      { icon: '🍷', name: 'F&B Management' }
    ],
    website: 'https://gatewaytofuture.com/hospitality',
    email: 'hospitality@gatewaytofuture.com',
    phone: '+49 152 2837 2894',
    formField: 'Hospitality',
    whatsappMessage: 'Hi Gateway to Future, I am interested in the Hospitality & Gastronomy Ausbildung program!'
  }
};

/**
 * Initialize Lightbox Modal Controller & Actions
 */
function initProgramModal() {
  const modal = document.getElementById('poster-modal');
  if (!modal) return;

  const backdrop = modal.querySelector('.modal-backdrop');
  const closeBtn = modal.querySelector('.modal-close-btn');
  const cards = document.querySelectorAll('.poster-card');

  // Modal components
  const modalImg = document.getElementById('modal-poster-img');
  const downloadBtn = document.getElementById('modal-download-btn');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const highlightsList = document.getElementById('modal-highlights');
  const tracksGrid = document.getElementById('modal-tracks');
  const websiteLink = document.getElementById('modal-website-link');
  const emailLink = document.getElementById('modal-email-link');
  const telText = document.getElementById('modal-tel-text');
  const applyBtn = document.getElementById('modal-apply-btn');
  const whatsappBtn = document.getElementById('modal-whatsapp-btn');

  let currentProgramKey = '';

  // Open modal
  function openModal(programKey) {
    const data = programData[programKey];
    if (!data) return;
    currentProgramKey = programKey;

    // Set images & links
    modalImg.src = data.poster;
    modalImg.alt = data.title + ' Poster';
    downloadBtn.href = data.poster;
    
    // Set headers
    title.textContent = data.title;
    subtitle.textContent = data.subtitle;

    // Populate Highlights
    highlightsList.innerHTML = '';
    data.highlights.forEach(highlight => {
      const li = document.createElement('li');
      li.textContent = highlight;
      highlightsList.appendChild(li);
    });

    // Populate Tracks
    tracksGrid.innerHTML = '';
    data.tracks.forEach(track => {
      const badge = document.createElement('div');
      badge.className = 'track-badge';
      
      const icon = document.createElement('span');
      icon.className = 'track-icon';
      icon.textContent = track.icon;
      
      const name = document.createElement('span');
      name.className = 'track-name';
      name.textContent = track.name;
      
      badge.appendChild(icon);
      badge.appendChild(name);
      tracksGrid.appendChild(badge);
    });

    // Contacts info
    websiteLink.href = data.website;
    websiteLink.textContent = data.website.replace('https://', '');
    
    emailLink.href = `mailto:${data.email}`;
    emailLink.textContent = data.email;
    
    telText.textContent = data.phone;

    // WhatsApp Message
    const encodedMsg = encodeURIComponent(data.whatsappMessage);
    whatsappBtn.href = `https://wa.me/4915228372894?text=${encodedMsg}`;

    // Show modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Disable page scrolling while open
  }

  // Close modal
  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Bind card clicks
  cards.forEach(card => {
    const programKey = card.getAttribute('data-program');
    if (!programKey) return;
    
    card.addEventListener('click', () => openModal(programKey));
    
    // Accessible keyboard triggers
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(programKey);
      }
    });
  });

  // Bind close event listeners
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Apply button inside modal: scrolls to form and pre-fills program selects
  applyBtn.addEventListener('click', () => {
    closeModal();
    
    const formSection = document.getElementById('form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Set goal to Ausbildung
    const goalSelect = document.getElementById('goal');
    if (goalSelect) {
      goalSelect.value = 'Ausbildung';
      // Trigger conditional fields logic
      const event = new Event('change');
      goalSelect.dispatchEvent(event);
    }

    // Set specialized field select
    const data = programData[currentProgramKey];
    const fieldSelect = document.getElementById('ausbildung_field');
    if (fieldSelect && data) {
      fieldSelect.value = data.formField;
      
      // Update scoring logic
      if (typeof calculateLeadScore === 'function') {
        calculateLeadScore();
      }
    }
  });

  // Copy buttons behavior
  const copyButtons = modal.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      let textToCopy = '';
      if (targetEl.tagName === 'A') {
        textToCopy = targetEl.textContent.trim();
      } else {
        textToCopy = targetEl.innerText.trim();
      }

      try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Toast style feedback
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 1500);
      } catch (err) {
        console.error('Clipboard copy failed: ', err);
      }
    });
  });
}
