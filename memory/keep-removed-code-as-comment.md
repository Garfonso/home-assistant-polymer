---
name: keep-removed-code-as-comment
description: User preference — when removing/disabling code for IoB, comment it out instead of deleting
metadata:
  type: feedback
---

When hiding or removing code as an IoB modification, keep the removed code as a comment rather than deleting it outright. Mark with an `// IoB` / `<!-- IoB -->` note explaining what was removed and why.

**Why:** Eases the manual merge of upstream Home Assistant frontend into the `iob` fork — the original code stays visible next to the IoB change, so the intent and the upstream baseline are both clear at merge time.

**How to apply:** Replace deletions with a commented-out block. In lit `html` templates use `<!-- IoB ... -->` around the original markup (note: `${...}` bindings inside an HTML comment are still consumed positionally by lit but not rendered — ensure they stay valid). In TS/JS use `//` or `/* */`. Example: yaml tab in `ha-panel-developer-tools.ts` kept as a commented `<ha-tab-group-tab panel="yaml">` block.
