import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GradingSuggestion {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  confidence: number;
  rubricScores?: { [criterion: string]: number };
}

export interface EssayGrading extends GradingSuggestion {
  grammar: number;
  structure: number;
  content: number;
  argumentation: number;
  plagiarismRisk: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiGradingService {
  private backendApiUrl = 'https://localhost:7270/api/AICalls/gradeSubmission';
  private aiAssistanceUrl = 'https://localhost:7270/api/AIAssistance';

  constructor(private http: HttpClient) {
    console.log('🤖 Using backend proxy for AI grading');
  }

  getAiGradeAssistance(assignmentId: string, studentId: string): Observable<any> {
    return this.http.post(`${this.aiAssistanceUrl}/aiGradeAssistance?assignmentId=${assignmentId}&studentId=${studentId}`, {});
  }

  getPlagiarismResult(assignmentId: string, studentId: string): Observable<any> {
    return this.http.get(`${this.aiAssistanceUrl}/getPlagiarismResult?assignmentId=${assignmentId}&studentId=${studentId}`);
  }

  getAllTeacherAssignments(teacherId: string): Observable<any[]> {
    return this.http.get<any[]>(`https://localhost:7270/api/Assingment/getAllTeacherAssignments/${teacherId}`);
  }

  submitGrade(payload: any): Observable<any> {
    console.log('🔵 submitGrade service called with payload:', payload);
    const url = `https://localhost:7270/api/Assingment/addAssignmentGrades`;
    console.log('🔵 Calling URL:', url);
    return this.http.post(url, payload);
  }

  async suggestGrade(
    question: string,
    modelAnswer: string,
    studentAnswer: string,
    maxScore: number
  ): Promise<GradingSuggestion> {
    const prompt = `You are an expert teacher grading an assignment.

Question: ${question}
Model Answer: ${modelAnswer}
Student Answer: ${studentAnswer}
Maximum Score: ${maxScore}

Provide a grading suggestion in JSON format:
{
  "score": <number between 0 and ${maxScore}>,
  "feedback": "<constructive feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "confidence": <number between 0 and 1>
}`;

    try {
      const response: any = await this.http.post(this.backendApiUrl, prompt).toPromise();
      console.log('🤖 AI Response:', response);
      const textContent = response[0].generated_text;
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON in response');
    } catch (error: any) {
      console.error('AI grading error:', error);
      return {
        score: 0,
        feedback: `AI grading failed: ${error.message || 'Unknown error'}. Please grade manually.`,
        strengths: [],
        improvements: [],
        confidence: 0
      };
    }
  }

  async gradeEssay(
    prompt: string,
    essay: string,
    maxScore: number,
    rubric?: string
  ): Promise<EssayGrading> {
    const gradingPrompt = `You are an expert teacher grading an essay.

Essay Prompt: ${prompt}
Student Essay: ${essay}
Maximum Score: ${maxScore}
${rubric ? `Rubric: ${rubric}` : ''}

Analyze the essay and provide detailed grading in JSON format:
{
  "score": <total score out of ${maxScore}>,
  "grammar": <score 0-100 for grammar and spelling>,
  "structure": <score 0-100 for organization and flow>,
  "content": <score 0-100 for depth and relevance>,
  "argumentation": <score 0-100 for logic and evidence>,
  "plagiarismRisk": <score 0-100, higher means more suspicious>,
  "feedback": "<detailed constructive feedback>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "confidence": <number between 0 and 1>
}`;

    try {
      const response: any = await this.http.post(this.backendApiUrl, gradingPrompt).toPromise();
      console.log('🤖 AI Response:', response);
      const textContent = response[0].generated_text;
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON in response');
    } catch (error: any) {
      console.error('AI essay grading error:', error);
      return {
        score: 0,
        grammar: 0,
        structure: 0,
        content: 0,
        argumentation: 0,
        plagiarismRisk: 0,
        feedback: `AI grading failed: ${error.message || 'Unknown error'}. Please grade manually.`,
        strengths: [],
        improvements: [],
        confidence: 0
      };
    }
  }

  setApiKey(key: string) {
    // Not needed - backend handles API key
  }

  async gradeDocumentSubmission(
    assignmentPrompt: string,
    documentBase64: string,
    maxScore: number,
    rubric?: string
  ): Promise<EssayGrading> {
    console.log('📄 Starting PDF text extraction...');
    
    // Step 1: Extract text from PDF
    let extractedText = '';
    try {
      const binaryString = atob(documentBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error('PDF.js library not loaded');
      }
      
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      console.log(`📄 PDF loaded: ${pdf.numPages} pages`);
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedText += pageText + '\n';
      }
      
      console.log('✅ Text extracted, length:', extractedText.length);
      console.log('📝 First 200 chars:', extractedText.substring(0, 200));
      
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF. Please ensure the document is readable.');
    }
    
    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error('No readable text found in PDF. Document may be scanned or image-based.');
    }
    
    // Step 2: Send extracted text to backend AI proxy
    console.log('🤖 Sending to backend AI for grading...');
    
    const gradingPrompt = `You are an expert teacher grading a student assignment.

Assignment Requirements: ${assignmentPrompt}
Maximum Score: ${maxScore}
${rubric ? `Grading Rubric: ${rubric}` : ''}

Student's Answer:
${extractedText.substring(0, 2000)}

Grade this student's work and respond ONLY with valid JSON in this exact format:
{
  "score": 75,
  "grammar": 80,
  "structure": 75,
  "content": 78,
  "argumentation": 72,
  "plagiarismRisk": 10,
  "feedback": "Your detailed feedback here",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "confidence": 0.8
}`;

    try {
      const response: any = await this.http.post(this.backendApiUrl, gradingPrompt).toPromise();
      console.log('🤖 AI Response:', response);
      
      if (response && response[0] && response[0].generated_text) {
        const generatedText = response[0].generated_text;
        console.log('📝 Generated text:', generatedText);
        
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log('✅ Parsed AI grading:', result);
          return result;
        }
      }
      
      throw new Error('AI did not return valid JSON format');
      
    } catch (error: any) {
      console.error('AI grading error:', error);
      throw new Error(`AI grading failed: ${error.message || error}`);
    }
  }
}
