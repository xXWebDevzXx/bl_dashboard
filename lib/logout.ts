/**
 * Logout function that clears all sessions, cache, and redirects to Auth0 logout
 * Can be called from anywhere in the app
 */
export async function logout() {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies by setting them to expire
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear service worker cache if available
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Clear IndexedDB if any exists
    if (window.indexedDB) {
      const databases = await window.indexedDB.databases();
      databases.forEach(db => {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });
    }
  } catch (error) {
    console.error('Error clearing cache during logout:', error);
  } finally {
    // Always redirect to Auth0 logout regardless of cache clearing success
    // Include returnTo parameter to specify where to redirect after logout
    const returnTo = encodeURIComponent(window.location.origin);
    window.location.href = `/api/auth/logout?returnTo=${returnTo}`;
  }
}

