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

const DEFAULT_SETTINGS: Settings = {
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

const getSettings = (src: string, container: HTMLElement) => {
  const settingsSrc = parseYaml(src);
  if (settingsSrc === undefined) {
    const error = "Cannot parse YAML!";
    renderError(container, error);
    throw new Error(error);
  }
  const settings: Settings = DEFAULT_SETTINGS;
  return { ...settings, ...settingsSrc };
};

export default getSettings;
