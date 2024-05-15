import React, { useState, useEffect } from 'react';

interface ChatBubble {
  type: 'question' | 'response';
  text: string;
}

class ChatApp {
  description: string;
  apiKey: string;
  apiUrl: string;

  constructor() {
    this.description = '';
    this.apiKey = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  async fetchDescription(): Promise<void> {
    try {
      const response = await fetch('/description.txt');
      this.description = await response.text();
    } catch (err) {
      console.error('Failed to load description:', err);
    }
  }

  async sendMessage(inputText: string, conversationHistory: ChatBubble[]): Promise<string> {
    const requestBody = {
      contents: [
        { role: "user", parts: [{ text: this.description }] },
        { role: "model", parts: [{ text: "Je suis votre aide Cybercap et je répond à toutes vos questions en lien avec Cybercap." }] },
        ...conversationHistory.map(bubble => ({
          role: bubble.type === 'question' ? "user" : "model",
          parts: [{ text: bubble.text }]
        })),
        { role: "user", parts: [{ text: inputText }] },
      ]
    };

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      const responseText = data.candidates[0].content.parts.map((part: any) => part.text).join(" ");
      return responseText;
    } catch (error) {
      console.error('Error:', error);
      return "Error fetching response";
    }
  }
}

const Home: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]);
  const [boxHeight, setBoxHeight] = useState<string>('300px');
  const chatApp = new ChatApp();

  useEffect(() => {
    chatApp.fetchDescription().then(() => setDescription(chatApp.description));

    const updateBoxHeight = () => {
      const estimatedOtherElementsHeight = 200;
      const availableHeight = window.innerHeight - estimatedOtherElementsHeight;
      setBoxHeight(`${availableHeight}px`);
    };

    updateBoxHeight();
    window.addEventListener('resize', updateBoxHeight);

    return () => window.removeEventListener('resize', updateBoxHeight);
  }, []);

  const handleSendClick = async () => {
    if (!inputText.trim()) {
      console.log("Can't send an empty message.");
      return;
    }

    const newRequest: ChatBubble = { type: 'question', text: inputText };
    const updatedHistory = [...conversationHistory, newRequest];

    const responseText = await chatApp.sendMessage(inputText, updatedHistory);
    const parsedResponse: ChatBubble = { type: 'response', text: responseText };
    setConversationHistory([...updatedHistory, parsedResponse]);
    setInputText(''); // Clear the input field after sending
  };

  const chatBubbleStyle = (type: 'question' | 'response') => ({
    maxWidth: '80%',
    padding: '10px',
    borderRadius: '20px',
    marginBottom: '10px',
    color: 'white',
    backgroundColor: type === 'question' ? '#90caf9' : '#a5d6a7',
    alignSelf: type === 'question' ? 'flex-start' : 'flex-end',
    wordBreak: 'break-word' as const
  });

  return (
    <div style={{ margin: '20px auto', width: '80%' }}>
      <h1>Aidant Cybercap</h1>
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: boxHeight, overflowY: 'auto', backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        {conversationHistory.map((item, index) => (
          <div key={index} style={chatBubbleStyle(item.type)}>
            <p style={{ color: '#333' }}>{item.text}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
          }
        }}
        placeholder="Votre question"
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button onClick={handleSendClick} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
        Envoyer
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <a href="/CreateAssistant" style={{ padding: '10px', backgroundColor: '#90caf9', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Create New Assistant</a>
        <a href="/" style={{ padding: '10px', backgroundColor: '#90caf9', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>List Assistants</a>
      </div>
    </div>
  );
};

export default Home;
