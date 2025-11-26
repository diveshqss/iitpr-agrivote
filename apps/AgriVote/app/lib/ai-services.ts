import { Domain, DuplicateMatch } from '../types';
import { questions } from './data';

// AI Domain Classification
export function classifyDomain(question: string): Domain {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.match(/pest|insect|bug|worm|locust|aphid/)) return 'pest';
  if (lowerQuestion.match(/disease|fungus|rot|blight|wilt|yellow|brown spot/)) return 'disease';
  if (lowerQuestion.match(/water|irrigat|drip|sprinkler|flood|drain/)) return 'irrigation';
  if (lowerQuestion.match(/fertilizer|nutrient|npk|urea|compost|manure/)) return 'fertilizer';
  if (lowerQuestion.match(/soil|clay|sandy|ph|testing|erosion/)) return 'soil';
  if (lowerQuestion.match(/tractor|machine|equipment|tool|pump|harvester/)) return 'machinery';
  if (lowerQuestion.match(/subsidy|scheme|loan|government|assistance|support/)) return 'subsidy';
  
  return 'crop'; // Default
}

// AI Question Cleanup
export function cleanupQuestion(originalQuestion: string): {
  cleaned: string;
  suggestions: string[];
} {
  let cleaned = originalQuestion.trim();
  
  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  
  // Add question mark if missing
  if (!cleaned.match(/[.?!]$/)) {
    cleaned += '?';
  }
  
  // Basic grammar improvements
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  const suggestions: string[] = [];
  
  // Analyze for missing information
  if (!cleaned.match(/location|region|state|district|village/i)) {
    suggestions.push('Consider adding: Your location or region for more specific advice');
  }
  
  if (cleaned.match(/crop|plant/i) && !cleaned.match(/age|month|day|week|year/i)) {
    suggestions.push('Consider adding: Age of the crop (e.g., 30 days old, 2 months after sowing)');
  }
  
  if (cleaned.match(/yellow|wilt|spot|problem/i) && !cleaned.match(/when|how long|start/i)) {
    suggestions.push('Consider adding: When did this problem start?');
  }
  
  if (!cleaned.match(/urgent|emergency|immediate/i) && cleaned.length < 50) {
    suggestions.push('Consider adding: More details about the symptoms or situation');
  }
  
  return { cleaned, suggestions };
}

// AI Semantic Duplicate Detection
export function detectDuplicates(question: string, domain: Domain): DuplicateMatch[] {
  const approvedQuestions = questions.filter(q => q.status === 'approved');
  const matches: DuplicateMatch[] = [];
  
  const questionWords = question.toLowerCase().split(/\s+/);
  
  for (const q of approvedQuestions) {
    if (q.domain !== domain) continue;
    
    const existingWords = q.cleanedQuestion.toLowerCase().split(/\s+/);
    
    // Simple word overlap similarity
    const commonWords = questionWords.filter(w => existingWords.includes(w) && w.length > 3);
    const similarity = (commonWords.length / Math.max(questionWords.length, existingWords.length)) * 100;
    
    if (similarity > 40) {
      const approvedAnswer = q.answers.find(a => a.id === q.moderatorReview?.selectedAnswerId);
      
      matches.push({
        questionId: q.id,
        question: q.cleanedQuestion,
        answer: approvedAnswer?.content || 'Answer not available',
        similarity: Math.round(similarity),
        domain: q.domain,
        answeredAt: q.moderatorReview?.reviewedAt || q.submittedAt
      });
    }
  }
  
  return matches.sort((a, b) => b.similarity - a.similarity);
}

// AI Expert Allocation
export function allocateExperts(domain: Domain, expertPool: any[]): string[] {
  // Filter experts by domain specialization
  const specializedExperts = expertPool
    .filter(e => e.specialization.includes(domain))
    .map(e => ({
      ...e,
      score: calculateExpertScore(e)
    }))
    .sort((a, b) => b.score - a.score);
  
  // Allocate top 3 experts
  return specializedExperts.slice(0, 3).map(e => e.id);
}

function calculateExpertScore(expert: any): number {
  return (
    expert.accuracyScore * 0.3 +
    expert.moderatorAcceptanceRate * 0.25 +
    (expert.peerVotesReceived / 2) * 0.2 +
    expert.consistencyScore * 0.15 +
    (10 - expert.averageResponseTime) * 2 * 0.1
  );
}

// AI Answer Draft Generation
export function generateAnswerDraft(question: string, domain: Domain): string {
  const drafts: Record<Domain, string> = {
    crop: 'Based on your question about crop management, consider the following: 1) Assess the current growth stage of your crop, 2) Check soil moisture and nutrient levels, 3) Ensure proper spacing and sunlight exposure. Please provide more specific details about your crop type and symptoms for targeted advice.',
    
    soil: 'For soil-related concerns: 1) Conduct a soil pH test (ideal range is 6.0-7.5 for most crops), 2) Check for proper drainage, 3) Consider adding organic matter like compost to improve soil structure. Soil testing labs can provide detailed nutrient analysis.',
    
    irrigation: 'Regarding irrigation: 1) Assess your current water source and availability, 2) Consider drip irrigation for water efficiency, 3) Water during early morning or late evening to reduce evaporation. Adjust frequency based on crop type, soil type, and weather conditions.',
    
    pest: 'For pest management: 1) Identify the specific pest (check for visible insects, damage patterns), 2) Use integrated pest management (IPM) - start with cultural and biological controls, 3) If necessary, apply appropriate pesticides following recommended dosages. Regular monitoring is key.',
    
    disease: 'For disease management: 1) Identify symptoms (leaf spots, wilting, discoloration), 2) Remove and destroy infected plant parts, 3) Improve air circulation and reduce moisture on leaves, 4) Apply appropriate fungicides if needed. Prevention through crop rotation and resistant varieties is important.',
    
    fertilizer: 'Regarding fertilizer application: 1) Conduct soil testing to determine nutrient deficiencies, 2) Apply balanced NPK based on crop requirements, 3) Consider organic options like compost or vermicompost, 4) Follow recommended dosages and timing. Avoid over-fertilization which can harm crops.',
    
    machinery: 'For machinery and equipment: 1) Ensure regular maintenance and servicing, 2) Check for proper functioning of all parts, 3) Follow manufacturer guidelines for operation, 4) Consider local mechanics or service centers for repairs. Proper storage extends equipment life.',
    
    subsidy: 'Regarding subsidies and schemes: 1) Check with your local agriculture office for available programs, 2) Ensure you have necessary documents (land records, Aadhaar, bank details), 3) Apply within specified deadlines, 4) Follow up regularly on application status. Many schemes are available for small and marginal farmers.'
  };
  
  return drafts[domain];
}

// AI Quality Suggestions for Answers
export function generateQualitySuggestions(answer: string, question: string): string[] {
  const suggestions: string[] = [];
  
  if (answer.length < 100) {
    suggestions.push('Consider expanding your answer with more details');
  }
  
  if (!answer.match(/\d/)) {
    suggestions.push('Add specific measurements, dosages, or timeframes where applicable');
  }
  
  if (!answer.match(/step|first|second|then|finally|:|1|2|3/i)) {
    suggestions.push('Structure your answer in clear steps for easy implementation');
  }
  
  if (!answer.match(/caution|warning|note|avoid|ensure|important/i)) {
    suggestions.push('Include safety precautions or important warnings if relevant');
  }
  
  if (answer.split('.').length < 3) {
    suggestions.push('Break down complex information into multiple sentences');
  }
  
  return suggestions;
}

// AI Answer Quality Scoring
export function calculateAnswerQualityScore(answer: string, question: string): number {
  let score = 50; // Base score
  
  // Length (comprehensiveness)
  if (answer.length > 200) score += 15;
  else if (answer.length > 100) score += 10;
  else if (answer.length > 50) score += 5;
  
  // Specific numbers/measurements
  if (answer.match(/\d+\s*(kg|gram|liter|ml|hectare|meter|day|week|month|%)/gi)) {
    score += 10;
  }
  
  // Structured format
  if (answer.match(/step|first|second|1\.|2\.|3\./i)) {
    score += 10;
  }
  
  // Safety/caution mentions
  if (answer.match(/caution|warning|avoid|ensure|important|note:/i)) {
    score += 8;
  }
  
  // Mentions multiple solutions/alternatives
  if (answer.match(/alternatively|or|also|additionally/i)) {
    score += 7;
  }
  
  // Cap at 100
  return Math.min(score, 100);
}

// AI Context for Rejected Questions
export function generateRejectionContext(
  question: string,
  previousAnswers: any[],
  rejectionFeedback: string
): string {
  return `CONTEXT FOR NEW EXPERT ASSIGNMENT:

Original Question: ${question}

Previous Attempt Summary:
- ${previousAnswers.length} expert(s) provided answers
- Moderator rejected with feedback: "${rejectionFeedback}"

What went wrong:
${analyzeRejectionReason(rejectionFeedback)}

What the new answer needs:
- Address the moderator's concerns directly
- Provide more specific, actionable advice
- Include proper measurements and timeframes
- Ensure accuracy and safety considerations
- Be comprehensive yet practical

This is your opportunity to provide the best possible answer to help the farmer.`;
}

function analyzeRejectionReason(feedback: string): string {
  const lower = feedback.toLowerCase();
  
  if (lower.includes('incomplete') || lower.includes('missing')) {
    return '- Previous answer lacked sufficient detail or missed key aspects';
  }
  if (lower.includes('inaccurate') || lower.includes('incorrect')) {
    return '- Previous answer contained factual errors or outdated information';
  }
  if (lower.includes('vague') || lower.includes('unclear')) {
    return '- Previous answer was not specific enough or lacked clear guidance';
  }
  if (lower.includes('safety') || lower.includes('risk')) {
    return '- Previous answer did not adequately address safety concerns';
  }
  
  return '- Previous answer did not meet quality standards';
}
