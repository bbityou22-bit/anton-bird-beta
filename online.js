(() => {
    const getVisitorId = () => {
        let id = localStorage.getItem("antonBirdVisitorId");
        if (!id) {
            id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
            localStorage.setItem("antonBirdVisitorId", id);
        }
        return id;
    };
    const visitorId = getVisitorId();
    let currentSort = "liked";

    async function request(url, options = {}) {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
        return data;
    }

    async function updateVisitors() {
        const el = document.getElementById("visitorCount");
        try {
            const data = await request("/api/visitor", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ visitorId }) });
            if (el) el.textContent = Number(data.count || 0).toLocaleString();
        } catch (e) {
            if (el) el.textContent = "--";
            console.warn("Visitor counter unavailable:", e.message);
        }
    }

    function renderLevels(levels) {
        const list = document.getElementById("onlineLevelList");
        const status = document.getElementById("onlineStatus");
        if (!list) return;
        list.innerHTML = "";
        if (!levels.length) { status.textContent = "No published levels yet."; return; }
        status.textContent = `${levels.length} level${levels.length === 1 ? "" : "s"}`;
        levels.forEach(level => {
            const card = document.createElement("div"); card.className = "onlineLevelCard";
            const name = document.createElement("div"); name.className="onlineLevelName"; name.textContent=level.name || "Untitled Level";
            const meta = document.createElement("div"); meta.className="onlineMeta"; meta.textContent=`👁️ ${level.views || 0}   💗 ${level.likes || 0}`;
            const like = document.createElement("button"); like.className="onlineLike" + (level.liked ? " liked" : ""); like.textContent="♥"; like.title="Like level";
            like.addEventListener("click", async () => {
                try { await request("/api/level-action", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"like",id:level.id,visitorId})}); await loadLevels(currentSort); }
                catch(e){ status.textContent=e.message; }
            });
            const play = document.createElement("button"); play.className="onlinePlay"; play.textContent="PLAY";
            play.addEventListener("click", async () => {
                try {
                    await request("/api/level-action", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"view",id:level.id,visitorId})});
                    window.pendingOnlineLevel = level;
                    window.showLevelCreator?.();
                } catch(e){ status.textContent=e.message; }
            });
            card.append(name, meta, like, play); list.appendChild(card);
        });
    }

    async function loadLevels(sort = "liked") {
        currentSort = sort;
        const status = document.getElementById("onlineStatus");
        if (status) status.textContent = "Loading levels...";
        document.querySelectorAll(".onlineTab").forEach(b => b.classList.toggle("activeOnlineTab", b.dataset.sort === sort));
        try {
            const data = await request(`/api/levels?sort=${encodeURIComponent(sort)}&visitorId=${encodeURIComponent(visitorId)}`);
            renderLevels(data.levels || []);
        } catch(e) {
            if (status) status.textContent = "Online Levels needs the Vercel database setup. See ONLINE_SETUP.txt.";
            console.warn(e);
        }
    }

    async function publishCurrentLevel() {
        const scene = window.levelCreatorScene;
        if (!scene) return;
        const level = scene.getPublishData();
        if (!level.layout.length) { alert("Place some objects before publishing."); return; }
        if (!level.layout.some(x => String(x.tool).startsWith("bike"))) { alert("Your level needs at least one bike."); return; }
        if (!confirm(`Publish \"${level.name}\" to Online Levels?`)) return;
        const button = document.getElementById("creatorPublishButton");
        button.disabled = true; button.textContent = "PUBLISHING...";
        try {
            await request("/api/levels", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...level, visitorId})});
            alert("Level published!");
        } catch(e) { alert(`Could not publish: ${e.message}\n\nCheck ONLINE_SETUP.txt.`); }
        finally { button.disabled=false; button.textContent="PUBLISH LEVEL"; }
    }

    window.addEventListener("DOMContentLoaded", () => {
        updateVisitors();
        document.querySelectorAll(".onlineTab").forEach(b => b.addEventListener("click", () => loadLevels(b.dataset.sort)));
        document.getElementById("creatorPublishButton")?.addEventListener("click", publishCurrentLevel);
    });
    window.AntonOnline = { loadLevels, publishCurrentLevel };
})();
