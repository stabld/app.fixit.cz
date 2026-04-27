// === GLOBÁLNÍ PROMĚNNÉ ===
window.SBURL = "https://iyvvwsnhezjrjrkscbyc.supabase.co";
window.SBKEY = "sbp_publishable0ehKol9qTAp-xfmlHpzOAOYBp4ouc";
window.sb = null;
try { if (window.supabase) window.sb = window.supabase.createClient(window.SBURL, window.SBKEY); } catch(e) {}
window.APP_ROLE = "customer";
window.APP_USER = null;
window.STATE = { requests: [], craftJobs: [], marketRequests: [] };
window.activeChatId = null;
window.msgSubscription = null;
window.notifCount = 0;
window.notifItems = [];
window.pendingDelete = null;
window.marketMap = null;

// === LOADER ===
function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.opacity = "0";
        loader.style.transform = "scale(1.05)";
        loader.style.pointerEvents = "none";
        setTimeout(() => { if (loader.parentNode) loader.remove(); }, 600);
    }
}
setTimeout(hideLoader, 4000);
window.addEventListener("load", function() { setTimeout(hideLoader, 1800); });

// === SESSION CHECK ===
window.addEventListener("load", async function() {
    if (!window.sb) {
        hideLoader();
        document.getElementById("view-role-select")?.classList.remove("hidden");
        return;
    }
    const { data: { session } } = await window.sb.auth.getSession();
    if (session && session.user) {
        window.APP_USER = session.user;
        window.APP_ROLE = session.user.user_metadata?.role || "customer";
        const name = session.user.user_metadata?.fullname || "Uživatel";
        document.getElementById("auth-screen")?.classList.add("hidden");
        const appEl = document.getElementById("main-app");
        if (appEl) { appEl.classList.remove("hidden"); appEl.style.opacity = 1; }
        window.initApp(window.APP_ROLE, name);
    } else {
        hideLoader();
        document.getElementById("view-role-select")?.classList.remove("hidden");
    }
});

// === ZBYTEK (tvůj stávající kód) ===
window.initApp = function(role, name) {
    window.APP_ROLE = role;
    document.getElementById("user-name").innerText = name || "Uživatel";
    document.getElementById("user-role-lbl").innerText = role === "craftsman" ? "Řemeslník" : "Zákazník";
    const roleIcon = document.getElementById("role-icon");
    if(roleIcon) roleIcon.className = "fa-solid " + (role === "craftsman" ? "fa-toolbox" : "fa-house");
};

window.switchTab = function(tab) {
    const login = document.getElementById("form-login");
    const reg = document.getElementById("form-reg");
    const forgot = document.getElementById("form-forgot");
    const btnLogin = document.getElementById("btn-login");
    const btnReg = document.getElementById("btn-reg");
    const slider = document.getElementById("tab-slider");
    if(!login || !reg || !forgot || !btnLogin || !btnReg || !slider) return;
    login.classList.add("hidden");
    reg.classList.add("hidden");
    forgot.classList.add("hidden");
    if(tab === "login") { login.classList.remove("hidden"); slider.style.transform = "translateX(0%)"; }
    else if(tab === "register") { reg.classList.remove("hidden"); slider.style.transform = "translateX(100%)"; }
    else if(tab === "forgot") { forgot.classList.remove("hidden"); }
};

window.doLogin = async function() {
    try {
        const email = document.getElementById("log-email").value.trim();
        const pass = document.getElementById("log-pass").value.trim();
        if(!email || !pass) return window.showToast("Chybí údaje", "Vyplň e-mail a heslo.", "error");
        const { error } = await window.sb.auth.signInWithPassword({ email, password: pass });
        if(error) throw error;
    } catch(err) { window.showToast("Přihlášení selhalo", err.message || "Zkuste to znovu.", "error"); }
};

window.doRegister = async function() {
    try {
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const pass = document.getElementById("reg-pass").value.trim();
        if(!name || !email || !pass) return window.showToast("Chybí údaje", "Vyplň jméno, e-mail a heslo.", "error");
        if(pass.length < 6) return window.showToast("Slabé heslo", "Heslo musí mít alespoň 6 znaků.", "error");
        const { error } = await window.sb.auth.signUp({ email, password: pass, options: { data: { fullname: name, role: window.APP_ROLE || "customer" } } });
        if(error) throw error;
        window.showToast("Registrace hotova", "Zkontroluj e-mail a dokonči přihlášení.", "success");
    } catch(err) { window.showToast("Registrace selhala", err.message || "Zkuste to znovu.", "error"); }
};

window.doLogout = async function() {
    try { if(window.sb) await window.sb.auth.signOut(); location.reload(); }
    catch(err) { window.showToast("Odhlášení selhalo", err.message || "Zkuste to znovu.", "error"); }
};

window.backToRoles = function() {
    document.getElementById("view-auth-form").classList.add("hidden");
    document.getElementById("view-role-select").classList.remove("hidden");
};

window.goToAuth = function(role) {
    window.APP_ROLE = role;
    document.getElementById("view-role-select").classList.add("hidden");
    document.getElementById("view-auth-form").classList.remove("hidden");
    document.getElementById("role-text").innerText = role === "craftsman" ? "Řemeslník" : "Zákazník";
    window.switchTab("login");
};
