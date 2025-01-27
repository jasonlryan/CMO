const { assessCMOCandidate } = require('../assessment');
const fs = require('fs');
const path = require('path');

// Read transcript directly
const transcriptPath = path.join(__dirname, '../../../docs/transcript.txt');
const transcript = fs.readFileSync(transcriptPath, 'utf8');

// Company context required by assessCMOCandidate
const companyContext = {
  stage: 'Growth',
  industry: 'Technology',
  organizationType: 'B2B' as const
};

async function testFullAssessment() {
  try {
    console.log('🚀 Starting CMO Assessment Test...\n');
    
    // Pass both required arguments
    const result = await assessCMOCandidate(transcript, companyContext);
    
    // Log results
    console.log('\n📊 Assessment Results:');
    console.log('------------------------');
    console.log('Profile:', {
      name: result.profile.name,
      role: result.profile.current_role,
      experience: result.profile.years_experience
    });
    
    console.log('\nScores:');
    console.log('------------------------');
    console.log(`Overall: ${result.detailed_scores.total * 100}%`);
    console.log('Categories:', {
      hardSkills: `${result.detailed_scores.categories.hardSkills * 100}%`,
      softSkills: `${result.detailed_scores.categories.softSkills * 100}%`
    });

    console.log('\nReports Generated:', {
      candidate: result.reports.candidate.length + ' sections',
      client: result.reports.client.length + ' sections'
    });

    return result;

  } catch (error) {
    console.error('\n❌ Assessment Test Failed:', error);
    throw error;
  }
}

// Run the test
console.log('🧪 Starting Assessment Test Suite\n');
testFullAssessment()
  .then(() => console.log('\n✅ Test completed successfully'))
  .catch(console.error); 