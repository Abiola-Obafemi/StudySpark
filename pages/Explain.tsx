
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleIcon, UploadIcon, CameraIcon, LoaderIcon, ZapIcon } from '../components/Icons';
import { explainHomework, generateVisual } from '../services/gemini';
import { SimpleMarkdown } from '../components/Markdown';
import { ChatMessage } from '../types';

const GRAPH_KEYWORDS = [
  'graph', 'plot', 'chart', 'linear', 'equation', 'slope', 'intercept', 
  'parabola', 'quadratic', 'axis', 'coordinate', 'geometry', 'triangle', 
  'circle', 'rectangle', 'polygon', 'function', 'grid'
];

const Explain = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I\'m StudySpark, your personal tutor. Send me a problem you\'re working on. \n\nI won\'t give you the answer, but I\'ll help you understand how to find it yourself! 🧠✨' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGeneratingVisual]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVisual = async (textContext: string) => {
    if(isGeneratingVisual) return;
    setIsGeneratingVisual(true);
    
    try {
      const imageUrl = await generateVisual(textContext.substring(0, 500)); 
      if (imageUrl) {
        setMessages(prev => [...prev, { 
            role: 'model', 
            text: "I've drawn this diagram to help you visualize the concept:", 
            visualUrl: imageUrl 
        }]);
      }
    } catch(e) {
        console.error(e);
    } finally {
        setIsGeneratingVisual(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userText = input;
    const userMsg: ChatMessage = {
      role: 'user',
      text: userText,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);

    try {
      const base64Image = currentImage ? currentImage.split(',')[1] : undefined;
      const responseText = await explainHomework(userText, base64Image);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);

      const lowerInput = userText.toLowerCase();
      const needsGraph = GRAPH_KEYWORDS.some(keyword => lowerInput.includes(keyword));

      if (needsGraph) {
        setTimeout(() => {
           handleGenerateVisual(userText);
        }, 800);
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I hit a snag while thinking. Let's try rephrasing the question?", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-4 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'model' ? 'bg-blue-600' : 'bg-slate-300'}`}>
              {msg.role === 'model' ? <ZapIcon className="w-4 h-4 text-white" /> : <div className="w-4 h-4 bg-slate-500 rounded-full" />}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
            }`}>
              {msg.image && (
                <img src={msg.image} alt="Handwriting" className="max-w-full h-auto rounded-lg mb-3 border border-white/20" />
              )}
              {msg.role === 'model' ? (
                <div>
                    <SimpleMarkdown text={msg.text} />
                    {msg.visualUrl && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-2">
                             <img src={msg.visualUrl} alt="Educational Diagram" className="w-full h-auto" />
                        </div>
                    )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        {(isLoading || isGeneratingVisual) && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
               <ZapIcon className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <LoaderIcon className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-slate-500 text-sm font-medium">{isGeneratingVisual ? 'Drawing visual aid...' : 'Preparing hint...'}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 relative">
        {selectedImage && (
          <div className="absolute bottom-full mb-2 left-0 bg-white p-2 rounded-lg shadow-lg border border-slate-200">
            <div className="relative">
              <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2 items-end focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 bg-transparent border-none focus:ring-0 p-3 max-h-32 resize-none text-slate-900 text-base placeholder:text-slate-400"
            rows={1}
            onKeyDown={(e) => {
              if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <button 
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-blue-100"
          >
            {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <UploadIcon className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Explain;
