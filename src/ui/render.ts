import { DataviewApi, DataArray } from "obsidian-dataview";

export function renderError(container: HTMLElement, error: string) {
  // render a custom error and style it
  const wrapper = container.createEl("div");
  wrapper.createEl("p", { text: `(Error) Obsidian Feeds: ${error}` });

  wrapper.style.borderRadius = "4px";
  wrapper.style.padding = "2px 16px";
  wrapper.style.backgroundColor = "#e50914";
  wrapper.style.color = "#fff";
  wrapper.style.fontWeight = "bolder";
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
