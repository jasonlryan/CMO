# Cursor Rules for CMO Assessment Tool

## 1. Model Selection

✅ MODELS MUST:

- Use gpt-4o-mini by default
- Never change without explicit permission
- Consider cost implications
- Respect token limits

❌ NEVER:

- Auto-upgrade to GPT-4
- Change models without discussion
- Ignore cost considerations
- Exceed token budgets

## 2. Prompt Management

✅ PROMPTS MUST:

- Live in /backend/prompts/ directory
- Be written in .md files
- Contain ONLY prompt content
- Be loaded (not defined) in assessment.js

❌ NEVER:

- Define prompts in code files
- Define prompts in test files
- Duplicate prompts across files

## 3. Template Management

✅ TEMPLATES MUST:

- Live in /backend/templates/
- Define data structures
- Handle data transformations
- Be imported by other files

❌ NEVER:

- Mix templates with prompts
- Define templates in test files
- Duplicate template logic

## 4. Test Files

✅ TESTS MUST:

- Import prompts from assessment.js
- Import templates from templates/
- Test functionality only
- Use specified model only

❌ NEVER:

- Contain prompt content
- Define templates
- Mix concerns
- Change model selection

## 5. Cost Management

✅ ALWAYS:

- Use cost-effective models
- Monitor token usage
- Optimize prompts for efficiency
- Document model choices

❌ NEVER:

- Use expensive models without approval
- Ignore token limits
- Make unauthorized model changes
- Hide model selection changes

## 6. Directory Structure

## 7. Implementation Flow

✅ MUST:

- Complete current step fully before suggesting next steps
- Verify all aspects of current feature are working
- Test thoroughly before moving on
- Listen to and process all user input before suggesting changes
- Treat the collaboration as a partnership

❌ NEVER:

- Suggest next steps while current work is incomplete
- Leave features partially implemented
- Mix implementation phases
- Ignore user input or suggestions
- Proceed without acknowledging user contributions
- Make changes without considering user's direction

## 6. Code Modification Rules

✅ MODIFICATIONS MUST:

- Be exactly what was requested
- Touch only specified functionality
- Preserve all error handling
- Keep business logic intact
- Preserve existing validation code
- Add to existing code rather than replace

❌ NEVER:

- Remove code when asked to remove logs
- Modify error handling without explicit request
- Reformat code without reason
- Change functionality while doing cosmetic updates
- Remove existing validation
- Replace working code with "simpler" solutions
- Lose domain-specific checks and balances

## 7. Logging Rules

✅ LOGS MUST:

- Keep all error logging (console.warn, console.error)
- Keep all critical system warnings
- Remove only debug/info logs when requested
- Preserve logging that aids troubleshooting

❌ NEVER:

- Remove error handling when removing logs
- Remove validation warnings
- Mix log removal with code changes
- Touch business logic when cleaning logs
