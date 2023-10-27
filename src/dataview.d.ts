/* eslint-disable @typescript-eslint/no-explicit-any */
import "obsidian";

import { DataviewApi } from "obsidian-dataview";

declare module "obsidian" {
  interface App {
    commands: {
      executeCommandById: (string) => void;
    };
    plugins: {
      enabledPlugins: Set<string>;
      plugins: {
        [id: string]: any;
        dataview?: {
          api?: DataviewApi;
        };
      };
    };
  }

  interface MetadataCache {
    on(name: "dataview:index-ready", callback: () => any, ctx?: any): EventRef;
    on(
      name: "dataview:metadata-change",
      callback: (op: string, file: TFile) => any,
      ctx?: any,
    ): EventRef;
  }

  interface Workspace {
    on(name: "dataview:refresh-views", callback: () => void, ctx?: any): EventRef;
  }
}

declare module "obsidian-dataview" {
  interface DataviewSettings {
    refreshEnabled: boolean;
    enableDataviewJs: boolean;
  }
}
