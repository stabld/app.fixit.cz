// === GLOBÁLNÍ PROMĚNNÉ A SUPABASE ===
window.SB_URL = "https://iyvvwsnhezjrjrkscbyc.supabase.co";
window.SB_KEY = "sb_publishable_OehKo_l9qTAp-xfmlHpzOA_OYBp4ouc";
window.sb = null;
try { if (window.supabase) window.sb = window.supabase.createClient(window.SB_URL, window.SB_KEY); } catch(e) {}

window.APP_ROLE = "customer";
window.APP_USER = null;
window.STATE = { requests: [], craftJobs: [], marketRequests: [] };

window.poptHistoryText = "";
window.poptBase64 = null;
window.poptMime = null;
window.activeChatId = null;
window.msgSubscription = null;
window.currentRatingValue = 5;
window._notifCount = 0;
window._notifItems = [];
window._pendingDelete = null;
window._marketMap = null;
window._avatarCache = {};

window.safeStorageGet = function(key) {
    try { return window.localStorage ? localStorage.getItem(key) : null; } catch (e) { return null; }
};
window.safeStorageSet = function(key, value) {
    try { if (window.localStorage) localStorage.setItem(key, value); } catch (e) {}
};
