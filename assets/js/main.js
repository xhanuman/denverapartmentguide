// Main JavaScript file for Denver Apartment Guide

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initMobileMenu();
  initSearchFilters();
  initLazyLoading();
  initMapViews();
  
  // Track page load for analytics
  trackPageView();
});

// Mobile menu toggle
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav ul');
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', 
        menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
      );
    });
  }
}

// Search filters functionality
function initSearchFilters() {
  const searchForm = document.querySelector('.search-bar form');
  
  if (searchForm) {
    // Pre-populate search fields from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    urlParams.forEach((value, key) => {
      const field = searchForm.querySelector(`[name="${key}"]`);
      if (field) {
        field.value = value;
      }
    });
    
    // Add event listeners for filter changes
    const filterSelects = searchForm.querySelectorAll('select');
    
    filterSelects.forEach(select => {
      select.addEventListener('change', function() {
        // Track filter usage for analytics
        if (this.value) {
          trackEvent('search_filter_used', {
            filter_name: this.name,
            filter_value: this.value
          });
        }
      });
    });
  }
}

// Lazy loading for images
function initLazyLoading() {
  // Check if browser supports Intersection Observer
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// Initialize Google Maps for neighborhood pages
function initMapViews() {
  const mapElement = document.getElementById('map');
  
  if (mapElement) {
    // Get coordinates from data attributes
    const lat = parseFloat(mapElement.dataset.lat);
    const lng = parseFloat(mapElement.dataset.lng);
    const zoom = parseInt(mapElement.dataset.zoom);
    
    // Initialize map when Google Maps API is loaded
    window.initMap = function() {
      const map = new google.maps.Map(mapElement, {
        center: { lat, lng },
        zoom: zoom || 14,
        styles: [
          {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#444444"}]
          },
          {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{"color": "#f2f2f2"}]
          },
          {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
          },
          {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{"saturation": -100}, {"lightness": 45}]
          },
          {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{"visibility": "simplified"}]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{"visibility": "off"}]
          },
          {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
          },
          {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#4299e1"}, {"visibility": "on"}]
          }
        ]
      });
      
      // Add neighborhood boundary marker
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: document.querySelector('h1').textContent
      });
      
      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="map-info-window">
          <h3>${document.querySelector('h1').textContent}</h3>
          <p>Explore apartments in this neighborhood</p>
          <a href="/search/?neighborhood=${mapElement.dataset.neighborhood}" class="btn btn-sm btn-primary">View Listings</a>
        </div>`
      });
      
      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
    };
  }
}

// Analytics tracking functions
function trackPageView() {
  // Check if Google Analytics is available
  if (typeof gtag === 'function') {
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }
}

function trackEvent(eventName, eventParams) {
  // Check if Google Analytics is available
  if (typeof gtag === 'function') {
    gtag('event', eventName, eventParams);
  }
}

// Schema.org structured data enhancement
function enhanceStructuredData() {
  // This function can be used to dynamically add structured data
  // based on page content if needed beyond the static schema in head.html
  
  // Example: Add aggregate rating schema to neighborhood pages
  const neighborhoodPage = document.querySelector('.neighborhood-header');
  
  if (neighborhoodPage) {
    const neighborhoodName = document.querySelector('h1').textContent;
    const walkScore = document.querySelector('.meta-value[data-score="walk"]')?.textContent;
    
    if (walkScore) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Place",
        "name": neighborhoodName,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": walkScore,
          "bestRating": "100",
          "worstRating": "0",
          "ratingCount": "1",
          "name": "Walk Score"
        }
      });
      
      document.head.appendChild(script);
    }
  }
}

// Call structured data enhancement after page load
window.addEventListener('load', enhanceStructuredData);
