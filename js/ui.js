window.showToast = function(title, message, type="success") {
    const container = document.getElementById("toast-container");
    if(!container) return;
    const icons = { success:"fa-check", info:"fa-bell", error:"fa-exclamation-triangle" };
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<div class="toast-icon ${type}"><i class="fa-solid ${icons[type]||icons.success}"></i></div><div style="flex:1;min-width:0"><div class="toast-title">${title}</div>${message ? `<div class="toast-msg">${message}</div>` : ""}</div><button class="toast-close" onclick="this.closest('.toast').remove()"><i class="fa-solid fa-times"></i></button><div class="toast-progress"></div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add("hiding"); setTimeout(() => toast.parentNode && toast.remove(), 350); }, 4500);
};

window.addNotif = function(title, message) {
    window.notifCount++;
    window.notifItems.unshift({ title, message, time: new Date().toLocaleTimeString("cs", {hour:"2-digit", minute:"2-digit"}) });
    if(window.notifItems.length > 10) window.notifItems.pop();
    const badge = document.getElementById("notif-badge");
    if(badge){
        badge.innerText = window.notifCount > 9 ? "9+" : window.notifCount;
        badge.classList.add("visible");
        badge.classList.remove("shake");
        void badge.offsetWidth;
        badge.classList.add("shake");
    }
    const list = document.getElementById("notif-list");
    if(list){
        const empty = document.getElementById("notif-empty");
        if(empty) empty.remove();
        const item = document.createElement("div");
        item.className = "notif-item";
        item.innerHTML = `<div class="notif-dot"></div><div><div class="notif-item-title">${title}</div><div class="notif-item-msg">${message}</div></div><div style="margin-left:auto;font-size:11px;color:#94a3b8;flex-shrink:0">${window.notifItems[0].time}</div>`;
        list.insertBefore(item, list.firstChild);
    }
};

window.clearNotifs = function() {
    window.notifCount = 0;
    const badge = document.getElementById("notif-badge");
    if(badge) badge.classList.remove("visible", "shake");
    const list = document.getElementById("notif-list");
    if(list) list.innerHTML = '<div id="notif-empty" style="padding:24px 16px;text-align:center;color:#94a3b8;font-size:13px;"><i class="fa-regular fa-bell-slash text-2xl mb-2 block opacity-40"></i>Žádná oznámení</div>';
    window.notifItems = [];
};

window.toggleNotifDropdown = function() {
    const dd = document.getElementById("notif-dropdown");
    if(!dd) return;
    const isOpen = dd.classList.contains("open");
    if(isOpen){ dd.classList.remove("open"); return; }
    dd.classList.add("open");
    setTimeout(() => {
        const closeDD = (e) => {
            if(!document.getElementById("notif-bell").contains(e.target)) {
                dd.classList.remove("open");
                document.removeEventListener("click", closeDD);
            }
        };
        document.addEventListener("click", closeDD);
    }, 10);
};

window.openLightbox = function(src) {
    const lb = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    if(!lb || !img) return;
    img.src = src;
    lb.classList.remove("hidden");
};

window.closeLightbox = function() {
    const lb = document.getElementById("lightbox");
    if(lb) lb.classList.add("hidden");
};
