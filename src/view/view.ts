import { Component, MarkdownPostProcessorContext } from "obsidian";
import { DataviewApi } from "obsidian-dataview";
import { Renderer } from "ui/renderer";

export default class FeedsRenderer extends Renderer {
  constructor(
    public api: DataviewApi,
    public containerEl: HTMLElement,
    public context: MarkdownPostProcessorContext,
    public component: Component,
  ) {
    super(api, containerEl, context, component);
  }

  async render() {
    this.api.taskList(
      this.api
        .pages("[[Testing Note]]")
        .file.lists.slice(0, 10)
        .flatMap(l => [l]),
      true,
      this.containerEl,
      this.component,
    );
  }
}
