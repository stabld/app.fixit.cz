window.callGeminiAPI = async function(parts, systemPrompt, useJson) {
    const res = await fetch('/api/gemini', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({parts, systemPrompt, useJson}) 
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'Chyba při volání AI');
    return data.text;
};
