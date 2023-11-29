import { DataviewApi, DataArray } from "obsidian-dataview";

export function renderError(container: HTMLElement, error: string) {
  const wrapper = container.createEl("div", { cls: "plugin-feeds-error" });
  wrapper.createEl("p", { text: `Feeds Error: ${error}` });
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
