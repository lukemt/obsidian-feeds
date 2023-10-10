const config = {
  searchFor: "[[#]]",
  excludeFolders: ["Logseq/logseq"],
  includeFolders: [],
  oneliners: true,
  showOptionsPanel: false,
  showCopyFeedButton: true,
  showParentIfNotAlone: true,
  removeOwnLinkFromList: false,
  groupBySection: false,
  sortByPath: true,
}

const fileName = dv.current()?.file?.name
const filePath = dv.current()?.file?.path
if (fileName == null) dv.el("div", "Please reopen the file to show the feed")

const configEl = dv.el("div", "");
const configContainerEl = configEl.parentElement.parentElement ?? {}
configContainerEl._feedState = configContainerEl._feedState ?? {}

const getState = () => {
  const uiState = configContainerEl._feedState
  params = typeof input === "string" ? {searchFor: input} : input;
  return {
    ...config,
    ...params,
    ...uiState,
  };
}
const state = getState();

const setStateProperty = (propName, value, refresh = true) => {
  configContainerEl._feedState[propName] = value
  
  if (refresh) {
    // set height to client height to reduce flickering
    configContainerEl.style.height = configContainerEl.clientHeight + "px";
    app.commands.executeCommandById("dataview:dataview-force-refresh-views")
    setTimeout(() => {
      configContainerEl.style.height = "";
    }
    , 100);
  }
}

const addShowOptionsLink = () => {
  const link = document.createElement("a");

  if (state.showOptionsPanel) {
    link.textContent = "< Hide options";
    link.onclick = () => {
      setStateProperty("showOptionsPanel", false);
    }
  } else {
    link.textContent = "Show options >";
    link.onclick = () => {
      setStateProperty("showOptionsPanel", true);
    }
  }
  link.style.margin = "0.2em";
  configEl.appendChild(link);
}

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
    configContainerEl._feedState = {
      showOptionsPanel: true,
    }
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

addShowOptionsLink();
if (state.showOptionsPanel) {
  addNewLine();
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

const searchFor = (state.searchFor || "[[#]]").replaceAll("[[#]]", `[[${fileName}]]`);
const searchForLinks = searchFor.match(/\[\[(.*?)\]\]/g) ?? [];
const searchForTags = searchFor.match(/#[^\s,#]+/g) ?? [];
const searchQuery = [...searchForLinks, ...searchForTags].join(" OR ");

const query = `(${searchQuery})`
  + (state.includeFolders.length ? ` AND (${state.includeFolders.map(f => `"${f}"`).join(" OR ")})` : "")
  + (state.excludeFolders.length ? ` AND (${state.excludeFolders.map(f => `!"${f}"`).join(" OR ")})` : "")

const result = dv.pages(query)
  .file.lists
  .where(l => l.section.subpath === fileName
    || l.outlinks?.some(o => searchForLinks.includes(`[[${o.fileName()}]]`))
    || l.tags?.some(t => searchForTags.some(tt => t.includes(tt)))
  )
  .flatMap(l => showParent(l)  ? [l] : l.children)
  .groupBy(l => state.groupBySection ? l.link : l.link.toFile())
  .sort(g => state.sortByPath ? g : g.key.fileName(), "desc")
  
if (state.showCopyFeedButton && state.showOptionsPanel) {
  addCopyFeedButton(result);
}

dv.taskList(result)
