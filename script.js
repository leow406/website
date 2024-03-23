// Fonction pour ouvrir la lightbox avec une image spécifique
function openLightbox(imageSrc) {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');

  lightbox.style.display = "block";
  lightboxImg.src = imageSrc;
}

// Fonction pour fermer la lightbox
function closeLightbox() {
  document.getElementById('lightbox').style.display = "none";
}
