import './main.css';

const audioFiles = {
  1: '/lead_qualifier.mp3',
  2: '/callkudu-booking-cheerful.mp3',
  3: '/whatsapp.mp3',
  4: '/cold_caller.mp3',
};

const audioRefs = {};
let playingId = null;

function initAudioPlayers() {
  document.querySelectorAll('[data-audio-id]').forEach((btn) => {
    const id = Number(btn.dataset.audioId);
    const card = btn.closest('[data-audio-card]');
    const bars = card?.querySelector('[data-audio-bars]');

    if (!audioRefs[id]) {
      const audio = new Audio(audioFiles[id]);
      audio.addEventListener('ended', () => {
        playingId = null;
        updateAudioUI();
      });
      audioRefs[id] = audio;
    }

    btn.addEventListener('click', () => {
      const audio = audioRefs[id];
      if (playingId === id) {
        audio.pause();
        playingId = null;
      } else {
        Object.entries(audioRefs).forEach(([otherId, otherAudio]) => {
          if (Number(otherId) !== id) {
            otherAudio.pause();
            otherAudio.currentTime = 0;
          }
        });
        audio.play();
        playingId = id;
      }
      updateAudioUI();
    });

    if (bars) {
      bars.dataset.barsId = String(id);
    }
  });
}

function updateAudioUI() {
  document.querySelectorAll('[data-audio-card]').forEach((card) => {
    const id = Number(card.dataset.audioCard);
    const playing = playingId === id;
    const bars = card.querySelector('[data-audio-bars]');
    const playIcon = card.querySelector('[data-icon-play]');
    const pauseIcon = card.querySelector('[data-icon-pause]');

    bars?.classList.toggle('playing', playing);
    playIcon?.classList.toggle('hidden', playing);
    pauseIcon?.classList.toggle('hidden', !playing);
  });
}

function initFaq() {
  document.querySelectorAll('[data-faq-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-faq-item]');
      const panel = item?.querySelector('[data-faq-panel]');
      const icon = btn.querySelector('[data-faq-icon]');
      const isOpen = item?.classList.contains('open');

      document.querySelectorAll('[data-faq-item].open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('[data-faq-panel]')?.classList.add('max-h-0');
          openItem.querySelector('[data-faq-panel]')?.classList.remove('max-h-96');
          openItem.querySelector('[data-faq-icon]')?.classList.remove('rotate-180');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        panel?.classList.add('max-h-0');
        panel?.classList.remove('max-h-96');
        icon?.classList.remove('rotate-180');
      } else {
        item?.classList.add('open');
        panel?.classList.remove('max-h-0');
        panel?.classList.add('max-h-96');
        icon?.classList.add('rotate-180');
      }
    });
  });
}

function initMobileNav() {
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileMenu');
  const iconOpen = document.getElementById('menuIconOpen');
  const iconClose = document.getElementById('menuIconClose');

  toggle?.addEventListener('click', () => {
    const open = menu?.classList.toggle('hidden') === false;
    iconOpen?.classList.toggle('hidden', open);
    iconClose?.classList.toggle('hidden', !open);
  });

  menu?.querySelectorAll('a, button[data-close-menu]').forEach((el) => {
    el.addEventListener('click', () => {
      menu.classList.add('hidden');
      iconOpen?.classList.remove('hidden');
      iconClose?.classList.add('hidden');
    });
  });
}

function initSampleCarousel() {
  const container = document.getElementById('samplesScroll');
  const dots = document.querySelectorAll('[data-sample-dot]');
  if (!container || !dots.length) return;

  const updateDots = () => {
    const index = Math.round(container.scrollLeft / container.offsetWidth);
    dots.forEach((dot, i) => {
      dot.classList.toggle('w-8', i === index);
      dot.classList.toggle('bg-primary-500', i === index);
      dot.classList.toggle('w-2', i !== index);
      dot.classList.toggle('bg-white/20', i !== index);
    });
  };

  container.addEventListener('scroll', updateDots, { passive: true });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.sampleDot);
      container.scrollTo({ left: container.offsetWidth * index, behavior: 'smooth' });
    });
  });
}

function initPilotModal() {
  const overlay = document.getElementById('pilotModal');
  const form = document.getElementById('pilotForm');
  const msg = document.getElementById('pilotMessage');
  const btn = document.getElementById('pilotSubmitBtn');

  window.showPilotModal = () => {
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.hidePilotModal = (e) => {
    if (e && e.target !== overlay && e.type === 'click') return;
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-open-pilot]').forEach((el) => {
    el.addEventListener('click', () => window.showPilotModal());
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Submitting...';
    msg.className = 'hidden';

    try {
      const res = await fetch('/api/pilot-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.value.trim(),
          email: form.email.value.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Something went wrong');

      msg.textContent = "Thanks for your interest! We'll be in touch soon.";
      msg.className = 'mt-4 rounded-lg bg-brandgreen-500/10 px-4 py-3 text-sm text-brandgreen-400';
      form.reset();
    } catch (err) {
      msg.textContent = err.message || 'Failed to submit. Please email support@callkudu.co.za.';
      msg.className = 'mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Interest';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAudioPlayers();
  initFaq();
  initMobileNav();
  initSampleCarousel();
  initPilotModal();
});
