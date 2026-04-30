window.signInWith = async function(provider) {
    if (!window.sb) {
        alert("Chyba: Supabase není inicializováno");
        return;
    }
    await window.sb.auth.signInWithOAuth({ provider: provider, options: { redirectTo: window.location.origin } });
};

window.clearMsgNotif = function() {
    window.msgNotifCount = 0;
    const badge = document.getElementById('sidebar-msg-badge');
    if (badge) badge.classList.add('hidden');
};

// === GLOBÁLNÍ PROMĚNNÉ ===
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

window.safeStorageGet = function(key) {
    try { return window.localStorage ? localStorage.getItem(key) : null; } catch (e) { return null; }
};
window.safeStorageSet = function(key, value) {
    try { if (window.localStorage) localStorage.setItem(key, value); } catch (e) {}
};

// === LOADER ===
(function() {
    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader && loader.style.opacity !== '0') {
            loader.style.opacity = '0';
            loader.style.transform = 'scale(1.05)';
            loader.style.pointerEvents = 'none';
            setTimeout(() => { if (loader.parentNode) loader.remove(); }, 600);
        }
    }
    setTimeout(hideLoader, 4000);
    window.addEventListener('load', function() { setTimeout(hideLoader, 1800); });
})();

// === SESSION CHECK ===
window.addEventListener('load', async () => {
    if (window.sb) {
        const { data: { session } } = await window.sb.auth.getSession();
        if (session && session.user) {
            window.APP_USER = session.user;
            window.APP_ROLE = session.user.user_metadata?.role || "customer";
            const name = session.user.user_metadata?.full_name || "Uživatel";
            const authEl = document.getElementById("auth-screen");
            if (authEl) authEl.classList.add("hidden");
            const appEl = document.getElementById("main-app");
            appEl.classList.remove("hidden"); appEl.style.opacity = "1";
            window.initApp(window.APP_ROLE, name);
        } else {
            document.getElementById("view-role-select").classList.remove("hidden");
        }
    } else {
        document.getElementById("view-role-select").classList.remove("hidden");
    }
});

// === TOAST ===
window.showToast = function(title, message, type) {
    type = type || 'success';
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: 'fa-check', info: 'fa-bell', error: 'fa-exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<div class="toast-icon ' + type + '"><i class="fa-solid ' + (icons[type]||'fa-bell') + '"></i></div>' +
        '<div style="flex:1;min-width:0;"><div class="toast-title">' + title + '</div>' +
        (message ? '<div class="toast-msg">' + message + '</div>' : '') + '</div>' +
        '<button class="toast-close" onclick="this.closest(\'.toast\').remove()"><i class="fa-solid fa-times"></i></button>' +
        '<div class="toast-progress"></div>';
    container.appendChild(toast);
    window.addNotif(title, message);
    setTimeout(function() {
        toast.classList.add('hiding');
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 350);
    }, 4500);
};

// === NOTIFIKACE ===
window.addNotif = function(title, message) {
    window.notifCount++;
    window.notifItems.unshift({ title, message, time: new Date().toLocaleTimeString('cs', {hour:'2-digit', minute:'2-digit'}) });
    if (window.notifItems.length > 10) window.notifItems.pop();
    const badge = document.getElementById('notif-badge');
    if (badge) {
        badge.innerText = window.notifCount > 9 ? '9+' : window.notifCount;
        badge.classList.add('visible');
        badge.classList.remove('shake'); void badge.offsetWidth; badge.classList.add('shake');
    }
    const sidebarBadge = document.getElementById('sidebar-msg-badge');
    if (sidebarBadge) {
        window.msgNotifCount = (window.msgNotifCount || 0) + 1;
        sidebarBadge.innerText = window.msgNotifCount > 9 ? '9+' : window.msgNotifCount;
        sidebarBadge.classList.remove('hidden');
    }
    const list = document.getElementById('notif-list');
    if (list) {
        const empty = document.getElementById('notif-empty'); if (empty) empty.remove();
        const item = document.createElement('div'); item.className = 'notif-item';
        item.innerHTML = `<div class="notif-dot"></div><div><div class="notif-item-title">${title}</div><div class="notif-item-msg">${message}</div></div><div style="margin-left:auto;font-size:11px;color:#94a3b8;flex-shrink:0">${window.notifItems[0].time}</div>`;
        list.insertBefore(item, list.firstChild);
    }
};

window.clearNotifs = function() {
    window._notifCount = 0;
    const badge = document.getElementById("notif-badge");
    if (badge) badge.classList.remove("visible","shake");
    const list = document.getElementById("notif-list");
    if (list) list.innerHTML = '<div id="notif-empty" style="padding:24px 16px;text-align:center;color:#94a3b8;font-size:13px;"><i class="fa-regular fa-bell-slash text-2xl mb-2 block opacity-40"></i>Žádná oznámení</div>';
    window._notifItems = [];
};
window.toggleNotifDropdown = function() {
    const dd = document.getElementById("notif-dropdown");
    if (!dd) return;
    const isOpen = dd.classList.contains("open");
    if (isOpen) { dd.classList.remove("open"); return; }
    dd.classList.add("open");
    setTimeout(() => {
        document.addEventListener("click", function closeDD(e) {
            if (!document.getElementById("notif-bell").contains(e.target)) {
                dd.classList.remove("open");
                document.removeEventListener("click", closeDD);
            }
        });
    }, 10);
};

// === HELPER ===
window.extractPhotoFromDesc = function(rawDesc) {
    if (!rawDesc) return { desc: "", photo: null, mime: null };
    const parts = rawDesc.split("||PHOTO||");
    if (parts.length > 1) {
        const desc = parts[0].trim();
        const photoParts = parts[1].split("||MIME||");
        return { desc, photo: photoParts[0], mime: photoParts[1] };
    }
    return { desc: rawDesc, photo: null, mime: null };
};

// === KRÁSNÉ KARTY ===
window.createBeautifulCard = function(req, isMarket, i) {
    try {
        const statusMap = { waiting:"Hledáme profíka", active:"Probíhá oprava", done:"Dokončeno" };
        const badgeMap = { waiting:"status-waiting", active:"status-active", done:"status-done" };
        let rawDesc = req.description || req.popis || "";
        let extracted = window.extractPhotoFromDesc(rawDesc);
        let mainDesc = extracted.desc;
        let reqPhoto = extracted.photo || req.photo;
        let reqMime = extracted.mime || req.mime;
        let detailsHtml = "";
        if (mainDesc.includes("---")) {
            const pts = mainDesc.split("---");
            mainDesc = pts[0].trim();
            if (pts.length > 1) {
                let rawDetails = pts[1].replace("📋 DOPLŇUJÍCÍ INFORMACE:", "").trim();
                const detailItems = rawDetails.split(/\r?\n/).map(l => l.trim()).filter(l => l);
                if (detailItems.length > 0) {
                    detailsHtml = '<div class="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700/50"><p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Doplňující informace</p><div class="flex flex-wrap gap-2">' +
                        detailItems.map(item => '<div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">' + item + '</div>').join('') +
                        '</div></div>';
                }
            }
        }
        const photoHtml = reqPhoto ? '<div class="w-full md:w-48 h-32 md:h-full shrink-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm relative group cursor-pointer" onclick="window.openLightbox(this.querySelector(\'img\').src)">' + '<img src="data:' + (reqMime||'image/jpeg') + ';base64,' + reqPhoto + '" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">' + '<div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center"><i class="fa-solid fa-expand text-white opacity-0 group-hover:opacity-100 text-2xl transition-all"></i></div></div>' : '';
        if (!isMarket) {
            return '<div class="req-card relative bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group fade-up overflow-hidden">' +
                '<div class="absolute top-0 left-0 w-1.5 h-full ' + (req.status==='done'?'bg-slate-300 dark:bg-slate-700':'bg-fixit-500') + '"></div>' +
                '<div class="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"><button onclick="window.deleteRequest(' + i + ',' + (req.sbId||'null') + ')" class="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm"><i class="fa-solid fa-trash-can text-sm"></i></button></div>' +
                '<div class="pl-2"><div class="flex items-center gap-3 mb-3 pr-10"><span class="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide"><i class="fa-solid fa-tag mr-1.5 opacity-70"></i>' + req.kat + '</span><span class="text-[11px] text-slate-400 font-bold uppercase tracking-wide"><i class="fa-regular fa-clock mr-1.5 opacity-70"></i>' + req.time + '</span></div>' +
                '<div class="flex items-start justify-between gap-4 mb-4"><h4 class="text-xl md:text-2xl font-extrabold dark:text-white leading-tight">' + req.title + '</h4><span class="status-badge ' + (badgeMap[req.status]||'status-waiting') + ' shrink-0">' + (statusMap[req.status]||'Čeká') + '</span></div>' +
                '<div class="flex flex-col md:flex-row gap-5 mb-2">' + photoHtml + '<div class="flex-1 min-w-0"><p class="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">' + mainDesc + '</p></div></div>' +
                detailsHtml +
                '<div class="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">' +
                '<button onclick="window.loadOffersForRequest(' + (req.sbId||0) + ',\'' + (req.title||'').replace(/'/g,"\\'") + '\')" class="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-md">Zobrazit nabídky řemeslníků</button>' +
                (req.status==='active' ? '<button onclick="window.openRatingModal(' + i + ',' + (req.sbId||'null') + ')" class="px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><i class="fa-solid fa-check mr-2"></i>Označit hotovo</button>' : '') +
                '</div></div></div>';
        } else {
            const iconMap = {"Instalatérství":"fa-faucet-drip","Elektrikář":"fa-bolt","Malíř":"fa-paint-roller","Tesař":"fa-door-open","Zámečník":"fa-lock","default":"fa-screwdriver-wrench"};
            const reqCat = req.category||"Ostatní";
            const reqUrg = req.urgency||"Střední";
            return '<div class="market-item bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 hover:border-fixit-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer fade-up overflow-hidden relative group" data-kat="' + reqCat + '" style="animation-delay:' + (i*60) + 'ms">' +
                '<div class="absolute top-0 left-0 w-1.5 h-full bg-fixit-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>' +
                '<div class="pl-2"><div class="flex items-start gap-5"><div class="w-14 h-14 bg-fixit-50 dark:bg-fixit-500/10 text-fixit-500 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner border border-fixit-100 dark:border-fixit-500/20"><i class="fa-solid ' + (iconMap[reqCat]||iconMap.default) + '"></i></div>' +
                '<div class="flex-1 min-w-0"><div class="flex items-start justify-between gap-3 mb-2"><h4 class="text-xl font-extrabold dark:text-white leading-tight">' + req.title + '</h4><span class="status-badge ' + (reqUrg==="Vysoká"?"bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400":"status-waiting") + ' shrink-0">' + reqUrg + '</span></div>' +
                '<div class="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4"><span class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"><i class="fa-solid fa-tag mr-1.5 opacity-70"></i>' + reqCat + '</span><span class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"><i class="fa-solid fa-user mr-1.5 opacity-70"></i>' + (req.customer_name||'Zákazník') + '</span><span class="bg-fixit-50 dark:bg-fixit-500/10 text-fixit-600 dark:text-fixit-400 px-2 py-1 rounded"><i class="fa-solid fa-coins mr-1.5"></i>' + (req.price_estimate||'Dohodou') + '</span></div>' +
                '<p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">' + mainDesc + '</p>' +
                detailsHtml +
                '<div class="flex gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800"><button onclick="window.openOfferModal(' + i + ')" class="flex-1 bg-fixit-500 hover:bg-fixit-600 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md hover:scale-[1.02]">Podat nabídku zákazníkovi</button><button class="w-12 h-12 border-2 border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-fixit-500 hover:border-fixit-500 hover:bg-fixit-50 dark:hover:bg-fixit-500/10 transition-colors"><i class="fa-regular fa-bookmark"></i></button></div>' +
                '</div></div></div></div>';
        }
    } catch(err) { return '<div class="p-4 bg-red-50 text-red-500 rounded-xl">Chyba vykreslení karty.</div>'; }
};

// === HODNOCENÍ ===
window.openRatingModal = function(index, sbId) {
    document.getElementById("rating-req-index").value = index;
    document.getElementById("rating-req-sbid").value = sbId;
    window.setRating(5);
    document.getElementById("rating-comment").value = "";
    const modal = document.getElementById("rating-modal");
    modal.classList.remove("hidden"); void modal.offsetWidth; modal.classList.add("opacity-100");
};
window.closeRatingModal = function() {
    const modal = document.getElementById("rating-modal");
    if (modal) { modal.classList.remove("opacity-100"); setTimeout(() => modal.classList.add("hidden"), 300); }
};
window.setRating = function(val) {
    window.currentRatingValue = val;
    document.getElementById("star-rating-container").querySelectorAll("i").forEach((star, idx) => {
        star.classList.toggle("text-yellow-400", idx < val);
        star.classList.toggle("text-slate-300", idx >= val);
    });
};
window.submitRating = async function() {
    const index = document.getElementById("rating-req-index").value;
    const sbId = document.getElementById("rating-req-sbid").value;
    const comment = document.getElementById("rating-comment").value.trim();
    const btn = document.getElementById("btn-submit-rating");
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Ukládám...'; btn.disabled = true;
    if (sbId !== "null" && window.sb) {
        try { await window.sb.from("requests").update({ status: "done" }).eq("id", sbId); } catch(e) {}
    }
    window.STATE.requests[index].status = "done";
    window.refreshRequestsList(); window.refreshDashboard();
    btn.innerHTML = orig; btn.disabled = false;
    window.closeRatingModal();
    window.showToast("Hotovo! ⭐", "Hodnocení bylo odesláno. Děkujeme!", "success");
};

// === CONFIRM MODAL ===
window.confirmDelete = function(index, sbId) {
    window._pendingDelete = { index, sbId };
    const modal = document.getElementById("confirm-modal");
    if (modal) { modal.classList.remove("hidden"); void modal.offsetWidth; modal.classList.add("opacity-100"); }
};
window.closeConfirmModal = function() {
    const modal = document.getElementById("confirm-modal");
    if (modal) { modal.classList.remove("opacity-100"); setTimeout(() => modal.classList.add("hidden"), 300); }
    window._pendingDelete = null;
};
window.doConfirmDelete = function() {
    if (!window._pendingDelete) return;
    const { index, sbId } = window._pendingDelete;
    window.closeConfirmModal();
    window._doDeleteRequest(index, sbId);
};

// === AUTH ===
window.goToAuth = function(role) {
    window.APP_ROLE = role;
    document.getElementById("role-icon").className = role === "customer" ? "fa-solid fa-house" : "fa-solid fa-toolbox";
    document.getElementById("role-text").innerText = role === "customer" ? "Zákazník" : "Řemeslník";
    document.getElementById("view-role-select").classList.add("hidden");
    document.getElementById("view-auth-form").classList.remove("hidden");
    window.switchTab("login"); window.clearMsg();
};
window.backToRoles = function() {
    document.getElementById("view-auth-form").classList.add("hidden");
    document.getElementById("view-role-select").classList.remove("hidden");
    window.clearMsg();
};
window.switchTab = function(t) {
    window.clearMsg();
    const slider = document.getElementById("tab-slider");
    if (slider) { slider.style.opacity = t==='forgot'?'0':'1'; slider.style.transform = t==="register"?"translateX(100%)":"translateX(0)"; }
    document.getElementById("btn-login").classList.toggle("text-slate-500", t!=="login");
    document.getElementById("btn-reg").classList.toggle("text-slate-500", t!=="register");
    document.getElementById("form-login").classList.toggle("hidden", t!=="login");
    document.getElementById("form-reg").classList.toggle("hidden", t!=="register");
    document.getElementById("form-forgot").classList.toggle("hidden", t!=="forgot");
};
window.showErr = function(m) { const e = document.getElementById("auth-error"); e.innerText = m; e.classList.remove("hidden"); document.getElementById("auth-ok").classList.add("hidden"); };
window.showOk = function(m) { const e = document.getElementById("auth-ok"); e.innerText = m; e.classList.remove("hidden"); document.getElementById("auth-error").classList.add("hidden"); };
window.clearMsg = function() { document.getElementById("auth-error").classList.add("hidden"); document.getElementById("auth-ok").classList.add("hidden"); };

window.doRegister = async function() {
    if (!window.sb) return window.showErr("Chyba připojení.");
    const btn = document.getElementById("btn-do-reg");
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Vytvářím...'; btn.disabled = true;
    try {
        const { error } = await window.sb.auth.signUp({ email: document.getElementById("reg-email").value, password: document.getElementById("reg-pass").value, options: { data: { full_name: document.getElementById("reg-name").value, role: window.APP_ROLE } } });
        if (error) throw error;
        window.showOk("Účet vytvořen! Nyní se přihlaste.");
        setTimeout(() => window.switchTab("login"), 1800);
    } catch(e) { window.showErr("Chyba: " + e.message); }
    finally { btn.innerHTML = "Vytvořit účet"; btn.disabled = false; }
};

window.doLogin = async function() {
    if (!window.sb) return window.showErr("Chyba připojení.");
    const btn = document.getElementById("btn-do-login");
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Přihlašuji...'; btn.disabled = true;
    try {
        const { data, error } = await window.sb.auth.signInWithPassword({ email: document.getElementById("log-email").value, password: document.getElementById("log-pass").value });
        if (error) throw error;
        window.showOk("Přihlášeno! Spouštím aplikaci...");
        window.APP_USER = data.user;
        const name = data.user.user_metadata?.full_name || "Uživatel";
        setTimeout(() => window.launchApp(window.APP_ROLE, name), 900);
    } catch(e) { window.showErr("Špatný e-mail nebo heslo."); }
    finally { btn.innerHTML = "Přihlásit se"; btn.disabled = false; }
};

window.doResetPassword = async function() {
    if (!window.sb) return window.showErr("Chyba připojení.");
    const email = document.getElementById("forgot-email").value.trim();
    if (!email) return window.showErr("Zadejte prosím svůj e-mail.");
    const btn = document.getElementById("btn-do-forgot");
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Odesílám...'; btn.disabled = true;
    try {
        const { error } = await window.sb.auth.resetPasswordForEmail(email);
        if (error) throw error;
        window.showOk("Odkaz pro obnovu hesla byl odeslán.");
        setTimeout(() => window.switchTab("login"), 4000);
    } catch(e) { window.showErr("Chyba: " + e.message); }
    finally { btn.innerHTML = "Odeslat odkaz"; btn.disabled = false; }
};

window.doLogout = async function() { if(window.sb) await window.sb.auth.signOut(); window.location.reload(); };

window.launchApp = function(role, name) {
    const as = document.getElementById("auth-screen");
    as.style.opacity = "0"; as.style.transition = "opacity 0.4s";
    setTimeout(() => {
        as.classList.add("hidden");
        const app = document.getElementById("main-app");
        app.classList.remove("hidden"); app.style.opacity = "0";
        setTimeout(() => { app.style.transition = "opacity 0.4s"; app.style.opacity = "1"; }, 50);
        window.initApp(role, name);
    }, 400);
};

window.initApp = function(role, name) {
    const avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(name) + "&backgroundColor=" + (role==="customer"?"f59e0b":"0f172a");
    const el = (id) => document.getElementById(id);
    if(el("user-name")) el("user-name").innerText = name;
    if(el("user-role-lbl")) el("user-role-lbl").innerText = role==="customer"?"Zákazník":"Řemeslník";
    const savedAv = window.APP_USER?.user_metadata?.avatar_url;
    const displayAv = savedAv ? (savedAv + "?v=" + (window.APP_USER?.updated_at||Date.now())) : avatarUrl;
    if(el("user-avatar")) el("user-avatar").src = displayAv;
    const tt = el("theme-toggle");
    const ui = () => {
        const d = document.documentElement.classList.contains("dark");
        if (el("theme-toggle-dark-icon")) el("theme-toggle-dark-icon").classList.toggle("hidden", d);
        if (el("theme-toggle-light-icon")) el("theme-toggle-light-icon").classList.toggle("hidden", !d);
    };
    ui();
    if (tt && !tt.dataset.boundTheme) {
        tt.dataset.boundTheme = "1";
        tt.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");
            try {
                if (window.localStorage) {
                    window.safeStorageSet("color-theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
                }
            } catch (e) {}
            ui();
        });
    }
    if (role === "customer") window.initCustomer(name); else window.initCraftsman(name);
    setTimeout(() => {
        if(window.APP_USER) {
            const meta = window.APP_USER.user_metadata || {};
            ["prof-name","prof-email","prof-phone","prof-city","prof-bio"].forEach(id => {
                const pel = el(id); if(!pel) return;
                if(id==="prof-name") pel.value = name;
                else if(id==="prof-email") pel.value = window.APP_USER.email||"";
                else if(id==="prof-phone") pel.value = meta.phone||"";
                else if(id==="prof-city") pel.value = meta.city||"";
                else if(id==="prof-bio") pel.value = meta.bio||"";
            });
            const savedAvatar = window.APP_USER?.user_metadata?.avatar_url;
            const displayAvatar = savedAvatar ? (savedAvatar + "?v=" + (window.APP_USER?.updated_at||Date.now())) : avatarUrl;
            if(el("prof-avatar-img")) el("prof-avatar-img").src = displayAvatar;
            if(el("user-avatar")) el("user-avatar").src = displayAvatar;
            if(el("prof-role-badge")) el("prof-role-badge").innerText = role==="customer"?"Zákazník":"Řemeslník";
        }
    }, 100);
    setTimeout(async () => {
        if (role==="customer") { await window.loadCustomerRequestsFromDB(); await window.loadCustomerConversations(); }
        else { await window.loadCraftsmanJobsFromDB(); await window.loadCraftsmanConversations(); await window.loadMarketFromDB(); }
    }, 500);
    setTimeout(() => window.showToast("Vítej, " + name + "! 👋", "Přihlášen jako " + (role==="customer"?"Zákazník":"Řemeslník") + ".", "success"), 600);
};

// === PROFIL ===
window._profilePhotoBase64 = null;

window.handleProfilePhoto = async function(input) {
    const file = input.files[0]; if (!file) return;
    if (file.size > 10000000) { window.showToast("Fotka je příliš velká", "Maximální velikost je 10 MB.", "error"); return; }

    const compressedBlob = await new Promise(function(resolve) {
        const fr = new FileReader();
        fr.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const MAX = 600; let w = img.width, h = img.height;
                if(w>h){if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}}else{if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}}
                const canvas = document.createElement("canvas");
                canvas.width=w; canvas.height=h;
                canvas.getContext("2d").drawImage(img,0,0,w,h);
                const preview = canvas.toDataURL("image/jpeg", 0.9);
                document.querySelectorAll("#prof-avatar-img").forEach(function(el){ el.src=preview; el.style.objectFit="cover"; });
                document.getElementById("user-avatar").src = preview;
                canvas.toBlob(function(blob){ resolve(blob); }, "image/jpeg", 0.9);
            };
            img.onerror = function() { resolve(null); };
            img.src = e.target.result;
        };
        fr.onerror = function() { resolve(null); };
        fr.readAsDataURL(file);
    });

    if (!compressedBlob) { window.showToast("Chyba", "Nepodařilo se načíst obrázek.", "error"); return; }
    if (!window.sb || !window.APP_USER) { window._profilePhotoBlob = compressedBlob; return; }

    window.showToast("Nahrávám...", "Ukládám profilovou fotku.", "info");
    try {
        const path = window.APP_USER.id + ".jpg";
        const { error: upErr } = await window.sb.storage
            .from("avatars")
            .upload(path, compressedBlob, { upsert: true, contentType: "image/jpeg" });
        if (upErr) throw new Error(upErr.message);

        const { data: urlData } = window.sb.storage.from("avatars").getPublicUrl(path);
        const publicUrl = urlData.publicUrl;

        const { error: metaErr } = await window.sb.auth.updateUser({ data: { avatar_url: publicUrl } });
        if (metaErr) throw new Error(metaErr.message);

        const { data: fresh } = await window.sb.auth.getUser();
        if (fresh?.user) window.APP_USER = fresh.user;

        const displayUrl = publicUrl + "?v=" + Date.now();
        document.getElementById("user-avatar").src = displayUrl;
        document.querySelectorAll("#prof-avatar-img").forEach(function(el){ el.src=displayUrl; });
        if (window.APP_USER) delete window._avatarCache[window.APP_USER.id];
        window._profilePhotoBlob = null;
        window.showToast("Fotka nahrána! 📸", "Profilová fotka byla úspěšně uložena.", "success");
    } catch(err) {
        window._profilePhotoBlob = compressedBlob;
        window.showToast("Chyba fotky", err.message, "error");
    }
};

window.saveProfile = async function(btnNode) {
    if (!window.sb || !window.APP_USER) return;
    const orig = btnNode.innerHTML;
    btnNode.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Ukládám...'; btnNode.disabled = true;
    try {
        const updateData = {
            full_name: document.getElementById("prof-name").value.trim(),
            phone: document.getElementById("prof-phone").value.trim(),
            city: document.getElementById("prof-city").value.trim(),
            bio: document.getElementById("prof-bio")?.value.trim()||""
        };

        if (window._profilePhotoBlob) {
            btnNode.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Nahrávám fotku...';
            const path = window.APP_USER.id + ".jpg";
            const { error: upErr } = await window.sb.storage.from("avatars").upload(path, window._profilePhotoBlob, { upsert: true, contentType: "image/jpeg" });
            if (upErr) throw new Error("Chyba nahrávání fotky: " + upErr.message);
            const { data: urlData } = window.sb.storage.from("avatars").getPublicUrl(path);
            updateData.avatar_url = urlData.publicUrl;
            window._profilePhotoBlob = null;
        }

        btnNode.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Ukládám profil...';
        const { data, error } = await window.sb.auth.updateUser({ data: updateData });
        if (error) throw error;

        const { data: freshData } = await window.sb.auth.getUser();
        const freshUser = freshData?.user || data.user;
        window.APP_USER = freshUser;

        const name = freshUser.user_metadata?.full_name || updateData.full_name;
        const savedAvatarUrl = freshUser.user_metadata?.avatar_url || updateData.avatar_url;
        const displayUrl = savedAvatarUrl || ("https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(name) + "&backgroundColor=" + (window.APP_ROLE==="customer"?"f59e0b":"0f172a"));

        document.getElementById("user-name").innerText = name;
        document.getElementById("user-avatar").src = displayUrl;
        document.querySelectorAll("#prof-avatar-img").forEach(function(img) { img.src = displayUrl; });

        window.showToast("Profil uložen! ✅", "Vaše změny byly úspěšně uloženy.", "success");
    } catch(e) {
        window.showToast("Chyba ukládání", e.message, "error");
    }
    finally { btnNode.innerHTML = orig; btnNode.disabled = false; }
};

// === AI ===
window.callGeminiAPI = async function(parts, systemPrompt, useJson) {
    const res = await fetch('/api/gemini', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({parts, systemPrompt, useJson}) });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'API chyba');
    return data.text;
};

window.handlePhoto = function(input) {
    const file = input.files[0]; if (!file) return;
    window.poptMime = file.type;
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById("photo-preview").src = e.target.result;
        document.getElementById("photo-preview").classList.remove("hidden");
        window.poptBase64 = e.target.result.split(",")[1];
        document.getElementById("photo-zone").querySelector("i").classList.add("hidden");
        document.getElementById("photo-zone").querySelector("p").classList.add("hidden");
    };
    reader.readAsDataURL(file);
};

window.appendChat = function(role, text) {
    const box = document.getElementById("popt-chat-msgs");
    const d = document.createElement("div");
    if (role==="user") { d.className="poptavka-bubble-user text-sm font-medium"; d.innerText=text; }
    else { d.className="poptavka-bubble-ai text-sm flex items-start gap-3"; d.innerHTML='<div class="w-8 h-8 bg-fixit-500 rounded-full flex items-center justify-center text-white shrink-0"><i class="fa-solid fa-hard-hat text-xs"></i></div><div>' + text + '</div>'; }
    box.appendChild(d); box.scrollTop=box.scrollHeight;
};

window.processPopt = async function(text) {
    const loading = document.getElementById("popt-loading");
    const replyArea = document.getElementById("popt-reply-area");
    loading.classList.remove("hidden"); replyArea.classList.add("hidden");
    const sp = 'Jsi Bořek, profesionální technik. Vytvoř zadání pro řemeslníka.\nODPOVÍDEJ PŘESNĚ V TOMTO JSON FORMÁTU BEZ DALŠÍHO TEXTU:\n{"status":"question","message":"otázka"} nebo {"status":"done","nazev":"titulek","kategorie":"obor","popis":"popis","nalehavost":"Vysoká/Střední/Nízká","odhad_ceny":"cena Kč","rada":"rada"}';
    let parts = [{text}];
    if (window.poptBase64 && window.poptMime) parts.push({inlineData:{mimeType:window.poptMime,data:window.poptBase64}});
    try {
        const raw = await window.callGeminiAPI(parts, sp, true);
        let clean = raw.replace(/```json/gi,"").replace(/```/g,"").trim();
        const s=clean.indexOf("{"), e=clean.lastIndexOf("}");
        if(s!==-1&&e!==-1) clean=clean.substring(s,e+1);
        const d = JSON.parse(clean);
        loading.classList.add("hidden");
        if(d.status==="question") { window.appendChat("ai",d.message.replace(/[*]/g,"")); replyArea.classList.remove("hidden"); document.getElementById("popt-reply").focus(); }
        else if(d.status==="done") {
            document.getElementById("r-nazev").innerText=d.nazev.replace(/[*]/g,"");
            document.getElementById("r-kat").innerText=d.kategorie.replace(/[*]/g,"");
            document.getElementById("r-nal").innerText=d.nalehavost.replace(/[*]/g,"");
            document.getElementById("r-cena").innerText=d.odhad_ceny.replace(/[*]/g,"");
            document.getElementById("r-popis").innerText=d.popis.replace(/[*]/g,"");
            if(d.rada&&d.rada.trim()){document.getElementById("popt-tip-text").innerText=d.rada.replace(/[*]/g,"");document.getElementById("popt-tip").classList.remove("hidden");}
            document.getElementById("popt-result").classList.remove("hidden");
        }
    } catch(err) { loading.classList.add("hidden"); replyArea.classList.remove("hidden"); window.showToast("Chyba AI", err.message, "error"); }
};

window.startAI = function() {
    const txt = document.getElementById("popt-input").value.trim();
    if(!txt&&!window.poptBase64){window.showToast("Chybí popis","Popište závadu nebo nahrajte fotku.","error");return;}
    document.getElementById("popt-form").classList.add("hidden");
    document.getElementById("popt-chat").classList.remove("hidden");
    window.poptHistoryText = txt||"Posílám fotografii k analýze.";
    window.appendChat("user",window.poptHistoryText);
    window.processPopt(window.poptHistoryText);
};
window.replyAI = function() {
    const inp=document.getElementById("popt-reply");
    const txt=inp.value.trim(); if(!txt)return;
    window.appendChat("user",txt);
    window.poptHistoryText+="\nUpřesnění od uživatele: "+txt;
    inp.value=""; window.processPopt(window.poptHistoryText);
};
window.showFinalizeForm = function() {
    document.getElementById("btn-show-finalize").classList.add("hidden");
    document.getElementById("popt-finalize").classList.remove("hidden");
    document.getElementById("popt-finalize").scrollIntoView({behavior:"smooth"});
};

// === PUBLISH REQUEST ===
window.publishRequest = async function(btnNode) {
    let orig = "Zveřejnit poptávku na Fixit";
    try {
        if(btnNode&&btnNode.tagName){orig=btnNode.innerHTML;btnNode.innerHTML='<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Zpracovávám...';btnNode.disabled=true;}
        const getText=(id,def)=>{const el=document.getElementById(id);return el?el.innerText.trim():def;};
        const getValue=(id,def)=>{const el=document.getElementById(id);return el?el.value.trim():def;};
        const title=getText("r-nazev","Nová poptávka"),kat=getText("r-kat","Ostatní"),popis=getText("r-popis",""),nal=getText("r-nal","Střední"),cena=getText("r-cena","Dohodou");
        const street=getValue("f-street",""),city=getValue("f-city",""),phone=getValue("f-phone",""),timeframe=getValue("f-timeframe","Během několika dnů"),property=getValue("f-property","Byt"),parking=getValue("f-parking","Bezproblémové"),budget=getValue("f-budget","");

        const highlightError = (id) => {
            const el=document.getElementById(id); if(!el)return; el.focus();
            el.style.borderColor="#ef4444"; el.style.boxShadow="0 0 0 3px rgba(239,68,68,0.18)";
            setTimeout(()=>{el.style.borderColor="";el.style.boxShadow="";},3000);
        };

        if(!street||!city||!phone){
            window.showToast("Chybí kontaktní údaje","Vyplňte ulici, město a telefonní číslo.","error");
            if(!street)highlightError("f-street"); else if(!city)highlightError("f-city"); else highlightError("f-phone");
            if(btnNode&&btnNode.tagName){btnNode.innerHTML=orig;btnNode.disabled=false;} return;
        }
        if(street.length<5||!/[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(street)||!/\d/.test(street)){
            window.showToast("Neplatná adresa","Zadejte ulici i číslo popisné, např. Masarykova 15.","error");
            highlightError("f-street"); if(btnNode&&btnNode.tagName){btnNode.innerHTML=orig;btnNode.disabled=false;} return;
        }
        if(city.length<2||/\d/.test(city)){
            window.showToast("Neplatné město","Zadejte název města bez čísel.","error");
            highlightError("f-city"); if(btnNode&&btnNode.tagName){btnNode.innerHTML=orig;btnNode.disabled=false;} return;
        }
        const phoneDigits=phone.replace(/\D/g,"");
        if(!/^[+]?[\d\s\-().]{7,20}$/.test(phone)||phoneDigits.length<9){
            window.showToast("Neplatné telefonní číslo","Zadejte číslo ve formátu +420 123 456 789.","error");
            highlightError("f-phone"); if(btnNode&&btnNode.tagName){btnNode.innerHTML=orig;btnNode.disabled=false;} return;
        }

        const detailInfo = ["📍 Adresa: "+street+", "+city,"📞 Telefon: "+phone,"📅 Termín: "+timeframe,"🏠 Typ objektu: "+property,"🚗 Parkování: "+parking,...(budget?["💰 Rozpočet: "+budget]:[])].join('\n');
        let finalPopis=popis+"\n\n---\n📋 DOPLŇUJÍCÍ INFORMACE:\n"+detailInfo;
        if(window.poptBase64&&window.poptMime) finalPopis+="\n||PHOTO||"+window.poptBase64+"||MIME||"+window.poptMime;

        let sbId=null;
        if(window.sb&&window.APP_USER){
            const cName=document.getElementById("user-name").textContent||"Zákazník";
            const {data,error}=await window.sb.from("requests").insert({customer_id:window.APP_USER.id,customer_name:cName,title,category:kat,description:finalPopis,urgency:nal,price_estimate:cena,status:"waiting"}).select();
            if(!error&&data&&data.length>0) sbId=data[0].id;
        }
        const now=new Date().toLocaleTimeString("cs",{hour:"2-digit",minute:"2-digit"});
        window.STATE.requests.unshift({sbId,title,kat,popis:finalPopis,time:now,status:"waiting",photo:window.poptBase64,mime:window.poptMime});
        window.refreshRequestsList(); window.refreshDashboard();
        window.poptHistoryText=""; window.poptBase64=null; window.poptMime=null;
        ["popt-input","f-street","f-city","f-phone","f-budget"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
        document.getElementById("popt-chat-msgs").innerHTML="";
        document.getElementById("photo-preview").classList.add("hidden");
        const pz=document.getElementById("photo-zone");if(pz){pz.querySelector("i").classList.remove("hidden");pz.querySelector("p").classList.remove("hidden");}
        ["popt-result","popt-tip","popt-chat","popt-finalize"].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add("hidden");});
        document.getElementById("btn-show-finalize").classList.remove("hidden");
        document.getElementById("popt-form").classList.remove("hidden");
        if(btnNode&&btnNode.tagName){btnNode.innerHTML=orig;btnNode.disabled=false;}
        window.showToast("Poptávka zveřejněna! 🎉","Řemeslníci budou brzy kontaktovat.","success");
        window.goTab("requests","Moje poptávky");
    } catch(err) {
        window.showToast("Chyba","Nastala chyba: "+err.message,"error");
        if(btnNode&&btnNode.tagName){btnNode.innerHTML=orig;btnNode.disabled=false;}
    }
};

window.deleteRequest = function(index, sbId) { window.confirmDelete(index, sbId); };
window._doDeleteRequest = async function(index, sbId) {
    if(sbId&&window.sb){
        try {
            await window.sb.from("requests").delete().eq("id",sbId);
            await window.sb.from("offers").delete().eq("request_id",sbId);
            await window.sb.from("messages").delete().eq("conversation_id",String(sbId));
        } catch(e){}
    }
    window.STATE.requests.splice(index,1);
    window.refreshRequestsList(); window.refreshDashboard();
    window.showToast("Smazáno","Poptávka byla úspěšně smazána.","info");
};

// === CUSTOMER INIT ===
window.initCustomer = function(name) {
    window.buildNav([{id:"dash",icon:"fa-house",label:"Nástěnka"},{id:"requests",icon:"fa-list-check",label:"Moje poptávky"},{id:"messages",icon:"fa-comment-dots",label:"Zprávy"},{id:"payments",icon:"fa-shield-halved",label:"Platby & Escrow"},{id:"profile",icon:"fa-user",label:"Můj profil"}]);
    document.getElementById("header-cta").innerHTML = '<button onclick="window.goTab(\'new\',\'Nová poptávka\')" class="bg-fixit-500 hover:bg-fixit-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition hover:scale-105"><i class="fa-solid fa-hard-hat"></i> <span>Nová poptávka</span></button>';
    document.getElementById("main-content").innerHTML = window.customerHTML(name);
    window.goTab("dash","Nástěnka");
};

window.customerHTML = function(name) {
    const first = name.split(" ")[0];
    return `
    <div id="view-dash" class="hidden fade-up">
        <div class="mb-10"><h2 class="text-3xl font-extrabold mb-2 dark:text-white">Vítejte, ${first} 👋</h2><p class="text-slate-500 text-lg">Přehled vašich aktivit na platformě Fixit.</p></div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"><p class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Aktivní</p><p class="text-4xl font-black text-fixit-500" id="stat-active">0</p></div>
            <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"><p class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Celkem</p><p class="text-4xl font-black dark:text-white" id="stat-total">0</p></div>
            <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"><p class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Zprávy</p><p class="text-4xl font-black dark:text-white" id="stat-msgs">0</p></div>
            <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"><p class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">V Escrow</p><p class="text-4xl font-black dark:text-white" id="stat-escrow">0 Kč</p></div>
        </div>
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
            <h3 class="text-xl font-extrabold mb-6 dark:text-white">Poslední poptávky</h3>
            <div id="dash-requests-list"><p class="text-slate-400 text-center py-8">Zatím žádné poptávky. <button onclick="window.goTab('new','Nová poptávka')" class="text-fixit-500 font-bold hover:underline">Vytvořit první →</button></p></div>
        </div>
    </div>
    <div id="view-requests" class="hidden fade-up">
        <div class="flex items-center justify-between mb-8"><h2 class="text-3xl font-extrabold dark:text-white">Moje poptávky</h2><button onclick="window.goTab('new','Nová poptávka')" class="bg-fixit-500 hover:bg-fixit-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition hover:scale-105"><i class="fa-solid fa-plus"></i> Nová</button></div>
        <div id="requests-list" class="space-y-5"><div id="empty-req" class="text-center p-16 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-3xl"><i class="fa-solid fa-folder-open text-5xl text-slate-300 dark:text-slate-600 mb-5 block"></i><p class="font-bold text-slate-500 text-lg">Zatím zde nic není.</p><button onclick="window.goTab('new','Nová poptávka')" class="mt-4 text-fixit-500 font-bold hover:underline text-sm">Vytvořit první poptávku →</button></div></div>
    </div>
    <div id="view-messages" class="hidden fade-up">
        <h2 class="text-3xl font-extrabold mb-8 dark:text-white">Zprávy</h2>
        <div id="chat-container-customer" class="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div id="conv-panel-customer" class="chat-conv-panel w-80 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col bg-slate-50/50 dark:bg-transparent">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800"><p class="font-bold text-sm dark:text-white">Konverzace</p></div>
                <div id="conv-list" class="flex-1 overflow-y-auto hide-scroll"><div class="p-8 text-center text-sm text-slate-400">Žádné konverzace</div></div>
            </div>
            <div id="msg-panel-customer" class="chat-msg-panel flex-1 flex flex-col relative">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white/50 dark:bg-transparent backdrop-blur-md z-10">
                    <button onclick="window.showConvList('customer')" class="md:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0"><i class="fa-solid fa-arrow-left text-sm"></i></button>
                    <div id="chat-partner-avatar" class="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0"></div>
                    <p class="font-extrabold dark:text-white text-sm flex-1 truncate" id="chat-partner-name">Vyberte konverzaci</p>
                </div>
                <div id="chat-msgs" class="flex-1 overflow-y-auto hide-scroll p-4 flex flex-col gap-3"></div>
                <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2 bg-slate-50 dark:bg-transparent"><input type="text" id="msg-input" placeholder="Napište zprávu..." onkeypress="if(event.key==='Enter')window.sendMsg()" class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm"><button onclick="window.sendMsg()" class="bg-fixit-500 hover:bg-fixit-600 text-white w-11 h-11 rounded-2xl flex items-center justify-center transition shrink-0"><i class="fa-solid fa-paper-plane text-sm"></i></button></div>
            </div>
        </div>
    </div>
    <div id="view-payments" class="hidden fade-up max-w-4xl">
        <h2 class="text-3xl font-extrabold mb-8 dark:text-white">Platby & Escrow</h2>
        <div class="bg-gradient-to-br from-fixit-500 to-fixit-600 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden"><div class="absolute -right-10 -top-10 text-white/10 text-9xl"><i class="fa-solid fa-shield-halved"></i></div><p class="text-xs font-black uppercase tracking-widest opacity-80 mb-2 relative z-10">Peníze v bezpečné úschově</p><p class="text-5xl font-black mb-4 relative z-10">0 Kč</p><p class="text-sm opacity-90 relative z-10">Peníze jsou zablokovány u Fixit do vašeho potvrzení o dokončení opravy.</p></div>
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center text-sm text-slate-400 py-12">Zatím neproběhly žádné platby.</div>
    </div>
    <div id="view-profile" class="hidden fade-up max-w-4xl mx-auto">
        <h2 class="text-3xl font-extrabold mb-8 dark:text-white">Můj profil</h2>
        <div class="bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <div class="flex flex-col md:flex-row gap-8">
                <div class="flex flex-col items-center gap-3 shrink-0">
                    <div class="relative group">
                        <img id="prof-avatar-img" src="" class="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg object-cover">
                        <label for="prof-avatar-input" class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                            <span class="text-white text-center text-xs font-bold leading-tight"><i class="fa-solid fa-camera text-xl mb-1 block"></i>Změnit</span>
                        </label>
                        <input type="file" id="prof-avatar-input" accept="image/*" class="hidden" onchange="window.handleProfilePhoto(this)">
                        <label for="prof-avatar-input" class="absolute -bottom-1 -right-1 w-9 h-9 bg-fixit-500 hover:bg-fixit-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition">
                            <i class="fa-solid fa-camera text-white text-sm"></i>
                        </label>
                    </div>
                    <span class="bg-fixit-50 dark:bg-fixit-500/10 text-fixit-600 dark:text-fixit-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest" id="prof-role-badge">Role</span>
                    <p class="text-xs text-slate-400 text-center">Max. 10 MB<br>JPG, PNG, GIF</p>
                </div>
                <div class="flex-1 space-y-5">
                    <div class="grid md:grid-cols-2 gap-5">
                        <div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Jméno a příjmení</label><input type="text" id="prof-name" class="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white"></div>
                        <div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">E-mail (nelze změnit)</label><input type="email" id="prof-email" disabled class="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm text-slate-500 cursor-not-allowed"></div>
                    </div>
                    <div class="grid md:grid-cols-2 gap-5">
                        <div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefonní číslo</label><input type="tel" id="prof-phone" class="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white" placeholder="+420 ..."></div>
                        <div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Město</label><input type="text" id="prof-city" class="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white" placeholder="Např. Brno"></div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                        <button onclick="window.saveProfile(this)" class="flex-1 bg-fixit-500 hover:bg-fixit-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition shadow-xl shadow-fixit-500/20 hover:-translate-y-1">Uložit změny v profilu</button>
                        <button onclick="window.doLogout()" class="sm:w-auto px-8 py-4 rounded-2xl font-black text-lg transition border-2 border-red-200 dark:border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center gap-2"><i class="fa-solid fa-arrow-right-from-bracket"></i> Odhlásit se</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="view-new" class="hidden fade-up max-w-5xl mx-auto w-full">
        <div class="bg-white dark:bg-[#0f172a] p-8 md:p-10 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            <div class="absolute top-[-20%] right-[-10%] w-96 h-96 bg-fixit-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div class="mb-10 flex items-center gap-5 relative z-10 border-b border-slate-100 dark:border-slate-800 pb-6"><div class="w-16 h-16 rounded-2xl bg-fixit-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-fixit-500/30"><i class="fa-solid fa-hard-hat text-2xl"></i></div><div><h3 class="text-2xl font-extrabold dark:text-white leading-tight">Asistent Bořek</h3><p class="text-fixit-600 dark:text-fixit-500 text-[11px] font-black uppercase tracking-widest mt-1">Příprava zakázky s umělou inteligencí</p></div></div>
            <div id="popt-form" class="space-y-6 relative z-10">
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="flex flex-col"><label class="font-extrabold text-sm text-slate-700 dark:text-slate-300 mb-3 block">Co se pokazilo?</label><textarea id="popt-input" class="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 dark:text-white focus:ring-2 focus:ring-fixit-500 outline-none resize-none min-h-[180px] shadow-inner" placeholder="Opište svůj problém co nejpodrobněji..."></textarea></div>
                    <div class="flex flex-col"><label class="font-extrabold text-sm text-slate-700 dark:text-slate-300 mb-3 block">Fotka závady (volitelné)</label><div class="relative flex-1 min-h-[180px] group"><input type="file" accept="image/*" onchange="window.handlePhoto(this)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"><div id="photo-zone" class="w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 group-hover:border-fixit-500 group-hover:bg-fixit-50 dark:group-hover:bg-fixit-500/10 transition-all overflow-hidden relative z-10 shadow-inner"><i class="fa-solid fa-camera text-4xl mb-3 text-slate-300 dark:text-slate-500 group-hover:text-fixit-500 transition-colors"></i><p class="text-sm font-bold text-slate-500 group-hover:text-fixit-600 transition-colors">Klikněte pro nahrání fotky</p><img id="photo-preview" class="hidden absolute inset-0 w-full h-full object-cover cursor-pointer" onclick="window.openLightbox(this.src)"></div></div></div>
                </div>
                <button onclick="window.startAI()" class="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-fixit-500 dark:hover:bg-fixit-500 hover:text-white font-black py-5 rounded-2xl text-lg transition-all shadow-xl hover:-translate-y-1">Analyzovat problém s Bořkem</button>
            </div>
            <div id="popt-chat" class="hidden flex flex-col gap-6 relative z-10">
                <div id="popt-chat-msgs" class="flex flex-col gap-4 max-h-[400px] overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 hide-scroll shadow-inner"></div>
                <div id="popt-reply-area" class="hidden flex gap-3"><input type="text" id="popt-reply" onkeypress="if(event.key==='Enter')window.replyAI()" class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm" placeholder="Odpovězte Bořkovi..."><button onclick="window.replyAI()" class="bg-fixit-500 hover:bg-fixit-600 text-white px-8 py-4 rounded-2xl font-bold transition hover:scale-105 shadow-lg"><i class="fa-solid fa-paper-plane"></i></button></div>
            </div>
            <div id="popt-loading" class="hidden mt-12 text-center relative z-10 py-10"><div class="relative w-20 h-20 mx-auto mb-6"><div class="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div><div class="absolute inset-0 border-4 border-fixit-500 rounded-full border-t-transparent animate-spin"></div><i class="fa-solid fa-microchip absolute inset-0 m-auto flex items-center justify-center text-2xl text-fixit-500" style="line-height:5rem"></i></div><p class="font-extrabold text-slate-600 dark:text-slate-300 text-lg">Bořek analyzuje data...</p><p class="text-slate-400 text-sm mt-2">Vytváříme profi zadání pro řemeslníky.</p></div>
            <div id="popt-result" class="hidden mt-10 relative z-10">
                <div id="popt-tip" class="hidden mb-8 bg-fixit-50 dark:bg-fixit-500/10 border border-fixit-200 dark:border-fixit-500/30 rounded-2xl p-6 shadow-sm"><div class="flex gap-4"><div class="w-10 h-10 rounded-full bg-white dark:bg-fixit-500/20 text-fixit-500 flex items-center justify-center shrink-0 shadow-sm"><i class="fa-solid fa-lightbulb text-lg"></i></div><div><p class="font-black text-[11px] uppercase tracking-widest mb-1.5 text-fixit-700 dark:text-fixit-400">Rada od Bořka</p><p id="popt-tip-text" class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed"></p></div></div></div>
                <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800"><div class="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"><i class="fa-solid fa-check text-xl"></i></div><div><h3 class="text-2xl font-black dark:text-white">Poptávka připravena!</h3><p class="text-sm text-slate-500 mt-1">Kliknutím na text níže jej upravte.</p></div></div>
                <div class="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-inner">
                    <div class="absolute top-0 left-0 w-2 h-full bg-fixit-500"></div>
                    <div class="flex flex-wrap gap-3 mb-6 pl-4"><span id="r-kat" contenteditable="true" class="status-badge bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-fixit-500 focus:outline-none cursor-text transition"></span><span id="r-nal" contenteditable="true" class="status-badge bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 focus:outline-none cursor-text transition"></span><span id="r-cena" contenteditable="true" class="status-badge bg-fixit-50 dark:bg-fixit-500/10 text-fixit-700 dark:text-fixit-400 border border-fixit-200 dark:border-fixit-500/30 focus:outline-none cursor-text transition"></span></div>
                    <h4 id="r-nazev" contenteditable="true" class="text-3xl font-black mb-6 dark:text-white focus:outline-none rounded-xl px-4 py-2 -mx-4 hover:bg-white dark:hover:bg-slate-800 transition cursor-text pl-4">...</h4>
                    <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-4">Popis pro řemeslníka</p>
                    <p id="r-popis" contenteditable="true" class="text-base text-slate-700 dark:text-slate-300 leading-relaxed focus:outline-none rounded-xl px-4 py-3 -mx-4 hover:bg-white dark:hover:bg-slate-800 transition cursor-text whitespace-pre-line min-h-[5rem] pl-4">...</p>
                    <button id="btn-show-finalize" onclick="window.showFinalizeForm()" class="w-full mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-lg transition shadow-xl hover:scale-[1.02]">Pokračovat k detailům adresy →</button>
                    <div id="popt-finalize" class="hidden mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 pl-4">
                        <h4 class="text-xl font-black dark:text-white mb-6">Doplňující údaje pro výjezd</h4>
                        <div class="grid md:grid-cols-3 gap-5 mb-5"><div class="md:col-span-2"><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Ulice a číslo popisné *</label><input type="text" id="f-street" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm" placeholder="Např. Masarykova 15"></div><div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Město *</label><input type="text" id="f-city" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm" placeholder="Např. Brno"></div></div>
                        <div class="grid md:grid-cols-2 gap-5 mb-5"><div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefonní číslo *</label><input type="tel" id="f-phone" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm" placeholder="+420 ..."></div><div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Termín</label><select id="f-timeframe" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm"><option value="Havarijní stav (Co nejdříve)">Havarijní stav (Co nejdříve)</option><option value="Během několika dnů" selected>Během několika dnů</option><option value="Nespěchá (do měsíce)">Nespěchá (do měsíce)</option></select></div></div>
                        <div class="grid md:grid-cols-2 gap-5 mb-5"><div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Typ nemovitosti</label><select id="f-property" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm"><option value="Byt">Byt</option><option value="Rodinný dům">Rodinný dům</option><option value="Komerční prostor">Komerční prostor</option></select></div><div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Parkování</label><select id="f-parking" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm"><option value="Bezproblémové (vlastní pozemek / volná ulice)">Bezproblémové (vlastní / volná ulice)</option><option value="Placené zóny / modré zóny">Placené / modré zóny</option><option value="Velmi špatné parkování">Velmi špatné parkování</option></select></div></div>
                        <div class="mb-6"><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Váš rozpočet <span class="font-normal normal-case">(volitelné)</span></label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Kč</span><input type="text" id="f-budget" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm" placeholder="Např. 2 000 – 5 000"></div><p class="text-xs text-slate-400 mt-2">Pomůže řemeslníkům připravit realistickou nabídku.</p></div>
                        <button onclick="window.publishRequest(this)" class="w-full bg-fixit-500 hover:bg-fixit-600 text-white py-5 rounded-2xl font-black text-lg transition shadow-xl shadow-fixit-500/20 hover:-translate-y-1">Zveřejnit poptávku na Fixit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

window.initCraftsman = function(name) {
    window.buildNav([{id:"market",icon:"fa-map-location-dot",label:"Tržiště zakázek"},{id:"jobs",icon:"fa-hammer",label:"Moje práce"},{id:"c-messages",icon:"fa-comment-dots",label:"Zprávy"},{id:"earnings",icon:"fa-wallet",label:"Výdělky"},{id:"profile",icon:"fa-user",label:"Můj profil"}]);
    document.getElementById("header-cta").innerHTML = '<button onclick="window.goTab(\'new\',\'Nov\u00e1 popt\u00e1vka\')\" class="bg-fixit-500 hover:bg-fixit-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition hover:scale-105\"><i class=\"fa-solid fa-hard-hat\"></i> <span>Nov\u00e1 popt\u00e1vka</span></button>';
    document.getElementById("main-content").innerHTML = window.craftsmanHTML(name);
    window.goTab("market","Tržiště zakázek");
};

window.craftsmanHTML = function(name) {
    return `
    <div id="view-market" class="hidden fade-up">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-extrabold dark:text-white">Tržiště zakázek</h2>
            <div class="flex items-center gap-2">
                <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 flex gap-1 shadow-sm">
                    <button id="view-toggle-list" onclick="window.toggleMarketView('list')" class="px-4 py-2 rounded-lg text-sm font-bold bg-fixit-500 text-white transition"><i class="fa-solid fa-list mr-1.5"></i>Seznam</button>
                    <button id="view-toggle-map" onclick="window.toggleMarketView('map')" class="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"><i class="fa-solid fa-map-location-dot mr-1.5"></i>Mapa</button>
                </div>
            </div>
        </div>
        <div class="flex gap-3 mb-8 overflow-x-auto hide-scroll pb-2">
            <button onclick="window.filterMarket('all', this)" id="filter-all" class="filter-btn shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold bg-fixit-500 text-white shadow-md transition hover:scale-105">Vše</button>
            <button onclick="window.filterMarket('Instalatérství', this)" class="filter-btn shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-fixit-500 transition hover:scale-105">Instalatérství</button>
            <button onclick="window.filterMarket('Elektrikář', this)" class="filter-btn shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-fixit-500 transition hover:scale-105">Elektrikář</button>
            <button onclick="window.filterMarket('Malíř', this)" class="filter-btn shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-fixit-500 transition hover:scale-105">Malíř</button>
            <button onclick="window.filterMarket('Tesař', this)" class="filter-btn shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-fixit-500 transition hover:scale-105">Tesař</button>
            <button onclick="window.filterMarket('Zámečník', this)" class="filter-btn shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-fixit-500 transition hover:scale-105">Zámečník</button>
        </div>
        <div id="market-list" class="space-y-5"><div class="text-center p-16 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-3xl"><i class="fa-solid fa-circle-notch fa-spin text-5xl text-fixit-500 mb-5 block"></i><p class="font-bold text-slate-500 text-lg">Hledám nové poptávky ve vašem okolí...</p></div></div>
        <div id="market-map" class="hidden"></div>
    </div>
    <div id="view-jobs" class="hidden fade-up">
        <h2 class="text-3xl font-extrabold mb-8 dark:text-white">Moje práce</h2>
        <div class="grid grid-cols-3 gap-5 mb-8"><div class="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center"><p class="text-4xl font-black text-fixit-500" id="jobs-active-count">0</p><p class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Aktivní</p></div><div class="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center"><p class="text-4xl font-black dark:text-white" id="jobs-done-count">0</p><p class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Dokončené</p></div><div class="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center"><p class="text-4xl font-black text-yellow-500" id="jobs-rating">5.0 ⭐</p><p class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Hodnocení</p></div></div>
        <div id="my-jobs-list" class="space-y-4"><div class="text-center p-12 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-3xl"><i class="fa-solid fa-hammer text-5xl text-slate-300 dark:text-slate-600 mb-4 block"></i><p class="font-bold text-slate-500 text-lg">Zatím nemáte žádné aktivní zakázky.</p></div></div>
    </div>
    <div id="view-c-messages" class="hidden fade-up max-w-4xl">
        <h2 class="text-3xl font-extrabold mb-8 dark:text-white">Zprávy</h2>
        <div id="chat-container-craftsman" class="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div id="conv-panel-craftsman" class="chat-conv-panel w-80 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col bg-slate-50/50 dark:bg-transparent">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800"><p class="font-bold text-sm dark:text-white">Konverzace</p></div>
                <div id="conv-list-c" class="flex-1 overflow-y-auto hide-scroll"><div class="p-8 text-center text-sm text-slate-400">Žádné konverzace</div></div>
            </div>
            <div id="msg-panel-craftsman" class="chat-msg-panel flex-1 flex flex-col relative">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white/50 dark:bg-transparent backdrop-blur-md z-10">
                    <button onclick="window.showConvList('craftsman')" class="md:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0"><i class="fa-solid fa-arrow-left text-sm"></i></button>
                    <p class="font-extrabold dark:text-white text-sm flex-1 truncate" id="chat-partner-name-c">Zprávy</p>
                </div>
                <div id="chat-msgs-c" class="flex-1 overflow-y-auto hide-scroll p-4 flex flex-col gap-3"></div>
                <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2 bg-slate-50 dark:bg-transparent"><input type="text" id="msg-input-c" placeholder="Napište zprávu..." onkeypress="if(event.key==='Enter')window.sendMsgC()" class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white shadow-sm"><button onclick="window.sendMsgC()" class="bg-fixit-500 hover:bg-fixit-600 text-white w-11 h-11 rounded-2xl flex items-center justify-center transition shrink-0"><i class="fa-solid fa-paper-plane text-sm"></i></button></div>
            </div>
        </div>
    </div>
    <div id="view-earnings" class="hidden fade-up max-w-3xl">
        <h2 class="text-3xl font-extrabold mb-8 dark:text-white">Výdělky</h2>
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden"><div class="absolute -right-10 -top-10 text-white/5 text-9xl"><i class="fa-solid fa-wallet"></i></div><p class="text-xs font-black uppercase tracking-widest opacity-60 mb-2 relative z-10">Celkové výdělky přes Fixit</p><p class="text-5xl font-black mb-1 relative z-10">0 Kč</p></div>
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center text-sm text-slate-400 py-12">Zatím neproběhly žádné výplaty.</div>
    </div>
    <div id="view-profile" class="hidden fade-up max-w-4xl mx-auto">
        <h2 class="text-3xl font-extrabold mb-8 dark:text-white">Můj profil</h2>
        <div class="bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <div class="flex flex-col md:flex-row gap-8">
                <div class="flex flex-col items-center gap-3 shrink-0">
                    <div class="relative group">
                        <img id="prof-avatar-img" src="" class="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg object-cover">
                        <label for="prof-avatar-input" class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                            <span class="text-white text-center text-xs font-bold leading-tight"><i class="fa-solid fa-camera text-xl mb-1 block"></i>Změnit</span>
                        </label>
                        <input type="file" id="prof-avatar-input" accept="image/*" class="hidden" onchange="window.handleProfilePhoto(this)">
                        <label for="prof-avatar-input" class="absolute -bottom-1 -right-1 w-9 h-9 bg-fixit-500 hover:bg-fixit-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition">
                            <i class="fa-solid fa-camera text-white text-sm"></i>
                        </label>
                    </div>
                    <span class="bg-fixit-50 dark:bg-fixit-500/10 text-fixit-600 dark:text-fixit-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest" id="prof-role-badge">Role</span>
                    <p class="text-xs text-slate-400 text-center">Max. 10 MB<br>JPG, PNG, GIF</p>
                </div>
                <div class="flex-1 space-y-5">
                    <div class="grid md:grid-cols-2 gap-5">
                        <div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Jméno a příjmení</label><input type="text" id="prof-name" class="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white"></div>
                        <div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">E-mail (nelze změnit)</label><input type="email" id="prof-email" disabled class="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm text-slate-500 cursor-not-allowed"></div>
                    </div>
                    <div class="grid md:grid-cols-2 gap-5">
                        <div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefonní číslo</label><input type="tel" id="prof-phone" class="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white" placeholder="+420 ..."></div>
                        <div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Město / Působnost</label><input type="text" id="prof-city" class="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white" placeholder="Např. Brno"></div>
                    </div>
                    <div><label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">O mně / Popis služeb</label><textarea id="prof-bio" rows="4" class="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-fixit-500 outline-none dark:text-white resize-none" placeholder="Popište své zkušenosti, specializaci, reference..."></textarea></div>
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                        <button onclick="window.saveProfile(this)" class="flex-1 bg-fixit-500 hover:bg-fixit-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition shadow-xl shadow-fixit-500/20 hover:-translate-y-1">Uložit změny v profilu</button>
                        <button onclick="window.doLogout()" class="sm:w-auto px-8 py-4 rounded-2xl font-black text-lg transition border-2 border-red-200 dark:border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center gap-2"><i class="fa-solid fa-arrow-right-from-bracket"></i> Odhlásit se</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

window.buildNav = function(items) {
    document.getElementById("sidebar-nav").innerHTML = items.map(item => '<button onclick="window.goTab(\'' + item.id + '\',\'' + item.label + '\')" id="nav-' + item.id + '" class="nav-item w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-sm"><i class="fa-solid ' + item.icon + ' w-5 text-center text-lg"></i> ' + item.label + '</button>').join("");
    document.getElementById("bottom-nav-items").innerHTML = items.map(item => '<button onclick="window.goTab(\'' + item.id + '\',\'' + item.label + '\')" id="bnav-' + item.id + '" class="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 text-slate-400 hover:text-fixit-500 transition min-w-0 px-0.5"><i class="fa-solid ' + item.icon + ' text-lg"></i><span class="text-[9px] font-bold leading-tight truncate max-w-full text-center">' + ({"dash":"Domů","requests":"Poptávky","messages":"Zprávy","payments":"Platby","profile":"Profil","market":"Tržiště","jobs":"Práce","c-messages":"Zprávy","earnings":"Výdělky"}[item.id]||item.label.split(" ")[0]) + '</span></button>').join("");
};

window.goTab = function(id, title) {
    document.querySelectorAll('[id^="view-"]').forEach(el => { el.classList.add("hidden"); el.classList.remove("fade-up"); });
    document.querySelectorAll(".nav-item").forEach(el => { el.classList.remove("active","text-slate-900","dark:text-white"); el.classList.add("text-slate-600","dark:text-slate-400"); });
    document.querySelectorAll('[id^="bnav-"]').forEach(el => { el.classList.remove("text-fixit-500"); el.classList.add("text-slate-400"); });
    const view = document.getElementById("view-"+id);
    if(view){view.classList.remove("hidden");void view.offsetWidth;view.classList.add("fade-up");}
    const sideBtn = document.getElementById("nav-"+id);
    if(sideBtn){sideBtn.classList.add("active","text-slate-900","dark:text-white");sideBtn.classList.remove("text-slate-600","dark:text-slate-400");}
    const botBtn = document.getElementById("bnav-"+id);
    if(botBtn){botBtn.classList.remove("text-slate-400");botBtn.classList.add("text-fixit-500");}
    if(title) document.getElementById("page-title").innerText = title;
    if(id==="messages") window.loadCustomerConversations();
    if(id==="c-messages") window.loadCraftsmanConversations();
    if(id==="market") {
        window.loadMarketFromDB();
        const mapEl=document.getElementById("market-map"),listEl=document.getElementById("market-list");
        if(mapEl&&listEl){mapEl.classList.add("hidden");listEl.classList.remove("hidden");}
        if(window._marketMap){window._marketMap.remove();window._marketMap=null;}
    }
};

window.refreshRequestsList = function() {
    const list = document.getElementById("requests-list"); if(!list) return;
    const empty = document.getElementById("empty-req");
    list.querySelectorAll(".req-card").forEach(c => c.remove());
    if(window.STATE.requests.length===0){if(empty)empty.classList.remove("hidden");return;}
    if(empty)empty.classList.add("hidden");
    window.STATE.requests.forEach((req,i) => {
        const div = document.createElement("div");
        div.innerHTML = window.createBeautifulCard(req,false,i);
        list.insertBefore(div.firstElementChild, list.querySelector("#empty-req"));
    });
};

window.refreshDashboard = function() {
    const sa=document.getElementById("stat-active");if(sa)sa.innerText=window.STATE.requests.filter(r=>r.status!=="done").length;
    const st=document.getElementById("stat-total");if(st)st.innerText=window.STATE.requests.length;
    const dl=document.getElementById("dash-requests-list");
    if(dl&&window.STATE.requests.length>0){
        dl.innerHTML=window.STATE.requests.slice(0,3).map(r=>'<div class="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0"><div class="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-xl flex items-center justify-center text-sm shrink-0"><i class="fa-solid fa-clipboard-list"></i></div><div class="flex-1 min-w-0"><p class="font-extrabold text-sm dark:text-white truncate">' + r.title + '</p><p class="text-xs text-slate-500 mt-0.5">' + r.kat + ' • ' + r.time + '</p></div><span class="status-badge ' + (r.status==="done"?"status-done":r.status==="active"?"status-active":"status-waiting") + ' shrink-0">' + (r.status==="done"?"Hotovo":r.status==="active"?"Probíhá":"Čeká") + '</span></div>').join("");
    } else if(dl){
        dl.innerHTML='<p class="text-slate-400 text-center py-8">Zatím žádné poptávky. <button onclick="window.goTab(\'new\',\'Nová poptávka\')" class="text-fixit-500 font-bold hover:underline">Vytvořit první →</button></p>';
    }
};

window.showConvList = function(role) {
    var convPanel = document.getElementById('conv-panel-' + role);
    var msgPanel = document.getElementById('msg-panel-' + role);
    if (!convPanel || !msgPanel) return;
    if (window.innerWidth <= 767) {
        convPanel.classList.remove('hidden-mobile');
        msgPanel.classList.remove('show-mobile');
    }
};
window.showMsgPanel = function(role) {
    var convPanel = document.getElementById('conv-panel-' + role);
    var msgPanel = document.getElementById('msg-panel-' + role);
    if (!convPanel || !msgPanel) return;
    if (window.innerWidth <= 767) {
        convPanel.classList.add('hidden-mobile');
        msgPanel.classList.add('show-mobile');
    }
};

window._avatarCache = {};

window.getUserAvatar = async function(userId, fallbackSeed, fallbackBg) {
    const fallback = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(fallbackSeed||"user") + "&backgroundColor=" + (fallbackBg||"f59e0b");
    if (!userId || !window.sb) return fallback;
    if (window._avatarCache[userId]) return window._avatarCache[userId];
    try {
        if (window.APP_USER && window.APP_USER.id === userId) {
            const url = window.APP_USER.user_metadata?.avatar_url;
            if (url) { window._avatarCache[userId] = url; return url; }
        }
        const { data } = window.sb.storage.from("avatars").getPublicUrl(userId + ".jpg");
        if (data?.publicUrl) {
            window._avatarCache[userId] = data.publicUrl;
            return data.publicUrl;
        }
    } catch(e) {}
    window._avatarCache[userId] = fallback;
    return fallback;
};

window.openConversation = async function(requestId, partnerName, partnerSeed, partnerUserId) {
    window.activeChatId = String(requestId);
    const nameEl = document.getElementById("chat-partner-name")||document.getElementById("chat-partner-name-c");
    if(nameEl) nameEl.innerText = partnerName;
    var role = window.APP_ROLE === "customer" ? "customer" : "craftsman";
    window.showMsgPanel(role);
    const avatarEl = document.getElementById("chat-partner-avatar");
    const fallbackBg = window.APP_ROLE === "customer" ? "0f172a" : "f59e0b";
    if(avatarEl) {
        const avUrl = await window.getUserAvatar(partnerUserId, partnerSeed, fallbackBg);
        avatarEl.style.backgroundImage = "url(" + avUrl + ")";
        avatarEl.style.backgroundSize = "cover";
        avatarEl.style.backgroundPosition = "center";
        const cavEl = document.getElementById("cav-" + requestId);
        if(cavEl) cavEl.src = avUrl;
    }
    document.querySelectorAll(".conv-item").forEach(el=>el.classList.remove("bg-white","dark:bg-slate-800/50","border-fixit-500"));
    const ac=document.getElementById("conv-"+requestId);if(ac)ac.classList.add("bg-white","dark:bg-slate-800/50","border-fixit-500");
    await window.loadMessages(requestId);
    window.subscribeMessages(requestId);
};

window.loadMessages = async function(requestId) {
    const boxId = window.APP_ROLE==="customer"?"chat-msgs":"chat-msgs-c";
    const box = document.getElementById(boxId); if(!box)return;
    box.innerHTML='<div class="text-center text-slate-400 text-sm py-8"><i class="fa-solid fa-circle-notch fa-spin text-2xl text-fixit-500 mb-3 block"></i>Načítám zprávy...</div>';
    if(!window.sb){box.innerHTML='<div class="text-center text-slate-400 text-sm py-8">Nepřipojeno.</div>';return;}
    const {data,error}=await window.sb.from("messages").select("*").eq("conversation_id",String(requestId)).order("created_at",{ascending:true});
    if(error){box.innerHTML='<div class="text-center text-red-400 text-sm py-8">Chyba načítání.</div>';return;}
    box.innerHTML="";
    if(data.length===0){box.innerHTML='<div class="text-center text-slate-400 text-sm py-10"><i class="fa-regular fa-comments text-4xl mb-3 block opacity-50"></i>Zatím žádné zprávy. Napište první!</div>';return;}
    data.forEach(m=>window.renderMessage(m,boxId));
    box.scrollTop=box.scrollHeight;
};

window.escapeHtml = function(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

window.renderMessage = function(m, boxId) {
    const box=document.getElementById(boxId);if(!box)return;
    const myUserId = window.APP_USER?.id ? String(window.APP_USER.id) : "";
    const senderId = m?.sender_id ? String(m.sender_id) : "";
    const senderRole = (m?.senderrole || "").trim();
    const myRole = (window.APP_ROLE || "").trim();
    const senderName = (m?.sender_name || "").trim();
    const myName = (document.getElementById("user-name")?.innerText || "").trim();

    let isMe = false;
    if (myUserId && senderId) {
        isMe = myUserId === senderId;
    } else if (senderRole && myRole && senderName && myName) {
        isMe = senderRole === myRole && senderName === myName;
    } else if (senderRole && myRole) {
        isMe = senderRole === myRole;
    } else if (senderName && myName) {
        isMe = senderName === myName;
    }

    const time=new Date(m.created_at).toLocaleTimeString("cs",{hour:"2-digit",minute:"2-digit"});
    box.querySelector(".text-center")?.remove();
    const d=document.createElement("div");
    const safeSender = window.escapeHtml(senderName || (isMe?"Já":"Uživatel"));
    const safeText = window.escapeHtml(m.text || "").replace(/\n/g, "<br>");
    d.className="flex "+(isMe?"justify-end":"justify-start");
    d.innerHTML='<div class="max-w-[75%]"><p class="text-[10px] font-bold mb-1.5 uppercase tracking-wide ' + (isMe?"text-fixit-500 text-right mr-2":"text-slate-400 ml-2") + '">' + safeSender + '</p><div class="px-5 py-3 rounded-2xl text-sm shadow-sm ' + (isMe?"bg-fixit-500 text-white rounded-br-sm":"bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-bl-sm") + '"><p class="leading-relaxed">' + safeText + '</p><p class="text-[10px] opacity-50 mt-1.5 font-medium ' + (isMe?"text-right":"") + '">' + time + '</p></div></div>';
    box.appendChild(d);box.scrollTop=box.scrollHeight;
};

window.subscribeMessages = function(requestId) {
    if(window.msgSubscription){try{window.sb.removeChannel(window.msgSubscription);}catch(e){}}
    if(!window.sb)return;
    const boxId=window.APP_ROLE==="customer"?"chat-msgs":"chat-msgs-c";
    window.msgSubscription=window.sb.channel("msgs-"+requestId).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"conversation_id=eq."+requestId},payload=>{
        if(payload.new.sender_id!==window.APP_USER?.id){
            window.renderMessage(payload.new,boxId);
            window.showToast("Nová zpráva! 💬","Zpráva od "+(payload.new.sender_name||"řemeslníka")+".","info");
            window.addNotif("Nová zpráva! 💬", "Zpráva od " + (payload.new.sender_name || "řemeslníka"));
            const sidebarBadge = document.getElementById("sidebar-msg-badge");
            if (sidebarBadge) {
                window.msgNotifCount = (window.msgNotifCount || 0) + 1;
                sidebarBadge.innerText = window.msgNotifCount > 9 ? "9+" : window.msgNotifCount;
                sidebarBadge.classList.remove("hidden");
            }
        }
    }).subscribe();
};

window.sendMsg = async function() {
    const inp=document.getElementById("msg-input");
    const txt=inp?.value?.trim();if(!txt)return;
    if(!window.activeChatId){ window.showToast("Nejprve otevřete konverzaci", "Vyberte vlevo konkrétní chat.", "info"); return; }
    inp.value="";
    const userNameEl = document.getElementById("user-name");
    const msgBase={conversation_id:String(window.activeChatId),sender_id:window.APP_USER?.id,sender_name:userNameEl?userNameEl.innerText:"Uživatel",text:txt};
    window.renderMessage({...msgBase,senderrole:window.APP_ROLE||"customer",created_at:new Date().toISOString()},"chat-msgs");
    if(window.sb){
        const {error}=await window.sb.from("messages").insert({...msgBase,senderrole:window.APP_ROLE||"customer"});
        if(error){
            window.showToast("Zprávu se nepodařilo uložit", error.message || "Zkuste to prosím znovu.", "error");
        }
    }
};

window.sendMsgC = async function() {
    const inp=document.getElementById("msg-input-c");
    const txt=inp?.value?.trim();if(!txt)return;
    if(!window.activeChatId){ window.showToast("Nejprve otevřete konverzaci", "Vyberte vlevo konkrétní chat.", "info"); return; }
    inp.value="";
    const userNameEl = document.getElementById("user-name");
    const msgBase={conversation_id:String(window.activeChatId),sender_id:window.APP_USER?.id,sender_name:userNameEl?userNameEl.innerText:"Uživatel",text:txt};
    window.renderMessage({...msgBase,senderrole:window.APP_ROLE||"craftsman",created_at:new Date().toISOString()},"chat-msgs-c");
    if(window.sb){
        const {error}=await window.sb.from("messages").insert({...msgBase,senderrole:window.APP_ROLE||"craftsman"});
        if(error){
            window.showToast("Zprávu se nepodařilo uložit", error.message || "Zkuste to prosím znovu.", "error");
        }
    }
};

window.loadCustomerConversations = async function() {
    const list=document.getElementById("conv-list");if(!list||!window.sb||!window.APP_USER)return;
    const {data:reqs}=await window.sb.from("requests").select("*").eq("customer_id",window.APP_USER.id).order("created_at",{ascending:false});
    if(!reqs||reqs.length===0){list.innerHTML='<div class="p-8 text-center text-sm text-slate-400"><i class="fa-regular fa-comments text-4xl mb-3 block opacity-50"></i>Žádné zprávy.<br>Vytvořte poptávku!</div>';return;}
    list.innerHTML=reqs.map(r=>{
        const statusColor = r.status==='active' ? 'text-green-500' : r.status==='done' ? 'text-slate-400' : 'text-fixit-500';
        const statusDot = r.status==='active' ? '#22c55e' : r.status==='done' ? '#94a3b8' : '#f59e0b';
        const avatarSeed = (r.craftsman_name||'craftsman') + r.id;
        return '<div id="conv-' + r.id + '" onclick="window.openConversation(' + r.id + ',\'' + (r.craftsman_name||"Řemeslník").replace(/'/g,"\\'") + '\',\'craftsman' + r.id + '\',' + (r.craftsman_id ? '\'' + r.craftsman_id + '\'' : 'null') + ')" class="conv-item px-4 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/80 border-l-3 border-l-transparent transition-all duration-150 flex items-center gap-3">' +
        '<div class="relative shrink-0"><img id="cav-' + r.id + '" src="https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(avatarSeed) + '&backgroundColor=0f172a" class="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-100 object-cover"><span style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:' + statusDot + ';border:2px solid white;"></span></div>' +
        '<div class="flex-1 min-w-0"><p class="font-bold text-sm dark:text-white truncate leading-tight">' + r.title + '</p><p class="text-xs text-slate-400 mt-0.5 truncate">' + r.category + ' • <span class="' + statusColor + ' font-semibold">' + (r.status==="waiting"?"Čeká na řemeslníka":r.status==="active"?"Probíhá":"Hotovo") + '</span></p></div>' +
        '<i class="fa-solid fa-chevron-right text-[10px] text-slate-300 dark:text-slate-600 shrink-0"></i>' +
        '</div>';
    }).join("");
};

window.loadCraftsmanConversations = async function() {
    const list=document.getElementById("conv-list-c");if(!list||!window.sb||!window.APP_USER)return;
    const {data:offers}=await window.sb.from("offers").select("*, requests(*)").eq("craftsman_id",window.APP_USER.id).order("created_at",{ascending:false});
    if(!offers||offers.length===0){list.innerHTML='<div class="p-8 text-center text-sm text-slate-400"><i class="fa-regular fa-comments text-4xl mb-3 block opacity-50"></i>Žádné zprávy.<br>Podejte nabídku!</div>';return;}
    list.innerHTML=offers.map(o=>{
        const statusColor = o.requests?.status==='active' ? 'text-green-500' : o.requests?.status==='done' ? 'text-slate-400' : 'text-fixit-500';
        const statusDot = o.requests?.status==='active' ? '#22c55e' : o.requests?.status==='done' ? '#94a3b8' : '#f59e0b';
        const avatarSeed = (o.requests?.customer_name||'customer') + o.request_id;
        return '<div id="conv-' + o.request_id + '" onclick="window.openConversation(' + o.request_id + ',\'' + (o.requests?.customer_name||"Zákazník").replace(/'/g,"\\'") + '\',\'customer' + o.request_id + '\')" class="conv-item px-4 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/80 border-l-transparent transition-all duration-150 flex items-center gap-3">' +
        '<div class="relative shrink-0"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(avatarSeed) + '&backgroundColor=f59e0b" class="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-100"><span style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:' + statusDot + ';border:2px solid white;"></span></div>' +
        '<div class="flex-1 min-w-0"><p class="font-bold text-sm dark:text-white truncate leading-tight">' + (o.requests?.title||"Poptávka") + '</p><p class="text-xs text-slate-400 mt-0.5 truncate">' + (o.requests?.category||"") + ' • <span class="' + statusColor + ' font-semibold">' + (o.requests?.customer_name||"Zákazník") + '</span></p></div>' +
        '<i class="fa-solid fa-chevron-right text-[10px] text-slate-300 dark:text-slate-600 shrink-0"></i>' +
        '</div>';
    }).join("");
};

window.openOfferModal = function(index) {
    const req=window.STATE.marketRequests[index];if(!req)return;
    document.getElementById("co-req-id").value=req.id;
    document.getElementById("co-req-title").value=req.title;
    document.getElementById("co-title").innerText=req.title;
    document.getElementById("co-cat").innerText=req.category||"Ostatní";
    document.getElementById("co-urg").innerText=req.urgency||"Střední";
    let extracted=window.extractPhotoFromDesc(req.description);
    document.getElementById("co-desc").innerHTML=extracted.desc.replace(/\n/g,"<br>");
    document.getElementById("co-price").value=req.price_estimate||"Dohodou";
    document.getElementById("co-msg").value='Dobrý den, mám zájem o vaši zakázku "' + req.title + '". Mám čas a vybavení, mohu pomoci.';
    const photoWrap=document.getElementById("co-photo-wrap"),photoImg=document.getElementById("co-photo");
    if(extracted.photo){photoImg.src="data:"+(extracted.mime||"image/jpeg")+";base64,"+extracted.photo;photoWrap.classList.remove("hidden");}
    else photoWrap.classList.add("hidden");
    const modal=document.getElementById("craftsman-offer-modal");
    modal.classList.remove("hidden");void modal.offsetWidth;modal.classList.add("opacity-100");
};
window.closeOfferModal = function() {
    const modal=document.getElementById("craftsman-offer-modal");
    if(modal){modal.classList.remove("opacity-100");setTimeout(()=>modal.classList.add("hidden"),300);}
};

window.submitCraftsmanOffer = async function() {
    const btn=document.getElementById("co-submit-btn");
    const orig=btn.innerHTML;
    const requestId=document.getElementById("co-req-id").value;
    const title=document.getElementById("co-req-title").value;
    const price=document.getElementById("co-price").value.trim();
    const msg=document.getElementById("co-msg").value.trim();
    if(!msg){window.showToast("Chybí zpráva","Napište zákazníkovi alespoň krátkou zprávu.","error");return;}
    if(!window.sb||!window.APP_USER){window.showToast("Nepřihlášen","Musíte se nejprve přihlásit.","error");return;}
    btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Odesílám...';btn.disabled=true;
    try {
        const {error}=await window.sb.from("offers").insert({request_id:requestId,craftsman_id:window.APP_USER.id,craftsman_name:document.getElementById("user-name").innerText,message:msg,price:price||"Dohodou",status:"pending"});
        if(error)throw error;
        btn.innerHTML='<i class="fa-solid fa-check mr-2"></i>Odesláno!';
        btn.className=btn.className.replace("bg-fixit-500 hover:bg-fixit-600","bg-green-500");
        window.showToast("Nabídka odeslána! 🎉","Zákazník obdrží vaši nabídku co nejdříve.","success");
        window.STATE.craftJobs.push({title,requestId,status:"pending",time:new Date().toLocaleTimeString("cs",{hour:"2-digit",minute:"2-digit"})});
        window.refreshCraftsmanJobs();window.activeChatId=String(requestId);
        setTimeout(()=>{window.closeOfferModal();btn.innerHTML=orig;btn.disabled=false;btn.className=btn.className.replace("bg-green-500","bg-fixit-500 hover:bg-fixit-600");window.goTab("c-messages","Zprávy");window.openConversation(requestId,"Zákazník","customer"+requestId);},1000);
    } catch(e){btn.innerHTML=orig;btn.disabled=false;window.showToast("Chyba odesílání",e.message,"error");}
};

window.loadOffersForRequest = async function(requestId, requestTitle) {
    if(!window.sb)return;
    const {data:offers}=await window.sb.from("offers").select("*").eq("request_id",requestId).order("created_at",{ascending:false});
    document.getElementById("offers-modal-title").innerText=requestTitle;
    const modalList=document.getElementById("offers-modal-list");
    if(!offers||offers.length===0){modalList.innerHTML='<div class="text-center text-slate-400 py-12"><i class="fa-solid fa-inbox text-4xl mb-4 block"></i><p>Zatím žádné nabídky.</p></div>';}
    else{modalList.innerHTML=offers.map(o=>'<div class="p-5 border border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/50"><div class="flex items-center gap-4 mb-4"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(o.craftsman_name) + '&backgroundColor=0f172a" class="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 dark:border-slate-700"><div><p class="font-extrabold dark:text-white">' + o.craftsman_name + '</p><p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">' + new Date(o.created_at).toLocaleDateString("cs") + '</p></div><span class="ml-auto font-black text-lg text-fixit-500">' + o.price + '</span></div><p class="text-sm text-slate-600 dark:text-slate-300 mb-5 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-100 dark:border-slate-700">' + o.message + '</p><button onclick="window.acceptOffer(' + o.id + ',' + requestId + ',\'' + (o.craftsman_name||"").replace(/'/g,"\\'") + '\'); window.closeOffersModal();" class="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold text-sm transition shadow-md hover:scale-[1.02]">Přijmout a zahájit zprávy</button></div>').join("");}
    const modal=document.getElementById("offers-modal");modal.classList.remove("hidden");void modal.offsetWidth;modal.classList.add("opacity-100");
};

window.acceptOffer = async function(offerId, requestId, craftsmanName) {
    if(!window.sb)return;
    await window.sb.from("offers").update({status:"accepted"}).eq("id",offerId);
    await window.sb.from("requests").update({status:"active",craftsman_name:craftsmanName}).eq("id",requestId);
    window.showToast("Nabídka přijata! ✅","Zahajujete spolupráci s "+craftsmanName+".","success");
    const req=window.STATE.requests.find(r=>r.sbId===requestId);if(req){req.status="active";req.craftsman_name=craftsmanName;}
    window.refreshRequestsList();window.refreshDashboard();
    window.activeChatId=String(requestId);
    window.goTab("messages","Zprávy");
    setTimeout(()=>window.openConversation(requestId,craftsmanName,"craftsman"+requestId),300);
};

window.closeOffersModal = function() {
    const modal=document.getElementById("offers-modal");
    if(modal){modal.classList.add("hidden");modal.classList.remove("opacity-100");}
};

window.refreshCraftsmanJobs = function() {
    const completed=window.STATE.craftJobs.filter(j=>j.status==="done"||j.status==="completed").length;
    const cnt=document.getElementById("jobs-active-count");if(cnt)cnt.innerText=window.STATE.craftJobs.length-completed;
    const doneCnt=document.getElementById("jobs-done-count");if(doneCnt)doneCnt.innerText=completed;
    const list=document.getElementById("my-jobs-list");if(!list)return;
    list.querySelector(".text-center")?.remove();list.innerHTML="";
    window.STATE.craftJobs.forEach(job=>{
        const d=document.createElement("div");
        d.className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm fade-up";
        let badge='<span class="status-badge status-waiting">Čekám na odpověď</span>';
        if(job.status==="accepted"||job.status==="active")badge='<span class="status-badge status-active">Aktivní zakázka</span>';
        if(job.status==="done"||job.status==="completed")badge='<span class="status-badge status-done">Dokončeno</span>';
        d.innerHTML='<div class="flex items-start justify-between mb-4"><div><h4 class="font-extrabold text-lg dark:text-white leading-tight">' + job.title + '</h4><p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">' + job.time + '</p></div>' + badge + '</div><button onclick="window.activeChatId=\'' + job.requestId + '\'; window.goTab(\'c-messages\',\'Zprávy\'); setTimeout(()=>window.openConversation(\'' + job.requestId + '\',\'Zákazník\',\'customer' + job.requestId + '\'),300);" class="text-sm font-bold text-fixit-500 hover:text-fixit-600 transition flex items-center gap-2"><i class="fa-regular fa-comment-dots"></i> Napsat zákazníkovi</button>';
        list.appendChild(d);
    });
};

window.loadCraftsmanJobsFromDB = async function() {
    if(!window.sb||!window.APP_USER)return;
    const {data}=await window.sb.from("offers").select("*, requests(title, category, status)").eq("craftsman_id",window.APP_USER.id);
    if(data&&data.length>0){
        window.STATE.craftJobs=data.map(o=>{
            let s=o.status;if(o.requests?.status==="done")s="done";
            return {title:o.requests?.title||"Zakázka",requestId:o.request_id,status:s,time:new Date(o.created_at).toLocaleTimeString("cs",{hour:"2-digit",minute:"2-digit"})};
        });
        window.refreshCraftsmanJobs();
    }
};

window.loadCustomerRequestsFromDB = async function() {
    if(!window.sb||!window.APP_USER)return;
    const {data}=await window.sb.from("requests").select("*").eq("customer_id",window.APP_USER.id).order("created_at",{ascending:false});
    if(data&&data.length>0){
        window.STATE.requests=data.map(r=>({sbId:r.id,title:r.title,kat:r.category,popis:r.description,time:new Date(r.created_at).toLocaleTimeString("cs",{hour:"2-digit",minute:"2-digit"}),status:r.status,craftsman_name:r.craftsman_name||null}));
        window.refreshRequestsList();window.refreshDashboard();
    }
};

window.loadMarketFromDB = async function() {
    const list=document.getElementById("market-list");if(!list||!window.sb)return;
    const {data,error}=await window.sb.from("requests").select("*").eq("status","waiting").order("created_at",{ascending:false});
    if(error||!data||data.length===0){list.innerHTML='<div class="text-center p-16 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-3xl"><i class="fa-solid fa-inbox text-5xl text-slate-300 dark:text-slate-600 mb-5 block"></i><p class="font-bold text-slate-500 text-lg">Zatím žádné poptávky ve vašem okolí.</p></div>';return;}
    window.STATE.marketRequests=data;
    list.innerHTML=data.map((r,i)=>window.createBeautifulCard({id:r.id,sbId:r.id,title:r.title,kat:r.category||"Ostatní",popis:r.description||"",time:new Date(r.created_at).toLocaleDateString("cs"),status:r.status,urgency:r.urgency||"Střední",category:r.category,customer_name:r.customer_name||"Zákazník",price_estimate:r.price_estimate||"Dohodou"},true,i)).join("");
};

window.toggleMarketView = function(mode) {
    const listEl=document.getElementById("market-list"),mapEl=document.getElementById("market-map");
    const btnList=document.getElementById("view-toggle-list"),btnMap=document.getElementById("view-toggle-map");
    if(!listEl||!mapEl)return;
    if(mode==="map"){
        listEl.classList.add("hidden");mapEl.classList.remove("hidden");
        if(btnList)btnList.className=btnList.className.replace("bg-fixit-500 text-white","text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700");
        if(btnMap)btnMap.className=btnMap.className.replace("text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700","bg-fixit-500 text-white");
        window.initMarketMap();
    } else {
        mapEl.classList.add("hidden");listEl.classList.remove("hidden");
        if(btnMap)btnMap.className=btnMap.className.replace("bg-fixit-500 text-white","text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700");
        if(btnList)btnList.className=btnList.className.replace("text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700","bg-fixit-500 text-white");
    }
};

window.initMarketMap = async function() {
    const mapEl=document.getElementById("market-map");if(!mapEl)return;
    if(window._marketMap){window._marketMap.eachLayer(l=>{if(l instanceof L.Marker)window._marketMap.removeLayer(l);});}
    else{window._marketMap=L.map("market-map").setView([49.8,15.5],8);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:18}).addTo(window._marketMap);}
    const requests=window.STATE.marketRequests||[];
    if(requests.length===0)return;
    const pinIcon=L.divIcon({className:"",html:'<div style="background:#f59e0b;color:white;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(245,158,11,0.45);border:2px solid white;"><i class="fa-solid fa-hammer" style="transform:rotate(45deg);font-size:13px;"></i></div>',iconSize:[36,36],iconAnchor:[18,36],popupAnchor:[0,-38]});
    const bounds=[];
    for(const r of requests){
        const addrMatch=(r.description||"").match(/Adresa:\s*([^\n📞📅🏠🚗]+)/);
        const addr=addrMatch?addrMatch[1].trim():(r.category+", Česká republika");
        try{
            const resp=await fetch("https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(addr+", Česká republika")+"&limit=1",{headers:{"Accept-Language":"cs"}});
            const geo=await resp.json();
            if(geo&&geo.length>0){
                const lat=parseFloat(geo[0].lat),lon=parseFloat(geo[0].lon);bounds.push([lat,lon]);
                const urgencyColor=r.urgency==="Vysoká"?"#ef4444":r.urgency==="Nízká"?"#22c55e":"#f59e0b";
                const popup=L.popup({maxWidth:280,minWidth:220}).setContent('<div class="fixit-pin-popup"><span class="cat-badge">'+(r.category||"Ostatní")+'</span><p class="title">'+(r.title||"Poptávka")+'</p><p class="addr"><i class="fa-solid fa-location-dot" style="color:#f59e0b;margin-right:4px"></i>'+addr+'</p><div style="display:flex;gap:8px;margin-bottom:10px"><span style="font-size:11px;font-weight:700;color:'+urgencyColor+';background:'+urgencyColor+'18;padding:3px 8px;border-radius:6px;">'+(r.urgency||"Střední")+' priorita</span>'+(r.price_estimate?'<span style="font-size:11px;font-weight:700;color:#0f172a;background:#f1f5f9;padding:3px 8px;border-radius:6px;">'+r.price_estimate+'</span>':'')+'</div><button class="offer-btn" onclick="window.openOfferModal('+r.id+',\\"'+(r.title||"").replace(/"/g,"")+'\\""); document.querySelectorAll(\".leaflet-popup-close-button\").forEach(b=>b.click());">Poslat nabídku →</button></div>');
                L.marker([lat,lon],{icon:pinIcon}).addTo(window._marketMap).bindPopup(popup);
            }
        }catch(e){}
    }
    if(bounds.length>0)window._marketMap.fitBounds(bounds,{padding:[40,40],maxZoom:13});
    setTimeout(()=>window._marketMap&&window._marketMap.invalidateSize(),100);
};

window.filterMarket = function(kat, triggerEl) {
    const activeBtn = triggerEl || document.activeElement;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-fixit-500','text-white','shadow-md');
        btn.classList.add('bg-white','dark:bg-slate-800','border','border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-300');
    });
    if (activeBtn && activeBtn.classList && activeBtn.classList.contains('filter-btn')) {
        activeBtn.classList.add('bg-fixit-500','text-white','shadow-md');
        activeBtn.classList.remove('bg-white','dark:bg-slate-800','border','border-slate-200','dark:border-slate-700','text-slate-600','dark:text-slate-300');
    }
    const data = Array.isArray(window.STATE?.marketRequests) ? window.STATE.marketRequests : [];
    const filtered = kat === 'all' ? data : data.filter(r => (r.category || '').trim() === kat);
    const list = document.getElementById('market-list');
    if (!list) return;
    if (!filtered.length) {
        list.innerHTML = '<div class="text-center text-slate-400 py-10">Žádné poptávky v této kategorii.</div>';
        return;
    }
    list.innerHTML = filtered.map((req, i) => window.createMarketCard(req, i)).join('');
};

window.openLightbox = function(src) {
    var lb = document.getElementById("lightbox");
    var img = document.getElementById("lightbox-img");
    img.src = src;
    lb.classList.remove("hidden");
    document.body.style.overflow = "hidden";
};
window.closeLightbox = function() {
    document.getElementById("lightbox").classList.add("hidden");
    document.body.style.overflow = "";
};
document.addEventListener("keydown", function(e) { if(e.key === "Escape") window.closeLightbox(); });
