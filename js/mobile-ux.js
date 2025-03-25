// Mobile UX Enhancements

document.addEventListener('DOMContentLoaded', function() {
  // Add mobile navigation if it doesn't exist
  if (!document.querySelector('.mobile-nav')) {
    createMobileNavigation();
  }
  
  // Initialize module topics sheet if on module page
  if (document.querySelector('aside .space-y-2')) {
    initializeModuleTopicsSheet();
  }
  
  // Enhance mobile file uploads
  if (document.getElementById('dropZone')) {
    enhanceMobileFileUpload();
  }
  
  // Fix iframe content sizing
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    iframe.setAttribute('loading', 'lazy');
  });
  
  // Improve mobile scrolling
  document.querySelectorAll('.overflow-y-auto').forEach(el => {
    el.style.webkitOverflowScrolling = 'touch';
  });
  
  // Add viewport height fix for mobile
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  window.addEventListener('resize', () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });
});

// Create mobile navigation
function createMobileNavigation() {
  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav';
  mobileNav.innerHTML = `
    <a href="./courceindex.html" class="mobile-nav-item ${window.location.href.includes('courceindex') ? 'active' : ''}">
      <i class="fas fa-home"></i>
      <span>Home</span>
    </a>
    <a href="./modules/main pages/modulespagehtml.html" class="mobile-nav-item ${window.location.href.includes('module') ? 'active' : ''}">
      <i class="fas fa-book"></i>
      <span>Courses</span>
    </a>
    <a href="./assignmenntpage.html" class="mobile-nav-item ${window.location.href.includes('assignment') ? 'active' : ''}">
      <i class="fas fa-tasks"></i>
      <span>Tasks</span>
    </a>
    <a href="./interviewfrontend.html" class="mobile-nav-item ${window.location.href.includes('interview') ? 'active' : ''}">
      <i class="fas fa-question-circle"></i>
      <span>Quiz</span>
    </a>
    <a href="#" class="mobile-nav-item" id="mobileMenuToggle">
      <i class="fas fa-bars"></i>
      <span>More</span>
    </a>
  `;
  document.body.appendChild(mobileNav);
  
  // Toggle more menu
  document.getElementById('mobileMenuToggle').addEventListener('click', function(e) {
    e.preventDefault();
    toggleMobileMenu();
  });
}

// Initialize module topics sheet
function initializeModuleTopicsSheet() {
  // Create the sheet element
  const sheet = document.createElement('div');
  sheet.className = 'module-topics-sheet';
  sheet.innerHTML = `
    <div class="handle"></div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-lg">Module Topics</h3>
      <button class="close-sheet p-2">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="topics-container space-y-2"></div>
  `;
  document.body.appendChild(sheet);
  
  // Clone topics from sidebar
  const topicsContainer = sheet.querySelector('.topics-container');
  const sidebarTopics = document.querySelectorAll('aside .space-y-2 button');
  
  sidebarTopics.forEach(topic => {
    const clone = topic.cloneNode(true);
    topicsContainer.appendChild(clone);
    
    clone.addEventListener('click', () => {
      const index = Array.from(sidebarTopics).indexOf(topic);
      sidebarTopics[index].click();
      toggleModuleTopicsSheet();
    });
  });
  
  // Add mobile toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'fixed bottom-16 right-4 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50';
  toggleButton.innerHTML = '<i class="fas fa-list"></i>';
  toggleButton.addEventListener('click', toggleModuleTopicsSheet);
  document.body.appendChild(toggleButton);
  
  // Close button functionality
  sheet.querySelector('.close-sheet').addEventListener('click', toggleModuleTopicsSheet);
  
  // Touch drag functionality
  const handle = sheet.querySelector('.handle');
  let startY = 0;
  let currentY = 0;
  
  handle.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    sheet.style.transition = 'none';
  });
  
  handle.addEventListener('touchmove', e => {
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0) {
      sheet.style.transform = `translateY(${deltaY}px)`;
    }
  });
  
  handle.addEventListener('touchend', e => {
    sheet.style.transition = 'transform 0.3s ease';
    if (currentY - startY > 100) {
      toggleModuleTopicsSheet();
    } else {
      sheet.style.transform = 'translateY(0)';
    }
  });
}

// Toggle module topics sheet
function toggleModuleTopicsSheet() {
  const sheet = document.querySelector('.module-topics-sheet');
  sheet.classList.toggle('active');
}

// Toggle mobile menu
function toggleMobileMenu() {
  if (document.querySelector('.mobile-menu')) {
    document.querySelector('.mobile-menu').classList.toggle('active');
  } else {
    // Create mobile menu if it doesn't exist
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu active';
    mobileMenu.innerHTML = `
      <div class="p-4 bg-white shadow-md">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-semibold text-lg">Menu</h3>
          <button class="close-menu p-2">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="space-y-4">
          <a href="./community.html" class="flex items-center p-3 hover:bg-gray-50 rounded-lg">
            <i class="fas fa-users mr-3 text-gray-600"></i>
            <span>Community</span>
          </a>
          <a href="./projects.html" class="flex items-center p-3 hover:bg-gray-50 rounded-lg">
            <i class="fas fa-project-diagram mr-3 text-gray-600"></i>
            <span>Projects</span>
          </a>
          <a href="#" class="flex items-center p-3 hover:bg-gray-50 rounded-lg">
            <i class="fas fa-cog mr-3 text-gray-600"></i>
            <span>Settings</span>
          </a>
          <a href="#" class="flex items-center p-3 hover:bg-gray-50 rounded-lg">
            <i class="fas fa-sign-out-alt mr-3 text-gray-600"></i>
            <span>Logout</span>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(mobileMenu);
    
    // Close button functionality
    mobileMenu.querySelector('.close-menu').addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', e => {
      if (!mobileMenu.contains(e.target) && !document.getElementById('mobileMenuToggle').contains(e.target)) {
        mobileMenu.classList.remove('active');
      }
    });
  }
}

// Enhance mobile file upload
function enhanceMobileFileUpload() {
  const dropZone = document.getElementById('dropZone');
  
  // Make upload area more touch-friendly
  dropZone.addEventListener('touchstart', () => {
    document.getElementById('fileInput').click();
  });
  
  // Add visual feedback
  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      dropZone.classList.add('border-blue-600', 'bg-blue-50');
      
      setTimeout(() => {
        dropZone.classList.remove('bg-blue-50');
      }, 1000);
    }
  });
}
