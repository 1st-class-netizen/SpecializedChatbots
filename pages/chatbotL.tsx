// Chatbot.tsx

import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';

// Interface for chat messages
interface ChatMessage {
  type: 'question' | 'response';
  text: string;
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

interface ImageWithCaptionProps {
  imageUrl: string;
  caption: string;
  altText: string;
}
const ImageWithCaption: React.FC<ImageWithCaptionProps> = ({ imageUrl, caption, altText }) => {
  return (
    <figure>
      <img src={imageUrl} title={altText} style={{ width: '100%', maxWidth: '600px', height: 'auto' }} />
      <figcaption 
        style={{
          textAlign: 'center', 
          fontStyle: 'italic', 
          backgroundColor: 'white', // White background behind the text
          padding: '8px 16px', // Padding around the caption text
          borderRadius: '8px', // Rounded corners
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Optional: soft shadow around the "card"
          maxWidth: '300px', // Match the image width
          margin: '8px auto 0 auto', // Centers the figcaption
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
};

// Chat application logic
class ChatApp {
  descriptionL: string;
  apiKey: string;
  apiUrl: string;

  constructor() {
    this.descriptionL = '';
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY; // Replace with your actual API key
    this.apiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent';
  }

  async fetchdescriptionL(): Promise<void> {
    try {
      const response = await fetch('/descriptionL.txt');
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
const ChatbotL: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [chatApp, setChatApp] = useState<ChatApp | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const app = new ChatApp();
    app.fetchdescriptionL().then(() => {
      setChatApp(app);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  const renderMarkdown = (text: string) => {
    const html = marked(text);
    return { __html: html };
  };

  return (<div style={{ backgroundColor: '#C1E3C6', padding: '10px' }}>

    {/* Sidebar */}
    <div
        style={{
          ...styles.sidebar,
          width: sidebarOpen ? '250px' : '0',
        }}
      >
        <button style={styles.closeBtn} onClick={closeSidebar}>
          &times;
        </button>
        <div style={{ color: 'white', padding: '8px 8px 8px 32px' }}  >
        <h1>Related Links</h1>
          </div>
        <a 
          href="/chatbotCS" 
          style={styles.sidebarLink} 
          onMouseOver={(e) => (e.currentTarget.style.color = '#f1f1f1')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#818181')}
        >
          Cybersecurity Site
        </a>
        <a 
          href="https://cybercap.qc.ca/" 
          style={styles.sidebarLink} 
          onMouseOver={(e) => (e.currentTarget.style.color = '#f1f1f1')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#818181')}
        >
          CyberCap
        </a>
      </div>

      {/* Main Content */}
      <div id="main" style={{ transition: 'margin-left 0.5s', marginLeft: sidebarOpen ? '250px' : '0' }}>
        {/* Header with Hamburger Menu */}
        <div style={styles.headerWithMenu}>
          <button style={styles.hamburgerBtn} onClick={toggleSidebar}>
            &#9776;
          </button>
        </div>
    <h1>
            <span style={styles.headerLink}>Language Site</span>
            <a href="/commentutiliserL" style={styles.headerLink}>
              How to use
            </a>
    </h1>
    <div
  style={{
    background: 'linear-gradient(45deg, brown 25%, orange 25%, orange 50%, brown 50%, brown 75%, orange 75%)',
    minHeight: '85.87vh',
    display: 'flex',
    alignItems: 'normal',
    justifyContent: 'left',
  }}
>
      <div style={styles.wrapper}>
        
        {/* Image with caption on the left */}
        <div style={styles.imageContainer}>
          <ImageWithCaption 
            imageUrl={'/cuneiform-tablet-assyria-905.jpg'} 
            altText={'A clay tablet with cuneiform'}
            caption={'A clay tablet with cuneiform from an Assyrian trading post, c. 1875-1840 BCE. (Los Angeles County Museum of Art, L.A.)'} 
          />
        </div>
        </div>
        {/* Chatbot on the right */}
        <div style={styles.chatContainer}>
          
          <div className="App">
            <div style={styles.container}>
              <div style={styles.header}>
                <span>Language Exercise Chatbot Assistant</span>
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
  </div>
  );
};
// Styles Object
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
    backgroundColor: '#C1E3C6',
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
    minHeight: '80vh',
    display: 'flex',
    background: 'linear-gradient(90deg, #9e9e9e 25%, #b0b0b0 25%, #b0b0b0 50%, #9e9e9e 50%, #9e9e9e 75%, #b0b0b0 75%)',
    backgroundSize: '30%', // Adjust size of gradient
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
    backgroundColor: '#C1E3C6',
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
  // New styles for the sidebar and hamburger menu
  sidebar: {
    height: '100%', 
    width: '0', // Initial width is 0
    position: 'fixed', 
    top: 0, 
    left: 0, 
    backgroundColor: '#111', 
    overflowX: 'hidden', 
    transition: '0.5s', 
    paddingTop: '60px',
    zIndex: 1000,
  },
  sidebarLink: {
    padding: '8px 8px 8px 32px',
    textDecoration: 'none',
    fontSize: '25px',
    color: '#818181',
    display: 'block',
    transition: '0.3s',
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '25px',
    fontSize: '36px',
    marginLeft: '50px',
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  hamburgerBtn: {
    fontSize: '30px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#fff',
    padding: '10px',
  },
  headerWithMenu: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#C1E3C6',
    padding: '10px',
    position: 'relative',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
  },
  headerLink: {
    color: 'darkred',
    marginLeft: '20px',
  },
};


export default ChatbotL;
