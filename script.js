// Fonction pour ouvrir la lightbox avec une image spécifique
function openLightbox(imageSrc) {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');

  lightbox.style.display = "block";
  lightboxImg.src = imageSrc;
}

// fermer la lightbox
function closeLightbox() {
  document.getElementById('lightbox').style.display = "none";
}



// === Carrousel Expériences Pro ===
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll('.carousel-item');
  const dotsContainer = document.querySelector('.carousel-dots');
  let currentIndex = 0;
  let interval;
  const delay = 30000; // 7 secondes

  // Créer les points dynamiquement
  items.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll('button');

  function showSlide(index) {
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
      dots[i].classList.toggle('active', i === index);

      // Reset et animation de progress bar
      const progress = item.querySelector('.carousel-progress');
      if (progress) {
        progress.style.transition = "none";
        progress.style.width = "0%";

        if (i === index) {
          // Timeout pour forcer le recalcul avant animation
          setTimeout(() => {
            progress.style.transition = `width ${delay}ms linear`;
            progress.style.width = "100%";
          }, 50);
        }
      }
    });
    currentIndex = index;
  }

  function nextSlide() {
    let newIndex = (currentIndex + 1) % items.length;
    showSlide(newIndex);
  }

  function goToSlide(index) {
    showSlide(index);
    resetInterval();
  }

  function startInterval() {
    interval = setInterval(nextSlide, delay);
  }

  function resetInterval() {
    clearInterval(interval);
    startInterval();
  }

  // Initialisation
  showSlide(currentIndex);
  startInterval();
});

