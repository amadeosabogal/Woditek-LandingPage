import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLoader } from '../../context/CRM/LoaderContext';
import type { LayoutContextType } from '../../components/CRM/layout/Layout';

const BandejaMensajes: React.FC = () => {
  const { showLoader, hideLoader } = useLoader();
  const { setFullScreenMode } = useOutletContext<LayoutContextType>();
  
  useEffect(() => {
    setFullScreenMode(true);
    return () => setFullScreenMode(false);
  }, [setFullScreenMode]);

  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [inputText, setInputText] = useState('');
  
  // Base Fake Chats
  const [chats, setChats] = useState<any[]>([
    { id: 1, name: 'Juan Pérez', unread: 2, lastMessage: '¿Cuál es el precio del servicio?', time: '10:45 AM' },
    { id: 2, name: 'María Gómez', unread: 0, lastMessage: 'Perfecto, agendamos reunión.', time: 'Ayer' },
    { id: 3, name: 'Carlos López', unread: 0, lastMessage: 'Gracias por la info.', time: 'Lunes' }
  ]);

  const [allMessages, setAllMessages] = useState<Record<number, any[]>>({
    1: [
      { id: 1, text: 'Hola, vi su mensaje masivo en WhatsApp.', isMe: false, time: '10:42 AM' },
      { id: 2, text: '¡Hola Juan! Gracias por responder. ¿En qué podemos ayudarte?', isMe: true, time: '10:43 AM' },
      { id: 3, text: '¿Cuál es el precio del servicio?', isMe: false, time: '10:45 AM' }
    ],
    2: [
      { id: 1, text: 'Hola María.', isMe: true, time: 'Ayer' },
      { id: 2, text: 'Perfecto, agendamos reunión.', isMe: false, time: 'Ayer' }
    ],
    3: [
      { id: 1, text: 'Te envié la info por correo.', isMe: true, time: 'Lunes' },
      { id: 2, text: 'Gracias por la info.', isMe: false, time: 'Lunes' }
    ]
  });

  useEffect(() => {
    // Load simulated chats from LeadsList
    const savedChatsStr = localStorage.getItem('whatsapp_simulated_chats');
    const savedMsgStr = localStorage.getItem('whatsapp_simulated_messages');
    
    if (savedChatsStr) {
      const savedChats = JSON.parse(savedChatsStr);
      setChats(prev => {
        // Prevent duplicates
        const prevIds = prev.map(c => c.id);
        const uniqueSaved = savedChats.filter((c: any) => !prevIds.includes(c.id));
        return [...uniqueSaved, ...prev];
      });
    }
    
    if (savedMsgStr) {
       setAllMessages(prev => ({ ...prev, ...JSON.parse(savedMsgStr) }));
    }
  }, []);

  const activeMessages = activeChat && allMessages[activeChat] ? allMessages[activeChat] : [];

  // Fake AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState([
    { id: 1, text: 'Nuestros precios varían según el volumen. ¿Cuántas licencias necesitas?', rating: 0 },
    { id: 2, text: 'El plan básico comienza en $50/mes. ¿Deseas que te envíe el PDF detallado?', rating: 0 }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    
    const newMessage = { id: Date.now(), text: inputText, isMe: true, time: 'Ahora' };
    
    setAllMessages(prev => {
      const updatedMessages = {
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), newMessage]
      };
      
      // Also update localStorage so it persists
      const savedMsgStr = localStorage.getItem('whatsapp_simulated_messages');
      if (savedMsgStr) {
        const stored = JSON.parse(savedMsgStr);
        stored[activeChat] = updatedMessages[activeChat];
        localStorage.setItem('whatsapp_simulated_messages', JSON.stringify(stored));
      }
      return updatedMessages;
    });

    // Update the last message in chat list
    setChats(prev => prev.map(c => c.id === activeChat ? { ...c, lastMessage: inputText, time: 'Ahora' } : c));
    
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
    <div className="h-full flex overflow-hidden bg-[#f0f2f5] font-sans">
      {/* LEFT PANE: Chats List */}
      <div className="w-[400px] border-r border-[#d1d7db] flex flex-col bg-white shrink-0">
        {/* Header */}
        <div className="h-[59px] px-4 bg-[#f0f2f5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#dfe5e7] overflow-hidden flex items-center justify-center">
               <span className="material-symbols-outlined text-[#54656f]">person</span>
            </div>
            <h2 className="font-bold text-[#00a884] ml-2 text-lg">WhatsApp</h2>
          </div>
          <div className="flex items-center gap-4 text-[#54656f]">
            <button className="hover:bg-[#d9dbdf] p-1.5 rounded-full transition-colors"><span className="material-symbols-outlined">data_usage</span></button>
            <button className="hover:bg-[#d9dbdf] p-1.5 rounded-full transition-colors"><span className="material-symbols-outlined">chat</span></button>
            <button className="hover:bg-[#d9dbdf] p-1.5 rounded-full transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-white border-b border-[#f2f2f2] shrink-0">
          <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 h-[35px]">
            <span className="material-symbols-outlined text-[#54656f] text-[20px] mr-3">search</span>
            <input 
              type="text" 
              placeholder="Buscar un chat o iniciar uno nuevo"
              className="bg-transparent flex-1 outline-none text-[15px] text-[#111b21] placeholder-[#54656f]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-3 py-2 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide border-b border-[#f2f2f2]">
          <button className="px-3 py-1.5 bg-[#d9fdd3] text-[#111b21] text-[14px] rounded-full whitespace-nowrap">Todos</button>
          <button className="px-3 py-1.5 bg-[#f0f2f5] text-[#54656f] text-[14px] rounded-full whitespace-nowrap">No leídos 269</button>
          <button className="px-3 py-1.5 bg-[#f0f2f5] text-[#54656f] text-[14px] rounded-full whitespace-nowrap">Favoritos</button>
          <button className="px-3 py-1.5 bg-[#f0f2f5] text-[#54656f] text-[14px] rounded-full whitespace-nowrap">Grupos 91</button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`flex items-center px-3 cursor-pointer hover:bg-[#f5f6f6] transition-colors ${activeChat === chat.id ? 'bg-[#f0f2f5]' : ''}`}
            >
              <div className="w-[49px] h-[49px] rounded-full bg-[#dfe5e7] flex items-center justify-center font-bold text-lg text-[#54656f] uppercase shrink-0 mr-3 overflow-hidden">
                {chat.name?.substring(0,2)}
              </div>
              <div className="flex-1 min-w-0 border-b border-[#f2f2f2] py-3 pr-4 flex flex-col justify-center h-[72px]">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="text-[17px] text-[#111b21] truncate">{chat.name}</h3>
                  <span className={`text-[12px] ${chat.unread > 0 ? 'text-[#00a884]' : 'text-[#667781]'}`}>{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[#667781] truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <div className="w-[20px] h-[20px] rounded-full bg-[#25D366] text-white flex items-center justify-center text-[11px] font-bold shrink-0 ml-2">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE PANE: Chat Interface */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative min-w-0">
        {/* Background Overlay */}
        <div className="absolute inset-0 opacity-[0.4] bg-repeat pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")' }}></div>

        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-[59px] px-4 bg-[#f0f2f5] border-b border-[#d1d7db] flex items-center justify-between shrink-0 relative z-10 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center font-bold text-[#54656f] text-label-caps uppercase overflow-hidden">
                  {chats.find(c => c.id === activeChat)?.name?.substring(0,2)}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-[16px] text-[#111b21]">{chats.find(c => c.id === activeChat)?.name}</h3>
                  <p className="text-[13px] text-[#667781] truncate">haz clic aquí para ver la información de contacto</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#54656f]">
                <button className="hover:bg-[#d9dbdf] p-1.5 rounded-full transition-colors"><span className="material-symbols-outlined">videocam</span></button>
                <button className="hover:bg-[#d9dbdf] p-1.5 rounded-full transition-colors"><span className="material-symbols-outlined">call</span></button>
                <span className="w-[1px] h-6 bg-[#d1d7db]"></span>
                <button className="hover:bg-[#d9dbdf] p-1.5 rounded-full transition-colors"><span className="material-symbols-outlined">search</span></button>
                <button className="hover:bg-[#d9dbdf] p-1.5 rounded-full transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-[5%] py-4 space-y-2 relative z-10">
              {activeMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[65%] px-2.5 py-1.5 rounded-lg shadow-sm relative text-[14.2px] leading-snug ${msg.isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                    <span className="text-[#111b21] break-words">{msg.text}</span>
                    <span className={`text-[11px] float-right mt-1.5 ml-2 flex items-center gap-1 ${msg.isMe ? 'text-[#667781]' : 'text-[#667781]'}`}>
                      {msg.time} 
                      {msg.isMe && <span className="material-symbols-outlined text-[15px] text-[#53bdeb]">done_all</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="h-[62px] px-4 bg-[#f0f2f5] flex items-center gap-3 relative z-10 shrink-0">
              <button className="text-[#54656f] hover:text-[#111b21] p-1.5"><span className="material-symbols-outlined">add</span></button>
              <button className="text-[#54656f] hover:text-[#111b21] p-1.5"><span className="material-symbols-outlined">mood</span></button>
              
              <form onSubmit={handleSendMessage} className="flex-1 flex bg-white rounded-lg px-4 h-[42px] items-center">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Escribe un mensaje"
                  className="flex-1 bg-transparent border-none outline-none text-[#111b21] text-[15px]"
                />
              </form>
              
              {inputText.trim() ? (
                <button onClick={handleSendMessage} className="text-[#54656f] hover:text-[#111b21] p-1.5"><span className="material-symbols-outlined">send</span></button>
              ) : (
                <button className="text-[#54656f] hover:text-[#111b21] p-1.5"><span className="material-symbols-outlined">mic</span></button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center relative z-10 bg-[#f0f2f5]">
            <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa66cgOovsu.png" alt="WhatsApp Web" className="w-[320px] mb-8 opacity-80" />
            <h1 className="text-[32px] text-[#41525d] font-light mb-4">WhatsApp Web</h1>
            <p className="text-[#667781] text-[14px]">Envía y recibe mensajes sin mantener tu teléfono conectado.</p>
            <p className="text-[#667781] text-[14px]">Usa WhatsApp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.</p>
          </div>
        )}
      </div>

      {/* RIGHT PANE: AI Suggestions */}
      <div className="w-[320px] border-l border-[#d1d7db] bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-[#f2f2f2] flex flex-col gap-1 bg-gradient-to-r from-[#d9fdd3]/50 to-transparent">
          <h2 className="font-semibold flex items-center gap-2 text-[#00a884] text-[16px]">
            <span className="material-symbols-outlined">psychology</span>
            Wimprove AI
          </h2>
          <p className="text-[12px] text-[#667781]">Análisis en tiempo real de la conversación para sugerir respuestas.</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f0f2f5]">
          {activeChat && activeMessages.length > 0 ? (
            <>
              <div className="text-[12px] font-semibold text-[#54656f] mb-1 uppercase tracking-wider">Sugerencias generadas</div>
              {aiSuggestions.map(sug => (
                <div key={sug.id} className="bg-white rounded-lg p-3 shadow-sm border border-transparent hover:border-[#25D366]/30 transition-colors">
                  <p className="text-[14px] text-[#111b21] mb-3 leading-snug">{sug.text}</p>
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#f2f2f2]">
                    {/* Star Rating System */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          onClick={() => rateSuggestion(sug.id, star)}
                          className={`material-symbols-outlined text-[16px] transition-colors ${star <= sug.rating ? 'text-[#F59E0B]' : 'text-[#aebac1] hover:text-[#F59E0B]/50'}`}
                          style={star <= sug.rating ? {fontVariationSettings: "'FILL' 1"} : {}}
                          title="Calificar para entrenar a la IA"
                        >
                          star
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => useSuggestion(sug.text)}
                      className="text-[12px] font-semibold text-[#00a884] hover:bg-[#d9fdd3] px-2 py-1 rounded transition-colors"
                    >
                      Usar Texto
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-[#e8f4fd] text-[#54656f] text-[12px] p-3 rounded-lg flex gap-2 items-start mt-4 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-[#53bdeb]">info</span>
                <p>Al calificar las respuestas con estrellas, la IA aprenderá el estilo que prefieres.</p>
              </div>
            </>
          ) : (
             <div className="text-center text-[#667781] py-10">
                <span className="material-symbols-outlined text-[40px] mb-2 opacity-50">lightbulb</span>
                <p className="text-[13px]">La IA necesita contexto. Inicia un chat para ver sugerencias.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BandejaMensajes;
