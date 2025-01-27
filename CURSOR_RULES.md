# Cursor Rules for CMO Assessment Tool

## 1. Prompt Management

✅ PROMPTS MUST:

- Live in /backend/prompts/ directory
- Be written in .md files
- Contain ONLY prompt content
- Be loaded (not defined) in assessment.js

❌ NEVER:

- Define prompts in code files
- Define prompts in test files
- Duplicate prompts across files

## 2. Template Management

✅ TEMPLATES MUST:

- Live in /backend/templates/
- Define data structures
- Handle data transformations
- Be imported by other files

❌ NEVER:

- Mix templates with prompts
- Define templates in test files
- Duplicate template logic

## 3. Test Files

✅ TESTS MUST:

- Import prompts from assessment.js
- Import templates from templates/
- Test functionality only

❌ NEVER:

- Contain prompt content
- Define templates
- Mix concerns

## 4. Directory Structure
