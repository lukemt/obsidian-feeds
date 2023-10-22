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
  sortByPath: true,
  showTree: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = { [key: string]: any };
const lowercaseKeys = (obj: AnyObject, deep = false) =>
  Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase()] =
      deep && typeof obj[key] === "object" ? lowercaseKeys(obj[key]) : obj[key];
    return acc;
  }, {} as AnyObject);

const getSettings = (src: string, container: HTMLElement) => {
  let settingsSrc: AnyObject = parseYaml(src);
  if (settingsSrc === undefined) {
    const error = "Cannot parse YAML!";
    renderError(container, error);
    throw new Error(error);
  }

  if (settingsSrc !== null) {
    settingsSrc = lowercaseKeys(settingsSrc);
  }

  const settings: Settings = DEFAULT_SETTINGS;
  return { ...settings, ...settingsSrc };
};

export default getSettings;
