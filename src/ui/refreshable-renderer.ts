import { DataviewApi } from "obsidian-dataview";

import { DataviewRefreshableRenderer } from "ui/refreshable-view";
import { renderError } from "ui/render";

export abstract class RefreshableRenderer extends DataviewRefreshableRenderer {
  constructor(public api: DataviewApi, public containerEl: HTMLElement) {
    super(containerEl, api.index, api.app, api.settings);
  }

  abstract run(): Promise<void>;

  async render() {
    this.containerEl.innerHTML = "";
    if (!this.dvSettings.enableDataviewJs) {
      this.containerEl.innerHTML = "";
      renderError(
        this.containerEl,
        "Dataview JS queries are disabled. You can enable them in the Dataview settings.",
      );
      return;
    }

    this.run();
  }
}
