# CMO Assessment Tool Glossary

This document serves as the definitive reference for terminology used throughout the CMO Assessment Tool documentation. All other documentation should conform to the terms defined here to ensure consistency.

## Core Concepts

### Assessment Process

| Term               | Definition                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **CMO Assessment** | The overall process of analyzing a Chief Marketing Officer candidate's skills, experiences, and leadership capabilities. |
| **Transcript**     | The text record of an interview with a CMO candidate that serves as the primary input for assessment.                    |
| **Profile**        | The collection of information about a candidate, including personal details, experience, and assessment results.         |
| **Report**         | The output document generated from an assessment, containing scores, analysis, and recommendations.                      |
| **Maturity Stage** | The company growth phase (Early-Stage, Growth, Scale-Up, or Enterprise) that determines expected skill requirements.     |

### Scoring System

| Term               | Definition                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Raw Score**      | The initial score (0-1 scale) assigned to a skill based on the transcript analysis before any adjustments. |
| **Adjusted Score** | A score that has been modified based on depth gap analysis or other adjustment factors.                    |
| **Maturity Score** | The overall assessment score that factors in skill scores and stage-specific weights.                      |
| **Category Score** | The aggregate score for a group of related skills (e.g., hardSkills, softSkills).                          |
| **Benchmark**      | The target or expected score level for a particular skill or category at a specific maturity stage.        |

### Depth Levels

| Term                        | Definition                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| **Depth Level**             | A measure (1-4) of how deeply a candidate understands and can execute a particular skill. |
| **Level 1: Strategic**      | High-level insight, setting goals, aligning with investor/board strategy.                 |
| **Level 2: Managerial**     | Ability to evaluate tactics, manage execution without being hands-on.                     |
| **Level 3: Conversational** | Fluency in technical details; able to discuss and identify issues.                        |
| **Level 4: Executional**    | Hands-on proficiency; deeply involved in executing technical tasks.                       |
| **Expected Depth**          | The target depth level for a skill at a specific maturity stage.                          |
| **Reported Depth**          | The depth level demonstrated by a candidate in their transcript.                          |
| **Depth Gap**               | The difference between expected and reported depth levels.                                |

### Technical Components

| Term                    | Definition                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| **OpenAI Analysis**     | The process of using OpenAI models to analyze transcripts and extract skill information. |
| **ChatGPT Integration** | The system allowing assessment through the ChatGPT interface.                            |
| **Assessment Service**  | The backend service that processes transcripts and generates assessment results.         |
| **Scoring Service**     | The component that calculates scores based on the analysis data.                         |
| **API Endpoint**        | A specific URL where the application receives requests and sends responses.              |

## Skill Categories

### Hard Skills

Technical marketing skills that are measurable and teachable.

| Term                     | Definition                                                        |
| ------------------------ | ----------------------------------------------------------------- |
| **Marketing Strategy**   | Ability to develop and execute comprehensive marketing plans.     |
| **Digital Marketing**    | Expertise in online channels, platforms, and technologies.        |
| **Data Analytics**       | Capability to analyze and derive insights from marketing data.    |
| **Brand Development**    | Skills in creating and evolving brand identities and positioning. |
| **Marketing Operations** | Proficiency in managing marketing processes and workflows.        |
| **Budget Management**    | Ability to plan, allocate, and control marketing resources.       |

### Soft Skills

Interpersonal abilities that affect how individuals work and interact with others.

| Term                       | Definition                                                               |
| -------------------------- | ------------------------------------------------------------------------ |
| **Communication**          | Ability to convey information clearly and effectively.                   |
| **Strategic Thinking**     | Capability to plan and make decisions with long-term objectives in mind. |
| **Stakeholder Management** | Skill in managing relationships with various interested parties.         |
| **Team Development**       | Ability to build and nurture effective teams.                            |

### Leadership Skills

Abilities related to guiding organizations and teams.

| Term                      | Definition                                                  |
| ------------------------- | ----------------------------------------------------------- |
| **Vision Setting**        | Ability to establish a compelling future direction.         |
| **Change Management**     | Skill in guiding organizations through transitions.         |
| **Strategic Influence**   | Capability to impact decisions at the organizational level. |
| **Organizational Design** | Expertise in structuring teams and functions effectively.   |

### Commercial Acumen

Business and financial capabilities relevant to marketing.

| Term                     | Definition                                                |
| ------------------------ | --------------------------------------------------------- |
| **Financial Modeling**   | Ability to create and interpret financial projections.    |
| **Market Sizing**        | Skill in determining addressable market opportunities.    |
| **Revenue Optimization** | Capability to maximize revenue from marketing activities. |
| **Resource Allocation**  | Expertise in distributing resources efficiently.          |

## File and Configuration Types

| Term                          | Definition                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| **Prompt**                    | A structured instruction set for AI models, stored in `/backend/prompts/`.           |
| **Template**                  | A data structure definition for formatting outputs, stored in `/backend/templates/`. |
| **Benchmark Configuration**   | The JSON file defining target weights for skills by maturity stage.                  |
| **Depth Level Configuration** | The JSON file defining expected depth levels for skills by maturity stage.           |
| **OpenAPI Schema**            | The specification defining the API endpoints and their expected requests/responses.  |

## Integration Components

| Term                    | Definition                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **Custom GPT**          | The ChatGPT extension built on the OpenAI platform that interfaces with the assessment tool. |
| **Response Caching**    | The mechanism for storing and retrieving previous assessment results to improve performance. |
| **Compression**         | The process of reducing the size of API responses for faster transmission.                   |
| **Assessment Endpoint** | The specific API endpoint (/api/chatgpt/assessment) that processes transcripts from ChatGPT. |
