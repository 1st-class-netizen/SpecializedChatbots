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
    if (typeof window !== "undefined") {
    window.location.reload(); // This refreshes the page
  }
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

// ImageWithCaption Component
const ImageWithCaption: React.FC<ImageWithCaptionProps> = ({
  imageUrl,
  caption,
  altText,
}) => {
  return (
    <figure>
      <img
        src={imageUrl}
        title={altText}
        style={{ width: "100%", maxWidth: "1280px", height: "auto" }}
      />
      <figcaption
        style={{
          textAlign: "center",
          fontStyle: "italic",
          backgroundColor: "white",
          padding: "8px 16px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
          margin: "8px auto 0 auto",
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
};


// Styles Object
const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    display: "flex",
    alignItems: "flex-start",
  },
  imageContainer: {
    flex: 1,
    padding: "4px",
    marginRight: "0px",
  },
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "top",
  },
  container: {
    width: "600px",
    marginTop: "20px",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Arial, sans-serif",
    position: "relative",
  },
  header: {
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#C1E3C6",
    padding: "10px",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    backgroundColor: "#fff",
  },
  typingIndicator: {
    color: "#888",
    fontStyle: "italic",
    margin: "10px 0",
    textAlign: "center",
  },
  inputContainer: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #eee",
    backgroundColor: "#f7f7f7",
  },
  bgStyle: {},
  input: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginRight: "10px",
  },
  button: {
    padding: "8px 15px",
    border: "none",
    backgroundColor: "#4082bf",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
  },
  userBubble: {
    backgroundColor: "#E3D7C1",
    borderRadius: "8px",
    padding: "10px",
    margin: "5px 0",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  botBubble: {
    backgroundColor: "#f1f0f0",
    borderRadius: "8px",
    padding: "10px",
    margin: "5px 0",
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  sidebarLink: {
    padding: "8px 8px 8px 32px",
    textDecoration: "none",
    fontSize: "25px",
    color: "#818181",
    display: "block",
    transition: "0.3s",
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "25px",
    fontSize: "36px",
    marginLeft: "50px",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  hamburgerBtn: {
    fontSize: "30px",
    cursor: "pointer",
    background: "none",
    border: "none",
    color: "#fff",
    padding: "10px",
  },
  headerWithMenu: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#C1E3C6",
    position: "relative",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "left",
  },
  headerLink: {
    color: "darkred",
    marginLeft: "20px",
  },
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
        .join(" ");
    } catch (error) {
      console.error('Error:', error);
      return 'Error fetching response';
    }
  }
}

// Chatbot component
const ChatbotL: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
    []
  );
  const [chatApp, setChatApp] = useState<ChatApp | null>(null);
  const [pageRefresh, setPageRefresh] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialHeight =
  typeof window !== "undefined" ? window.innerHeight : 940; // fallback if SSR
const [height, setHeight] = useState<number>(initialHeight);

useEffect(() => {
  if (typeof window !== "undefined") {
    const handleResize = () => {
      setHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }
}, []);

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

  useEffect(() => {
    if (pageRefresh && typeof window !== "undefined") {
      window.location.reload();
    }
  }, [pageRefresh]);


  const handleSendMessage = async () => {
    if (inputValue.trim() !== "") {
      const newUserMessage: ChatMessage = {
        type: "question",
        text: inputValue,
      };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setConversationHistory((prevHistory) => [...prevHistory, newUserMessage]);
      setInputValue("");

      if (chatApp) {
        setIsTyping(true);
        const responseText = await chatApp.sendMessage(inputValue, [
          ...conversationHistory,
          newUserMessage,
        ]);
        const newBotMessage: ChatMessage = {
          type: "response",
          text: responseText,
        };
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

  return (
    <div
      style={{
        backgroundColor: "#C1E3C6",
      }}
      >
        {/* Sidebar */}
      <div
        style={{
          height: height - 60,
          width: sidebarOpen ? "250px" : "0",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "#111",
          overflowX: "hidden",
          transition: "0.5s",
          paddingTop: "60px",
          zIndex: 1000,
          flexDirection: "column",
          display: "flex",
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
        <div
          style={{
            color: "white",
            padding: "8px 8px 8px 32px",
            marginTop: "auto",
          }}
        >
          <h3>By Sam</h3>
        </div>
      </div>
      {/* Main Content */}
      <div
        id="main"
        style={{
          transition: "margin-left 0.5s",
          marginLeft: sidebarOpen ? "250px" : "0",
        }}
      >
        <div style={styles.headerWithMenu}>
          <button style={styles.hamburgerBtn} onClick={toggleSidebar}>
            &#9776;
          </button>
        </div>
        <div style={styles.headerTitle}>
          <h1>
            <span style={styles.headerLink}>Language Site</span>
            <a href="/commentutiliserL" style={styles.headerLink}>
              How to use
            </a>
          </h1>
        </div>
    <div
  style={{
    background: 'linear-gradient(45deg, brown 25%, orange 25%, orange 50%, brown 50%, brown 75%, orange 75%)',
    minHeight: height-140,
    display: 'flex',
    alignItems: 'normal',
    justifyContent: 'left',
  }}
>
      <div style={styles.wrapper}>
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
                      style={
                        msg.type === "question"
                          ? styles.userBubble
                          : styles.botBubble
                      }
                      dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                  {isTyping && (
                    <div style={styles.typingIndicator}>
                      Assistant is typing...
                    </div>
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
      </div>{" "}
    </div>
  );
};



export default ChatbotL;
