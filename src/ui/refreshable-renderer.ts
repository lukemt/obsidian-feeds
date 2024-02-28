import { MarkdownRenderChild } from "obsidian";
import { DataviewApi } from "obsidian-dataview";

import { renderError } from "~/ui/render";

// Adapted from Dataview's RefreshableRenderer
// https://github.com/blacksmithgu/obsidian-dataview/blob/master/src/ui/refreshable-view.ts

export abstract class RefreshableRenderer extends MarkdownRenderChild {
  private lastReload: number;

  constructor(
    public containerEl: HTMLElement,
    public dvApi: DataviewApi,
  ) {
    super(containerEl);
    this.lastReload = 0;
  }

  abstract run(): Promise<void>;

  async render() {
    this.containerEl.empty();

    if (!this.dvApi.settings.enableDataviewJs) {
      renderError(
        this.containerEl,
        "Dataview JS queries are disabled. You can enable them in the Dataview settings.",
      );
      return;
    }

    this.run();
  }

  onload() {
    const { app, index } = this.dvApi;
    this.render();
    this.lastReload = index.revision;

    // Refresh after index changes stop.
    this.registerEvent(app.workspace.on("dataview:refresh-views", this.maybeRefresh));

    // Refresh after settings changes.
    this.registerEvent(app.workspace.on("feeds:update-settings", this.refresh));

    // ...or when the DOM is shown (sidebar expands, tab selected, nodes scrolled into view).
    this.register(this.containerEl.onNodeInserted(this.maybeRefresh));
  }

  refresh = () => {
    this.lastReload = 0;
    this.maybeRefresh();
  };

  maybeRefresh = () => {
    const { index } = this.dvApi;
    // If the index revision has changed recently, then queue a reload.
    // But only if we're mounted in the DOM and auto-refreshing is active.
    if (
      this.lastReload != index.revision &&
      this.containerEl.isShown() &&
      this.dvApi.settings.refreshEnabled
    ) {
      this.lastReload = index.revision;
      this.render();
    }
  };
}
