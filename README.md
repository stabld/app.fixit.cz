# Fixit.cz – Profesionální řemesla 🛠️

Fixit.cz je moderní webová aplikace, která pomocí umělé inteligence propojuje zákazníky s ověřenými řemeslníky. Poptávající stačí vyfotit závadu a náš AI asistent Bořek automaticky připraví profesionální zadání.

## 🚀 Hlavní funkce

* **AI Asistent Bořek:** Automatická analýza fotografie závady (přes Gemini 4o API) a návrh řešení.
* **Tržiště a Interaktivní Mapa:** Zobrazení zakázek v okolí (Leaflet & OpenStreetMap) s filtrací dle oboru.
* **Real-time Chat:** Okamžitá komunikace mezi zákazníkem a řemeslníkem (Supabase Realtime).
* **Správa Nabídek:** Řemeslník pošle nabídku s cenou a zákazník si vybere ideálního kandidáta.
* **Hodnocení:** Po dokončení opravy může zákazník řemeslníka ohodnotit (1-5 hvězdiček).
* **Uživatelské Profily:** Správa osobních údajů, telefonu, referencí a profilových fotek.

## 💻 Použité technologie

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6), Tailwind CSS
* **Backend & Databáze:** Supabase (PostgreSQL, Auth, Storage, Realtime)
* **Umělá inteligence:** Node.js (Serverless Function), GPT-4o / Gemini API
* **Mapy:** Leaflet.js
* **Ikony:** FontAwesome 6

## ⚙️ Struktura repozitáře

Projekt je rozdělen do modulů pro snadnou údržbu:
- `/api/` - Serverless funkce pro komunikaci s AI
- `/js/` - Klientská logika (`auth.js`, `ui.js`, `chat.js`, `features.js`, `config.js`)
- `index.html` - Struktura webu
- `style.css` - Custom design nad rámec Tailwindu
- `app.js` - Hlavní inicializace aplikace po načtení
