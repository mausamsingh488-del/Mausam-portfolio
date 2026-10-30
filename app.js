/**
 * Main Application Logic for Mausam Kumari's 3D Cartoon Bubble Portfolio
 */

// Toast notification helper
function showToast(message = '✨ Action complete!') {
  const toast = document.getElementById('toast-bubble');
  const toastText = document.getElementById('toast-text');
  if (!toast) return;

  if (toastText) toastText.textContent = message;
  toast.classList.add('show');

  if (window.sounds) window.sounds.sparkle();

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// Modal open/close helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.sounds) window.sounds.boing();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (window.sounds) window.sounds.click();
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {

  // 1. SOUND EFFECTS TOGGLE
  const soundToggleBtn = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (window.sounds) {
        const isEnabled = window.sounds.toggle();
        soundIcon.textContent = isEnabled ? '🔊' : '🔇';
        showToast(isEnabled ? '🔊 Cartoon sounds enabled!' : '🔇 Sounds muted');
      }
    });
  }

  // 2. MODAL BACKDROP CLICKS & ESC KEY
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });

  // 3. SKILLS CATEGORY FILTER
  const filterTabs = document.querySelectorAll('.filter-tab');
  const skillCards = document.querySelectorAll('.skill-bubble-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      if (window.sounds) window.sounds.click();

      skillCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'block';
          card.style.animation = 'floatMini 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. ONE-CLICK CLIPBOARD COPY (EMAIL & PHONE)
  const copyButtons = [
    { id: 'btn-copy-email', text: 'mausamsingh488@gmail.com', msg: '✨ Email copied to clipboard!' },
    { id: 'btn-copy-phone', text: '+917079860581', msg: '📞 Phone number copied!' }
  ];

  copyButtons.forEach(item => {
    const btn = document.getElementById(item.id);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(item.text).then(() => {
          showToast(item.msg);
        }).catch(() => {
          // Fallback
          showToast(`Copied: ${item.text}`);
        });
      });
    }
  });

  // 5. RESUME MODAL TRIGGER
  const resumeBtn = document.getElementById('btn-download-cv');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      openModal('modal-resume');
    });
  }

  // 6. CONTACT FORM SUBMISSION
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      if (window.sounds) window.sounds.sparkle();
      showToast(`🎉 Thank you ${name}! Your message is sent!`);
      contactForm.reset();
    });
  }

  // 7. MOBILE MENU TOGGLE
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      if (window.sounds) window.sounds.click();
    });

    // Close menu when clicking link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // 8. GLOBAL BOUNCY SOUNDS ON BUTTONS
  document.querySelectorAll('.btn-bubble').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (window.sounds && window.sounds.enabled) {
        window.sounds.pop(740);
      }
    });
    btn.addEventListener('click', () => {
      if (window.sounds) window.sounds.click();
    });
  });

  // 9. SKILL CARD BOUNCE ON CLICK
  skillCards.forEach(card => {
    card.addEventListener('click', () => {
      if (window.sounds) window.sounds.pop(500 + Math.random() * 300);
      card.style.transform = 'scale(0.92)';
      setTimeout(() => {
        card.style.transform = '';
      }, 150);
    });
  });
});
