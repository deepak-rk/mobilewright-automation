---
name: Project docs location preference
description: User wants all Claude session documentation kept in the project's .claude folder, not globally
type: feedback
---

Keep all project-specific Claude documentation (plans, memories, notes) inside the project folder at `<project-root>/.claude/` rather than in the global `C:\Users\Deepak\.claude\`.

**Why:** User explicitly corrected this during the mobilewright-automation scaffolding session — they want docs co-located with the project for portability and review.

**How to apply:** When creating plan files or memory files for this project, write to `C:\Deepak\CODE\mobilewright-automation\.claude\<type>\<file>.md`. Do not use the global `C:\Users\Deepak\.claude\` path for project work.
