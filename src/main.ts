import { Plugin } from "obsidian";
import ObsidianFeeds from "./view";

export default class ObsidianFeedsPlugin extends Plugin {
  /**
   * Called on plugin load.
   * This can be when the plugin is enabled or Obsidian is first opened.
   */
  async onload() {
    this.registerMarkdownCodeBlockProcessor("obsidian-feeds", (src, el, ctx) => {
      const handler = new ObsidianFeeds(this, src, el, this.app, ctx);
      ctx.addChild(handler);
    });
  }

  /**
   * Called on plugin unload.
   * This can be when the plugin is disabled or Obsidian is closed.
   */
  async onunload() {}
}
