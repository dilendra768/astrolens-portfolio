(() => {
  "use strict";

  const STORAGE_KEY = "astrolens.v1";
  const SIGNS = [
    { name: "Capricorn", glyph: "♑", start: [12, 22], description: "A practical, steady sign traditionally associated with patience and long-term goals." },
    { name: "Aquarius", glyph: "♒", start: [1, 20], description: "An independent sign traditionally associated with ideas, originality and community." },
    { name: "Pisces", glyph: "♓", start: [2, 19], description: "A sensitive sign traditionally associated with imagination, empathy and intuition." },
    { name: "Aries", glyph: "♈", start: [3, 21], description: "A lively sign traditionally associated with initiative, courage and fresh starts." },
    { name: "Taurus", glyph: "♉", start: [4, 20], description: "A grounded sign traditionally associated with consistency, comfort and patience." },
    { name: "Gemini", glyph: "♊", start: [5, 21], description: "A curious sign traditionally associated with communication, learning and variety." },
    { name: "Cancer", glyph: "♋", start: [6, 21], description: "A caring sign traditionally associated with belonging, memory and emotional awareness." },
    { name: "Leo", glyph: "♌", start: [7, 23], description: "An expressive sign traditionally associated with creativity, warmth and confidence." },
    { name: "Virgo", glyph: "♍", start: [8, 23], description: "An observant sign traditionally associated with craft, service and thoughtful improvement." },
    { name: "Libra", glyph: "♎", start: [9, 23], description: "A relationship-oriented sign traditionally associated with balance, fairness and beauty." },
    { name: "Scorpio", glyph: "♏", start: [10, 23], description: "An intense sign traditionally associated with depth, focus and transformation." },
    { name: "Sagittarius", glyph: "♐", start: [11, 22], description: "An exploratory sign traditionally associated with learning, freedom and big questions." }
  ];
  const PROMPTS = [
    ["What deserves more of your attention, and what can wait?", "Choose one thing to do with care rather than five things in a rush."],
    ["Where did you notice progress, even if it was small?", "Give yourself credit for a step forward that might otherwise go unnoticed."],
    ["What conversation or task would benefit from a fresh perspective?", "Try curiosity before reaching for a quick conclusion."],
    ["What is one boundary that would make your day feel healthier?", "Rest and focus are resources. Spend them intentionally."],
    ["What did today teach you about what matters?", "Notice what gave you energy and what quietly drained it."]
  ];
  const MOODS = ["Calm", "Happy", "Focused", "Anxious", "Low"];
  const $ = (selector) => document.querySelector(selector);
  let state = loadState();
  let selectedMood = "";

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { profile: {}, entries: [] };
      const parsed = JSON.parse(raw);
      return {
        profile: parsed.profile && typeof parsed.profile === "object" ? parsed.profile : {},
        entries: Array.isArray(parsed.entries) ? parsed.entries.filter(validEntry).slice(0, 500) : []
      };
    } catch (error) {
      console.warn("AstroLens could not read saved data:", error);
      return { profile: {}, entries: [] };
    }
  }

  function validEntry(entry) {
    return entry && typeof entry.id === "string" && typeof entry.date === "string" &&
      MOODS.includes(entry.mood) && typeof entry.text === "string";
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("AstroLens could not save data:", error);
      $("#form-message").textContent = "Could not save. Check your browser storage settings.";
      return false;
    }
  }

  function sunSign(dateString) {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
    const date = new Date(`${dateString}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let index = SIGNS.length - 1;
    for (let i = 1; i < SIGNS.length; i++) {
      const [m, d] = SIGNS[i].start;
      if (month > m || (month === m && day >= d)) index = i;
    }
    // Capricorn spans the end and beginning of the calendar year.
    if ((month === 1 && day < 20) || (month === 12 && day >= 22)) index = 0;
    return SIGNS[index];
  }

  function dailyPrompt() {
    const now = new Date();
    const seed = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    return PROMPTS[((seed % PROMPTS.length) + PROMPTS.length) % PROMPTS.length];
  }

  function formatDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return Number.isNaN(date.getTime()) ? dateString : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  function renderProfile() {
    const p = state.profile;
    $("#display-name").value = p.name || "";
    $("#birth-date").value = p.birthDate || "";
    $("#birth-time").value = p.birthTime || "";
    $("#birth-place").value = p.birthPlace || "";
    const sign = sunSign(p.birthDate);
    $("#zodiac-glyph").textContent = sign ? sign.glyph : "✧";
    $("#zodiac-name").textContent = sign ? sign.name : "Not set yet";
    $("#zodiac-description").textContent = sign ? sign.description : "Add your birthday to see your Sun sign.";
  }

  function renderHeader() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    $("#greeting").textContent = `${greeting}${state.profile.name ? `, ${state.profile.name}` : ""}.`;
    $("#today-label").textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
    const [title, prompt] = dailyPrompt();
    $("#daily-title").textContent = title;
    $("#daily-prompt").textContent = prompt;
  }

  function currentStreak(entries) {
    if (!entries.length) return 0;
    const dates = new Set(entries.map(e => e.date));
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    const today = cursor.toISOString().slice(0, 10);
    if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (dates.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function renderEntries() {
    const sorted = [...state.entries].sort((a, b) => b.createdAt - a.createdAt);
    $("#entry-count").textContent = state.entries.length;
    $("#recent-count").textContent = `${state.entries.length} saved`;
    $("#streak-count").textContent = `${currentStreak(state.entries)} ${currentStreak(state.entries) === 1 ? "day" : "days"}`;
    const counts = Object.fromEntries(MOODS.map(mood => [mood, 0]));
    state.entries.forEach(entry => counts[entry.mood]++);
    const topMood = MOODS.filter(m => counts[m] > 0).sort((a, b) => counts[b] - counts[a])[0];
    $("#top-mood").textContent = topMood || "—";
    const recent = $("#recent-entries");
    recent.replaceChildren();
    if (!sorted.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Your reflections will appear here. Start with one small thought.";
      recent.append(empty);
    } else {
      sorted.slice(0, 5).forEach(entry => {
        const card = document.createElement("article");
        card.className = "entry";
        const top = document.createElement("div");
        top.className = "entry-top";
        const mood = document.createElement("span");
        mood.className = "entry-mood";
        mood.textContent = `● ${entry.mood}`;
        const date = document.createElement("span");
        date.className = "entry-date";
        date.textContent = formatDate(entry.date);
        const body = document.createElement("p");
        body.className = "entry-text";
        body.textContent = entry.text || "A quiet check-in.";
        top.append(mood, date);
        card.append(top, body);
        recent.append(card);
      });
    }
    renderMoodChart(counts);
  }

  function renderMoodChart(counts) {
    const chart = $("#mood-chart");
    chart.replaceChildren();
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    if (!total) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Add a few journal entries to see your mood patterns.";
      chart.append(empty);
      return;
    }
    MOODS.forEach(mood => {
      const row = document.createElement("div");
      row.className = "mood-row";
      const label = document.createElement("span");
      label.textContent = mood;
      const track = document.createElement("div");
      track.className = "bar-track";
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = `${(counts[mood] / total) * 100}%`;
      track.append(fill);
      const count = document.createElement("span");
      count.className = "mood-count";
      count.textContent = counts[mood];
      row.append(label, track, count);
      chart.append(row);
    });
  }

  function selectMood(mood) {
    selectedMood = mood;
    document.querySelectorAll(".mood-option").forEach(button => {
      const active = button.dataset.mood === mood;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  document.querySelectorAll(".mood-option").forEach(button => {
    button.addEventListener("click", () => selectMood(button.dataset.mood));
  });

  $("#reflection").addEventListener("input", event => {
    $("#char-count").textContent = event.target.value.length;
  });

  $("#journal-form").addEventListener("submit", event => {
    event.preventDefault();
    const text = $("#reflection").value.trim();
    if (!selectedMood) {
      $("#form-message").textContent = "Choose a mood first.";
      return;
    }
    if (!text) {
      $("#form-message").textContent = "Add a thought before saving your reflection.";
      $("#reflection").focus();
      return;
    }
    const now = new Date();
    state.entries.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      createdAt: now.getTime(),
      mood: selectedMood,
      text
    });
    if (persist()) {
      $("#reflection").value = "";
      $("#char-count").textContent = "0";
      selectMood("");
      $("#form-message").textContent = "Reflection saved. Thanks for checking in with yourself.";
      renderEntries();
    }
  });

  $("#profile-form").addEventListener("submit", event => {
    event.preventDefault();
    const birthDate = $("#birth-date").value;
    if (birthDate && !sunSign(birthDate)) return;
    state.profile = {
      name: $("#display-name").value.trim(),
      birthDate,
      birthTime: $("#birth-time").value,
      birthPlace: $("#birth-place").value.trim()
    };
    if (persist()) {
      renderProfile();
      renderHeader();
      $("#form-message").textContent = "Profile saved.";
    }
  });

  $("#export-button").addEventListener("click", () => {
    const payload = {
      app: "AstroLens",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      profile: state.profile,
      entries: state.entries
    };
    download(`astrolens-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), "application/json");
  });

  renderHeader();
  renderProfile();
  renderEntries();
})();