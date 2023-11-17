import { MarkdownRenderChild } from "obsidian";
import { renderError } from "~/ui/render";

export default class DeprecatedObsidianFeedsCodeBlockProcessor extends MarkdownRenderChild {
  constructor(container: HTMLElement) {
    super(container);
    renderError(
      container,
      "`obsidian-feeds` code blocks are deprecated, please use `feed` instead.",
    );
  }
}
