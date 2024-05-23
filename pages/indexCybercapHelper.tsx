import React, { useEffect, useState } from 'react';

interface ChatBubble {
  type: 'question' | 'response';
  text: string;
}

class ChatApp {
  apiKey: string;
  apiUrl: string;
  assistantPurpose: string;

  constructor() {
    this.apiKey = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    this.assistantPurpose = "Je suis votre aide Cybercap et je répond à toutes vos questions en lien avec Cybercap.";
  }

  escapeString(str: string): string {
    return str.replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/'/g, "\\'")
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
  }

  async sendMessage(inputText: string, conversationHistory: ChatBubble[]): Promise<string> {
    const escapedPurpose = this.escapeString(this.assistantPurpose);
    const escapedInputText = this.escapeString(inputText);
    const escapedHistory = conversationHistory.map(bubble => ({
      ...bubble,
      text: this.escapeString(bubble.text)
    }));

    const requestBody = {
      contents: [
        { role: "user", parts: [{ text: escapedPurpose }] },
        { role: "model", parts: [{ text: "Je suis votre aide Cybercap et je répond à toutes vos questions en lien avec Cybercap." }] },
        ...escapedHistory.map(bubble => ({
          role: bubble.type === 'question' ? "user" : "model",
          parts: [{ text: bubble.text }]
        })),
        { role: "user", parts: [{ text: escapedInputText }] },
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
      const newUserMessage: ChatBubble = { type: 'question', text: inputValue };

      setMessages((prevMessages) => [...prevMessages, `Utilisateur dit: ${inputValue}`]);
      setConversationHistory((prevHistory) => [...prevHistory, newUserMessage]);

      const responseText = await chatApp.sendMessage(inputValue, [...conversationHistory, newUserMessage]);
      const newBotMessage: ChatBubble = { type: 'response', text: responseText };

      setMessages((prevMessages) => [...prevMessages, `Chatbot dit: ${responseText}`]);
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
