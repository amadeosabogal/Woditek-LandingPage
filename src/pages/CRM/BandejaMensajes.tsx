import React, { useState } from 'react';
import { useLoader } from '../../context/CRM/LoaderContext';

const BandejaMensajes: React.FC = () => {
  const { showLoader, hideLoader } = useLoader();
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [inputText, setInputText] = useState('');
  
  // Fake Chats
  const [chats] = useState([
    { id: 1, name: 'Juan Pérez', unread: 2, lastMessage: '¿Cuál es el precio del servicio?', time: '10:45 AM' },
    { id: 2, name: 'María Gómez', unread: 0, lastMessage: 'Perfecto, agendamos reunión.', time: 'Ayer' },
    { id: 3, name: 'Carlos López', unread: 0, lastMessage: 'Gracias por la info.', time: 'Lunes' }
  ]);

  // Fake Messages for Active Chat
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hola, vi su mensaje masivo en WhatsApp.', isMe: false, time: '10:42 AM' },
    { id: 2, text: '¡Hola Juan! Gracias por responder. ¿En qué podemos ayudarte?', isMe: true, time: '10:43 AM' },
    { id: 3, text: '¿Cuál es el precio del servicio?', isMe: false, time: '10:45 AM' }
  ]);

  // Fake AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState([
    { id: 1, text: 'Nuestros precios varían según el volumen. ¿Cuántas licencias necesitas?', rating: 0 },
    { id: 2, text: 'El plan básico comienza en $50/mes. ¿Deseas que te envíe el PDF detallado?', rating: 0 }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setMessages([...messages, { id: Date.now(), text: inputText, isMe: true, time: 'Ahora' }]);
    setInputText('');
  };

  const useSuggestion = (text: string) => {
    setInputText(text);
  };

  const rateSuggestion = (suggestionId: number, rating: number) => {
    setAiSuggestions(aiSuggestions.map(s => s.id === suggestionId ? { ...s, rating } : s));
    showLoader('IA aprendiendo tu estilo...');
    setTimeout(() => {
      hideLoader();
      // Pequeño toast o aviso de que guardó
    }, 800);
  };

  return (
    <div className="h-full flex overflow-hidden bg-surface">
      {/* LEFT PANE: Chats List */}
      <div className="w-[300px] border-r border-border-subtle flex flex-col bg-surface-lowest">
        <div className="p-4 border-b border-border-subtle bg-surface flex items-center justify-between">
          <h2 className="font-headline-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">forum</span>
            Bandeja
          </h2>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-4 border-b border-border-subtle cursor-pointer hover:bg-surface-muted transition-colors flex gap-3 items-start ${activeChat === chat.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-label-caps uppercase shrink-0">
                {chat.name.substring(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-body-sm truncate">{chat.name}</h3>
                  <span className="text-[11px] text-on-surface-variant">{chat.time}</span>
                </div>
                <p className="text-[12px] text-on-surface-variant truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-status-ip text-white flex items-center justify-center text-[10px] font-bold">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE PANE: Chat Interface */}
      <div className="flex-1 flex flex-col relative bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')] bg-opacity-5 relative">
        {/* WhatsApp Background Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-repeat pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")' }}></div>

        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-surface border-b border-border-subtle flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-label-caps uppercase">
                {chats.find(c => c.id === activeChat)?.name.substring(0,2)}
              </div>
              <div>
                <h3 className="font-bold text-body-sm">{chats.find(c => c.id === activeChat)?.name}</h3>
                <p className="text-[11px] text-status-pp flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-status-pp block"></span> En línea
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg shadow-sm relative ${msg.isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-surface border border-border-subtle rounded-tl-none'}`}>
                    <p className="text-body-sm">{msg.text}</p>
                    <div className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-white/70' : 'text-on-surface-variant'}`}>
                      {msg.time} {msg.isMe && <span className="material-symbols-outlined text-[12px] align-middle">done_all</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface border-t border-border-subtle relative z-10">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-surface-muted border-none rounded-full px-4 py-2 text-body-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button type="submit" className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-sm">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant relative z-10">
            <span className="material-symbols-outlined text-[64px] mb-4 opacity-50">forum</span>
            <p>Selecciona un chat para comenzar a enviar mensajes</p>
          </div>
        )}
      </div>

      {/* RIGHT PANE: AI Suggestions */}
      <div className="w-[320px] border-l border-border-subtle bg-surface flex flex-col">
        <div className="p-4 border-b border-border-subtle flex flex-col gap-1 bg-gradient-to-r from-primary/10 to-transparent">
          <h2 className="font-headline-sm font-bold flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">psychology</span>
            Wimprove AI
          </h2>
          <p className="text-[12px] text-on-surface-variant">Análisis en tiempo real de la conversación para sugerir respuestas.</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {activeChat && messages.length > 0 ? (
            <>
              <div className="text-label-caps text-on-surface-variant mb-2">Sugerencias generadas</div>
              {aiSuggestions.map(sug => (
                <div key={sug.id} className="bg-surface-muted rounded-lg p-3 border border-border-subtle relative group hover:border-primary/50 transition-colors shadow-sm">
                  <p className="text-body-sm text-on-surface mb-3">{sug.text}</p>
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-subtle">
                    {/* Star Rating System */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          onClick={() => rateSuggestion(sug.id, star)}
                          className={`material-symbols-outlined text-[16px] transition-colors ${star <= sug.rating ? 'text-[#F59E0B]' : 'text-outline-variant hover:text-[#F59E0B]/50'}`}
                          style={star <= sug.rating ? {fontVariationSettings: "'FILL' 1"} : {}}
                          title="Calificar para entrenar a la IA"
                        >
                          star
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => useSuggestion(sug.text)}
                      className="text-[11px] font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                    >
                      Usar Texto
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-blue-50 text-blue-800 text-[11px] p-3 rounded-lg border border-blue-200 flex gap-2 items-start mt-6">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <p>Al calificar las respuestas con estrellas, la IA aprenderá el estilo (tono, formalidad) que prefieres para futuras sugerencias.</p>
              </div>
            </>
          ) : (
             <div className="text-center text-on-surface-variant py-10 opacity-70">
                <span className="material-symbols-outlined text-[40px] mb-2">lightbulb</span>
                <p className="text-[12px]">La IA necesita contexto. Inicia un chat para ver sugerencias.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BandejaMensajes;
