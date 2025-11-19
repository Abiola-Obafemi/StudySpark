import React from 'react';

// A simplified markdown renderer to avoid heavy dependencies
export const SimpleMarkdown = ({ text }: { text: string }) => {
  if (!text) return null;

  const lines = text.split('\n');
  
  return (
    <div className="space-y-3 text-slate-700 leading-relaxed">
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold text-slate-900 mt-6 mb-3 pb-1 border-b border-slate-200">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-extrabold text-blue-900 mb-4">{line.replace('# ', '')}</h1>;
        }

        // Bullet points
        if (line.trim().startsWith('- ')) {
          const content = line.trim().replace('- ', '');
          return (
            <div key={index} className="flex gap-2 ml-4">
              <span className="text-blue-500 font-bold">•</span>
              <span dangerouslySetInnerHTML={{ __html: parseInline(content) }} />
            </div>
          );
        }
        
        // Numbered lists
         if (/^\d+\.\s/.test(line.trim())) {
           return (
            <div key={index} className="flex gap-2 ml-4">
               <span className="text-blue-500 font-bold min-w-[20px]">{line.trim().match(/^\d+\./)}</span>
               <span dangerouslySetInnerHTML={{ __html: parseInline(line.replace(/^\d+\.\s/, '')) }} />
            </div>
           )
         }

        // Paragraphs (skip empty lines)
        if (line.trim() === '') return <div key={index} className="h-2"></div>;

        return <p key={index} dangerouslySetInnerHTML={{ __html: parseInline(line) }} />;
      })}
    </div>
  );
};

// Basic inline parser for **bold** and *italic* and `code`
const parseInline = (text: string) => {
  let parsed = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-pink-600 px-1 rounded font-mono text-sm">$1</code>');
  return parsed;
};