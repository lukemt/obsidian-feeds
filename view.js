const fileName = dv.current()?.file?.name
if (fileName == null) dv.el("div", "Please reopen the file to show the feed")
const configEl = dv.el("div");

const config = {
  oneliners: false,
  showCopyFeedButton: true,
  search: ""
}

const getState = () => {
  const path = dv.current()?.file?.path;
  if (!path || !window._feedsState) return config;
  return {
    ...config,
    ...window._feedsState[path]
  };
}

window.setStateProperty = (path, propName, value) => {
  if (!window._feedsState) window._feedsState = {}
  window._feedsState[path] = {
    ...getState(),
    [propName]: value
  }
}

const resetState = () => {
  window._feedsState = undefined
}

const addToggle = (label, prop) => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = getState()[prop];
  toggle.addEventListener("change", () => {
    setStateProperty(dv.current()?.file?.path, prop, toggle.checked);
    app.commands.executeCommandById("dataview:dataview-force-refresh-views")
  })
  // push the toggle down a bit so it aligns with the text
  toggle.style.margin = "0 0.5em -0.1em";
  const labelEl = document.createElement("label");
  labelEl.appendChild(toggle);
  labelEl.appendChild(document.createTextNode(label));
  configEl.appendChild(labelEl);  
}

const addResetStateButton = () => {
  const button = document.createElement("button");
  button.textContent = "Reset state";
  button.onclick = () => {
    resetState();
    app.commands.executeCommandById("dataview:dataview-force-refresh-views")
  }
  configEl.appendChild(button);
}

const addNewLine = () => {
  configEl.appendChild(document.createElement("br"));
}

const addTextInput = (label, prop) => {
  const input = document.createElement("input");
  const path = dv.current()?.file?.path;
  input.type = "text";
  input.value = getState()[prop];
  // observe enter key
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      setStateProperty(path, prop, input.value);
      app.commands.executeCommandById("dataview:dataview-force-refresh-views")
    }
  })
  
  const labelEl = document.createElement("label");
  labelEl.appendChild(input);

  const button = document.createElement("button");
  button.textContent = "Search";
  button.addEventListener("click", () => {
    setStateProperty(path, prop, input.value);
    app.commands.executeCommandById("dataview:dataview-force-refresh-views")
  })
  labelEl.appendChild(button);
  configEl.appendChild(labelEl);
}

// addTextInput("Search", "search");
// addNewLine();
addToggle("Find oneliners", "oneliners");
addNewLine();
addResetStateButton();


const hideParent = (listItem) => {
  if (listItem.section.subpath === fileName) return false;
  // if i remove all links and there is still content other than special characters,
  // i want to keep the parent as is
  // and not change the text
  // if i remove all links and there is no content other than special characters,
  // but there are several links, i want to keep the parent, but remove my own link
  // if i remove all links and there is no content other than special characters,
  // and there is only one link, i want to remove the parent
  
  const hasText = /[a-zA-Z0-9]/g.test(listItem.text.replace(/\[\[[^\]]+\]\]/g, ""));
  if (hasText) {
    console.log("has text", {state: getState(), text: listItem.text});
    if (getState().oneliners) {
      return false;
    }
    return true;
  }

  const textWithoutMe = listItem.text
    .replace(`[[${fileName}]]`, "")
    .replace(/^[^\[]+/, "")
    .replace(/[^\]]+$/, "")
  
  if (textWithoutMe) {
    // listItem.text = textWithoutMe;
    return false;
  }

  return true;
}

const result = dv.pages('[[#]] AND !"Logseq/logseq"')
  .file.lists
  .where(l => (l.section.subpath === fileName || l.outlinks?.some(o => o.fileName() === fileName)) && l.text.includes(getState().search))
  .flatMap(l => hideParent(l)  ? l.children : [l])
  .groupBy(l => l.link.toFile())
  .sort(g => g.key.fileName(), "desc")
  
if (getState().showCopyFeedButton) {
  const md = dv.markdownTaskList(result)
    .replace(/    /gm, "\t")
    .replace(/^# \[\[[^\|]+\|([^\]]+)\]\]\n\n/gm, (a, b) => `- [[${b}]]\n`)
  
  // if (md) dv.el("button", "📋 Copy Feed as markdown", {
  //   attr: {
  //     onclick: "navigator.clipboard.writeText(this.getAttr('data-md'));this.textContent='📋 Copied!'",
  //     "data-md": md,
  //     style: "margin: 2em 0;"
  //   }
  // })

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
}


dv.taskList(result)

