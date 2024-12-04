// Chatbot.tsx

import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';

// Interface for chat messages
interface ChatMessage {
  type: 'question' | 'response';
  text: string;
}

interface ImageWithCaptionProps {
  imageUrl: string;
  caption: string;
  altText: string;
}

const RefreshButton: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload(); // This refreshes the page
  };

  return (
    <button onClick={handleRefresh} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
      <img 
        src="/85272_refresh_icon.png" 
        alt="Refresh" 
        style={{ width: '50px', height: '50px' }} // Adjust the size of the image as needed
      />
    </button>
  );
};

const ImageWithCaption: React.FC<ImageWithCaptionProps> = ({ imageUrl, caption, altText }) => {
  return (
    <figure>
      <img src={imageUrl} title={altText} style={{ width: '100%', maxWidth: '889px', height: 'auto' }} />
      <figcaption 
        style={{
          textAlign: 'center', 
          fontStyle: 'italic', 
          backgroundColor: 'white', // White background behind the text
          padding: '8px 16px', // Padding around the caption text
          borderRadius: '8px', // Rounded corners
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Optional: soft shadow around the "card"
          maxWidth: '500px', // Match the image width
          margin: '8px auto 0 auto', // Centers the figcaption
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  imageContainer: {
    flex: 1,
    padding: '4px',
    marginRight: '0px', // Space between the image and chatbot
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'top',
  },
  container: {
    width: '600px',
    marginTop: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
  },
  header: {
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#E3D7C1',
    padding: '10px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    backgroundColor: '#fff',
  },
  typingIndicator: {
    color: '#888',
    fontStyle: 'italic',
    margin: '10px 0',
    textAlign: 'center',
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #eee',
    backgroundColor: '#f7f7f7',
  },
  bgStyle: {
    minHeight: '90vh',
    display: 'flex',
    background: 'linear-gradient(90deg, #9e9e9e 25%, #b0b0b0 25%, #b0b0b0 50%, #9e9e9e 50%, #9e9e9e 75%, #b0b0b0 75%)',
    backgroundSize: '30% 100%', // Adjust size of gradient
  },
  input: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '10px',
  },
  button: {
    padding: '8px 15px',
    border: 'none',
    backgroundColor: '#4082bf',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  userBubble: {
    backgroundColor: '#E3D7C1',
    borderRadius: '8px',
    padding: '10px',
    margin: '5px 0',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  botBubble: {
    backgroundColor: '#f1f0f0',
    borderRadius: '8px',
    padding: '10px',
    margin: '5px 0',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
};

// Chat application logic
class ChatApp {
  descriptionL: string;
  apiKey: string;
  apiUrl: string;

  constructor() {
    this.descriptionL = '';
    this.apiKey = 'AIzaSyDZRyPcXJv2Rsc41NxK2VDzATuiAnIht-U'; // Replace with your actual API key
    this.apiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent';
  }

  async fetchdescriptionL(): Promise<void> {
    try {
      const response = await fetch('/descriptionCS.txt');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.descriptionL = await response.text();
      console.log('descriptionL loaded:', this.descriptionL);
    } catch (err) {
      console.error('Failed to load descriptionL:', err);
    }
  }

  // Helper method to escape special characters
  escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  async sendMessage(
    inputText: string,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    const contents = conversationHistory.flatMap((message) => [
      {
        role: message.type === 'question' ? 'user' : 'model',
        parts: [
          {
            text: message.text,
          },
        ],
      },
    ]);

    contents.push({
      role: 'user',
      parts: [
        {
          text: inputText,
        },
      ],
    });
    const requestBody = {
      contents: contents,
      systemInstruction: {
        role: 'user',
        parts: [
          {
            text: this.descriptionL || 'Default system instruction here',
          },
        ],
      },
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
      },
    };

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts
      ) {
        throw new Error('Invalid API response structure');
      }

      return data.candidates[0].content.parts
        .map((part: any) => part.text)
        .join(' ');
    } catch (error) {
      console.error('Error:', error);
      return 'Error fetching response';
    }
  }
}

// Chatbot component
const ChatbotCS: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [chatApp, setChatApp] = useState<ChatApp | null>(null);
  const [pageRefresh, setPageRefresh] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new ChatApp();
    app.fetchdescriptionL().then(() => {
      setChatApp(app);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (pageRefresh) {
      window.location.reload();
    }
  }, [pageRefresh]);

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      const newUserMessage: ChatMessage = { type: 'question', text: inputValue };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setConversationHistory((prevHistory) => [...prevHistory, newUserMessage]);
      setInputValue('');

      if (chatApp) {
        setIsTyping(true);
        const responseText = await chatApp.sendMessage(
          inputValue,
          [...conversationHistory, newUserMessage]
        );
        const newBotMessage: ChatMessage = { type: 'response', text: responseText };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
        setConversationHistory((prevHistory) => [
          ...prevHistory,
          newBotMessage,
        ]);
        setIsTyping(false);

        if (responseText.includes("ZXC")) {
          setPageRefresh(true);
        } else {
          setPageRefresh(false);
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMarkdown = (text: string) => {
    const html = marked(text);
    return { __html: html };
  };

  return (
    <div style={{ backgroundColor: '#E3D7C1', padding: '10px' }}>
      <h1>
        <a style={{ color: 'midnightblue', marginRight: '10px' }}>
          Cybersecurity Site
        </a>
        <a href="/commentutiliserCS" style={{ color: 'midnightblue', marginRight: '10px' }}>
          How to use
        </a>
      </h1>
      <div style={styles.bgStyle}>
        {/* Repeat `@` symbols in 3 columns */}
        <div style={styles.wrapper}>
          {/* Image with caption on the left */}
          <div style={styles.imageContainer}>
            <ImageWithCaption 
              imageUrl={'/kali-desktop-xfce.jpg'} 
              altText={'Xfce is a lightweight desktop environment for UNIX-like operating systems. It aims to be fast and low on system resources, while still being visually appealing and user friendly.'}
              caption={'Xfce consists of separately packaged parts that together provide all functions of the desktop environment, but can be selected in subsets to suit user needs and preferences. This is Kali\'s default desktop environment. (kali.org)'} 
            />
          </div>
        </div>
        {/* Chatbot on the right */}
        <div style={styles.chatContainer}>
          <div className="App">
            <div style={styles.container}>
              <div style={styles.header}>
                <span>Cybersecurity Exercise Chatbot Assistant</span>
              </div>
              <div style={styles.messages} id="messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={msg.type === 'question' ? styles.userBubble : styles.botBubble}
                    dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                  />
                ))}
                <div ref={messagesEndRef} />
                {isTyping && (
                  <div style={styles.typingIndicator}>Assistant is typing...</div>
                )}
              </div>
              <div style={styles.inputContainer}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here"
                  style={styles.input}
                />
                <button onClick={handleSendMessage} style={styles.button}>
                  Send
                </button>
                <RefreshButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotCS;
