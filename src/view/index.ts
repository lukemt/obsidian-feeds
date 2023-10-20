import { App, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";

import ObsidianFeedsPlugin from "../main";
import getSettings, { Settings } from "./settings";
import renderError from "./errors";
import FeedView from "./view";

export default class ObsidianFeeds extends MarkdownRenderChild {
  private settings: Settings;

  constructor(
    public plugin: ObsidianFeedsPlugin,
    public src: string,
    public containerEl: HTMLElement,
    public app: App,
    public ctx: MarkdownPostProcessorContext,
  ) {
    super(containerEl);
    this.settings = getSettings(src, app, containerEl, ctx);

    // once dataview has indexed the files we need to reload the container
    // so that the feed populates.
    // this is only really needed for startup or app reload.
    // TODO: don't do this
    this.registerEvent(
      this.app.metadataCache.on("dataview:index-ready", async () => {
        Array.from(this.containerEl.children).forEach(child => {
          this.containerEl.removeChild(child);
        });
        await this.onload();
      }),
    );
  }

  async onload() {
    const hasDataView = isPluginEnabled(this.app);
    if (!hasDataView) {
      const error =
        "Dataview plugin is not installed. Please install it from Community plugins.";
      renderError(this.containerEl, error);
      throw new Error(error);
    }
    const dv = getAPI();

    const fv = new FeedView();
    console.log({ dv });
    console.log({ fv });

    // This needs to be implemented in a similar way to
    // DataviewJSRenderer and DataviewRefreshableRenderer
    // otherwise it does not refresh
    // https://github.com/blacksmithgu/obsidian-dataview/blob/master/src/ui/views/js-view.ts#L6
    // triggers a refresh on("dataview:refresh-views")
    // TODO: don't do this
    dv.taskList(
      dv
        .pages("[[Testing Note]]")
        .file.lists.slice(0, 10)
        .flatMap(l => [l]),
      true,
      this.containerEl,
      this,
    );
  }

  async onunload() {}
}
