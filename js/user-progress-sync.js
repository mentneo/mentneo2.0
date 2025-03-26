/**
 * User Progress Sync Module
 * Provides functions for syncing user progress across devices using Firestore
 */

const UserProgressSync = (function() {
    // Private variables
    let firebaseAuth;
    let firebaseDb;
    let isInitialized = false;
    let currentUser = null;
    
    // Initialize the module with Firebase instances
    function init(auth, db) {
        if (isInitialized) return;
        
        firebaseAuth = auth;
        firebaseDb = db;
        isInitialized = true;
        
        // Set up auth state listener
        firebaseAuth.onAuthStateChanged(user => {
            currentUser = user;
        });
    }
    
    // Save module progress to Firestore
    async function saveModuleProgress(moduleKey, data) {
        if (!isInitialized || !currentUser) return;
        
        try {
            // Get current user data
            const userDoc = await firebaseDb.collection('userProgress').doc(currentUser.uid).get();
            let userData = userDoc.exists ? userDoc.data() : {};
            
            // Create module object if it doesn't exist
            if (!userData[moduleKey]) {
                userData[moduleKey] = {};
            }
            
            // Update with new data
            userData[moduleKey] = {
                ...userData[moduleKey],
                ...data,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Update last activity
            userData.lastActivity = firebase.firestore.FieldValue.serverTimestamp();
            userData.lastModule = moduleKey;
            
            // Save to Firestore
            await firebaseDb.collection('userProgress').doc(currentUser.uid).set(userData);
            return true;
        } catch (error) {
            console.error(`Error saving module progress for ${moduleKey}:`, error);
            return false;
        }
    }
    
    // Get module progress from Firestore
    async function getModuleProgress(moduleKey) {
        if (!isInitialized || !currentUser) return null;
        
        try {
            const userDoc = await firebaseDb.collection('userProgress').doc(currentUser.uid).get();
            if (userDoc.exists && userDoc.data()[moduleKey]) {
                return userDoc.data()[moduleKey];
            }
            return null;
        } catch (error) {
            console.error(`Error getting module progress for ${moduleKey}:`, error);
            return null;
        }
    }
    
    // Mark module as completed
    async function markModuleCompleted(moduleKey, moduleIndex) {
        if (!isInitialized || !currentUser) return;
        
        try {
            const userDoc = await firebaseDb.collection('userProgress').doc(currentUser.uid).get();
            let userData = userDoc.exists ? userDoc.data() : {};
            
            if (!userData.completedModules) {
                userData.completedModules = [];
            }
            
            if (!userData.completedModules.includes(moduleIndex)) {
                userData.completedModules.push(moduleIndex);
            }
            
            if (!userData[moduleKey]) {
                userData[moduleKey] = {};
            }
            
            userData[moduleKey].completed = true;
            userData[moduleKey].completedAt = firebase.firestore.FieldValue.serverTimestamp();
            userData.lastActivity = firebase.firestore.FieldValue.serverTimestamp();
            
            await firebaseDb.collection('userProgress').doc(currentUser.uid).set(userData);
            return true;
        } catch (error) {
            console.error(`Error marking module ${moduleKey} as completed:`, error);
            return false;
        }
    }
    
    // Mark topic as completed
    async function markTopicCompleted(moduleKey, topicIndex) {
        if (!isInitialized || !currentUser) return;
        
        try {
            const userDoc = await firebaseDb.collection('userProgress').doc(currentUser.uid).get();
            let userData = userDoc.exists ? userDoc.data() : {};
            
            if (!userData[moduleKey]) {
                userData[moduleKey] = { completedTopics: [] };
            }
            
            if (!userData[moduleKey].completedTopics) {
                userData[moduleKey].completedTopics = [];
            }
            
            if (!userData[moduleKey].completedTopics.includes(topicIndex)) {
                userData[moduleKey].completedTopics.push(topicIndex);
            }
            
            userData.lastActivity = firebase.firestore.FieldValue.serverTimestamp();
            userData.lastModule = moduleKey;
            
            await firebaseDb.collection('userProgress').doc(currentUser.uid).set(userData);
            return true;
        } catch (error) {
            console.error(`Error marking topic ${topicIndex} as completed in module ${moduleKey}:`, error);
            return false;
        }
    }
    
    // Get all user progress
    async function getAllProgress() {
        if (!isInitialized || !currentUser) return null;
        
        try {
            const userDoc = await firebaseDb.collection('userProgress').doc(currentUser.uid).get();
            if (userDoc.exists) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error("Error getting all progress:", error);
            return null;
        }
    }
    
    // Sync local storage with Firestore
    async function syncWithLocalStorage(moduleKey) {
        if (!isInitialized || !currentUser) return;
        
        try {
            // Get local storage data
            const completedTopics = JSON.parse(localStorage.getItem('completedTopics') || '[]');
            const currentVideoIndex = parseInt(localStorage.getItem('currentVideoIndex') || '0');
            const currentProgress = parseFloat(localStorage.getItem('currentProgress') || '0');
            
            // Get Firestore data
            const moduleProgress = await getModuleProgress(moduleKey);
            
            if (moduleProgress) {
                // Merge data - prefer server data but keep local if it's more advanced
                const mergedTopics = new Set([
                    ...(moduleProgress.completedTopics || []),
                    ...completedTopics
                ]);
                
                // Determine which video index to use
                let finalVideoIndex = Math.max(
                    moduleProgress.currentVideoIndex || 0,
                    currentVideoIndex
                );
                
                // Determine which progress to use
                let finalProgress = Math.max(
                    moduleProgress.currentProgress || 0,
                    currentProgress
                );
                
                // Update local storage
                localStorage.setItem('completedTopics', JSON.stringify(Array.from(mergedTopics)));
                localStorage.setItem('currentVideoIndex', finalVideoIndex.toString());
                localStorage.setItem('currentProgress', finalProgress.toString());
                
                // Update Firestore
                await saveModuleProgress(moduleKey, {
                    completedTopics: Array.from(mergedTopics),
                    currentVideoIndex: finalVideoIndex,
                    currentProgress: finalProgress
                });
                
                return {
                    completedTopics: Array.from(mergedTopics),
                    currentVideoIndex: finalVideoIndex,
                    currentProgress: finalProgress
                };
            } else {
                // No server data, save local data to server
                await saveModuleProgress(moduleKey, {
                    completedTopics,
                    currentVideoIndex,
                    currentProgress
                });
                
                return {
                    completedTopics,
                    currentVideoIndex,
                    currentProgress
                };
            }
        } catch (error) {
            console.error(`Error syncing ${moduleKey} with local storage:`, error);
            return null;
        }
    }
    
    // Is user signed in
    function isSignedIn() {
        return !!currentUser;
    }
    
    // Get current user
    function getCurrentUser() {
        return currentUser;
    }
    
    // Public API
    return {
        init,
        saveModuleProgress,
        getModuleProgress,
        markModuleCompleted,
        markTopicCompleted,
        getAllProgress,
        syncWithLocalStorage,
        isSignedIn,
        getCurrentUser
    };
})();

// If Firebase is already loaded, initialize the module
if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
    UserProgressSync.init(firebase.auth(), firebase.firestore());
}
