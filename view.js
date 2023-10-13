const config = {
  searchFor: "[[#]]",
  onlyWithTasks: false, // "all", "done", "undone"
  excludeFolders: ["Logseq/logseq"],
  includeFolders: [],
  oneliners: true,
  showOptions: true,
  showOptionsPanel: false,
  showCopyFeedButton: true,
  showParentIfNotAlone: true,
  removeOwnLinkFromList: false,
  groupBySection: false,
  hideHeaders: false,
  sortByPath: true,
  showTree: false,
};

const fileName = dv.current()?.file?.name;
const filePath = dv.current()?.file?.path;
if (fileName == null) dv.el("div", "Please reopen the file to show the feed");

const configEl = dv.el("div", "");
const configContainerEl = configEl.parentElement.parentElement ?? {};
configContainerEl._feedState = configContainerEl._feedState ?? {};

const getState = () => {
  const uiState = configContainerEl._feedState;
  let params = {};
  if (typeof input === "string") {
    params = { searchFor: input };
  } else if (typeof input === "object") {
    params = input;
  }
  return {
    ...config,
    ...params,
    ...uiState,
  };
};
const state = getState();

const setStateProperty = (propName, value, refresh = true) => {
  configContainerEl._feedState[propName] = value;

  if (refresh) {
    // set height to client height to reduce flickering
    configContainerEl.style.height = configContainerEl.clientHeight + "px";
    app.commands.executeCommandById("dataview:dataview-force-refresh-views");
    setTimeout(() => {
      configContainerEl.style.height = "";
    }, 100);
  }
};

const addShowOptionsLink = () => {
  const link = document.createElement("a");

  if (state.showOptionsPanel) {
    link.textContent = "< Hide options";
    link.onclick = () => {
      setStateProperty("showOptionsPanel", false);
    };
  } else {
    link.textContent = "Show options >";
    link.onclick = () => {
      setStateProperty("showOptionsPanel", true);
    };
  }
  link.style.margin = "0.2em";
  if (state.showOptions) {
    // don't showOptions panel at all and configure via code
    configEl.appendChild(link);
  }
};

const addToggle = (label, prop) => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = state[prop];
  toggle.addEventListener("change", () => {
    setStateProperty(prop, toggle.checked);
  });
  toggle.style.margin = "0 0.5em -0.1em";
  const labelEl = document.createElement("label");
  labelEl.appendChild(toggle);
  labelEl.appendChild(document.createTextNode(label));
  configEl.appendChild(labelEl);
};

const addSelect = (label, prop, options) => {
  const select = document.createElement("select");
  select.style.margin = "0 0.5em -0.1em";
  select.onchange = () => {
    setStateProperty(prop, select.value);
  };
  options.forEach((o) => {
    const option = document.createElement("option");
    option.value = o;
    option.textContent = o;
    select.appendChild(option);
  });
  select.value = state[prop];
  const labelEl = document.createElement("label");
  labelEl.appendChild(document.createTextNode(label));
  labelEl.appendChild(select);
  configEl.appendChild(labelEl);
};

const addResetStateButton = () => {
  const button = document.createElement("button");
  button.textContent = "Reset options";
  button.onclick = () => {
    configContainerEl._feedState = {
      showOptionsPanel: true,
    };
    app.commands.executeCommandById("dataview:dataview-force-refresh-views");
  };
  configEl.appendChild(button);
};

const addNewLine = () => {
  configEl.appendChild(document.createElement("br"));
};

const addCopyFeedButton = (result) => {
  const md = dv
    .markdownTaskList(result)
    .replace(/    /gm, "\t")
    .replace(/^# \[\[[^\|]+\|([^\]]+)\]\]\n\n/gm, (a, b) => `- [[${b}]]\n`);

  if (md) {
    const button = document.createElement("button");
    button.textContent = "📋 Copy Feed as markdown";
    button.onclick = () => {
      navigator.clipboard.writeText(md);
      button.textContent = "📋 Copied!";
    };
    button.style.margin = "0 1em";
    configEl.appendChild(button);
  }
};

addShowOptionsLink();
if (state.showOptionsPanel) {
  addNewLine();
  addSelect("Only with tasks", "onlyWithTasks", ["", "any", "undone", "done"]);
  addNewLine();
  addToggle("Show tree", "showTree");
  if (!state.showTree) {
    addNewLine();
    addToggle("Find oneliners", "oneliners");
    addNewLine();
    addToggle("Show parent if not alone", "showParentIfNotAlone");
    if (state.showParentIfNotAlone) {
      addNewLine();
      addToggle("Remove own link from list", "removeOwnLinkFromList");
    }
  }
  addNewLine();
  addToggle("Group by section", "groupBySection");
  addNewLine();
  addToggle("Hide header section names", "hideHeaders");
  addNewLine();
  addResetStateButton();
}

// --------------------------------------

const isMatch = (l) =>
  l.section.subpath === fileName ||
  l.outlinks?.some((o) => searchForLinks.includes(`[[${o.fileName()}]]`)) ||
  l.tags?.some((t) => searchForTags.some((tt) => t.includes(tt)));

const tree = (listItem) => {
  // attention: this mutates the list item
  if (isMatch(listItem)) {
    return [listItem];
  }
  listItem.children = listItem.children.flatMap(tree);
  return listItem.children.length ? [listItem] : [];
};

const showParent = (listItem) => {
  if (listItem.section.subpath === fileName) return true;
  const cleanText = listItem.text
    .replace(/\[\[[^\]]+\]\]/g, "")  // match [[links]]
    .replace(/#[^ ]+/g, "");  // match #nested/TAGS/100 until ` `
  const hasText = /[a-zA-Z0-9]/g.test(cleanText);
  if (hasText) {
    if (
      state.oneliners ||
      (state.showParentIfNotAlone && listItem.children.length)
    ) {
      return true;
    }
    return false;
  }

  // not alone, keep parent
  if (state.showParentIfNotAlone) {
    const textWithoutOwnLink = listItem.text
      .replace(`[[${fileName}]]`, "")
      .replace(/^[^\[]+/, "")
      .replace(/[^\]]+$/, "");

    if (textWithoutOwnLink) {
      if (state.removeOwnLinkFromList) {
        listItem.text = textWithoutOwnLink;
      }
      return true;
    }
  }

  return false;
};

const showTask = (listItem) => {
  switch (state.onlyWithTasks) {
    case "all":
    case "any":
    case "yes":
    case true:
      return listItem.task;
    case "done":
    case "checked":
    case "completed":
    case "x":
      return listItem.task && listItem.checked;
    case "undone":
    case "unchecked":
    case "incomplete":
    case " ":
      return listItem.task && !listItem.checked;
    default:
      return listItem.task && listItem.status === state.onlyWithTasks;
  }
};

const someOfMeAndMyChildren = (listItem, predicate) => {
  console.log(listItem);
  if (predicate(listItem)) return true;
  if (listItem.children.length) {
    return listItem.children.some((l) => someOfMeAndMyChildren(l, predicate));
  }
  return false;
};

const searchFor = (state.searchFor || "[[#]]").replaceAll(
  "[[#]]",
  `[[${fileName}]]`
);
const searchForLinks = searchFor.match(/\[\[(.*?)\]\]/g) ?? [];
const searchForTags = searchFor.match(/#[^\s,#]+/g) ?? [];
const searchQuery = [...searchForLinks, ...searchForTags].join(" OR ");

const query =
  `(${searchQuery})` +
  (state.includeFolders.length
    ? ` AND (${state.includeFolders.map((f) => `"${f}"`).join(" OR ")})`
    : "") +
  (state.excludeFolders.length
    ? ` AND (${state.excludeFolders.map((f) => `!"${f}"`).join(" OR ")})`
    : "");

let result = dv
  .pages(query)
  .file.lists.where(
    state.showTree
      ? (l) => !l.parent && someOfMeAndMyChildren(l, isMatch)
      : isMatch
  )
  .flatMap(state.showTree ? tree : (l) => (showParent(l) ? [l] : l.children))
  .filter((l) => !state.onlyWithTasks || someOfMeAndMyChildren(l, showTask))
  .groupBy((l) => (state.groupBySection ? l.link : l.link.toFile()))
  .sort((g) => (state.sortByPath ? g.key.fileName() : g), "desc")
  ;

if (state.showCopyFeedButton && state.showOptionsPanel) {
  addCopyFeedButton(result);
}

if (state.hideHeaders) {
  result = result
    .flatMap((section) =>
      section.rows.map((row) => ({
        ...row,
        text: `${section.key} - ${row.text}`,
      }))
    );
  dv.taskList(result, false);
} else {
  dv.taskList(result);
}
