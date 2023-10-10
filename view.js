const config = {
  oneliners: true,
  excludeFolders: ["Logseq/logseq"],
  includeFolders: [],
  showOptionsPanel: false,
  showCopyFeedButton: false,
  showParentIfNotAlone: true,
  removeOwnLinkFromList: false,
}

const fileName = dv.current()?.file?.name
const filePath = dv.current()?.file?.path
if (fileName == null) dv.el("div", "Please reopen the file to show the feed")

const getState = () => {
  const uiState = (window._feedsState && window._feedsState[filePath]) ?? {};
  return {
    ...config,
    ...input,
    ...uiState,
  };
}
const state = getState();

const setStateProperty = (propName, value, refresh = true) => {
  if (!window._feedsState) window._feedsState = {}
  window._feedsState[filePath] = {
    ...state,
    [propName]: value
  }
  if (refresh) {
    app.commands.executeCommandById("dataview:dataview-force-refresh-views")
  }
}

if (state.showOptionsPanel) {
  dv.el("a", "&lt; hide options", {
    onclick: () => {
      setStateProperty("showOptionsPanel", false);
    }
  })
} else {
  dv.el("a", "show options &gt;", {
    onclick: () => {
      setStateProperty("showOptionsPanel", true);
    }
  })
}

const configEl = dv.el("div", "");

const addToggle = (label, prop) => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = getState()[prop];
  toggle.addEventListener("change", () => {
    setStateProperty(prop, toggle.checked);
  })
  toggle.style.margin = "0 0.5em -0.1em";
  const labelEl = document.createElement("label");
  labelEl.appendChild(toggle);
  labelEl.appendChild(document.createTextNode(label));
  configEl.appendChild(labelEl);  
}

const addResetStateButton = () => {
  const button = document.createElement("button");
  button.textContent = "Reset options";
  button.onclick = () => {
    window._feedsState = undefined
    app.commands.executeCommandById("dataview:dataview-force-refresh-views")
  }
  configEl.appendChild(button);
}

const addNewLine = () => {
  configEl.appendChild(document.createElement("br"));
}

const addCopyFeedButton = (result) => {
  const md = dv.markdownTaskList(result)
    .replace(/    /gm, "\t")
    .replace(/^# \[\[[^\|]+\|([^\]]+)\]\]\n\n/gm, (a, b) => `- [[${b}]]\n`)

  if (md) {
    const button = document.createElement("button");
    button.textContent = "📋 Copy Feed as markdown";
    button.onclick = () => {
      navigator.clipboard.writeText(md);
      button.textContent = "📋 Copied!";
    }
    button.style.margin = "0 1em";
    configEl.appendChild(button);
  }
};

if (state.showOptionsPanel) {
  addToggle("Find oneliners", "oneliners");
  addNewLine();
  addToggle("Show parent if not alone", "showParentIfNotAlone");
  if (state.showParentIfNotAlone) {
    addNewLine();
    addToggle("Remove own link from list", "removeOwnLinkFromList");
  }
  addNewLine();
  addResetStateButton();
}

const showParent = (listItem) => {
  if (listItem.section.subpath === fileName) return true;
  
  const hasText = /[a-zA-Z0-9]/g.test(listItem.text.replace(/\[\[[^\]]+\]\]/g, ""));
  if (hasText) {
    if (state.oneliners || (state.showParentIfNotAlone && listItem.children.length)) {
      return true;
    }
    return false;
  }

  // not alone, keep parent
  if (state.showParentIfNotAlone) {
    const textWithoutOwnLink = listItem.text
      .replace(`[[${fileName}]]`, "")
      .replace(/^[^\[]+/, "")
      .replace(/[^\]]+$/, "")
    
    if (textWithoutOwnLink) {
      if (state.removeOwnLinkFromList) {
        listItem.text = textWithoutOwnLink;
      }
      return true;
    }
  }

  return false;
}

const query = `[[#]]` + (state.includeFolders.length ? ` AND (${state.includeFolders.map(f => `"${f}"`).join(" OR ")})` : "") + (state.excludeFolders.length ? ` AND (${state.excludeFolders.map(f => `!"${f}"`).join(" OR ")})` : "");

const result = dv.pages(query)
  .file.lists
  .where(l => l.section.subpath === fileName || l.outlinks?.some(o => o.fileName() === fileName))
  .flatMap(l => showParent(l)  ? [l] : l.children)
  .groupBy(l => l.link.toFile())
  .sort(g => g.key.fileName(), "desc")
  
if (state.showCopyFeedButton) {
  addCopyFeedButton(result);
}

dv.taskList(result)
