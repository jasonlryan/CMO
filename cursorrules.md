# CURSOR RULES FOR CMO ASSESSMENT TOOL

This document defines the mandatory guidelines for the CMO Assessment Tool. All team members must follow these rules when making changes, writing prompts, creating templates, and developing tests.

---

## 1. Model Selection

**MUST:**

- Use **gpt-4o-mini** by default.
- Never change the model without explicit permission.
- Consider cost implications.
- Respect token limits.

**NEVER:**

- Auto-upgrade to GPT-4.
- Change models without discussion.
- Ignore cost considerations.
- Exceed token budgets.

---

## 2. Prompt Management

**MUST:**

- Store all prompt files in the `/backend/prompts/` directory.
- Write prompts in Markdown (`.md`) files.
- Include **only prompt content** in these files.
- Load prompts (do not define them inline) in `assessment.js`.

**NEVER:**

- Define prompts in code files or test files.
- Duplicate prompt content across files.

---

## 3. Template Management

**MUST:**

- Place all templates in the `/backend/templates/` directory.
- Templates must define data structures and handle data transformations.
- Templates should be imported and reused by other modules.

**NEVER:**

- Mix templates with prompt content.
- Define templates in test files.
- Duplicate template logic.

---

## 4. Test Files

**MUST:**

- Import prompts from `assessment.js` and templates from `/backend/templates/`.
- Focus tests solely on functionality (no business logic).
- Use the specified model for testing.

**NEVER:**

- Include prompt content in tests.
- Define templates in test files.
- Mix concerns or change model selection in tests.

---

## 5. Cost Management

**MUST:**

- Use cost-effective models.
- Monitor token usage.
- Optimize prompts for efficiency.
- Document model choices clearly.

**NEVER:**

- Use expensive models without explicit approval.
- Ignore token limits.
- Make unauthorized model changes.
- Conceal model selection changes.

---

## 6. Directory Structure

- **Prompts:** All prompt files must live in `/backend/prompts/`.
- **Templates:** All template files must be stored in `/backend/templates/`.
- **Tests:** Tests should reference the proper locations for prompts and templates.

Maintain this structure to avoid duplication and ensure consistency.

---

## 7. Implementation Flow

**MUST:**

- Complete the current implementation phase before moving on to the next.
- Verify that all aspects of the current feature work as intended.
- Test thoroughly before suggesting further changes.
- Process and incorporate all user input before proceeding.
- Treat collaboration as a partnership.

**NEVER:**

- Suggest next steps while current work remains incomplete.
- Leave features partially implemented.
- Mix different implementation phases.
- Ignore or dismiss user input.
- Proceed without acknowledging user contributions.
- Make changes without considering user direction.

---

## 8. Code Modification Rules

**MUST:**

- Make changes exactly as requested.
- Modify only the specified functionality.
- Preserve all error handling and existing validation.
- Maintain business logic integrity.
- Add to existing code rather than replacing it.

**NEVER:**

- Remove code unless explicitly directed (e.g., removing logs only when asked).
- Modify error handling without explicit instructions.
- Reformat code without a valid reason.
- Change functionality during cosmetic updates.
- Remove existing validation.
- Replace working code with a "simpler" solution that might compromise quality.
- Lose domain-specific checks and balances.

---

## 9. Logging Rules

**MUST:**

- Retain all error logging (e.g., `console.warn`, `console.error`).
- Keep all critical system warnings.
- Remove only debug or informational logs when requested.
- Preserve logs that aid in troubleshooting.

**NEVER:**

- Remove error handling when cleaning up logs.
- Remove validation warnings.
- Mix log removal with code changes.
- Alter business logic when adjusting logs.

---

## 10. Hard Rules for Changes

These are the non-negotiable "Hard Rules" that must always be followed:

1. **If the user says NO to something, that means NO.** There are no exceptions.
2. **Never add mock/test data without explicit user approval.**
3. **Never try to "sneak in" changes that the user has rejected.**
4. **Never make changes the user hasn't explicitly approved.**
5. **Always show EXACT changes being proposed before making them.**
6. **If unsure, ASK the user first—do not assume.**
7. **Be 100% transparent about what changes are being suggested and why.**
8. **Admit mistakes immediately when caught—do not try to hide them.**
9. **Focus ONLY on what the user requested—do not add extras.**

---

## Final Note

All developers must adhere strictly to these rules. Incorporate these guidelines into your code reviews, pull request templates, and CI/CD checks to ensure consistent compliance. Regular audits and feedback sessions should be held to keep the team aligned with these standards.
