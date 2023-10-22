import { App, Component, MarkdownPostProcessorContext, TFile } from "obsidian";
import { DataviewApi } from "obsidian-dataview";
import { RefreshableRenderer } from "ui/renderer";
import { Settings } from "./settings";

export default class FeedsRenderer extends RefreshableRenderer {
  public app: App;
  public state: Settings;
  public file: TFile;

  constructor(
    public api: DataviewApi,
    public settings: Settings,
    public containerEl: HTMLElement,
    public context: MarkdownPostProcessorContext,
  ) {
    super(api, containerEl);
    this.app = api.app;
    this.state = this.initState();

    const file = this.app.vault.getAbstractFileByPath(context.sourcePath);
    if (file instanceof TFile) {
      this.file = file;
    }
  }

  initState() {
    return this.settings;
  }

  setStateProperty(prop, value) {}

  async run() {
    // const configEl = this.containerEl.createDiv();

    // const addShowOptionsLink = () => {
    //   // don't showOptions panel at all and configure via code
    //   if (this.state.showOptions) {
    //     const link = configEl.createEl("a");
    //     if (this.state.showOptionsPanel) {
    //       link.textContent = "< Hide options";
    //       link.onclick = () => {
    //         this.setStateProperty("showOptionsPanel", false);
    //       };
    //     } else {
    //       link.textContent = "Show options >";
    //       link.onclick = () => {
    //         this.setStateProperty("showOptionsPanel", true);
    //       };
    //     }
    //     link.style.margin = "0.2em";
    //   }
    // };

    // const addToggle = (label, prop) => {
    //   const toggle = configEl.createEl("input");
    //   toggle.type = "checkbox";
    //   toggle.checked = this.state[prop];
    //   toggle.addEventListener("change", () => {
    //     this.setStateProperty(prop, toggle.checked);
    //   });
    //   toggle.style.margin = "0 0.5em -0.1em";
    //   const labelEl = document.createElement("label");
    //   labelEl.appendChild(toggle);
    //   labelEl.appendChild(document.createTextNode(label));
    // };

    // const addSelect = (label, prop, options) => {
    //   const select = document.createElement("select");
    //   select.style.margin = "0 0.5em -0.1em";
    //   select.onchange = () => {
    //     this.setStateProperty(prop, select.value);
    //   };
    //   options.forEach(o => {
    //     const option = document.createElement("option");
    //     option.value = o;
    //     option.textContent = o;
    //     select.appendChild(option);
    //   });
    //   select.value = this.state[prop];
    //   const labelEl = document.createElement("label");
    //   labelEl.appendChild(document.createTextNode(label));
    //   labelEl.appendChild(select);
    //   configEl.appendChild(labelEl);
    // };

    // const addResetStateButton = () => {
    //   const button = document.createElement("button");
    //   button.textContent = "Reset options";
    //   button.onclick = () => {
    //     this.containerEl._feedState = {
    //       showOptionsPanel: true,
    //     };
    //     this.app.commands.executeCommandById("dataview:dataview-force-refresh-views");
    //   };
    //   configEl.appendChild(button);
    // };

    // const addNewLine = () => {
    //   configEl.createEl("br");
    // };

    // const addCopyFeedButton = result => {
    //   const md = this.api
    //     .markdownTaskList(result)
    //     .replace(/    /gm, "\t")
    //     .replace(/^# \[\[[^\|]+\|([^\]]+)\]\]\n\n/gm, (a, b) => `- [[${b}]]\n`);
    //   if (md) {
    //     const button = configEl.createEl("button");
    //     button.textContent = "📋 Copy Feed as markdown";
    //     button.onclick = () => {
    //       navigator.clipboard.writeText(md);
    //       button.textContent = "📋 Copied!";
    //     };
    //     button.style.margin = "0 1em";
    //   }
    // };

    // addShowOptionsLink();
    // if (this.state.showOptionsPanel) {
    //   addNewLine();
    //   addSelect("Only with tasks", "onlyWithTasks", ["", "any", "undone", "done"]);
    //   addNewLine();
    //   addToggle("Show tree", "showTree");
    //   if (!this.state.showTree) {
    //     addNewLine();
    //     addToggle("Find oneliners", "oneliners");
    //     addNewLine();
    //     addToggle("Show parent if not alone", "showParentIfNotAlone");
    //     if (this.state.showParentIfNotAlone) {
    //       addNewLine();
    //       addToggle("Remove own link from list", "removeOwnLinkFromList");
    //     }
    //   }
    //   addNewLine();
    //   addToggle("Group by section", "groupBySection");
    //   addNewLine();
    //   addToggle("Collapse header section names", "collapseHeaders");
    //   addNewLine();
    //   addResetStateButton();
    // }

    // -------- Settings end

    const isMatch = l =>
      l.section.subpath === this.file.basename ||
      l.outlinks?.some(o => searchForLinks.includes(`[[${o.fileName()}]]`)) ||
      l.tags?.some(t => searchForTags.some(tt => t.includes(tt)));

    const tree = listItem => {
      // attention: this mutates the list item
      if (isMatch(listItem)) {
        return [listItem];
      }
      listItem.children = listItem.children.flatMap(tree);
      return listItem.children.length ? [listItem] : [];
    };

    const showParent = listItem => {
      if (listItem.section.subpath === this.file.basename) return true;
      const cleanText = listItem.text
        .replace(/\[\[[^\]]+\]\]/g, "") // match [[links]]
        .replace(/#[^ ]+/g, ""); // match #nested/TAGS/100 until ` `
      const hasText = /[a-zA-Z0-9]/g.test(cleanText);
      if (hasText) {
        if (
          this.state.oneliners ||
          (this.state.showParentIfNotAlone && listItem.children.length)
        ) {
          return true;
        }
        return false;
      }

      // not alone, keep parent
      if (this.state.showParentIfNotAlone) {
        const textWithoutOwnLink = listItem.text
          .replace(`[[${this.file.basename}]]`, "")
          .replace(/^[^\[]+/, "")
          .replace(/[^\]]+$/, "");

        if (textWithoutOwnLink) {
          if (this.state.removeOwnLinkFromList) {
            listItem.text = textWithoutOwnLink;
          }
          return true;
        }
      }

      return false;
    };

    const showTask = listItem => {
      switch (this.state.onlyWithTasks) {
        case "all":
        case true:
          return listItem.task;
        case "done":
          return listItem.task && listItem.checked;
        case "undone":
          return listItem.task && !listItem.checked;
        default:
          return listItem.task && listItem.status === this.state.onlyWithTasks;
      }
    };

    const someOfMeAndMyChildren = (listItem, predicate) => {
      if (predicate(listItem)) return true;
      if (listItem.children.length) {
        return listItem.children.some(l => someOfMeAndMyChildren(l, predicate));
      }
      return false;
    };

    const searchFor = this.state.searchFor.replaceAll(
      "[[#]]",
      `[[${this.file.basename}]]`,
    );
    const searchForLinks = searchFor.match(/\[\[(.*?)\]\]/g) ?? [];
    const searchForTags = searchFor.match(/#[^\s,#]+/g) ?? [];
    const searchQuery = [...searchForLinks, ...searchForTags].join(" OR ");

    const query =
      `(${searchQuery})` +
      (this.state.includeFolders.length
        ? ` AND (${this.state.includeFolders.map(f => `"${f}"`).join(" OR ")})`
        : "") +
      (this.state.excludeFolders.length
        ? ` AND (${this.state.excludeFolders.map(f => `!"${f}"`).join(" OR ")})`
        : "");

    let result = this.api
      .pages(query)
      .file.lists.where(
        this.state.showTree
          ? l => !l.parent && someOfMeAndMyChildren(l, isMatch)
          : isMatch,
      )
      .flatMap(this.state.showTree ? tree : l => (showParent(l) ? [l] : l.children))
      .filter(l => !this.state.onlyWithTasks || someOfMeAndMyChildren(l, showTask))
      .groupBy(l => (this.state.groupBySection ? l.link : l.link.toFile()))
      .sort(g => (this.state.sortByPath ? g : g.key.fileName()), "desc");

    // if (this.state.showCopyFeedButton && this.state.showOptionsPanel) {
    //   addCopyFeedButton(result);
    // }

    let group = true;
    if (this.state.collapseHeaders) {
      result = result.flatMap(section =>
        section.rows.map(row => ({
          ...row,
          text: `${section.key} - ${row.text}`,
        })),
      );
      group = false;
    }
    this.api.taskList(result, group, this.containerEl, this);
  }
}
