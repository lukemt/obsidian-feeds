import { App, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";
import ObsidianFeedsPlugin from "~/main";
import { renderError } from "~/ui/render";
import FeedRenderer from "~/renderer";

export default class ObsidianFeedsCodeBlockProcessor extends MarkdownRenderChild {
  constructor(
    public plugin: ObsidianFeedsPlugin,
    public src: string,
    public containerEl: HTMLElement,
    public context: MarkdownPostProcessorContext,
  ) {
    super(containerEl);
  }

  async onload() {
    const { app, settings } = this.plugin;

    const hasDataView = isPluginEnabled(app);
    if (!hasDataView) {
      const error =
        "Dataview plugin is not installed. Please install it from Community plugins.";
      renderError(this.containerEl, error);
      throw new Error(error);
    }

    const dvApi = getAPI(app);
    this.addChild(new FeedRenderer(this.plugin, dvApi, this.containerEl, this.context));
  }

  async onunload() {}
}
