import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianFeedsPlugin from "~/main";

export interface ObsidianFeedsSettings {
  searchFor: string;
  onlyWithTasks: boolean | string;
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
};

export class ObsidianFeedsSettingsTab extends PluginSettingTab {
  plugin: ObsidianFeedsPlugin;

  constructor(app: App, plugin: ObsidianFeedsPlugin) {
    super(app, plugin);
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
            this.plugin.settings.searchFor = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Only with Tasks")
      .setDesc("Only include lines with tasks")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.onlyWithTasks).onChange(async value => {
          this.plugin.settings.onlyWithTasks = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Oneliners")
      .setDesc("Include lines starting with the topic")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.oneliners).onChange(async value => {
          this.plugin.settings.oneliners = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Show parent if not alone")
      .setDesc("Show the parent item if not alone")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.showParentIfNotAlone)
          .onChange(async value => {
            this.plugin.settings.showParentIfNotAlone = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Group by Section")
      .setDesc("Group items by their parent section")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.groupBySection).onChange(async value => {
          this.plugin.settings.groupBySection = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Collapse headers")
      .setDesc("Remove headers from the output")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.collapseHeaders).onChange(async value => {
          this.plugin.settings.collapseHeaders = value;
          await this.plugin.saveSettings();
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
            this.plugin.settings.sort = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Sort by path")
      .setDesc("Sort item depending on their path")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.sortByPath).onChange(async value => {
          this.plugin.settings.sortByPath = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Show tree")
      .setDesc("Show the whole tree")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.showTree).onChange(async value => {
          this.plugin.settings.showTree = value;
          await this.plugin.saveSettings();
        }),
      );
  }
}
// const getSettings = async (
//   plugin: ObsidianFeedsPlugin,
//   src: string,
//   container: HTMLElement,
// ) => {
//   const settingsSrc = parseYaml(src);
//   if (settingsSrc === undefined) {
//     const error = "Cannot parse YAML!";
//     renderError(container, error);
//     throw new Error(error);
//   }
//   const settings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
//   const newSettings = { ...settings, ...settingsSrc };
//   plugin.saveData(newSettings);
//   return newSettings;
// };
//
// export default getSettings;
// const getSettings = async (
//   plugin: ObsidianFeedsPlugin,
//   src: string,
//   container: HTMLElement,
// ) => {
//   const settingsSrc = parseYaml(src);
//   if (settingsSrc === undefined) {
//     const error = "Cannot parse YAML!";
//     renderError(container, error);
//     throw new Error(error);
//   }
//   const settings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
//   const newSettings = { ...settings, ...settingsSrc };
//   plugin.saveData(newSettings);
//   return newSettings;
// };
//
// export default getSettings;
