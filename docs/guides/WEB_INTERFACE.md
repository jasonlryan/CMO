# CMO Assessment Tool - Web Interface User Guide

This guide provides comprehensive instructions for using the CMO Assessment Tool web interface to analyze and assess CMO candidate interview transcripts.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Creating a New Assessment](#creating-a-new-assessment)
4. [Viewing Assessment Results](#viewing-assessment-results)
5. [Understanding the Scoring System](#understanding-the-scoring-system)
6. [Depth Level Analysis](#depth-level-analysis)
7. [Exporting and Sharing Results](#exporting-and-sharing-results)
8. [User Settings](#user-settings)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### Account Registration and Login

1. Navigate to the CMO Assessment Tool at [https://cmo-assessment-tool.com](https://cmo-assessment-tool.com)
2. Click "Sign Up" to create a new account
3. Fill in your details:
   - Email address
   - Password (must be at least 8 characters with mixed case and a number)
   - Name
   - Company
4. Verify your email address by clicking the link sent to your inbox
5. Return to the login page and enter your credentials

### First-Time Setup

Upon first login, you'll be guided through a brief onboarding process:

1. Select your company's maturity stage (Early-Stage, Growth, Scale-Up, or Enterprise)
2. Choose your preferred report format
3. Review key features through the guided tour

## Dashboard Overview

The dashboard is your central hub for all assessment activities.

![Dashboard Overview](../assets/dashboard-overview.png)

Key components:

1. **Navigation Menu**: Access all major sections of the application
2. **Assessment Summary**: Quick overview of your recent and in-progress assessments
3. **Quick Actions**: Buttons for common tasks like creating a new assessment
4. **Statistics Panel**: Performance metrics and assessment statistics
5. **Recent Activity**: Timeline of your recent actions within the system

## Creating a New Assessment

### Step 1: Initiate New Assessment

From the dashboard, click the "New Assessment" button or navigate to Assessments > New Assessment.

### Step 2: Enter Candidate Information

Fill in the candidate details form:

- Candidate Name
- Position (defaults to "Chief Marketing Officer")
- Company Maturity Stage (pre-filled based on your settings, but can be changed)
- Assessment Date (defaults to current date)
- Optional: Tags for categorizing the assessment

### Step 3: Submit Transcript

You have three options for submitting the interview transcript:

1. **Direct Text Entry**: Paste the transcript directly into the text area
2. **File Upload**: Upload a text, Word, or PDF file containing the transcript
3. **Audio Transcription**: Upload an audio recording for automatic transcription (Premium feature)

For best results:

- Ensure the transcript includes both interviewer questions and candidate responses
- Mark speakers clearly (e.g., "Interviewer:" and "Candidate:")
- Include the complete interview for comprehensive assessment

### Step 4: Initiate Analysis

Click "Begin Assessment" to start the analysis process. The system will:

1. Process the transcript using AI analysis
2. Extract and score skills across categories
3. Determine depth levels for each skill
4. Calculate maturity fit scores
5. Generate recommendations

This process typically takes 2-5 minutes, depending on transcript length. You can:

- Wait on the processing page for results
- Enable notifications to be alerted when complete
- Navigate away and return later (the assessment will continue processing)

## Viewing Assessment Results

### Assessment Overview

The results page displays a comprehensive view of the candidate assessment:

![Assessment Results](../assets/assessment-results.png)

Key components:

1. **Summary Panel**: Candidate details, overall score, and maturity fit
2. **Skill Category Scores**: Radar chart showing scores across four main categories
3. **Depth Analysis**: Visual representation of depth levels across key skills
4. **Key Findings**: AI-generated summary of the candidate's strongest and weakest areas
5. **Recommendations**: Suggested focus areas and considerations

### Detailed Analysis

Click "View Detailed Analysis" to access more comprehensive information:

1. **Skill Breakdown**: Individual scores for all skills with supporting evidence, including:

   - Skill name
   - Score (0-1 scale)
   - Reported Depth (1-4)
   - Expected Depth (1-4) based on company maturity stage
   - Gap (difference between expected and reported depth)
   - Key evidence from the transcript

   Example:

   | Skill              | Score (0-1) | Reported Depth (1-4) | Expected Depth (1-4) | Gap | Key Evidence                                                                     |
   | ------------------ | ----------- | -------------------- | -------------------- | --- | -------------------------------------------------------------------------------- |
   | Marketing Strategy | 0.8         | 2                    | 3                    | 1   | Discussed aligning marketing roles with business type and investor expectations. |
   | Digital Marketing  | 0.7         | 2                    | 3                    | 1   | Highlighted the importance of social media and influencer relationships.         |
   | Brand Development  | 0.9         | 2                    | 2                    | 0   | Stressed that brand building is crucial in B2C marketing.                        |

2. **Depth Level Details**: Complete analysis of depth levels with skill-by-skill comparison
3. **Maturity Gap Analysis**: Detailed comparison of candidate skills against the expected profile for your company's stage
4. **Evidence Panel**: Referenced statements from the transcript supporting each score

## Understanding the Scoring System

### Skill Categories

The CMO Assessment Tool evaluates candidates across four main categories:

1. **Hard Skills**: Technical marketing competencies

   - Digital Marketing
   - Data Analytics
   - Marketing Automation
   - etc.

2. **Soft Skills**: Interpersonal and communication abilities

   - Communication
   - Collaboration
   - Adaptability
   - etc.

3. **Leadership Skills**: Management and team development capabilities

   - Strategic Vision
   - Team Development
   - Change Management
   - etc.

4. **Commercial Acumen**: Business and financial understanding
   - ROI Orientation
   - Budget Management
   - Market Understanding
   - etc.

### Score Interpretation

Scores range from 0 to 1, with higher values indicating stronger capabilities:

- **0.0-0.2**: Minimal evidence of skill
- **0.3-0.4**: Basic understanding
- **0.5-0.6**: Moderate proficiency
- **0.7-0.8**: Strong proficiency
- **0.9-1.0**: Expert level mastery

The overall score is a weighted average of all skill scores, with weights adjusted based on your company's maturity stage.

## Depth Level Analysis

### Understanding Depth Levels

Depth levels measure how deeply a candidate understands and can execute various marketing skills:

- **Level 1 (Strategic)**: High-level strategic understanding
- **Level 2 (Operational)**: Ability to develop operational plans
- **Level 3 (Tactical)**: Hands-on execution capabilities
- **Level 4 (Technical)**: Detailed technical knowledge

### Depth Requirements by Maturity Stage

Different company stages require different depth profiles:

- **Early-Stage**: Requires deeper tactical/technical knowledge (Levels 3-4)
- **Growth**: Balanced across all levels with operational focus
- **Scale-Up**: Stronger in strategic/operational (Levels 1-2)
- **Enterprise**: Primarily strategic with management oversight (Level 1)

### Gap Analysis

The gap analysis highlights mismatches between the candidate's depth profile and your company's requirements:

- **Red**: Critical gaps (difference of 2+ levels)
- **Yellow**: Moderate gaps (difference of 1 level)
- **Green**: Good alignment (no difference)

The system calculates the gap by subtracting the candidate's Reported Depth from the Expected Depth for your company's maturity stage. Gaps are prominently displayed in the Skills Breakdown table and highlighted using a color-coded system for quick identification of areas needing attention.

## Exporting and Sharing Results

### Export Options

Assessment results can be exported in several formats:

1. **PDF Report**: Comprehensive assessment document with all details
2. **Executive Summary**: Condensed one-page overview for quick review
3. **CSV Data**: Raw assessment data for further analysis
4. **Presentation**: PowerPoint slides highlighting key findings

To export, click the "Export" button in the top-right corner of the assessment results page.

### Sharing Results

Share assessment results directly with team members:

1. Click "Share" on the assessment results page
2. Enter email addresses of recipients
3. Select sharing permissions:
   - View Only
   - View and Comment
   - Full Access
4. Add an optional message
5. Click "Send"

Recipients will receive an email with a secure link to access the assessment results.

## User Settings

### Account Management

Access account settings by clicking your profile icon in the top-right corner:

- **Profile Information**: Update name, email, and company details
- **Password and Security**: Change password and enable two-factor authentication
- **Notification Preferences**: Configure email and in-app notifications
- **API Access**: Generate and manage API keys (Business plan only)

### Company Settings

Customize settings specific to your company:

- **Maturity Stage**: Update your company's current stage
- **Custom Skill Weights**: Adjust importance of different skills
- **Benchmark Profiles**: Create custom benchmarking profiles
- **Report Templates**: Customize assessment report formats
- **Team Management**: Invite and manage team members (Team plan only)

## Troubleshooting

### Common Issues

#### Assessment Processing Stuck

If an assessment remains in "Processing" status for more than 10 minutes:

1. Refresh the page
2. Check the "Assessment Status" page for error messages
3. Verify the transcript length (extremely long transcripts may take longer)
4. Try resubmitting the assessment

#### Poor Analysis Results

If assessment results seem inaccurate:

1. Verify transcript quality and format
2. Ensure the transcript contains sufficient detail on marketing topics
3. Check that the correct company maturity stage was selected
4. Use the "Feedback" button on the results page to report issues

#### Export Failures

If exports fail to generate:

1. Check your internet connection
2. Try a different export format
3. Reduce the export scope (e.g., select specific sections only)
4. Clear browser cache and try again

### Getting Help

For additional assistance:

1. Click the "Help" icon in the bottom-right corner to access the knowledge base
2. Use the in-app chat support (Business and Enterprise plans)
3. Email support@cmo-assessment-tool.com
4. Schedule a support call via the Help Center
