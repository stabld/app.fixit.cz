window.renderMessage = function(m, boxId) {
    const box = document.getElementById(boxId); if(!box) return;
    const myUserId = window.APP_USER?.id ? String(window.APP_USER.id) : "";
    const senderId = m?.sender_id ? String(m.sender_id) : "";
    const senderName = (m?.sender_name || "").trim();
    const myName = (document.getElementById("user-name")?.innerText || "").trim();
    let isMe = false;
    if (myUserId && senderId) isMe = myUserId === senderId;
    else if (senderName && myName) isMe = senderName === myName;
    const time = new Date(m.created_at).toLocaleTimeString("cs", {hour:"2-digit", minute:"2-digit"});
    box.querySelector(".text-center")?.remove();
    const d = document.createElement("div");
    const safeSender = window.escapeHtml(senderName || (isMe ? "Já" : "Uživatel"));
    const safeText = window.escapeHtml(m.text || "").replace(/\n/g, "<br>");
    d.className = "flex " + (isMe ? "justify-end" : "justify-start");
    d.innerHTML = '<div class="max-w-[75%]"><p class="text-[10px] font-bold mb-1.5 uppercase tracking-wide ' + (isMe ? "text-fixit-500 text-right mr-2" : "text-slate-400 ml-2") + '">' + safeSender + '</p><div class="px-5 py-3 rounded-2xl text-sm shadow-sm ' + (isMe ? "bg-fixit-500 text-white rounded-br-sm" : "bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-bl-sm") + '"><p class="leading-relaxed">' + safeText + '</p><p class="text-[10px] opacity-50 mt-1.5 font-medium ' + (isMe ? "text-right" : "") + '">' + time + '</p></div></div>';
    box.appendChild(d); box.scrollTop = box.scrollHeight;
};

window.sendMsg = async function() {
    const inp = document.getElementById("msg-input");
    const txt = inp?.value?.trim(); if(!txt) return;
    if(!window.activeChatId) { window.showToast("Nejprve otevřete konverzaci", "Vyberte vlevo konkrétní chat.", "info"); return; }
    inp.value = "";
    const userNameEl = document.getElementById("user-name");
    const msgBase = { conversation_id: String(window.activeChatId), sender_id: window.APP_USER?.id, sender_name: userNameEl ? userNameEl.innerText : "Uživatel", text: txt };
    window.renderMessage({ ...msgBase, created_at: new Date().toISOString() }, "chat-msgs");
    if(window.sb){
        const {error} = await window.sb.from("messages").insert(msgBase);
        if(error) window.showToast("Zprávu se nepodařilo uložit", error.message || "Zkuste to prosím znovu.", "error");
    }
};

window.sendMsgC = async function() {
    const inp = document.getElementById("msg-input-c");
    const txt = inp?.value?.trim(); if(!txt) return;
    if(!window.activeChatId) { window.showToast("Nejprve otevřete konverzaci", "Vyberte vlevo konkrétní chat.", "info"); return; }
    inp.value = "";
    const userNameEl = document.getElementById("user-name");
    const msgBase = { conversation_id: String(window.activeChatId), sender_id: window.APP_USER?.id, sender_name: userNameEl ? userNameEl.innerText : "Uživatel", text: txt };
    window.renderMessage({ ...msgBase, created_at: new Date().toISOString() }, "chat-msgs-c");
    if(window.sb){
        const {error} = await window.sb.from("messages").insert(msgBase);
        if(error) window.showToast("Zprávu se nepodařilo uložit", error.message || "Zkuste to prosím znovu.", "error");
    }
};
