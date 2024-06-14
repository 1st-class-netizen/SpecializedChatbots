import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';

interface ChatBubble {
  type: 'question' | 'response';
  text: string;
}

class ChatApp {
  description: string;
  apiKeyGemini: string;
  apiKeyGPT4o: string;
  apiUrlGemini: string;
  apiUrlGPT4o: string;
  generationConfig: any;
  safetySettings: any[];

  constructor() {
    this.description = '';
    this.apiKeyGemini = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U';
    this.apiKeyGPT4o = '';
    this.apiUrlGemini = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';
    this.apiUrlGPT4o = 'https://api.openai.com/v1/chat/completions';
    this.generationConfig = {
      temperature: 0.1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    this.safetySettings = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ];
  }

  async fetchDescription(): Promise<void> {
    try {
      const response = await fetch('/description.txt');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      this.description = text;
      console.log('Description loaded:', this.description);
    } catch (err) {
      console.error('Failed to load description:', err);
    }
  }

  escapeString(str: string): string {
    return str.replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/'/g, "\\'")
              .replace(/\n/g, '')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
  }


  async sendMessage(inputText: string, conversationHistory: ChatBubble[], isUsingGPT4o: boolean): Promise<string> {
    const escapedDescription = this.escapeString(this.description);
    const escapedInputText = this.escapeString(inputText);
    const escapedHistory = conversationHistory.map(bubble => ({
      ...bubble,
      text: this.escapeString(bubble.text)
    }));

    function formatDate(dateString: string): string {
      const months = [
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
      ];
    
      const [year, month, day] = dateString.split('-');
    
      const dayNumber = parseInt(day, 10);
      const monthName = months[parseInt(month, 10) - 1];
    
      return `${dayNumber} ${monthName} ${year}`;
    }
    
    const historyGemini = [
      {
        role: "user",
        parts: [
          { text: "quel est le dernier évènement de mai" },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "Le dernier évènement de mai était l'AGA Startop : Initiation à la gouvernance, le 17 mai 2024." },
        ],
      },
      {
        role: "user",
        parts: [
          { text: "Je crois qu'il y a une erreur dans ta logique" },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "Peux-tu me dire quelle erreur tu penses que j'ai faite ? Je ferai de mon mieux pour comprendre et corriger mon erreur. 😊" },
        ],
      },
      {
        role: "user",
        parts: [
          { text: "l'évènement dans le mois de mai, ce n'est pas le dernier" },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "Tu as raison! L'évènement du 24 mai est après celui du 17 mai. Je m'excuse pour cette erreur. Que veux-tu savoir à propos de l'évènement du 24 mai ? 😊" },
        ],
      },
      {
        role: "user",
        parts: [
          { text: "Quel date sommes-nous ?" },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "Aujourd'hui, nous sommes le " + formatDate(new Date().toLocaleDateString()) + "." },
        ],
      },
    ];

    const requestBodyGemini = {
      contents: [
        ...historyGemini,
        { role: "user", parts: [{ text: escapedDescription + " Je réponds avec une courte description, réponse très simple et courte seulement. Current date: Date actuelle: " + formatDate(new Date().toLocaleDateString()) }] },
        { role: "model", parts: [{ text: "Je réponds en une phrase seulement avec une courte description, mes réponses sont très courtes et simples. Current date: Date actuelle: " + formatDate(new Date().toLocaleDateString()) }] },
        ...escapedHistory.map(bubble => ({
          role: bubble.type === 'question' ? "user" : "model",
          parts: [{ text: bubble.text }]
        })),
        { role: "user", parts: [{ text: escapedInputText }] },
      ],
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
    };

    const requestBodyGPT4o = {
      model: 'gpt-4o',
      messages: [
        { role: "system", content: escapedDescription + " Je réponds avec une courte description, réponse très simple et courte seulement. Current date: Date actuelle: " + new Date().toLocaleDateString() },
        { role: "assistant", content: "Je réponds en une phrase seulement avec une courte description, mes réponses sont très courtes et simples. Current date: Date actuelle: " + new Date().toLocaleDateString() },
        ...escapedHistory.map(bubble => ({
          role: bubble.type === 'question' ? "user" : "assistant",
          content: bubble.text
        })),
        { role: "user", content: escapedInputText },
      ],
      temperature: this.generationConfig.temperature,
      max_tokens: 4095,
      top_p: this.generationConfig.topP,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    try {
      const response = await fetch(isUsingGPT4o ? this.apiUrlGPT4o : `${this.apiUrlGemini}?key=${this.apiKeyGemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': isUsingGPT4o ? `Bearer ${this.apiKeyGPT4o}` : '' },
        body: JSON.stringify(isUsingGPT4o ? requestBodyGPT4o : requestBodyGemini)
      });

      const data = await response.json();
      console.log('API response:', data);

      if (isUsingGPT4o) {
        if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
          throw new Error('Invalid API response structure');
        }
        return data.choices[0].message.content;
      } else {
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Invalid API response structure');
        }
        return data.candidates[0].content.parts.map((part: any) => part.text).join(' ');
      }
    } catch (error) {
      console.error('Error:', error);
      return 'Error fetching response';
    }
  }
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]);
  const [chatApp, setChatApp] = useState<ChatApp | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isUsingGPT4o, setIsUsingGPT4o] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new ChatApp();
    app.fetchDescription().then(() => {
      setChatApp(app);
    });

    document.body.style.backgroundImage = 'url(/background.jpg)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.height = '100vh';
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'Arial, sans-serif';

    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.height = '';
      document.body.style.margin = '';
      document.body.style.fontFamily = '';
    };
  }, []);

  useEffect(() => {
    const messagesDiv = document.getElementById('messages');
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      const newUserMessage: ChatBubble = { type: 'question', text: inputValue };

      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setConversationHistory((prevHistory) => [...prevHistory, newUserMessage]);

      setInputValue('');

      if (chatApp) {
        setIsTyping(true);
        const responseText = await chatApp.sendMessage(inputValue, [...conversationHistory, newUserMessage], isUsingGPT4o);
        const newBotMessage: ChatBubble = { type: 'response', text: responseText };

        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
        setConversationHistory((prevHistory) => [...prevHistory, newBotMessage]);
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setInputValue(inputValue + '\n');
    }
  };

  const renderMarkdown = (text: string) => {
    const formattedText = text.replace(/(\n|^)(\* )/g, '$1\n$2');
    const html = marked(formattedText);
    return { __html: html };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    const resizeHandle = resizeHandleRef.current;
    if (container && resizeHandle && e.target === resizeHandle) {
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = container.offsetWidth;
      const startHeight = container.offsetHeight;

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = startWidth + (startX - e.clientX);
        const newHeight = startHeight + (startY - e.clientY);
        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div ref={containerRef} style={{ ...styles.container, ...(isMinimized ? styles.containerMinimized : {}) }}>
      <div ref={resizeHandleRef} style={styles.resizeHandle} onMouseDown={handleMouseDown}></div>
      <div style={styles.header}>
        <span>Assistant Cybersécurité</span>
        <button onClick={handleMinimize} style={styles.minimizeButton}>{isMinimized ? '🔍' : '➖'}</button>
      </div>
      {!isMinimized && (
        <>
          <div style={styles.messages} id="messages">
            {messages.map((msg, index) => (
              <div key={index} style={msg.type === 'question' ? styles.userBubble : styles.botBubble} dangerouslySetInnerHTML={renderMarkdown(msg.text)} />
            ))}
            <div ref={messagesEndRef} />
            {isTyping && <div style={styles.typingIndicator}>L'assistant est en train d'écrire...</div>}
          </div>
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Entrez votre message ici"
              style={styles.input}
            />
            <button onClick={handleSendMessage} style={styles.button}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div style={styles.switchContainer}>
            <label>
              <input
                type="checkbox"
                checked={isUsingGPT4o}
                onChange={() => setIsUsingGPT4o(!isUsingGPT4o)}
              />
              Use GPT-4o
            </label>
          </div>
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '475px',
    height: '647px',
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    padding: '10px',
    zIndex: 1000,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  containerMinimized: {
    width: '200px',
    height: '40px',
    overflow: 'hidden',
  },
  header: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#FFFFFF',
    backgroundColor: '#005B96',
    padding: '10px',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minimizeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: '20px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  typingIndicator: {
    color: '#666',
    fontStyle: 'italic',
    margin: '10px 0',
    textAlign: 'center',
  },
  inputContainer: {
    display: 'flex',
    marginTop: 'auto',
  },
  input: {
    flex: 1,
    padding: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px 0 0 4px',
  },
  button: {
    padding: '5px 10px',
    border: 'none',
    backgroundColor: '#FF6F61',
    color: 'white',
    borderRadius: '0 4px 4px 0',
    cursor: 'pointer',
  },
  buttonHover: {
    backgroundColor: '#E65B53',
  },
  userBubble: {
    backgroundColor: '#e1ffc7',
    borderRadius: '10px',
    padding: '2px 5px',
    margin: '2px 0',
    alignSelf: 'flex-end',
    maxWidth: '80%',
    textAlign: 'right',
    color: '#005B96',
  },
  botBubble: {
    backgroundColor: '#f1f0f0',
    borderRadius: '10px',
    padding: '2px 5px',
    margin: '2px 0',
    alignSelf: 'flex-start',
    maxWidth: '80%',
    color: '#005B96',
  },
  resizeHandle: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '10px',
    height: '10px',
    backgroundColor: '#FFFFFF',
    cursor: 'nwse-resize',
    zIndex: 1001,
    borderTopLeftRadius: '8px',
  },
  switchContainer: {
    marginTop: '10px',
    textAlign: 'center',
  }
};

export default Chatbot;
