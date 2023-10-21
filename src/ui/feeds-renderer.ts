import { DataviewRefreshableRenderer } from "./refreshable-view";
import { DataviewApi } from "obsidian-dataview";

import { renderError } from "ui/render";

export class FeedsRenderer extends DataviewRefreshableRenderer {
  constructor(
    public api: DataviewApi,
    public container: HTMLElement,
    public sourcePath: string,
  ) {
    super(container, api.index, api.app, api.settings);
  }

  async render() {
    this.container.innerHTML = "";
    if (!this.settings.enableDataviewJs) {
      this.containerEl.innerHTML = "";
      renderError(
        this.container,
        "Dataview JS queries are disabled. You can enable them in the Dataview settings.",
      );
      return;
    }

    this.api.taskList(
      this.api
        .pages("[[Testing Note]]")
        .file.lists.slice(0, 10)
        .flatMap(l => [l]),
      true,
      this.containerEl,
      this,
    );
  }
}
