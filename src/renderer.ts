import { App, MarkdownPostProcessorContext, TFile } from "obsidian";
import { DataviewApi, Literal, ListItem } from "obsidian-dataview";
import ObsidianFeedsPlugin from "~/main";
import { DEFAULT_SETTINGS, ObsidianFeedsSettings } from "~/settings";
import { RefreshableRenderer } from "~/ui/refreshable-renderer";
import { addCopyFeedButton, buildConfig } from "~/ui/render";

export default class FeedRenderer extends RefreshableRenderer {
  public app: App;
  public state: ObsidianFeedsSettings;
  public file: TFile;
  public configEl: HTMLElement;

  constructor(
    public plugin: ObsidianFeedsPlugin,
    public api: DataviewApi,
    public containerEl: HTMLElement,
    public context: MarkdownPostProcessorContext,
  ) {
    super(api, containerEl);
    this.app = api.app;
    this.state = { ...this.plugin.settings };

    const file = this.app.vault.getAbstractFileByPath(context.sourcePath);
    if (file instanceof TFile) {
      this.file = file;
    }
  }

  initState() {
    this.state = { ...DEFAULT_SETTINGS, showOptionsPanel: true };
    this.app.commands.executeCommandById("dataview:dataview-force-refresh-views");
    this.plugin.saveData(this.state);
  }

  async setStateProperty<T extends keyof ObsidianFeedsSettings>(
    prop: T,
    value: ObsidianFeedsSettings[T],
  ) {
    this.state[prop] = value;
    if (this.api.settings.refreshEnabled) {
      this.app.commands.executeCommandById("dataview:dataview-force-refresh-views");
    }
    this.plugin.saveData(this.state);
  }

  async run() {
    this.configEl = this.containerEl.createDiv("options");
    buildConfig(
      this.configEl,
      this.state,
      (k, v) => this.setStateProperty(k, v),
      () => this.initState(),
    );

    const isMatch = (l: Literal) =>
      l.section.subpath === this.file.basename ||
      l.outlinks?.some((o: Literal) =>
        searchForLinks.includes(`[[${o.fileName()}]]`),
      ) ||
      l.tags?.some((t: Literal) => searchForTags.some(tt => t.includes(tt)));

    const tree = (listItem: ListItem) => {
      // attention: this mutates the list item
      if (isMatch(listItem)) {
        return [listItem];
      }
      listItem.children = listItem.children.flatMap(tree);
      return listItem.children.length ? [listItem] : [];
    };

    const showParent = (listItem: ListItem) => {
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
          .replace(/^[^[]+/, "")
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

    const showTask = (listItem: ListItem) => {
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

    const someOfMeAndMyChildren = (
      listItem: ListItem,
      predicate: (l: Literal) => boolean,
    ) => {
      if (predicate(listItem)) return true;
      if (listItem.children.length) {
        return listItem.children.some((l: Literal) =>
          someOfMeAndMyChildren(l, predicate),
        );
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
      .file.lists.filter(
        this.state.showTree
          ? (l: Literal) => !l.parent && someOfMeAndMyChildren(l, isMatch)
          : isMatch,
      )
      .flatMap(
        this.state.showTree ? tree : (l: Literal) => (showParent(l) ? [l] : l.children),
      )
      .filter(
        (l: Literal) => !this.state.onlyWithTasks || someOfMeAndMyChildren(l, showTask),
      )
      .groupBy((l: Literal) => (this.state.groupBySection ? l.link : l.link.toFile()))
      .sort(
        (l: Literal) => (this.state.sortByPath ? l : l.key.fileName()),
        this.state.sort,
      );

    if (this.state.showCopyFeedButton && this.state.showOptionsPanel) {
      addCopyFeedButton(this.configEl, this.api, result);
    }

    let group = true;
    if (this.state.collapseHeaders) {
      result = result.flatMap((section: Literal) =>
        section.rows.map((row: Literal) => ({
          ...row,
          text: `${section.key} - ${row.text}`,
        })),
      );
      group = false;
    }
    this.api.taskList(result, group, this.containerEl, this);
  }
}
