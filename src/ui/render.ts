import { DataviewApi, DataArray } from "obsidian-dataview";

export function renderError(container: HTMLElement, error: string) {
  // render a custom error and style it
  const wrapper = container.createEl("div");
  wrapper.createEl("div", { text: `Feeds Error: ${error}` });

  wrapper.style.borderRadius = "var(--callout-radius)";
  wrapper.style.padding = "var(--callout-padding)";
  wrapper.style.backgroundColor = "var(--background-modifier-error)";
  wrapper.style.color = "var(--text-on-accent-inverted)";
  wrapper.style.fontWeight = "var(--font-bold)";
}

export function addCopyFeedButton(
  container: HTMLElement,
  api: DataviewApi,
  result: DataArray,
) {
  const md = api
    .markdownTaskList(result)
    .replace(/[ ]{4}/gm, "\t")
    .replace(
      /^# \[\[[^|]+\|([^\]]+)\]\]\n\n/gm,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_: any, b: any) => `- [[${b}]]\n`,
    );
  if (md) {
    const button = container.createEl("button");
    button.textContent = "📋 Copy Feed as markdown";
    button.onclick = () => {
      navigator.clipboard.writeText(md);
      button.textContent = "📋 Copied!";
    };
    button.style.margin = "0 1em";
  }
}
