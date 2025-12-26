// ===== Mobile fullscreen auto =====
function mobileMode() {
  if (window.innerWidth <= 700) {
    windows.forEach((win) => {
      if (win.style.display !== "none") {
        win.classList.add("fullscreen");
      }
    });
  } else {
    windows.forEach((win) => {
      win.classList.remove("fullscreen");
    });
  }
}
mobileMode();
window.addEventListener("resize", mobileMode);

// ===== Terminale =====
const terminalOutput = document.getElementById("terminal-output");
const terminalInput = document.getElementById("terminal-input");

let termDir = "/";

function terminalPrint(text) {
  if (!terminalOutput) return;
  const safe = text.replace(/\n/g, "<br />");
  terminalOutput.innerHTML += safe + "<br />";
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function terminalClear() {
  if (!terminalOutput) return;
  terminalOutput.innerHTML = "";
}

if (terminalOutput) {
  terminalPrint(getDict().terminal_welcome);
}

if (terminalInput) {
  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const cmd = terminalInput.value.trim();
      const dict = getDict();
      const promptBase = dict.terminal_prompt_base;
      terminalPrint(`${promptBase}:${termDir}$ ${cmd}`);
      handleCommand(cmd);
      terminalInput.value = "";
    }
  });
}

function handleCommand(cmd) {
  const dict = getDict();
  if (!cmd) return;

  const parts = cmd.split(" ");
  const base = parts[0];
  const arg = parts.slice(1).join(" ");

  switch (base) {
    case "help":
      terminalPrint(dict.terminal_help);
      break;
    case "about":
      terminalPrint(dict.terminal_about);
      break;
    case "clear":
      terminalClear();
      break;
    case "apps":
      terminalPrint(dict.terminal_apps);
      break;
    case "ls":
      handleLs();
      break;
    case "cd":
      handleCd(arg);
      break;
    case "open":
      handleOpenApp(arg);
      break;
    case "lang":
      if (arg === "en" || arg === "it") {
        currentLang = arg;
        applyTranslations();
        terminalPrint(dict.terminal_lang_set + " " + arg);
      } else {
        terminalPrint("lang en | it");
      }
      break;
    case "date":
      terminalPrint(new Date().toString());
      break;
    default:
      terminalPrint(`${dict.terminal_unknown} ${base}`);
      break;
  }
}

function handleLs() {
  const dict = getDict();
  if (termDir === "/") {
    terminalPrint(dict.terminal_ls_root);
  } else if (termDir === "/home") {
    terminalPrint(dict.terminal_ls_home);
  } else if (termDir === "/home/Documents") {
    terminalPrint(dict.terminal_ls_docs);
  } else if (termDir === "/home/Music") {
    terminalPrint(dict.terminal_ls_music);
  } else {
    terminalPrint(".");
  }
}

function handleCd(path) {
  const dict = getDict();
  if (!path) return;
  const validDirs = ["/", "/home", "/home/Documents", "/home/Music"];
  if (validDirs.includes(path)) {
    termDir = path;
    terminalPrint(`${dict.terminal_cd_ok} ${path}`);
  } else {
    terminalPrint(`${dict.terminal_cd_fail} ${path}`);
  }
}

function handleOpenApp(name) {
  const dict = getDict();
  const map = {
    notes: "win-notes",
    browser: "win-browser",
    files: "win-files",
    music: "win-music",
    terminal: "win-terminal",
    about: "win-about",
    settings: "win-settings"
  };
  const id = map[name];
  if (!id) {
    terminalPrint(`${dict.terminal_open_fail} ${name}`);
    return;
  }
  openWindow(id);
}

// ===== File Manager =====
const fsStructure = {
  "/home": [
    { name: "Documents", type: "folder", path: "/home/Documents" },
    { name: "Music", type: "folder", path: "/home/Music" },
    { name: "todo.txt", type: "file" },
    { name: "ideas.txt", type: "file" }
  ],
  "/home/Documents": [
    { name: "spec.md", type: "file" },
    { name: "notes.txt", type: "file" }
  ],
  "/home/Music": [
    { name: "track1.mp3", type: "file" },
    { name: "track2.mp3", type: "file" }
  ]
};

let fmCurrentPath = "/home";
const fmPathEl = document.getElementById("fm-path");
const fmListEl = document.getElementById("fm-list");
const fmNavItems = document.querySelectorAll(".fm-nav-item");

function renderFileManager() {
  if (!fmPathEl || !fmListEl) return;
  fmPathEl.textContent = fmCurrentPath;
  fmListEl.innerHTML = "";

  const entries = fsStructure[fmCurrentPath] || [];
  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "fm-row";
    row.dataset.type = entry.type;
    row.dataset.name = entry.name;
    if (entry.path) row.dataset.path = entry.path;

    const icon = document.createElement("div");
    icon.className = "fm-row-icon";
    icon.textContent = entry.type === "folder" ? "📁" : "📄";

    const name = document.createElement("div");
    name.className = "fm-row-name";
    name.textContent = entry.name;

    const type = document.createElement("div");
    type.className = "fm-row-type";
    type.textContent = entry.type;

    row.appendChild(icon);
    row.appendChild(name);
    row.appendChild(type);

    row.addEventListener("dblclick", () => {
      if (entry.type === "folder" && entry.path) {
        fmCurrentPath = entry.path;
        renderFileManager();
      }
    });

    fmListEl.appendChild(row);
  });
}

fmNavItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    const path = btn.dataset.path;
    if (path) {
      fmCurrentPath = path;
      renderFileManager();
    }
  });
});

// ===== Standby & Reboot =====
function showBlackSequence(iconSymbol, duration = 3000, callback) {
  if (!blackScreen || !blackIcon) {
    if (callback) callback();
    return;
  }
  blackIcon.textContent = iconSymbol;
  blackScreen.classList.add("visible");
  setTimeout(() => {
    blackScreen.classList.remove("visible");
    setTimeout(() => {
      if (callback) callback();
    }, 400);
  }, duration);
}

function enterStandby() {
  const dict = getDict();
  const ok = window.confirm(dict.confirm_standby);
  if (!ok) return;

  startMenu.classList.remove("open");
  startButton.classList.remove("active");
  closeAllWindows();

  showBlackSequence("⏸", 3000, () => {
    setTimeout(() => {
      standbyOverlay.classList.add("visible");
      isInStandby = true;
    }, 0);
  });
}

function wakeFromStandby() {
  if (!isInStandby) return;
  isInStandby = false;
  standbyOverlay.classList.remove("visible");

  showBlackSequence("⏸", 3000, () => {
    playSplash(() => {});
  });
}

standbyOverlay.addEventListener("click", wakeFromStandby);
standbyOverlay.addEventListener("touchstart", (e) => {
  e.preventDefault();
  wakeFromStandby();
});

function enterReboot() {
  const dict = getDict();
  const ok = window.confirm(dict.confirm_reboot);
  if (!ok) return;

  startMenu.classList.remove("open");
  startButton.classList.remove("active");
  closeAllWindows();

  showBlackSequence("🔄", 3000, () => {
    setTimeout(() => {
      playSplash(() => {});
    }, 3000);
  });
}

startPowerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if (action === "standby") enterStandby();
    if (action === "reboot") enterReboot();
  });
});

// ===== Init =====
applyTranslations();
renderFileManager();
playSplash(() => {});
