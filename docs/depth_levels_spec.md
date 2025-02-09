Below is a full specification for integrating depth levels into your CMO Assessment Tool. This spec outlines the business rationale, required configuration, algorithm adjustments, reporting, testing, and integration points.

────────────────────────────── 1. Overview and Rationale

The purpose of integrating depth levels is to provide a qualitative measure of each skill’s mastery. Rather than simply using a raw performance score, the tool will:

Compare a candidate’s demonstrated depth (derived from transcript analysis) against an explicitly defined expected depth.
Adjust the candidate’s raw skill score if they fall short of the expected depth, while not penalizing (or even potentially rewarding) them when they meet or exceed the expectation.
Allow the expected depth to vary by company maturity (Early-Stage, Growth, Scale-Up, Enterprise), reflecting that early-stage companies may require more hands-on execution (deeper technical levels) while mature organizations may expect more strategic oversight.
────────────────────────────── 2. Definitions

Depth Levels (1 to 4):

Level 1 – Strategic Understanding:
High-level insight, setting goals, aligning with investor or board-level strategy.
Level 2 – Managerial/Operational Oversight:
Ability to evaluate tactics, manage and guide execution without being deeply hands-on.
Level 3 – Conversational Proficiency:
Fluency in the technical details; able to discuss and identify issues intelligently.
Level 4 – Executional Expertise:
Hands-on proficiency; the candidate is deeply involved in executing technical tasks.
Expected Depth Mapping:
For each skill (or sub-skill), define an expected depth level based on the company’s maturity. For example, for “Digital Strategy”:

Early-Stage: Expected Level 4 (Executional)
Growth: Expected Level 3 (Conversational)
Scale-Up: Expected Level 2 (Managerial)
Enterprise: Expected Level 1 (Strategic)
Cluster Weighting by Maturity:
Weighting percentages differ by maturity stage. For example, Hard Skills may have 35% weight in Early-Stage and 20% in Enterprise.

────────────────────────────── 3. Configuration and Mapping

Create a configuration table (or object) that includes:

Skill Mapping Table:
A table that explicitly maps each key skill (or cluster/sub-skill) to an expected depth level for each maturity stage.

Example Table:

Skill / Cluster Maturity Stage Weighting (%) Expected Depth Level
Hard Skills – Digital Strategy Early-Stage 35% Level 4 (Executional)
Growth 30% Level 3 (Conversational)
Scale-Up 25% Level 2 (Managerial)
Enterprise 20% Level 1 (Strategic)
Soft Skills – Conflict Resolution Early-Stage 25% Level 4 (Executional)
Growth 20% Level 3 (Conversational)
Scale-Up 20% Level 2 (Managerial)
Enterprise 15% Level 2 (Managerial)
Leadership Skills – Team Leadership Early-Stage 20% Level 3 (Conversational)
Growth 25% Level 2 (Managerial)
Scale-Up 30% Level 2 (Managerial)
Enterprise 35% Level 1 (Strategic)
Commercial Acumen – Investor Storytelling Early-Stage 20% Level 4 (Executional)
Growth 25% Level 3 (Conversational)
Scale-Up 25% Level 2 (Managerial)
Enterprise 30% Level 1 (Strategic)
DEPTH_LEVELS Constant:
Define in your scoring module an object that sets the “penalty factor” for falling short. (This may simply be used in the algorithm to compute a multiplier based on the gap.)

────────────────────────────── 4. Scoring Algorithm

The algorithm has two main phases: per-skill adjustment and cluster aggregation.

Per-Skill Adjustment:

For each skill, obtain:
The raw performance score (e.g., on a 0–1 scale).
The candidate’s demonstrated depth level (an integer 1–4 from transcript analysis).
Look up the expected depth level for that skill from the mapping table based on the company’s maturity.
Comparison and Multiplier Calculation:
If the candidate’s depth is below the expected level:
Compute the gap as:
gap = expectedDepth - candidateDepth

Compute the multiplier as:
multiplier = 1 - (gap / maximumGap)
where the maximumGap is 3 (since depth levels range from 1 to 4).

If the candidate’s depth is equal to or greater than the expected level:
Set multiplier = 1 (or optionally, if you wish to reward over-qualification, a multiplier slightly greater than 1).

Compute the adjusted skill score as:
adjustedSkillScore = rawScore \* multiplier
Cluster Aggregation:

Group the adjusted scores by their skill clusters.
Aggregate (for example, take the average) the adjusted scores for each cluster.
Multiply the aggregated cluster score by its predefined weighting for the current maturity stage.
Sum the weighted cluster scores to obtain the overall candidate score.
────────────────────────────── 5. Reporting Requirements

Your system should output both a summary and detailed breakdown:

Per-Skill Reporting:
For each skill, include:

Raw Score
Candidate’s Actual Depth
Expected Depth (from the mapping)
Calculated Depth Gap (if any)
Multiplier applied
Adjusted Skill Score
Cluster and Overall Reporting:
Include the aggregated cluster scores (with weightings) and the final overall score.

Example Report Format (e.g., JSON or Table):

json
Copy
{
"overallScore": 3.7,
"skillBreakdown": [
{
"skill": "Digital Strategy",
"rawScore": 0.8,
"actualDepth": 3,
"expectedDepth": 4,
"depthGap": 1,
"multiplier": 0.67,
"adjustedScore": 0.536
},
{
"skill": "Conflict Resolution",
"rawScore": 0.7,
"actualDepth": 2,
"expectedDepth": 2,
"depthGap": 0,
"multiplier": 1.00,
"adjustedScore": 0.7
}
// Additional skills...
],
"clusterBreakdown": {
"Hard Skills": { "score": 0.65, "weight": 35 },
"Soft Skills": { "score": 0.7, "weight": 25 }
// Additional clusters...
}
}
────────────────────────────── 6. Integration Points

Scoring Module:
Update your backend/services/scoring.js to include the depth level calculation within the overall scoring functions.

Configuration/Mapping File:
Consider creating a configuration file (or section within your scoring module) that contains the mapping table and the DEPTH_LEVELS constant.

Transcript Analysis:
Ensure that your OpenAI analysis or any other transcript processing returns a depth level for each skill.

Reporting Module:
Update your report generation templates (in backend/templates/reports.js) to incorporate and display the detailed breakdown of expected versus actual depth levels.

────────────────────────────── 7. Testing and Calibration

Unit Tests:
Create unit tests for the per-skill adjustment function to verify that:

A candidate’s depth below the expected level correctly reduces the score.
A candidate’s depth equal to or above the expected level results in a multiplier of 1 (or a bonus if desired).
Integration Tests:
Validate the entire assessment flow—from transcript analysis to final report—to ensure that the depth level adjustments are correctly applied across clusters and maturity stages.

Calibration:
Use sample data or pilot assessments to adjust the maximum gap or the penalty formula if needed, ensuring that the final scores accurately reflect candidate suitability for the given maturity stage.

────────────────────────────── 8. Summary

Explicit Mapping:
Define and document the expected depth levels for each skill across maturity stages.

Scoring Algorithm:
Implement a scoring algorithm that:

Adjusts raw scores based on the gap between candidate’s depth and expected depth.
Aggregates and weights these adjusted scores by skill cluster.
Outputs both detailed per-skill and overall reports.
Reporting:
Clearly report expected versus actual depth levels to aid decision makers.

Testing and Calibration:
Ensure through testing that the integration works as intended and refine the penalty formula as needed.

This full specification should serve as a roadmap for integrating depth levels into your candidate scoring system, ensuring that both quantitative performance and qualitative depth requirements are accurately captured and reported.
