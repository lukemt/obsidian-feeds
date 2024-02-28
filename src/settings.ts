import { PluginSettingTab, Setting } from "obsidian";
import ObsidianFeedsPlugin from "~/main";

export interface ObsidianFeedsSettings {
  searchFor: string;
  onlyWithTasks: boolean; // TODO: Add support for "all" | "done" | "undone";
  excludeFolders: string[];
  includeFolders: string[];
  oneliners: boolean;
  showOptions: boolean;
  showOptionsPanel: boolean;
  showCopyFeedButton: boolean;
  showParentIfNotAlone: boolean;
  removeOwnLinkFromList: boolean;
  groupBySection: boolean;
  collapseHeaders: boolean;
  sort: "desc" | "asc";
  sortByPath: boolean;
  showTree: boolean;
  pageLength: number;
}

export const DEFAULT_SETTINGS: ObsidianFeedsSettings = {
  searchFor: "[[#]]",
  onlyWithTasks: false,
  excludeFolders: [],
  includeFolders: [],
  oneliners: true,
  showOptions: true,
  showOptionsPanel: false,
  showCopyFeedButton: true,
  showParentIfNotAlone: true,
  removeOwnLinkFromList: false,
  groupBySection: false,
  collapseHeaders: false,
  sort: "desc",
  sortByPath: true,
  showTree: false,
  pageLength: 10,
};

export class ObsidianFeedsSettingsTab extends PluginSettingTab {
  plugin: ObsidianFeedsPlugin;

  constructor(plugin: ObsidianFeedsPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Search for")
      .setDesc("Default search query")
      .addText(text =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.searchFor)
          .setValue(this.plugin.settings.searchFor)
          .onChange(async value => {
            await this.plugin.updateSettings({
              searchFor: value,
            });
          }),
      );

    new Setting(containerEl)
      .setName("Tasks only")
      .setDesc("Only include lines with tasks")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.onlyWithTasks).onChange(async value => {
          await this.plugin.updateSettings({
            onlyWithTasks: value,
          });
        }),
      );

    new Setting(containerEl)
      .setName("Oneliners")
      .setDesc("Include lines starting with the topic")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.oneliners).onChange(async value => {
          await this.plugin.updateSettings({
            oneliners: value,
          });
        }),
      );

    new Setting(containerEl)
      .setName("Show parent if not alone")
      .setDesc("Show the parent item if not alone")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.showParentIfNotAlone)
          .onChange(async value => {
            await this.plugin.updateSettings({
              showParentIfNotAlone: value,
            });
          }),
      );

    new Setting(containerEl)
      .setName("Group by section")
      .setDesc("Group items by their parent section")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.groupBySection).onChange(async value => {
          await this.plugin.updateSettings({
            groupBySection: value,
          });
        }),
      );

    new Setting(containerEl)
      .setName("Collapse headers")
      .setDesc("Remove headers from the output")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.collapseHeaders).onChange(async value => {
          await this.plugin.updateSettings({
            collapseHeaders: value,
          });
        }),
      );

    new Setting(containerEl)
      .setName("Sort order")
      .setDesc("Item sort order")
      .addDropdown(dropdown =>
        dropdown
          .addOptions({ desc: "Descending", asc: "Ascending" })
          .setValue(this.plugin.settings.sort)
          .onChange(async value => {
            if (value !== "desc" && value !== "asc") {
              throw new Error("Invalid sort order type");
            }
            await this.plugin.updateSettings({
              sort: value,
            });
          }),
      );

    new Setting(containerEl)
      .setName("Sort by path")
      .setDesc("Sort item depending on their path")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.sortByPath).onChange(async value => {
          await this.plugin.updateSettings({
            sortByPath: value,
          });
        }),
      );

    new Setting(containerEl)
      .setName("Show tree")
      .setDesc("Show the whole tree")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.showTree).onChange(async value => {
          await this.plugin.updateSettings({
            showTree: value,
          });
        }),
      );

    new Setting(containerEl)
      .setName("Page length")
      .setDesc("How many items to show per page")
      .addSlider(slider =>
        slider
          .setLimits(5, 30, 5)
          .setValue(this.plugin.settings.pageLength)
          .setDynamicTooltip()
          .onChange(async value => {
            await this.plugin.updateSettings({
              pageLength: value,
            });
          }),
      );
  }
}
