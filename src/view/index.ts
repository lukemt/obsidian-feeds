import { App, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";

import ObsidianFeedsPlugin from "main";
import getSettings, { Settings } from "view/settings";
import { renderError } from "ui/render";
import { FeedsRenderer } from "ui/feeds-renderer";

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

    console.log({ dv });

    this.addChild(new FeedsRenderer(dv, this.containerEl, this.ctx.sourcePath));
  }

  async onunload() {}
}
