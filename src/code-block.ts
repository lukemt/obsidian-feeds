import {
  App,
  MarkdownPostProcessorContext,
  MarkdownRenderChild,
  parseYaml,
} from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";
import ObsidianFeedsPlugin from "~/main";
import { renderError } from "~/ui/render";
import FeedRenderer from "~/renderer";
import { ObsidianFeedsSettings } from "~/settings";

export default class ObsidianFeedsCodeBlockProcessor extends MarkdownRenderChild {
  public settings: ObsidianFeedsSettings;

  constructor(
    public plugin: ObsidianFeedsPlugin,
    public src: string,
    public containerEl: HTMLElement,
    public context: MarkdownPostProcessorContext,
  ) {
    super(containerEl);

    try {
      this.settings = mergeSettings(plugin.settings, src);
    } catch (error: unknown) {
      renderError(containerEl, (error as Error).message);
      throw error;
    }
  }

  async onload() {
    const hasDataView = isPluginEnabled(this.plugin.app);
    if (!hasDataView) {
      const error =
        "Dataview plugin is not installed. Please install it from Community plugins.";
      renderError(this.containerEl, error);
      throw new Error(error);
    }

    const dvApi = getAPI(this.plugin.app);
    this.addChild(
      new FeedRenderer(
        this.plugin,
        dvApi,
        this.settings,
        this.containerEl,
        this.context,
      ),
    );
  }

  async onunload() {}
}

const mergeSettings = (defaultSettings: ObsidianFeedsSettings, yaml: string) => {
  const blockSettings = parseYaml(yaml);
  if (blockSettings === undefined) {
    throw new Error("Cannot parse YAML!");
  }
  return { ...defaultSettings, ...blockSettings };
};
