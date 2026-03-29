const zoomModal = document.getElementById('zoom-modal');
const zoomedImage = document.getElementById('zoomed-image');

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('can-zoom')) {
    zoomedImage.src = e.target.src;
    zoomModal.classList.add('active');

    // Optional: enable mobile back gesture to close
    history.pushState({ zoom: true }, '');
  }
});

// Close when clicking outside the image
zoomModal.addEventListener('click', (e) => {
  if (e.target === zoomModal) {
    closeZoom();
  }
});

// Close on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeZoom();
  }
});

function closeZoom() {
  zoomModal.classList.remove('active');
  zoomedImage.src = '';

  // Clean up history entry if added
  if (history.state && history.state.zoom) {
    history.back();
  }
}

// Handle mobile back gesture
window.addEventListener('popstate', () => {
  if (zoomModal.classList.contains('active')) {
    closeZoom();
  }
});

// Close on click
zoomedImage.addEventListener('click', () => {
  closeZoom();
});