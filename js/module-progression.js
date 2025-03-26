/**
 * Module Progression System
 * Handles unlocking modules based on topic completion
 */

const ModuleProgression = (function() {
    // Constants
    const TOPICS_REQUIRED_FOR_UNLOCK = 5;

    // Check if a module should be unlocked
    function checkModuleUnlock(moduleIndex) {
        const completedTopics = JSON.parse(localStorage.getItem(`module${moduleIndex}CompletedTopics`)) || [];
        return completedTopics.length >= TOPICS_REQUIRED_FOR_UNLOCK;
    }

    // Update module UI based on completion status
    function updateModuleUI() {
        const moduleCards = document.querySelectorAll('.module-card');
        
        moduleCards.forEach((card, index) => {
            const moduleIndex = parseInt(card.dataset.moduleIndex);
            const previousModuleIndex = moduleIndex - 1;
            
            // First module is always unlocked
            if (moduleIndex === 0) {
                unlockModule(card);
                return;
            }
            
            // Check if previous module has enough completed topics
            if (checkModuleUnlock(previousModuleIndex)) {
                unlockModule(card);
            } else {
                lockModule(card);
            }
        });
    }
    
    // Unlock a module with animation
    function unlockModule(moduleCard) {
        if (moduleCard.classList.contains('locked')) {
            moduleCard.classList.remove('locked');
            
            // Add unlock animation
            moduleCard.classList.add('module-unlocked');
            
            // Update status badge
            const badge = moduleCard.querySelector('.module-status');
            if (badge) {
                badge.textContent = 'Available';
                badge.classList.remove('bg-gray-200', 'text-gray-600');
                badge.classList.add('bg-green-100', 'text-green-800');
            }
            
            // Enable button
            const button = moduleCard.querySelector('button');
            if (button) {
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }
    
    // Lock a module
    function lockModule(moduleCard) {
        if (!moduleCard.classList.contains('locked')) {
            moduleCard.classList.add('locked');
            
            // Update status badge
            const badge = moduleCard.querySelector('.module-status');
            if (badge) {
                badge.textContent = 'Locked';
                badge.classList.remove('bg-green-100', 'text-green-800');
                badge.classList.add('bg-gray-200', 'text-gray-600');
            }
            
            // Disable button
            const button = moduleCard.querySelector('button');
            if (button) {
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }
    
    // Process topic completion
    function markTopicCompleted(moduleIndex, topicIndex) {
        const storageKey = `module${moduleIndex}CompletedTopics`;
        const completedTopics = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        if (!completedTopics.includes(topicIndex)) {
            completedTopics.push(topicIndex);
            localStorage.setItem(storageKey, JSON.stringify(completedTopics));
            
            // Check if we've reached the threshold to unlock next module
            if (completedTopics.length === TOPICS_REQUIRED_FOR_UNLOCK) {
                showModuleUnlockedNotification(moduleIndex + 1);
            }
        }
        
        // Update UI if we're on a page with module cards
        if (document.querySelectorAll('.module-card').length > 0) {
            updateModuleUI();
        }
    }
    
    // Show a notification when a new module is unlocked
    function showModuleUnlockedNotification(moduleIndex) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg opacity-0 transform translate-y-10 z-50';
        notification.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-unlock-alt text-2xl mr-3"></i>
                <div>
                    <h3 class="font-bold">New Module Unlocked!</h3>
                    <p class="text-sm">You've unlocked Module ${moduleIndex + 1}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(10px)';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
    
    // Add CSS styles for animations
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .module-unlocked {
                animation: pulse-green 2s;
            }
            
            @keyframes pulse-green {
                0% {
                    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 15px rgba(52, 211, 153, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
                }
            }
            
            .module-card {
                transition: all 0.3s ease;
            }
            
            .module-card.locked {
                filter: grayscale(0.8);
                opacity: 0.8;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Reset completed topics when changing modules
    function resetTopicProgress() {
        localStorage.removeItem('completedTopics');
        localStorage.setItem('currentVideoIndex', '0');
        localStorage.setItem('currentProgress', '0');
        return [];
    }

    // Update module navigation function
    function navigateToModule(currentModule, nextModule) {
        // Save current module as completed
        const completedModules = JSON.parse(localStorage.getItem('completedModules')) || [];
        if (!completedModules.includes(currentModule)) {
            completedModules.push(currentModule);
            localStorage.setItem('completedModules', JSON.stringify(completedModules));
        }
        
        // Reset topic tracking for new module
        resetTopicProgress();
        
        // Navigate to next module
        window.location.href = `module${nextModule}videopage.html?module=${nextModule}`;
    }

    // Initialize the module
    function init() {
        addStyles();
        
        // Update UI if we're on a page with module cards
        if (document.querySelectorAll('.module-card').length > 0) {
            updateModuleUI();
        }
    }
    
    // Public API
    return {
        init,
        markTopicCompleted,
        checkModuleUnlock,
        resetTopicProgress,
        navigateToModule,
        TOPICS_REQUIRED_FOR_UNLOCK
    };
})();

// Run on load
document.addEventListener('DOMContentLoaded', ModuleProgression.init);
