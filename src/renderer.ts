import { App, MarkdownPostProcessorContext, TFile } from "obsidian";
import { DataviewApi, Literal, ListItem } from "obsidian-dataview";
import ObsidianFeedsPlugin from "~/main";
import { ObsidianFeedsSettings } from "~/settings";
import { RefreshableRenderer } from "~/ui/refreshable-renderer";
import { addCopyFeedButton } from "~/ui/render";

export default class FeedRenderer extends RefreshableRenderer {
  public app: App;
  public file: TFile;
  public configEl: HTMLElement;

  constructor(
    public plugin: ObsidianFeedsPlugin,
    public api: DataviewApi,
    public getSettings: () => ObsidianFeedsSettings,
    public containerEl: HTMLElement,
    public context: MarkdownPostProcessorContext,
  ) {
    super(containerEl, api);
    this.app = api.app;

    const file = this.app.vault.getAbstractFileByPath(context.sourcePath);
    if (file instanceof TFile) {
      this.file = file;
    }
  }

  async run() {
    const settings = this.getSettings();
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
          settings.oneliners ||
          (settings.showParentIfNotAlone && listItem.children.length)
        ) {
          return true;
        }
        return false;
      }

      // not alone, keep parent
      if (settings.showParentIfNotAlone) {
        const textWithoutOwnLink = listItem.text
          .replace(`[[${this.file.basename}]]`, "")
          .replace(/^[^[]+/, "")
          .replace(/[^\]]+$/, "");

        if (textWithoutOwnLink) {
          if (settings.removeOwnLinkFromList) {
            listItem.text = textWithoutOwnLink;
          }
          return true;
        }
      }

      return false;
    };

    const showTask = (listItem: ListItem) => {
      switch (settings.onlyWithTasks) {
        // case "all":
        case true:
          return listItem.task;
        // case "done":
        //   return listItem.task && listItem.checked;
        // case "undone":
        //   return listItem.task && !listItem.checked;
        default:
          return listItem.task && listItem.status === settings.onlyWithTasks;
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

    const searchFor = settings.searchFor.replaceAll(
      "[[#]]",
      `[[${this.file.basename}]]`,
    );
    const searchForLinks = searchFor.match(/\[\[(.*?)\]\]/g) ?? [];
    const searchForTags = searchFor.match(/#[^\s,#]+/g) ?? [];
    const searchQuery = [...searchForLinks, ...searchForTags].join(" OR ");

    const query =
      `(${searchQuery})` +
      (settings.includeFolders.length
        ? ` AND (${settings.includeFolders.map(f => `"${f}"`).join(" OR ")})`
        : "") +
      (settings.excludeFolders.length
        ? ` AND (${settings.excludeFolders.map(f => `!"${f}"`).join(" OR ")})`
        : "");

    let result = this.api
      .pages(query)
      .file.lists.filter(
        settings.showTree
          ? (l: Literal) => !l.parent && someOfMeAndMyChildren(l, isMatch)
          : isMatch,
      )
      .flatMap(
        settings.showTree ? tree : (l: Literal) => (showParent(l) ? [l] : l.children),
      )
      .filter(
        (l: Literal) => !settings.onlyWithTasks || someOfMeAndMyChildren(l, showTask),
      )
      .groupBy((l: Literal) => (settings.groupBySection ? l.link : l.link.toFile()))
      .sort(
        (l: Literal) => (settings.sortByPath ? l : l.key.fileName()),
        settings.sort,
      );

    if (settings.showCopyFeedButton && settings.showOptionsPanel) {
      addCopyFeedButton(this.containerEl, this.api, result);
    }

    let group = true;
    if (settings.collapseHeaders) {
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
