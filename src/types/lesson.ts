export interface Topic {
    id: string;
    topicName: string;
    topicDescription: string;
    order: number;
    status: 'not started' | 'in progress' | 'completed';
    type: 'communication' | 'vocabulary' | 'grammar';
    isUserAdded: boolean;
  }
  
  export interface Exercise {
    id: string;
    question: string;
    type: string; // 'multiple-choice', 'fill-in-the-blank', etc.
    options?: string[];
    hint?: string;
  }
  
  export interface Example {
    context?: string;
    correct: string;
    incorrect?: string;
    explanation: string;
  }
  
  export interface VocabularyWord {
    word: string;
    translation: string;
    exampleSentence: string;
  }
  
  export interface Dialogue {
    role: string;
    text: string;
  }
  
  export interface Scenario {
    description: string;
    steps: string[];
  }
  
  export interface GrammarExample {
    sentence: string;
    explanation: string;
  }
  
  export interface GeneratedTopic {
    id: string;
    title: string;
    introduction: {
      explanation: string;
      keyPoints: string[];
    };
    inDepth: string; // This will be Markdown-formatted text
    examples: Example[];
    exercises: Exercise[];
  }
  
  export interface Lesson {
    id: string;
    number: number;
    title: string;
    date: string;
    status: string;
    topics: Topic[];
    brief: string;
    generated?: boolean;
    generatedTopics?: GeneratedTopic[];
  }