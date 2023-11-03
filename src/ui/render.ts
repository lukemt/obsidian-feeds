import { DataviewApi, DataArray } from "obsidian-dataview";
import { Settings } from "~/view/settings";

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

export function addSelect({
  container,
  value,
  onChange,
  label,
  options,
}: {
  container: HTMLElement;
  value: string | boolean;
  onChange: (v: string | boolean) => void;
  label: string;
  options: (string | boolean)[];
}) {
  const select = document.createElement("select");
  select.style.margin = "0 0.5em -0.1em";
  select.onchange = () => {
    // this.setStateProperty(prop, select.value);
    const v =
      select.value === "false" ? false : select.value === "true" ? true : select.value;
    onChange(v);
  };
  options.forEach(o => {
    const option = document.createElement("option");
    const ov = typeof o === "boolean" ? o.toString() : o;
    option.value = ov;
    option.textContent = ov;
    select.appendChild(option);
  });
  select.value = typeof value === "boolean" ? value.toString() : value;
  const labelEl = document.createElement("label");
  labelEl.appendChild(document.createTextNode(label));
  labelEl.appendChild(select);
  container.appendChild(labelEl);
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

export function addToggle(
  container: HTMLElement,
  label: string,
  value: boolean,
  onChange: (v: boolean) => void,
) {
  const labelEl = container.createEl("label");
  const toggle = labelEl.createEl("input");
  toggle.type = "checkbox";
  toggle.checked = value;
  toggle.onchange = () => {
    onChange(toggle.checked);
  };
  toggle.style.margin = "0 0.5em -0.1em";
  labelEl.appendChild(document.createTextNode(label));
}

export function addResetStateButton(container: HTMLElement, onClick: () => void) {
  const button = document.createElement("button");
  button.textContent = "Reset options";
  button.onclick = () => onClick();
  container.appendChild(button);
}

export function addNewLine(container: HTMLElement) {
  container.createEl("br");
}
