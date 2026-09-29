---
name: chat-app-ui
description: Build, style, maintain, and review this chat application's frontend using the repository's installed frontend-design, shadcn, and web-design-guidelines skills. Use for UI implementation, component work, visual refinement, accessibility reviews, and UX audits in this repository.
---

# Chat App UI

Use the skills pinned in `skills-lock.json` as the authoritative workflows for frontend work in this repository. Read the applicable skill file completely before acting; do not infer its rules from the lock-file metadata alone.

## Route the task

- For new interfaces, redesigns, or substantial visual changes, read [frontend-design](.agents/skills/frontend-design/SKILL.md). Establish a brief-specific visual direction before implementation.
- For shadcn components, registries, presets, chat primitives, forms, or any work governed by `components.json`, read [shadcn](.agents/skills/shadcn/SKILL.md) and any referenced rule file relevant to the task.
- For UI, UX, or accessibility reviews, read [web-design-guidelines](.agents/skills/web-design-guidelines/SKILL.md) and follow its current-guidelines workflow.

Use every skill that materially applies. For design-and-build work, apply `frontend-design` first to set the direction, then `shadcn` to implement it with the project's component system. Add `web-design-guidelines` when the user requests a review or audit; do not turn ordinary implementation into an unsolicited audit.

## Repository conventions

- Preserve the user's explicit brief, existing architecture, and established product language.
- Treat `components.json` as the source of truth for shadcn configuration, aliases, primitive base, icon library, and global CSS location.
- Prefer existing components in `src/shared/ui` and compose the chat primitives already present there before adding dependencies or creating parallel abstractions.
- Keep changes scoped. Inspect nearby code and tests before modifying shared components.
- Verify implementation changes with the narrowest relevant checks, then run broader type-checking or tests when shared behavior is affected.

Do not copy the full contents of the installed skills into this file. They are independently pinned by `skills-lock.json`; link to them so updates remain centralized.
