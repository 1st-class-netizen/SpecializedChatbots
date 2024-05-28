import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';

// Interface qui définit la structure des messages du chat
interface ChatBubble {
  type: 'question' | 'response'; // Le type peut être une question ou une réponse
  text: string; // Le texte du message
}

// Classe qui gère la logique du chatbot et la communication avec l'API Gemini 1.5 Flash
class ChatApp {
  description: string;
  apiKey: string; // Clé API pour authentifier les requêtes
  apiUrl: string; // URL de l'API Gemini 1.5 Flash
  generationConfig: any; // Configuration pour la génération de contenu
  safetySettings: any[]; // Paramètres de sécurité

  constructor() {
    this.description = '';
    this.apiKey = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    this.generationConfig = {
      temperature: 0.1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    this.safetySettings = [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
      },
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
      console.log('Description loaded:', this.description); // Log to confirm the content
    } catch (err) {
      console.error('Failed to load description:', err);
    }
  }

  // Méthode pour échapper les caractères spéciaux dans une chaîne de caractères
  escapeString(str: string): string {
    return str.replace(/\\/g, '\\\\') // Échappe les antislash
              .replace(/"/g, '\\"') // Échappe les guillemets doubles
              .replace(/'/g, "\\'") // Échappe les guillemets simples
              .replace(/\n/g, '\\n') // Échappe les nouvelles lignes
              .replace(/\r/g, '\\r') // Échappe les retours chariot
              .replace(/\t/g, '\\t'); // Échappe les tabulations
  }

  // Méthode asynchrone pour envoyer un message à l'API et obtenir une réponse
  async sendMessage(inputText: string, conversationHistory: ChatBubble[]): Promise<string> {
    const escapedDescription = this.escapeString(this.description);
    const escapedInputText = this.escapeString(inputText);
    const escapedHistory = conversationHistory.map(bubble => ({
      ...bubble,
      text: this.escapeString(bubble.text)
    }));

    // Prépare le corps de la requête
    const requestBody = {
      contents: [
        { role: "user", parts: [{ text: escapedDescription + " Je réponds avec une courte description, réponse très simple et courte seulement." }] },
        { role: "model", parts: [{ text: "Je réponds en une phrase seulement avec une courte description, mes réponses sont très courtes et simples." }] },
        ...escapedHistory.map(bubble => ({
          role: bubble.type === 'question' ? "user" : "model",
          parts: [{ text: bubble.text }]
        })),
        { role: "user", parts: [{ text: escapedInputText }] },
      ],
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
    };

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API response:', data); // Affiche la réponse de l'API dans la console

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }

      const responseText = data.candidates[0].content.parts.map((part: any) => part.text).join(' ');
      return responseText;
    } catch (error) {
      console.error('Error:', error);
      return 'Error fetching response';
    }
  }
}

// Composant React qui gère l'interface utilisateur du chatbot
const ChatBotSimpleApi: React.FC = () => {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]);
  const [chatApp, setChatApp] = useState<ChatApp | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new ChatApp();
    app.fetchDescription().then(() => {
      setChatApp(app);
    });
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
        const responseText = await chatApp.sendMessage(inputValue, [...conversationHistory, newUserMessage]);
        const newBotMessage: ChatBubble = { type: 'response', text: responseText };

        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
        setConversationHistory((prevHistory) => [...prevHistory, newBotMessage]);
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
    if (container) {
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = container.offsetWidth;
      const startHeight = container.offsetHeight;

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = startWidth - (e.clientX - startX);
        const newHeight = startHeight - (e.clientY - startY);
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

  return (
    <div ref={containerRef} style={styles.container} onMouseDown={handleMouseDown}>
      <div style={styles.header}>Assistant Cybercap</div>
      <div style={styles.messages} id="messages">
        {messages.map((msg, index) => (
          <div key={index} style={msg.type === 'question' ? styles.userBubble : styles.botBubble} dangerouslySetInnerHTML={renderMarkdown(msg.text)} />
        ))}
        <div ref={messagesEndRef} />
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
        <button onClick={handleSendMessage} style={styles.button}>Envoyer</button>
      </div>
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
    resize: 'both',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
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
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '0 4px 4px 0',
    cursor: 'pointer',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  userBubble: {
    backgroundColor: '#e1ffc7',
    borderRadius: '10px',
    padding: '2px 5px',
    margin: '2px 0',
    alignSelf: 'flex-end',
    maxWidth: '80%',
    textAlign: 'right',
  },
  botBubble: {
    backgroundColor: '#f1f0f0',
    borderRadius: '10px',
    padding: '2px 5px',
    margin: '2px 0',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
};

export default ChatBotSimpleApi;
