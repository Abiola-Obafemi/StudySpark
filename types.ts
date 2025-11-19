export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  visualDescription?: string; // Short description for generating an image if needed (e.g. "Graph of y=2x")
}

export interface QuizData {
  topic: string;
  questions: QuizQuestion[];
  dateCreated: string;
}

export interface StudyGuide {
  id: string;
  topic: string;
  content: string; // Markdown
  dateCreated: string;
  visualUrl?: string;
}

export interface FlashcardSet {
  id: string;
  topic: string;
  cards: Flashcard[];
  dateCreated: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  dateCreated: string;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'microsoft' | 'email';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 or url
  isError?: boolean;
  visualUrl?: string; // generated image for this message
}