import React, { useEffect, useState } from 'react';

class Chatbot {
  username: string;
  message: string;

  constructor(username: string, message: string) {
    this.username = username;
    this.message = message;
  }

  static randomResponse(): string {
    const responses = [
      'Bonjour! Comment puis-je vous aider aujourd\'hui?',
      'Bien sûr, je peux vous aider avec ça.',
      'Merci de votre question, je vais vérifier cela.',
      'Au revoir! Passez une excellente journée!'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  printMessage(): string {
    return `${this.username} dit: ${this.message}`;
  }
}

interface ChatBubble {
  type: 'question' | 'response';
  text: string;
}

class ChatApp {
  apiKey: string;
  apiUrl: string;

  constructor() {
    this.apiKey = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  }

  async sendMessage(inputText: string, conversationHistory: ChatBubble[]): Promise<string> {
    const requestBody = {
      contents: [
        ...conversationHistory.map(bubble => ({
          role: bubble.type === 'question' ? 'user' : 'model',
          parts: [{ text: bubble.text }]
        })),
        { role: 'user', parts: [{ text: inputText }] },
      ]
    };

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API response:', data);

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

const Example: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]);
  const chatApp = new ChatApp();

  useEffect(() => {
    const messageList = document.createElement('ul');

    messages.forEach((msg) => {
      const messageItem = document.createElement('li');
      messageItem.textContent = msg;
      messageList.appendChild(messageItem);
    });

    document.getElementById('messages')?.appendChild(messageList);

    return () => {
      document.getElementById('messages')?.removeChild(messageList);
    };
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      const userMessage = new Chatbot('Utilisateur', inputValue);
      const newUserMessage: ChatBubble = { type: 'question', text: inputValue };

      setMessages((prevMessages) => [...prevMessages, userMessage.printMessage()]);
      setConversationHistory((prevHistory) => [...prevHistory, newUserMessage]);

      const responseText = await chatApp.sendMessage(inputValue, [...conversationHistory, newUserMessage]);
      const botMessage = new Chatbot('Chatbot', responseText);
      const newBotMessage: ChatBubble = { type: 'response', text: responseText };

      setMessages((prevMessages) => [...prevMessages, botMessage.printMessage()]);
      setConversationHistory((prevHistory) => [...prevHistory, newBotMessage]);

      setInputValue('');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Entrez votre message ici"
      />
      <button onClick={handleSendMessage}>Envoyer</button>
      <div id="messages"></div>
    </div>
  );
};

export default Example;
