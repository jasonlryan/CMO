# Plan for Updating the Codebase with the Depth Level Algorithm

Below is a step-by-step plan to integrate the depth level algorithm into the existing CMO Assessment Tool codebase. This plan outlines the necessary updates to the scoring logic, configuration, reporting, and testing, ensuring that each candidate’s raw skill score is adjusted based on the gap between their demonstrated depth and the expected depth for the role’s maturity stage.

---

## 1. Review of Current Codebase

- **Backend Services:**

  - **scoring.js:** Contains functions like `calculateSkillGaps`, `calculateMaturityScore`, `evaluateCapabilities`, and `evaluateSkillsByStage`. This module is responsible for aggregating and weighting scores.
  - **assessment.js & openai.js:** Handle candidate analysis by calling OpenAI and parsing the transcript response. These modules currently expect a `skills` object but do not yet incorporate a depth level.
  - **Templates and Types:** The profile template (`cmoProfile.js`) and TypeScript interfaces (`types.ts`) define the overall structure for skills and capabilities but do not include explicit fields for depth levels.

- **Reporting and Tests:**
  - **reports.js:** Generates candidate and client reports based on the processed profile and scores.
  - **Tests:** Integration tests exist (in `backend/tests/test.js`) to validate the overall assessment flow.

---

## 2. Define the Expected Depth Mapping

- **Create a Mapping Table:**  
  Develop a configuration (or object) that maps each key skill or cluster to its expected depth level for each maturity stage. For example, update the mapping to include entries such as:
  - **Digital Strategy (Hard Skills):**
    - Early-Stage: Expected Level 4 (Executional)
    - Growth: Expected Level 3 (Conversational)
    - Scale-Up: Expected Level 2 (Managerial)
    - Enterprise: Expected Level 1 (Strategic)
- **Location:**  
  This mapping can be defined in a new configuration file (e.g., `backend/config/depthMapping.json`) or directly within the scoring module as a constant.

---

## 3. Update the Scoring Algorithm (scoring.js)

- **Per-Skill Adjustment Function:**
  - **New Function:** Create a function (e.g., `adjustScoreForDepth`) that takes three parameters: the candidate’s raw score, the candidate’s depth level (from transcript analysis), and the expected depth level (from the mapping).
  - **Logic:**
    - If candidate’s depth < expected depth:
      - Calculate the gap: `gap = expectedDepth - candidateDepth`
      - Compute the penalty multiplier: `multiplier = 1 - (gap / 3)` (with maximum gap of 3, since levels are 1–4)
    - Else (if candidate’s depth is equal to or greater than expected):
      - Set `multiplier = 1` (or optionally award a bonus multiplier).
    - Return the adjusted score: `adjustedScore = rawScore * multiplier`.
- **Integration into Existing Functions:**
  - Modify the loop in `evaluateSkillsByStage` (or similar functions) to call `adjustScoreForDepth` for each skill.
  - Store the adjusted score in the candidate’s profile data (e.g., as `adjustedScore` for each skill).

---

## 4. Update Transcript Analysis and Data Structures

- **Transcript Analysis (openai.js):**

  - Ensure that the OpenAI prompt (in `transcriptAnalysis.md`) is updated (if necessary) to include candidate depth for each skill.
  - Update the JSON parsing in `openai.js` to extract a `depth` field for each skill and include it in the resulting object.

- **Data Structures:**
  - Update the TypeScript interfaces in `types.ts` and the profile template in `cmoProfile.js` to include a `depthLevel` property for each skill.
  - Example addition:
    ```javascript
    skills: {
      hardSkills: {
        digital_strategy: { score: 0, depthLevel: 0 },
        // ... other skills
      },
      // ... other clusters
    }
    ```

---

## 5. Update Report Generation (reports.js)

- **Detailed Breakdown:**
  - Modify the report generation in `reports.js` to include:
    - Raw Score
    - Actual (Candidate) Depth
    - Expected Depth (from the mapping)
    - Calculated Depth Gap
    - Multiplier applied
    - Adjusted Score
  - This detailed information can be displayed in a table or as a JSON object for transparency.

---

## 6. Update Testing and Documentation

- **Unit Tests:**
  - Write tests for the new `adjustScoreForDepth` function, verifying that:
    - When the candidate’s depth is below the expected level, the adjusted score is reduced.
    - When the candidate’s depth meets or exceeds the expected level, the multiplier is 1 (or shows a bonus if implemented).
- **Integration Tests:**
  - Update integration tests in `backend/tests/test.js` to cover the full assessment flow including depth level adjustments.
- **Documentation:**
  - Update relevant documentation files (e.g., `COMPLETION_PLAN.md`, `GAP_ANALYSIS.md`, and any developer guides) to explain:
    - The purpose and logic of the depth level algorithm.
    - The mapping table and how it changes by maturity stage.
    - How the depth adjustment is integrated into the overall scoring process.

---

## 7. Summary of the Plan

1. **Define the Mapping:**  
   Create and document a mapping table for expected depth levels per skill/cluster and maturity stage.

2. **Implement Scoring Adjustments:**

   - Develop a function to adjust raw scores based on the gap between actual and expected depth.
   - Integrate this function into the overall scoring algorithm in `scoring.js`.

3. **Update Data Structures and Analysis:**

   - Ensure the transcript analysis (OpenAI integration) outputs a depth level for each skill.
   - Update templates and type definitions to include depth level information.

4. **Enhance Reporting:**  
   Modify report generation to include a detailed breakdown of raw scores, expected vs. actual depth, and adjusted scores.

5. **Test and Document:**
   - Write unit and integration tests for the new functionality.
   - Update documentation to reflect the new depth level algorithm and its integration.

By following these steps, you will integrate the depth level algorithm into your existing codebase, ensuring that the assessment tool accurately adjusts candidate scores based on both quantitative performance and qualitative depth requirements.
