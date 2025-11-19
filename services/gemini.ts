import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Flashcard, QuizQuestion } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

// ------------------------------------------------------------------
// Visual Generator (Graphs, Diagrams)
// ------------------------------------------------------------------
export const generateVisual = async (prompt: string): Promise<string | null> => {
  const ai = getClient();
  const model = 'imagen-4.0-generate-001';
  
  try {
    const response = await ai.models.generateImages({
      model,
      prompt: `Create a clear, educational, textbook-style diagram or graph for: ${prompt}.
      
      STRICT RULES FOR MATH/GRAPHS:
      1. If asking for a graph (linear, quadratic, etc.), draw a clean 2D Cartesian coordinate system on a WHITE background.
      2. Axis lines must be black and clearly visible.
      3. Grid lines should be light gray.
      4. The function line should be bold and a distinct color (blue or red).
      5. If geometry, draw shapes with clear black outlines and white fills or light shading.
      
      General Style: Minimalist, academic, high contrast, white background, no photorealism.`,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      }
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Visual Generation Error:", error);
    return null;
  }
};

// ------------------------------------------------------------------
// Homework Explainer
// ------------------------------------------------------------------
export const explainHomework = async (
  text: string,
  imageBase64?: string,
  history?: { role: string; parts: any[] }[]
): Promise<string> => {
  const ai = getClient();
  
  const systemInstruction = `
    You are StudySpark, an AI homework tutor. 
    Your goal is to TEACH, not just give answers.
    1. Break down problems step-by-step.
    2. Use clear, student-friendly language.
    3. For math, show the working out clearly.
    4. If the user uploads an image of handwriting, do your best to read it.
    5. Never write a full essay for the student; guide them with an outline and key points instead.
    6. If the user provides an answer, check it politely and explain any mistakes.
    7. Use Markdown for formatting (bolding key terms, bullet points).
  `;

  const model = "gemini-2.5-flash";
  
  // Simple message construction
  const parts: any[] = [];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    });
  }
  if (text) {
    parts.push({ text });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.4, 
      }
    });
    return response.text || "I couldn't generate an explanation.";
  } catch (error) {
    console.error("Explainer Error:", error);
    return "Sorry, I encountered an error while explaining. Please try again.";
  }
};

// ------------------------------------------------------------------
// Flashcard Generator
// ------------------------------------------------------------------
export const generateFlashcards = async (topic: string, count: number = 5): Promise<Flashcard[]> => {
  const ai = getClient();
  const model = "gemini-2.5-flash";

  const prompt = `Create ${count} study flashcards about: ${topic}. Keep concepts clear and concise.`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        front: { type: Type.STRING, description: "The term or question on the front of the card" },
        back: { type: Type.STRING, description: "The definition or answer on the back" },
      },
      required: ["front", "back"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Flashcard[];
  } catch (error) {
    console.error("Flashcard Error:", error);
    return [];
  }
};

// ------------------------------------------------------------------
// Quiz Generator
// ------------------------------------------------------------------
export const generateQuiz = async (topic: string, difficulty: string = "medium"): Promise<QuizQuestion[]> => {
  const ai = getClient();
  const model = "gemini-2.5-flash";

  const prompt = `Create a 5-question multiple choice quiz about: ${topic}. Difficulty: ${difficulty}.
  If a question requires a visual aid (like a graph for a linear relationship, a geometry diagram, or a science diagram), provide a description in 'visualDescription'.`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "4 possible answers" 
        },
        correctAnswerIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct answer" },
        explanation: { type: Type.STRING, description: "Short explanation of why the answer is correct" },
        visualDescription: { type: Type.STRING, description: "Optional: A description of a graph or image needed for this question. e.g., 'A graph of line y=2x+1'"}
      },
      required: ["question", "options", "correctAnswerIndex", "explanation"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz Error:", error);
    return [];
  }
};

// ------------------------------------------------------------------
// Study Guide Generator
// ------------------------------------------------------------------
export const generateStudyGuide = async (topic: string): Promise<string> => {
  const ai = getClient();
  const model = "gemini-2.5-flash";

  const prompt = `Create a comprehensive study guide for: ${topic}.
  Structure it with:
  1. Title
  2. Key Concepts (bullet points)
  3. Detailed Explanations
  4. Important Vocabulary
  5. Example Problems or Scenarios
  
  Use strict Markdown formatting. Use # for main title, ## for sections, **bold** for terms.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Failed to generate guide.";
  } catch (error) {
    console.error("Study Guide Error:", error);
    return "Sorry, could not create the study guide.";
  }
};