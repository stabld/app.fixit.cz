// === ZPRÁVY A REALTIME CHAT ===
window.clearMsgNotif = function() {
    window.msgNotifCount = 0;
    const badge = document.getElementById('sidebar-msg-badge');
    if (badge) badge.classList.add('hidden');
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
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};

window.renderMessage = function(m, boxId) {
    const box=document.getElementById(boxId);if(!box)return;
    const myUserId = window.APP_USER?.id ? String(window.APP_USER.id) : "";
    const senderName = (m?.sender_name || "").trim();
    const isMe = myUserId && m?.sender_id ? String(myUserId) === String(m.sender_id) : false;

    const time=new Date(m.created_at).toLocaleTimeString("cs",{hour:"2-digit",minute:"2-digit"});
    box.querySelector(".text-center")?.remove();
    const d=document.createElement("div");
    const safeSender = window.escapeHtml(senderName || (isMe?"Já":"Uživatel"));
    const safeText = window.escapeHtml(m.text || "").replace(/\n/g, "<br>");
    d.className="flex "+(isMe?"justify-end":"justify-start");
    d.innerHTML=`<div class="max-w-[75%]"><p class="text-[10px] font-bold mb-1.5 uppercase tracking-wide ${isMe?"text-fixit-500 text-right mr-2":"text-slate-400 ml-2"}">${safeSender}</p><div class="px-5 py-3 rounded-2xl text-sm shadow-sm ${isMe?"bg-fixit-500 text-white rounded-br-sm":"bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-bl-sm"}"><p class="leading-relaxed">${safeText}</p><p class="text-[10px] opacity-50 mt-1.5 font-medium ${isMe?"text-right":""}">${time}</p></div></div>`;
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
        }
    }).subscribe();
};

window.sendMsg = async function() {
    const inp=document.getElementById("msg-input");
    const txt=inp?.value?.trim();if(!txt)return;
    if(!window.activeChatId){ window.showToast("Vyberte konverzaci", "Vyberte vlevo konkrétní chat.", "info"); return; }
    inp.value="";
    const msgBase={conversation_id:String(window.activeChatId),sender_id:window.APP_USER?.id,sender_name:document.getElementById("user-name")?.innerText || "Uživatel",text:txt};
    window.renderMessage({...msgBase,created_at:new Date().toISOString()},"chat-msgs");
    if(window.sb) await window.sb.from("messages").insert({...msgBase,senderrole:window.APP_ROLE||"customer"});
};

window.sendMsgC = async function() {
    const inp=document.getElementById("msg-input-c");
    const txt=inp?.value?.trim();if(!txt)return;
    if(!window.activeChatId){ window.showToast("Vyberte konverzaci", "Vyberte vlevo konkrétní chat.", "info"); return; }
    inp.value="";
    const msgBase={conversation_id:String(window.activeChatId),sender_id:window.APP_USER?.id,sender_name:document.getElementById("user-name")?.innerText || "Uživatel",text:txt};
    window.renderMessage({...msgBase,created_at:new Date().toISOString()},"chat-msgs-c");
    if(window.sb) await window.sb.from("messages").insert({...msgBase,senderrole:window.APP_ROLE||"craftsman"});
};

// OPRAVENO: Bezpečné generování HTML
window.loadCustomerConversations = async function() {
    const list=document.getElementById("conv-list");
    if(!list||!window.sb||!window.APP_USER) return;
    const {data:reqs}=await window.sb.from("requests").select("*").eq("customer_id",window.APP_USER.id).order("created_at",{ascending:false});
    if(!reqs||reqs.length===0){
        list.innerHTML='<div class="p-8 text-center text-sm text-slate-400">Žádné konverzace.</div>';
        return;
    }
    
    list.innerHTML = reqs.map(r => {
        const statusDot = r.status === 'active' ? '#22c55e' : r.status === 'done' ? '#94a3b8' : '#f59e0b';
        const safeName = (r.craftsman_name || "Řemeslník").replace(/'/g, "\\'");
        const craftIdParam = r.craftsman_id ? `'${r.craftsman_id}'` : 'null';
        const seed = encodeURIComponent(r.craftsman_name || 'c');
        
        return `
        <div id="conv-${r.id}" onclick="window.openConversation(${r.id}, '${safeName}', 'craftsman${r.id}', ${craftIdParam})" class="conv-item px-4 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/80 transition-all flex items-center gap-3">
            <div class="relative shrink-0">
                <img id="cav-${r.id}" src="https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=0f172a" class="w-10 h-10 rounded-full border-2 border-slate-200 bg-slate-100 object-cover">
                <span style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:${statusDot};border:2px solid white;"></span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-sm dark:text-white truncate">${r.title}</p>
                <p class="text-xs text-slate-400 mt-0.5 truncate">${r.category}</p>
            </div>
        </div>`;
    }).join("");
};

// OPRAVENO: Bezpečné generování HTML
window.loadCraftsmanConversations = async function() {
    const list=document.getElementById("conv-list-c");
    if(!list||!window.sb||!window.APP_USER) return;
    const {data:offers}=await window.sb.from("offers").select("*, requests(*)").eq("craftsman_id",window.APP_USER.id).order("created_at",{ascending:false});
    if(!offers||offers.length===0){
        list.innerHTML='<div class="p-8 text-center text-sm text-slate-400">Žádné konverzace.</div>';
        return;
    }
    
    list.innerHTML = offers.map(o => {
        const statusDot = o.requests?.status === 'active' ? '#22c55e' : o.requests?.status === 'done' ? '#94a3b8' : '#f59e0b';
        const safeName = (o.requests?.customer_name || "Zákazník").replace(/'/g, "\\'");
        const seed = encodeURIComponent(o.requests?.customer_name || 'u');
        const title = o.requests?.title || "Poptávka";
        const cName = o.requests?.customer_name || "Zákazník";
        
        return `
        <div id="conv-${o.request_id}" onclick="window.openConversation(${o.request_id}, '${safeName}', 'customer${o.request_id}')" class="conv-item px-4 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/80 transition-all flex items-center gap-3">
            <div class="relative shrink-0">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=f59e0b" class="w-10 h-10 rounded-full border-2 border-slate-200 bg-slate-100">
                <span style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:${statusDot};border:2px solid white;"></span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-sm dark:text-white truncate">${title}</p>
                <p class="text-xs text-slate-400 mt-0.5 truncate">${cName}</p>
            </div>
        </div>`;
    }).join("");
};

// === GLOBÁLNÍ NOTIFIKACE ===
window.initGlobalNotifications = function() {
    if (!window.sb || !window.APP_USER) return;
    if (window.globalNotifSub) { try { window.sb.removeChannel(window.globalNotifSub); } catch(e){} }

    window.globalNotifSub = window.sb.channel('global-notifs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            const msg = payload.new;
            if (msg.sender_id !== window.APP_USER.id && window.activeChatId !== String(msg.conversation_id)) {
                window.showToast("Nová zpráva! 💬", "Napsal vám: " + (msg.sender_name || "Uživatel"), "info");
                window.addNotif("Nová zpráva! 💬", "Zpráva od: " + msg.sender_name);
                if (window.APP_ROLE === "customer") window.loadCustomerConversations();
                else window.loadCraftsmanConversations();
            }
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offers' }, payload => {
            if (window.APP_ROLE === "customer") {
                window.showToast("Nová nabídka! 🎉", "Řemeslník " + (payload.new.craftsman_name || "") + " má zájem.", "success");
                window.addNotif("Nová nabídka! 🎉", payload.new.craftsman_name + " poslal nabídku.");
                if (window.loadCustomerRequestsFromDB) window.loadCustomerRequestsFromDB();
            }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'offers' }, payload => {
            if (window.APP_ROLE === "craftsman" && payload.new.craftsman_id === window.APP_USER.id && payload.new.status === "accepted") {
                window.showToast("Nabídka přijata! ✅", "Zákazník přijal vaši nabídku.", "success");
                window.addNotif("Nabídka přijata! ✅", "Můžete začít komunikovat.");
                if (window.loadCraftsmanJobsFromDB) window.loadCraftsmanJobsFromDB();
                if (window.loadCraftsmanConversations) window.loadCraftsmanConversations();
            }
        })
        .subscribe();
};
