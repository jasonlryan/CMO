# CURSOR RULES FOR CMO ASSESSMENT TOOL

This document defines the mandatory guidelines for the CMO Assessment Tool. All team members must follow these rules when making changes, writing prompts, creating templates, and developing tests.

---

## POINT 1: NEVER COMMIT SECRETS OR API KEYS TO GIT

- API keys, passwords, tokens, and other secrets must NEVER be committed to Git repositories
- Always use environment variables or secure secret management systems for sensitive information
- Store secrets in `.env` files that are listed in `.gitignore`
- If a secret is accidentally committed, consider it compromised and rotate it immediately
- Never include secrets in scripts or configuration files that will be committed

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

- Follow strict logging level guidelines:

  - INFO: Only stage transitions and major events
  - DEBUG: Processing details and data state
  - WARN: Validation issues and fallbacks
  - ERROR: Operation failures and exceptions
  - TIME: Performance measurements

- Use standardized formats:

  ```javascript
  infoLog("Starting stage: <stage_name>");
  debugLog("Processing <item>:", data);
  warnLog("Invalid <item>, using defaults:", context);
  errorLog("Failed to <operation>:", error);
  timeLog("<operation>", duration);
  ```

- Follow ownership rules:
  - Each operation logged only in its service
  - Parent services only log their own operations
  - Child services handle their own logging

**NEVER:**

- Remove error handling when cleaning up logs.
- Remove validation warnings.
- Mix log removal with code changes.
- Alter business logic when adjusting logs.

---

## 10. Documentation Management

**When Creating New .md Files:**

**MUST:**

- Only write to files specifically requested by user
- Complete file creation in a single response
- Use correct syntax: ```markdown:path/to/file
- Keep content focused and organized

**NEVER:**

- Create example or hypothetical files
- Mix chat responses with file creation
- Create files in wrong directories
- Add unrequested documentation

## 11. Hard Rules for Changes

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

## Investigation Before Implementation

1. **Code Search First**

   - ALWAYS search existing codebase before writing new code
   - Follow import chains to find existing functionality
   - Check related files for similar patterns

2. **Document Investigation**

   - List files checked
   - Note existing functionality found
   - Identify gaps (if any) in current code

3. **Propose Changes Only After**

   - Confirming functionality doesn't exist
   - Understanding existing patterns
   - Identifying the minimal change needed

4. **Safe Investigation Pattern**
   ```
   1. Identify the issue (e.g., missing function)
   2. List relevant files to check
   3. Follow import chains
   4. Document what was found
   5. ONLY THEN propose changes if needed
   ```

## Hard Rules for Changes

1. **Code Duplication**

   - STOP and check for existing code first
   - Document where you checked
   - Prove functionality doesn't exist
   - Follow DRY (Don't Repeat Yourself) principle

2. **File Organization**

---

## Final Note

All developers must adhere strictly to these rules. Incorporate these guidelines into your code reviews, pull request templates, and CI/CD checks to ensure consistent compliance. Regular audits and feedback sessions should be held to keep the team aligned with these standards.
