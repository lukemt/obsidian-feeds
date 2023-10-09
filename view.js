const fileName = dv.current()?.file?.name
if (fileName == null) dv.el("div", "Please reopen the file to show the feed")

const hideParent = (listItem) => {
  if (listItem.section.subpath === fileName) return false;
    // if i remove all links and there is still content other than special characters,
    // i want to keep the parent as is
    // and not change the text
    // if i remove all links and there is no content other than special characters,
    // but there are several links, i want to keep the parent, but remove my own link
    // if i remove all links and there is no content other than special characters,
    // and there is only one link, i want to remove the parent
  
  const hasText = /[a-zA-Z0-9]/g.test(listItem.text.replace(/\[\[[^\]]+\]\]/g, ""));
  if (hasText) return false;

  const textWithoutMe = listItem.text
    .replace(`[[${fileName}]]`, "")
    .replace(/^[^\[]+/, "")
    .replace(/[^\]]+$/, "")
  
  if (textWithoutMe) {
    // listItem.text = textWithoutMe;
    return false;
  }

  return true;
}

const result = dv.pages("[[#]]")
  .file.lists
  .where(l => l.section.subpath === fileName || l.outlinks?.some(o => o.fileName() === fileName))
  // .flatMap(l => l.section.subpath === fileName ? [l] : l.children)
  .flatMap(l => hideParent(l)  ? l.children : [l])
  .groupBy(l => l.link.toFile())
  .sort(g => g.key.fileName(), "desc")
  
dv.taskList(result)

const md = dv.markdownTaskList(result)
  .replace(/    /gm, "\t")
  .replace(/^# \[\[[^\|]+\|([^\]]+)\]\]\n\n/gm, (a, b) => `- [[${b}]]\n`)
  
if (md) dv.el("button", "📋 Copy Feed as markdown", { 
  attr: { 
    onclick: "navigator.clipboard.writeText(this.getAttr('data-md'));this.textContent='📋 Copied!'",
    "data-md": md,
    style: "margin: 2em 0;"
    }
})
