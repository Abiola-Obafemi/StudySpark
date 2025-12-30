import { GoogleGenAI, Type } from "@google/genai";
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
  const model = 'gemini-2.5-flash-image';
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{
          text: `Create a clear, educational, textbook-style diagram or graph for: ${prompt}.
          
          STRICT RULES FOR MATH/GRAPHS:
          1. If asking for a graph, draw a clean 2D Cartesian coordinate system on a WHITE background.
          2. Axis lines must be black. Function line should be bold blue.
          3. Geometry shapes must have clear black outlines and light shading.
          
          General Style: Minimalist, academic, high contrast, white background.`
        }]
      },
      config: {
        imageConfig: {
          aspectRatio: '16:9'
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Visual Generation Error:", error);
    return null;
  }
};

// ------------------------------------------------------------------
// Homework Explainer (The Strict Socratic Tutor)
// ------------------------------------------------------------------
export const explainHomework = async (
  text: string,
  imageBase64?: string,
): Promise<string> => {
  const ai = getClient();
  
  const systemInstruction = `
    You are StudySpark, a world-class Socratic Tutor. 
    
    YOUR UNBREAKABLE OATH:
    1. NEVER provide a final answer, solution, or value (e.g., "x = 5" or "The theme is betrayal").
    2. If a student asks for the answer, politely refuse and explain that your goal is to help THEM find it.
    3. Break complex problems into tiny, logical steps.
    4. Focus on the "WHY" behind the concept.
    5. Ask ONE targeted question at a time to lead the student to the next realization.
    6. If they are completely lost, provide a conceptual hint or an analogy.
    7. For multiple choice: Don't tell them which letter is right. Explain why the concepts in the options are different.
    
    Response Tone: Encouraging, patient, and challenging.
    Formatting: Use Markdown, bolding, and lists for readability.
  `;

  const model = "gemini-3-flash-preview";
  
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
        temperature: 0.7, 
      }
    });
    return response.text || "I'm thinking... Let's look at this another way. What's the first thing you notice about this problem?";
  } catch (error) {
    console.error("Explainer Error:", error);
    return "Sorry, I'm having a hard time connecting right now. Can you try rephrasing your question?";
  }
};

// ------------------------------------------------------------------
// Flashcard Generator
// ------------------------------------------------------------------
export const generateFlashcards = async (topic: string, count: number = 5): Promise<Flashcard[]> => {
  const ai = getClient();
  const model = "gemini-3-flash-preview";

  const prompt = `Create ${count} study flashcards about: ${topic}. Focus on key terms and definitions.`;

  const schema: any = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        front: { type: Type.STRING },
        back: { type: Type.STRING },
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

    return JSON.parse(response.text || "[]") as Flashcard[];
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
  const model = "gemini-3-flash-preview";

  const prompt = `Create a 5-question multiple choice quiz about: ${topic}. Difficulty: ${difficulty}.`;

  const schema: any = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }
        },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING },
        visualDescription: { type: Type.STRING }
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
    
    return JSON.parse(response.text || "[]") as QuizQuestion[];
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
  const model = "gemini-3-flash-preview";

  const prompt = `Create a comprehensive study guide for: ${topic}. 
  Focus on conceptual understanding. Use Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Failed to generate guide.";
  } catch (error) {
    console.error("Study Guide Error:", error);
    return "Could not create the study guide.";
  }
};