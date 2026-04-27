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

    btnLogin.classList.remove("text-slate-500");
    btnReg.classList.remove("text-slate-500");

    if(tab === "login") {
        login.classList.remove("hidden");
        btnLogin.classList.add("text-white");
        btnReg.classList.add("text-slate-500");
        slider.style.transform = "translateX(0%)";
    } else if(tab === "register") {
        reg.classList.remove("hidden");
        btnReg.classList.add("text-white");
        btnLogin.classList.add("text-slate-500");
        slider.style.transform = "translateX(100%)";
    } else if(tab === "forgot") {
        forgot.classList.remove("hidden");
    }
};

window.doLogin = async function() {
    try {
        const email = document.getElementById("log-email").value.trim();
        const pass = document.getElementById("log-pass").value.trim();
        if(!email || !pass) return window.showToast("Chybí údaje", "Vyplň e-mail a heslo.", "error");
        const { error } = await window.sb.auth.signInWithPassword({ email, password: pass });
        if(error) throw error;
    } catch(err) {
        window.showToast("Přihlášení selhalo", err.message || "Zkuste to znovu.", "error");
    }
};

window.doRegister = async function() {
    try {
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const pass = document.getElementById("reg-pass").value.trim();
        if(!name || !email || !pass) return window.showToast("Chybí údaje", "Vyplň jméno, e-mail a heslo.", "error");
        if(pass.length < 6) return window.showToast("Slabé heslo", "Heslo musí mít alespoň 6 znaků.", "error");
        const { error } = await window.sb.auth.signUp({
            email,
            password: pass,
            options: { data: { fullname: name, role: window.APP_ROLE || "customer" } }
        });
        if(error) throw error;
        window.showToast("Registrace hotova", "Zkontroluj e-mail a dokonči přihlášení.", "success");
    } catch(err) {
        window.showToast("Registrace selhala", err.message || "Zkuste to znovu.", "error");
    }
};

window.doLogout = async function() {
    try {
        if(window.sb) await window.sb.auth.signOut();
        location.reload();
    } catch(err) {
        window.showToast("Odhlášení selhalo", err.message || "Zkuste to znovu.", "error");
    }
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
