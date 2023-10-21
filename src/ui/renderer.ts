import { Component, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { DataviewApi } from "obsidian-dataview";

import { DataviewRefreshableRenderer } from "ui/refreshable-view";
import { renderError } from "ui/render";

export class RefreshableRenderer extends DataviewRefreshableRenderer {
  constructor(
    public api: DataviewApi,
    public containerEl: HTMLElement,
    public renderer: Renderer,
  ) {
    super(containerEl, api.index, api.app, api.settings);
  }

  async render() {
    this.containerEl.innerHTML = "";
    if (!this.settings.enableDataviewJs) {
      this.containerEl.innerHTML = "";
      renderError(
        this.containerEl,
        "Dataview JS queries are disabled. You can enable them in the Dataview settings.",
      );
      return;
    }
    this.renderer.render();
  }
}

export abstract class Renderer extends MarkdownRenderChild {
  public constructor(
    public api: DataviewApi,
    public containerEl: HTMLElement,
    public context: MarkdownPostProcessorContext,
    public component: Component,
  ) {
    super(containerEl);
  }

  abstract render(): Promise<void>;
}
