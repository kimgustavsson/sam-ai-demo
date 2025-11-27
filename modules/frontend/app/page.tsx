'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Home, FileText, Mic, Send, Sparkles, Pill, Clock, Settings as SettingsIcon, CheckCircle, ArrowLeft, Upload, X, Image as ImageIcon, Phone } from 'lucide-react';
import CallOverlay from './components/CallOverlay';

// Define types for SpeechRecognition
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export default function MainChatScreen() {
  // Helper state for navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'settings'>('home');

  // Chat State
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [viewState, setViewState] = useState<'main' | 'questions' | 'problems'>('main');
  const [ticketState, setTicketState] = useState<'chat' | 'decision' | 'summary' | 'success'>('chat');
  const [activeFlow, setActiveFlow] = useState<'none' | 'late_to_work' | 'call_manager'>('none');
  const [isCalling, setIsCalling] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState({ type: 'Sick Leave', details: 'User reported not feeling well and requested sick leave. Symptoms noted. Expecting to be out for 2 days.' });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [settings, setSettings] = useState({
    largerText: false,
    highContrast: false,
    textToSpeech: false,
    voiceControl: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (currentTab === 'home') {
      scrollToBottom();
    }
  }, [messages, isLoading, currentTab]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInput(''); 
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      
      let content = data.content || "";
      if (content.includes('[COMPLETE]')) {
        content = content.replace('[COMPLETE]', '').trim();
        setTicketState('decision');
      }

      setMessages(prev => [...prev, { role: data.role, content }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  };

  const handleHomeClick = () => {
    if (currentTab === 'home') {
      setMessages([]); // Reset to initial state
      setInput('');
      setViewState('main');
      setTicketState('chat');
      setActiveFlow('none');
      setSelectedImage(null);
    } else {
      setCurrentTab('home');
    }
  };

  const handleLateToWork = () => {
    setActiveFlow('late_to_work');
    setViewState('main');
    const question = "When will you arrive?";
    setMessages(prev => [...prev, { role: 'assistant', content: question }]);
  };

  const handleReportProblem = () => {
    setViewState('problems');
  };
  
  const handleNeedAssistance = () => {
    setViewState('main');
    setActiveFlow('call_manager');
    setMessages(prev => [...prev, 
      { role: 'user', content: "Need assistance" },
      { role: 'assistant', content: "I can help. Do you want to call your manager directly?" }
    ]);
  };

  const handleCallManager = () => {
    setIsCalling(true);
    setActiveFlow('none');
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setMessages(prev => [...prev, { 
      role: 'system', 
      content: "📞 Call ended. Duration: 0:42. A follow-up note has been sent to your manager." 
    }]);
  };

  const handleUploadNote = () => {
    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadConfirm = () => {
      if (!selectedImage) return;
      
      // Simulate upload
      setMessages(prev => [...prev, 
          { role: 'user', content: 'Uploaded a doctor\'s note.' },
          { role: 'assistant', content: 'File received. Thank you.' }
      ]);
      setSelectedImage(null);
      setViewState('main');
  };

  const cancelUpload = () => {
      setSelectedImage(null);
  };

  // Sub-components for cleaner rendering
  const SettingsToggle = ({ label, value, onChange }: { label: string, value: boolean, onChange: () => void }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <span className="text-lg font-medium text-gray-800">{label}</span>
      <button 
        onClick={onChange}
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${value ? 'bg-primary' : 'bg-gray-300'}`}
      >
        <div className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const HistoryItem = ({ date, title }: { date: string, title: string }) => (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-1">
      <span className="text-xs text-gray-400 font-medium">{date}</span>
      <span className="text-base font-medium text-gray-800">{title}</span>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#F2F4F7] flex flex-col font-sans text-gray-900 pb-20 relative ${settings.largerText ? 'text-lg' : ''} ${settings.highContrast ? 'contrast-125' : ''}`}>
      
      {isCalling && <CallOverlay onEndCall={handleEndCall} />}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 overflow-y-auto pt-20 pb-24 w-full max-w-lg mx-auto">
        
        {/* HOME TAB */}
        {currentTab === 'home' && (
          <>
            {ticketState === 'summary' ? (
              <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Review your Report</h2>
                  
                  <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
                        <div className="text-lg font-medium text-gray-800">Fatima</div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type</label>
                      <div className="text-lg font-medium text-gray-800">{summaryData.type}</div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Details</label>
                      <p className="text-base text-gray-600 mt-1 bg-gray-50 p-3 rounded-xl">
                        {summaryData.details}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={() => setTicketState('success')}
                      className="w-full bg-primary text-white text-lg font-semibold py-4 rounded-2xl shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                    >
                      Send to Manager
                    </button>
                  </div>
                </div>
              </div>
            ) : ticketState === 'success' ? (
              <div className="w-full flex flex-col items-center justify-center h-full space-y-6 animate-in zoom-in duration-500 mt-20">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 text-center">Sent to Manager! Get well soon.</h2>
                <button 
                  onClick={handleHomeClick}
                  className="mt-8 px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              // Normal Chat View
              <>
            {messages.length === 0 ? (
              <div className="w-full flex flex-col items-center space-y-8 mt-4">
                {/* Greeting */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-center leading-tight text-gray-800">
                      Hi, Fatima, how can i help you today?
                    </h1>
                    <Sparkles className="w-6 h-6 text-primary fill-purple-100" />
                  </div>
                </div>

                {/* Action Buttons or Suggestions */}
                {viewState === 'main' && (
                  <div className="w-full flex flex-row gap-4">
                    <button 
                      onClick={() => setViewState('questions')} 
                      className="flex-1 flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 h-40"
                      aria-label="Common questions"
                    >
                      <div className="p-4 bg-purple-50 rounded-full mb-3">
                        <Pill className="w-8 h-8 text-primary" /> 
                      </div>
                      <span className="text-lg font-medium text-gray-800">Questions</span>
                    </button>

                    <button 
                      onClick={() => handleSend("Show me instruction files")}
                      className="flex-1 flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 h-40"
                      aria-label="View instruction files"
                    >
                      <div className="p-4 bg-purple-50 rounded-full mb-3">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <span className="text-lg font-medium text-gray-800">Instruction Files</span>
                    </button>
                  </div>
                )}

                {viewState === 'questions' && (
                  <div className="w-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-lg font-semibold text-gray-800">Common questions</h3>
                      <button 
                        onClick={() => setViewState('main')}
                        className="text-sm text-primary font-medium hover:text-primary/80"
                      >
                        Close
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          handleSend("Sick leave");
                          setViewState('main');
                        }}
                        className="px-4 py-2 bg-white border border-purple-100 text-primary rounded-full font-medium shadow-sm hover:bg-purple-50 active:scale-95 transition-all text-left"
                      >
                        Sick leave
                      </button>

                      <button
                        onClick={handleLateToWork}
                        className="px-4 py-2 bg-white border border-purple-100 text-primary rounded-full font-medium shadow-sm hover:bg-purple-50 active:scale-95 transition-all text-left"
                      >
                        Late to work
                      </button>

                      <button
                        onClick={handleReportProblem}
                        className="px-4 py-2 bg-white border border-purple-100 text-primary rounded-full font-medium shadow-sm hover:bg-purple-50 active:scale-95 transition-all text-left"
                      >
                        Have a problem
                      </button>

                      <button
                        onClick={handleUploadNote}
                        className="px-4 py-2 bg-white border border-purple-100 text-primary rounded-full font-medium shadow-sm hover:bg-purple-50 active:scale-95 transition-all text-left"
                      >
                        Upload doctor's note
                      </button>
                    </div>
                  </div>
                )}

                {viewState === 'problems' && (
                   <div className="w-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-lg font-semibold text-gray-800">Select a problem</h3>
                      <button 
                        onClick={() => setViewState('main')}
                        className="text-sm text-primary font-medium hover:text-primary/80"
                      >
                        Close
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          handleSend("Forgot a key/card");
                          setViewState('main');
                        }}
                        className="px-4 py-2 bg-white border border-purple-100 text-primary rounded-full font-medium shadow-sm hover:bg-purple-50 active:scale-95 transition-all text-left"
                      >
                        Forgot a key/card
                      </button>

                      <button
                        onClick={handleNeedAssistance}
                        className="px-4 py-2 bg-white border border-purple-100 text-primary rounded-full font-medium shadow-sm hover:bg-purple-50 active:scale-95 transition-all text-left"
                      >
                        Need assistance
                      </button>

                      <button
                        onClick={() => {
                            handleCallManager();
                            setViewState('main');
                        }}
                        className="px-4 py-2 bg-white border border-purple-100 text-primary rounded-full font-medium shadow-sm hover:bg-purple-50 active:scale-95 transition-all text-left"
                      >
                        Call my manager
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
                <div className="w-full flex flex-col space-y-4 pb-4 pt-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {messages.length > 0 && messages[messages.length - 1].role === 'system' && messages[messages.length - 1].content.includes("Call ended") && (
                       <div className="w-full mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <button 
                            onClick={handleHomeClick}
                            className="w-full bg-[#6A53E7] text-white text-lg font-semibold py-4 rounded-2xl shadow-lg hover:bg-[#5a43d6] transition-all active:scale-95 flex items-center justify-center space-x-2"
                          >
                            <Home className="w-5 h-5" />
                            <span>Back to Home</span>
                          </button>
                       </div>
                    )}

                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="p-4 bg-white rounded-2xl rounded-bl-none text-gray-500 animate-pulse shadow-sm">
                                Thinking...
                            </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
              </>
            )}
          </>
        )}

        {/* HISTORY TAB */}
        {currentTab === 'history' && (
          <div className="w-full flex flex-col space-y-6">
             <h2 className="text-2xl font-semibold text-gray-800 pl-2">History</h2>
             <div className="flex flex-col space-y-3">
                <HistoryItem date="Today, 10:23 AM" title="Instruction manual for heater" />
                <HistoryItem date="Yesterday" title="Request for leave" />
                <HistoryItem date="Nov 24" title="How to reset password" />
                <HistoryItem date="Nov 20" title="Meeting notes summary" />
             </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {currentTab === 'settings' && (
          <div className="w-full flex flex-col space-y-8">
            <h2 className="text-2xl font-semibold text-gray-800 pl-2">Accessibility Setup</h2>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-2">Vision</h3>
              <SettingsToggle 
                label="Larger Text" 
                value={settings.largerText} 
                onChange={() => toggleSetting('largerText')} 
              />
              <SettingsToggle 
                label="High Contrast" 
                value={settings.highContrast} 
                onChange={() => toggleSetting('highContrast')} 
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-2">Hearing</h3>
              <SettingsToggle 
                label="Text-to-Speech" 
                value={settings.textToSpeech} 
                onChange={() => toggleSetting('textToSpeech')} 
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-2">Motor</h3>
              <SettingsToggle 
                label="Voice Control" 
                value={settings.voiceControl} 
                onChange={() => toggleSetting('voiceControl')} 
              />
            </div>
          </div>
        )}

      </main>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Bottom Input Bar - Only visible on Home */}
      {currentTab === 'home' && ticketState !== 'summary' && ticketState !== 'success' && (
        <div className="fixed bottom-[80px] left-0 right-0 p-4 w-full max-w-lg mx-auto z-20 pointer-events-none">
          
          {/* Specific Flow Chips */}
          <div className="pointer-events-auto flex flex-wrap justify-center gap-2 mb-4 animate-in slide-in-from-bottom-4 duration-300">
            {activeFlow === 'late_to_work' && (
               <>
                 {["10 mins", "30 mins", "1 hour"].map((time) => (
                    <button
                       key={time}
                       onClick={() => {
                           // Just set local state for speed, no AI roundtrip needed for this strict flow
                           setMessages(prev => [...prev, 
                              { role: 'user', content: time },
                              { role: 'assistant', content: "Understood. I have notified your manager." }
                           ]);
                           setSummaryData({ type: 'Late to Work', details: `User is running late. Estimated arrival in ${time}.` });
                           setTicketState('summary');
                       }}
                       className="px-4 py-2 bg-purple-100 text-primary rounded-full font-semibold shadow-sm border border-purple-200 hover:bg-purple-200 active:scale-95 transition-all"
                    >
                       {time}
                    </button>
                 ))}
               </>
            )}

             {activeFlow === 'call_manager' && (
                <button
                    onClick={handleCallManager}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-full font-bold shadow-lg hover:bg-green-600 active:scale-95 transition-all"
                >
                    <Phone className="w-5 h-5 fill-current" />
                    <span>Call Manager</span>
                </button>
            )}
          </div>

          {/* Image Preview Modal / Card */}
          {selectedImage && (
             <div className="pointer-events-auto w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mb-4 animate-in zoom-in duration-300 flex flex-col items-center">
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-4">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                       onClick={cancelUpload}
                       className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                       <X className="w-4 h-4" />
                    </button>
                </div>
                <button 
                   onClick={handleUploadConfirm}
                   className="w-full bg-primary text-white font-semibold py-3 rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                   <Upload className="w-5 h-5" />
                   <span>Upload Doctor's Note</span>
                </button>
             </div>
          )}

          {ticketState === 'decision' ? (
            <div className="pointer-events-auto w-full flex flex-col space-y-3 animate-in slide-in-from-bottom-10 duration-300">
               <button 
                  onClick={() => setTicketState('summary')}
                  className="w-full bg-primary text-white text-lg font-semibold py-3 rounded-2xl shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
               >
                 I am done
               </button>
               <button 
                  onClick={() => setTicketState('chat')}
                  className="w-full bg-white text-primary text-lg font-semibold py-3 rounded-2xl border-2 border-purple-100 hover:bg-purple-50 active:scale-95 transition-all"
               >
                 Ask More Questions
               </button>
            </div>
          ) : (
            <div className="pointer-events-auto relative flex items-center bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 p-2 pl-6">
              
              <input
                type="text"
                placeholder="Ask me about anything"
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-base"
                aria-label="Chat message input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              
              <div className="flex items-center space-x-2">
                {/* File Upload Trigger (Icon in Input Bar) */}
                 <button 
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Upload file"
                  onClick={handleUploadNote}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button 
                  className={`p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-600'}`}
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                  onClick={toggleListening}
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'fill-current' : ''}`} />
                </button>
                
                <button 
                  className="p-3 bg-primary hover:bg-primary/90 text-white rounded-full transition-colors shadow-md active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-5 h-5 fill-current translate-x-[-1px] translate-y-[1px]" />
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center py-3 pt-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-30">
        <button 
          onClick={handleHomeClick}
          className={`flex flex-col items-center space-y-1 w-16 transition-colors ${currentTab === 'home' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          aria-label="Home"
        >
          <Home className="w-7 h-7" />
          <span className="text-xs font-medium">Home</span>
        </button>
        
        <button 
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center space-y-1 w-16 transition-colors ${currentTab === 'history' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          aria-label="History"
        >
          <Clock className="w-7 h-7" />
          <span className="text-xs font-medium">History</span>
        </button>
        
        <button 
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center space-y-1 w-16 transition-colors ${currentTab === 'settings' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          aria-label="Settings"
        >
          <SettingsIcon className="w-7 h-7" />
          <span className="text-xs font-medium">Settings</span>
        </button>
      </nav>

    </div>
  );
}
