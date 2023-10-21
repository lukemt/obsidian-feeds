import { App, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";

import ObsidianFeedsPlugin from "main";
import getSettings, { Settings } from "view/settings";
import FeedsRenderer from "view/view";
import { renderError } from "ui/render";
import { RefreshableRenderer } from "ui/renderer";

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
    this.settings = getSettings(src, containerEl, app, ctx);
  }

  async onload() {
    const hasDataView = isPluginEnabled(this.app);
    if (!hasDataView) {
      const error =
        "Dataview plugin is not installed. Please install it from Community plugins.";
      renderError(this.containerEl, error);
      throw new Error(error);
    }

    const dvApi = getAPI();
    const feedsRenderer = new FeedsRenderer(dvApi, this.containerEl, this.ctx, this);
    this.addChild(new RefreshableRenderer(dvApi, this.containerEl, feedsRenderer));
  }

  async onunload() {}
}
