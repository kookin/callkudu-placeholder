import './main.css';

const audioFiles = {
  1: '/lead_qualifier.mp3',
  2: '/callkudu-booking-cheerful.mp3',
  3: '/callkudu-transfer-casual.mp3',
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
        audio.play().catch(() => {
          playingId = null;
          updateAudioUI();
        });
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
    card.querySelector('[data-audio-id]')?.setAttribute('aria-pressed', playing ? 'true' : 'false');
  });
}

function initFaq() {
  document.querySelectorAll('[data-faq-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-faq-item]');
      const icon = btn.querySelector('[data-faq-icon]');
      const isOpen = item?.classList.contains('open');

      document.querySelectorAll('[data-faq-item].open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('[data-faq-toggle]')?.setAttribute('aria-expanded', 'false');
          openItem.querySelector('[data-faq-icon]')?.classList.remove('rotate-180');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        icon?.classList.remove('rotate-180');
      } else {
        item?.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
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

  const setOpen = (open) => {
    menu?.classList.toggle('hidden', !open);
    iconOpen?.classList.toggle('hidden', open);
    iconClose?.classList.toggle('hidden', !open);
    toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
  };

  toggle?.addEventListener('click', () => {
    const open = menu?.classList.contains('hidden');
    setOpen(Boolean(open));
  });

  menu?.querySelectorAll('a').forEach((el) => {
    el.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 768px)').matches) setOpen(false);
  });
}

function initSampleCarousel() {
  const container = document.getElementById('samplesScroll');
  const dots = document.querySelectorAll('[data-sample-dot]');
  if (!container || !dots.length) return;

  const cards = Array.from(container.querySelectorAll('[data-audio-card]'));

  const updateDots = () => {
    if (!cards.length) return;
    const center = container.scrollLeft + container.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;
    cards.forEach((card, i) => {
      const mid = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    dots.forEach((dot, i) => {
      const active = i === nearest;
      dot.classList.toggle('w-8', active);
      dot.classList.toggle('bg-primary-500', active);
      dot.classList.toggle('w-2', !active);
      dot.classList.toggle('bg-white/20', !active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  };

  container.addEventListener('scroll', updateDots, { passive: true });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.sampleDot);
      const card = cards[index];
      if (!card) return;
      container.scrollTo({
        left: card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2,
        behavior: 'smooth',
      });
    });
  });

  updateDots();
}

document.addEventListener('DOMContentLoaded', () => {
  initAudioPlayers();
  initFaq();
  initMobileNav();
  initSampleCarousel();
});
