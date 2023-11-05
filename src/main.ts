import { Plugin } from "obsidian";
import ObsidianFeedsCodeBlockProcessor from "~/code-block";
import {
  DEFAULT_SETTINGS,
  ObsidianFeedsSettings,
  ObsidianFeedsSettingsTab,
} from "~/settings";

export default class ObsidianFeedsPlugin extends Plugin {
  settings: ObsidianFeedsSettings;
  /**
   * Called on plugin load.
   * This can be when the plugin is enabled or Obsidian is first opened.
   */
  async onload() {
    await this.loadSettings();

    this.addSettingTab(new ObsidianFeedsSettingsTab(this.app, this));

    this.registerMarkdownCodeBlockProcessor(
      "obsidian-feeds",
      (src, containerEl, context) => {
        const handler = new ObsidianFeedsCodeBlockProcessor(
          this,
          src,
          containerEl,
          context,
        );
        context.addChild(handler);
      },
    );
  }

  /**
   * Called on plugin unload.
   * This can be when the plugin is disabled or Obsidian is closed.
   */
  async onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
