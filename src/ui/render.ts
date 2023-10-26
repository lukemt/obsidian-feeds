import { DataviewApi, DataArray } from "obsidian-dataview";
import { Settings } from "view/settings";

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
  options: string[];
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
    option.value = o;
    option.textContent = o;
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

export function buildConfig(
  container: HTMLElement,
  state: Settings,
  setState: (key: string, value: any) => void,
  resetState: () => void,
) {
  const addShowOptionsLink = () => {
    if (state.showOptions) {
      const link = container.createEl("a");
      if (state.showOptionsPanel) {
        link.textContent = "< Hide options";
        link.onclick = () => {
          setState("showOptionsPanel", false);
        };
      } else {
        link.textContent = "Show options >";
        link.onclick = () => {
          setState("showOptionsPanel", true);
        };
      }
      link.style.margin = "0.2em";
    }
  };
  addShowOptionsLink();
  if (state.showOptionsPanel) {
    addNewLine(container);
    addSelect({
      container: container,
      value: state.onlyWithTasks,
      onChange: v => setState("onlyWithTasks", v),
      label: "Only with tasks",
      options: ["false", "any", "undone", "done"],
    });
    addNewLine(container);
    addToggle(container, "Show tree", state.showTree, v => setState("showTree", v));
    if (!state.showTree) {
      addNewLine(container);
      addToggle(container, "Find oneliners", state.oneliners, v =>
        setState("oneliners", v),
      );
      addNewLine(container);
      addToggle(container, "Show parent if not alone", state.showParentIfNotAlone, v =>
        setState("showParentIfNotAlone", v),
      );
      if (state.showParentIfNotAlone) {
        addNewLine(container);
        addToggle(
          container,
          "Remove own link from list",
          state.removeOwnLinkFromList,
          v => setState("removeOwnLinkFromList", v),
        );
      }
    }
    addNewLine(container);
    addToggle(container, "Group by section", state.groupBySection, v =>
      setState("groupBySection", v),
    );
    addNewLine(container);
    addToggle(container, "Collapse header section names", state.collapseHeaders, v =>
      setState("collapseHeaders", v),
    );
    addNewLine(container);
    addResetStateButton(container, () => resetState());
  }
}
