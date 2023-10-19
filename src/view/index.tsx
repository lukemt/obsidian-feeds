import { App, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";

import ObsidianFeedsPlugin from "../main";
import getSettings, { Settings } from "./settings";
import renderError from "./errors";

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
        "Dataview plugin is not installed. Please install community plugin.";
      renderError(this.containerEl, error);
      throw new Error(error);
    }
    const dv = getAPI();

    // TODO: view.js needs to be refactored...
    dv.taskList(
      dv
        .pages("")
        .file.lists.slice(0, 10)
        .flatMap(l => [l]),
      true,
      this.containerEl,
      this,
    );
  }

  async onunload() {}
}
