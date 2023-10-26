import ObsidianFeedsPlugin from "main";
import { parseYaml } from "obsidian";
import { renderError } from "ui/render";

export interface Settings {
  searchFor: string;
  onlyWithTasks: boolean | "all" | "done" | "undone";
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

export const DEFAULT_SETTINGS: Settings = {
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

const getSettings = async (
  plugin: ObsidianFeedsPlugin,
  src: string,
  container: HTMLElement,
) => {
  const settingsSrc = parseYaml(src);
  if (settingsSrc === undefined) {
    const error = "Cannot parse YAML!";
    renderError(container, error);
    throw new Error(error);
  }
  const settings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
  const newSettings = { ...settings, ...settingsSrc };
  plugin.saveData(newSettings);
  return newSettings;
};

export default getSettings;
