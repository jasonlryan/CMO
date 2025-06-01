# Implementation Guide: Adding Expected Depth to Assessment Results

This document outlines the changes needed to implement the Expected Depth display in the CMO Assessment Tool.

## 1. Backend Changes

### Update Assessment Response Structure

Modify the assessment service to include expected depth in the response:

**File**: `backend/services/assessmentService.js`

```javascript
// Before:
function processSkillResults(skills, maturityStage) {
  return Object.entries(skills).reduce((acc, [category, skillSet]) => {
    acc[category] = Object.entries(skillSet).reduce(
      (skillAcc, [skillName, skillData]) => {
        skillAcc[skillName] = {
          score: skillData.score,
          reportedDepth: skillData.depth || 1,
          evidence: skillData.evidence || [],
        };
        return skillAcc;
      },
      {}
    );
    return acc;
  }, {});
}

// After:
function processSkillResults(skills, maturityStage) {
  const depthConfig = getDepthConfig(maturityStage);

  return Object.entries(skills).reduce((acc, [category, skillSet]) => {
    acc[category] = Object.entries(skillSet).reduce(
      (skillAcc, [skillName, skillData]) => {
        const reportedDepth = skillData.depth || 1;
        const expectedDepth =
          depthConfig?.[category]?.[skillName] ||
          depthConfig?.[category]?.default ||
          depthConfig?.default ||
          2; // Fallback default

        skillAcc[skillName] = {
          score: skillData.score,
          reportedDepth: reportedDepth,
          expectedDepth: expectedDepth,
          gap: Math.max(0, expectedDepth - reportedDepth),
          evidence: skillData.evidence || [],
        };
        return skillAcc;
      },
      {}
    );
    return acc;
  }, {});
}
```

### Update Gap Priority Calculation

Add a function to determine gap priority:

```javascript
function getGapPriority(gap) {
  if (gap === 0) return "none";
  if (gap === 1) return "medium";
  return "high";
}
```

And use it in the skill processing:

```javascript
skillAcc[skillName] = {
  // ... other properties
  gap: Math.max(0, expectedDepth - reportedDepth),
  gapPriority: getGapPriority(Math.max(0, expectedDepth - reportedDepth)),
  // ... other properties
};
```

## 2. Update Response Templates

### Update ChatGPT API Response Template

**File**: `backend/templates/chatgptResponse.js`

```javascript
function formatSkillsResponse(skills, maturityStage) {
  const formattedSkills = [];

  Object.entries(skills).forEach(([category, skillSet]) => {
    Object.entries(skillSet).forEach(([skillName, skillData]) => {
      formattedSkills.push({
        name: skillName,
        category: category,
        score: skillData.score,
        reportedDepth: skillData.reportedDepth,
        expectedDepth: skillData.expectedDepth,
        gap: skillData.gap,
        priority: skillData.gapPriority,
        evidence: skillData.evidence?.[0] || "",
      });
    });
  });

  return formattedSkills;
}
```

### Update Web API Response Template

**File**: `backend/templates/assessmentResponse.js`

```javascript
function formatSkillsForWebResponse(skills) {
  return {
    categories: calculateCategoryScores(skills),
    skills: Object.entries(skills).flatMap(([category, skillSet]) =>
      Object.entries(skillSet).map(([skillName, skillData]) => ({
        name: skillName,
        category: category,
        score: skillData.score,
        reportedDepth: skillData.reportedDepth,
        expectedDepth: skillData.expectedDepth,
        gap: skillData.gap,
        gapPriority: skillData.gapPriority,
        evidence: skillData.evidence,
      }))
    ),
  };
}
```

## 3. Frontend Changes

### Update Skill Table Component

**File**: `frontend/src/components/SkillTable.jsx`

```jsx
function SkillTable({ skills, category }) {
  return (
    <table className="skill-table">
      <thead>
        <tr>
          <th>Skill</th>
          <th>Score (0-1)</th>
          <th>Reported Depth (1-4)</th>
          <th>Expected Depth (1-4)</th>
          <th>Gap</th>
          <th>Key Evidence</th>
        </tr>
      </thead>
      <tbody>
        {skills
          .filter((skill) => skill.category === category)
          .map((skill) => (
            <tr key={skill.name}>
              <td>{formatSkillName(skill.name)}</td>
              <td>{skill.score.toFixed(1)}</td>
              <td>{skill.reportedDepth}</td>
              <td>{skill.expectedDepth}</td>
              <td className={`gap-${skill.gapPriority}`}>{skill.gap}</td>
              <td>{skill.evidence[0]}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
```

### Add CSS for Gap Highlighting

**File**: `frontend/src/styles/SkillTable.css`

```css
.gap-none {
  background-color: #e6ffe6;
  color: #008000;
}

.gap-medium {
  background-color: #fff6e6;
  color: #cc8800;
}

.gap-high {
  background-color: #ffe6e6;
  color: #cc0000;
}
```

## 4. Testing Changes

### Update Test Cases

**File**: `backend/tests/services/assessmentService.test.js`

```javascript
describe("processSkillResults", () => {
  it("should calculate expected depths and gaps correctly", () => {
    // Mock skill data
    const skills = {
      hardSkills: {
        marketing_strategy: {
          score: 0.8,
          depth: 2,
          evidence: ["Evidence 1"],
        },
      },
    };

    // Mock maturity stage
    const maturityStage = "Growth";

    // Mock depth config
    jest.spyOn(depthConfigModule, "getDepthConfig").mockReturnValue({
      hardSkills: {
        marketing_strategy: 3,
      },
    });

    const result = processSkillResults(skills, maturityStage);

    expect(result.hardSkills.marketing_strategy).toEqual({
      score: 0.8,
      reportedDepth: 2,
      expectedDepth: 3,
      gap: 1,
      gapPriority: "medium",
      evidence: ["Evidence 1"],
    });
  });
});
```

## 5. Deployment Steps

1. Update backend services with the new depth-related fields
2. Update response templates
3. Deploy backend changes
4. Update frontend components to display the new fields
5. Deploy frontend changes
6. Verify in both web interface and ChatGPT integration

## 6. Rollback Plan

If issues arise:

1. Revert backend changes to the previous response structure
2. Update frontend to handle both old and new response formats
3. If needed, deploy a temporary fix that transforms the response on the client side

## 7. Documentation Updates

Update the following documentation:

- ✅ Web Interface Guide (WEB_INTERFACE.md)
- ✅ Scoring Specification (SCORING_SPEC.md)
- ✅ ChatGPT Integration (CHATGPT.md)
