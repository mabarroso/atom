## Context

The project has established language conventions (documented in `openspec/project.md`) that mandate:
- **Technical artifacts** (code, documentation, commit messages) must be in **English**
- **User-facing interface** text must be in **Spanish**

Currently, `README.md` and `openspec/project.md` contain Spanish text in technical documentation sections, violating the English-only convention for technical artifacts. This creates inconsistency and may confuse contributors about which language standard applies.

## Goals / Non-Goals

**Goals:**
- Translate all Spanish text in `README.md` to English
- Translate all Spanish text in `openspec/project.md` to English
- Maintain consistent English throughout technical documentation
- Preserve meaning, structure, and technical accuracy during translation
- Keep references to Spanish UI text where conventions are explained

**Non-Goals:**
- Translating user interface text (remains Spanish per conventions)
- Changing any functional documentation content beyond language
- Modifying code, configuration, or implementation files
- Translating archived change documents (keep historical context intact)

## Decisions

**Decision 1: Manual translation over automated tools**
- **Rationale**: Technical documentation requires accurate terminology and context-aware translation. Manual translation ensures technical terms (Socket.io events, configuration keys, etc.) are preserved correctly and section meanings remain precise.
- **Alternative considered**: Automated translation tools - rejected due to risk of technical term mistranslation and reduced quality.

**Decision 2: Preserve original structure and formatting**
- **Rationale**: Only language changes. Keep all section headers, code blocks, formatting, and organization identical to maintain document familiarity.
- **Alternative considered**: Restructuring during translation - rejected as out of scope (language only).

**Decision 3: Document-by-document approach**
- **Rationale**: Translate `README.md` first (user-facing), then `openspec/project.md` (contributor-facing). Each file is self-contained.
- **Alternative considered**: Glossary-first approach - unnecessary for this small scope.

**Decision 4: Keep Spanish references in convention explanations**
- **Rationale**: The language conventions section in `project.md` explains that UI text is Spanish. Those example references to Spanish should remain to illustrate the convention itself.
- **Alternative considered**: Remove all Spanish - rejected as it would lose clarity in explaining the bilingual policy.

## Risks / Trade-offs

**[Risk: Translation accuracy]** → Mitigation: Review translated content for technical accuracy, especially Socket.io event names, configuration keys, and technical terms. Verify all code blocks and command examples remain unchanged.

**[Risk: Loss of context for Spanish-speaking contributors]** → Mitigation: Accept this trade-off. The project convention prioritizes English for technical artifacts to support international collaboration. Spanish documentation served its initial purpose but must align with established standards.

**[Trade-off: One-time effort vs. ongoing maintenance]** → Once translated, all future documentation follows the English-only standard, eliminating language mixing permanently.
