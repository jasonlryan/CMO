# Debug & Logging System Documentation

January 30, 2024

## System Architecture

The CMO Assessment Tool implements a centralized logging system in `backend/config/logging.js` with five distinct logging levels:

| Level  | Function | Visibility | Purpose             |
| ------ | -------- | ---------- | ------------------- |
| DEBUG  | debugLog | DEBUG_MODE | Development details |
| INFO   | infoLog  | Always     | Stage progression   |
| WARN   | warnLog  | Always     | Non-critical issues |
| ERROR  | errorLog | Always     | Critical failures   |
| TIMING | timeLog  | Always     | Performance metrics |

## Core Principles

1. **Minimal & Essential**

- INFO: Only major state changes
- WARN: Only validation failures
- ERROR: Only critical failures
- TIME: Only significant operations
- DEBUG: Only when needed for troubleshooting

2. **Service Ownership**
   Each service handles its own domain:

- **assessment.js**

  ```javascript
  infoLog("Starting assessment...");
  timeLog("Assessment complete", duration);
  errorLog("Assessment failed:", error);
  ```

- **openai.js**

  ```javascript
  infoLog("Starting stage: OpenAI");
  warnLog("Invalid capability analysis, using defaults");
  errorLog("Failed to parse OpenAI response:", error);
  ```

- **scoring.js**
  ```javascript
  warnLog("Failed to load benchmarks:", error.message);
  warnLog("Missing capabilities, using defaults");
  warnLog("Invalid stage 'X', using Growth");
  ```

## Configuration

```javascript
// In .env
DEBUG_MODE = true | false;

// In config/logging.js
const DEBUG_MODE = process.env.DEBUG_MODE?.toLowerCase() === "true";
```

## Missing Elements

1. **Error Context**

- Need standardized error context format
- Should include operation type
- Should include recovery action

2. **Performance Metrics**

- No baseline metrics defined
- No performance thresholds
- No timing aggregation

3. **Validation Strategy**

- No clear validation levels
- Missing validation chains
- Inconsistent fallback handling

4. **Debug Controls**

- No granular debug levels
- Missing service-specific debug flags
- No debug sampling rate

## Recommendations

1. Add error context structure:

```javascript
errorLog("Operation failed:", {
  operation: "name",
  error: error.message,
  recovery: "action taken",
});
```

2. Define performance baselines:

```javascript
timeLog("Operation", duration, {
  baseline: 1000,
  threshold: 2000,
});
```

3. Standardize validation:

```javascript
warnLog("Validation failed:", {
  field: "name",
  expected: "type",
  received: "value",
  action: "fallback",
});
```

## Usage Guidelines

### Configuration

The logging system is controlled through environment variables:

```
DEBUG_MODE=true|false  # Controls debug message visibility
```

### Message Formats

#### Debug Messages

```javascript
debugLog("Operation details:", data);
```

- Only shown when DEBUG_MODE=true
- Use for development and troubleshooting
- Include relevant data objects

#### Info Messages

```javascript
infoLog("Stage progress");
```

- Always visible
- Use for stage progression
- Keep messages clear and concise

## Current Issues

### Systemic Issues

1. ✅ Direct console.\* calls replaced
2. ✅ Message formatting standardized
3. ✅ Logging levels unified
4. ✅ Timing logs standardized
5. ✅ Newline usage normalized
6. ✅ DEBUG prefixes removed

## Required Standards

### Message Formats

- Debug: `debugLog("Operation details:", data)`
- Warning: `warnLog("Validation issue:", details)`
- Error: `errorLog("Operation failed:", error)`
- Timing: `timeLog("Operation name", duration)`
- Info: `infoLog("Stage progress")`

## Required Changes

### Immediate Actions

1. Remove all DEBUG prefixes
2. Standardize newline usage
3. Clean up warning formats
4. Normalize timing messages

### Service-Specific Updates

1. OpenAI Service

   - Clean validation warnings
   - Standardize error logs
   - Update timing formats

2. Scoring Service

   - Clean benchmark logs
   - Update calculation logs
   - Standardize warnings

3. Assessment Service
   - Update stage logs
   - Clean timing messages
   - Normalize errors

## Success Criteria

### Technical Requirements

- No direct console.\* usage
- Consistent message formats
- Proper logging levels
- Clean debug toggling

### Operational Requirements

- Clear stage progression
- Accurate timing data
- Proper error visibility
- Controlled debug output

## Implementation Plan

### Phase 1: Cleanup (Week 1)

- Remove all DEBUG prefixes
- Standardize message formats
- Clean up warning messages
- Normalize timing logs

### Phase 2: Validation (Week 1)

- Test DEBUG_MODE toggle
- Verify log levels
- Check format consistency
- Validate timing accuracy

### Phase 3: Documentation (Week 2)

- Update logging standards
- Document message formats
- Create usage examples
- Add troubleshooting guide

## Notes

The logging system provides a solid foundation but requires cleanup for consistency and maintainability. Focus should be on standardizing message formats and removing redundant prefixes while maintaining current functionality.

## Non-Critical Missing Elements

The following elements are documented for future consideration but are not critical for current operations:

### 1. Error Recovery

- Retry logic for failed operations
- Graceful degradation paths
- Recovery state tracking

### 2. Performance Monitoring

- Long-term trend tracking
- Warning thresholds for operations
- Performance reporting system

### 3. Validation Chain

- Hierarchical validation system
- Cross-service validation flows
- Standardized fallback patterns

These elements can be implemented in future iterations if needed, but the current minimal logging approach is sufficient for core functionality.

Maintenance Guidelines:

- Keep DEBUG_MODE as single source of truth
- Maintain consistent message formats
- Use appropriate log levels
- Follow timing message standards

## Logging Levels

### 1. INFO Level

- Purpose: Track stage progression
- When to use: Major state transitions
- Format: `infoLog("Starting stage: Analysis")`
- Examples:
  ```javascript
  infoLog("Starting assessment...");
  infoLog("Profile creation complete");
  ```

### 2. DEBUG Level

- Purpose: Development and troubleshooting
- When to use: Data processing details
- Format: `debugLog("Processing item:", data)`
- Examples:
  ```javascript
  debugLog("Parsing OpenAI response:", length);
  debugLog("Calculating scores:", weights);
  ```

### 3. WARN Level

- Purpose: Non-critical issues
- When to use: Validation failures, fallbacks
- Format: `warnLog("Invalid item, using defaults:", context)`
- Examples:
  ```javascript
  warnLog("Invalid skills structure:", template);
  warnLog("Missing weights, using defaults:", defaults);
  ```

### 4. ERROR Level

- Purpose: Critical failures
- When to use: Operation failures
- Format: `errorLog("Operation failed:", error)`
- Examples:
  ```javascript
  errorLog("OpenAI request failed:", error);
  errorLog("Failed to save profile:", error);
  ```

### 5. TIME Level

- Purpose: Performance tracking
- When to use: Operation timing
- Format: `timeLog("Operation", duration)`
- Examples:
  ```javascript
  timeLog("OpenAI analysis", duration);
  timeLog("Profile creation", duration);
  ```

## Service Responsibilities

### assessment.js

- Stage progression (INFO)
- Overall timing (TIME)
- Assessment failures (ERROR)

### openai.js

- API operations (DEBUG)
- Response validation (WARN)
- Parse failures (ERROR)
- API timing (TIME)

### scoring.js

- Benchmark loading (DEBUG)
- Weight validation (WARN)
- Calculation details (DEBUG)
- Score timing (TIME)

## Best Practices

1. Single Responsibility

   - Each service logs only its operations
   - No duplicate logging across services
   - Clear ownership of logging tasks

2. Consistent Formatting

   - Use defined message templates
   - Include relevant context
   - Follow level-specific formats

3. Performance Impact
   - Minimize object logging in production
   - Use DEBUG_MODE appropriately
   - Keep timing precise but lean

---

Last Updated: January 30, 2024
