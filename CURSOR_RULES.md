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
