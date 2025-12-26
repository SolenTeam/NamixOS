function loadApp(name, win) {
  const content = win.querySelector(".content");

  if (name === "terminal") {
    loadTerminal(content);
  }

  if (name === "files") {
    loadFileManager(content);
  }

  if (name === "notes") {
    loadNotes(content);
  }
}

function loadTerminal(container) {
  container.innerHTML = `
    <div id="terminal-output"></div>
    <input id="terminal-input" placeholder="Scrivi un comando...">
  `;

  const input = container.querySelector("#terminal-input");
  const output = container.querySelector("#terminal-output");

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      output.innerHTML += `<div>> ${input.value}</div>`;
      input.value = "";
    }
  });
}

function loadFileManager(container) {
  container.innerHTML = `
    <p>File Manager</p>
    <ul>
      <li>Documenti</li>
      <li>Immagini</li>
      <li>Musica</li>
    </ul>
  `;
}

function loadNotes(container) {
  container.innerHTML = `
    <textarea style="width:100%;height:100%;">Scrivi qui...</textarea>
  `;
}
