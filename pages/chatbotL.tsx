// Chatbot.tsx

import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";

// Interface for chat messages
interface ChatMessage {
  type: "question" | "response";
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
    <button
      onClick={handleRefresh}
      style={{ border: "none", background: "transparent", cursor: "pointer" }}
    >
      <img
        src="/85272_refresh_icon.png"
        alt="Refresh"
        style={{ width: "50px", height: "50px" }} // Adjust the size of the image as needed
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
    backgroundColor: "#C1E3C6",
    borderRadius: "8px",
    padding: "10px",
    margin: "5px 0",
    alignSelf: "flex-end",
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
    this.descriptionL = "";
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY; // Replace with your actual API key
    this.apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent";
  }

  async fetchdescriptionL(): Promise<void> {
    try {
      const response = await fetch("/descriptionL.txt");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.descriptionL = await response.text();
      console.log("descriptionL loaded:", this.descriptionL);
    } catch (err) {
      console.error("Failed to load descriptionL:", err);
    }
  }

  // Helper method to escape special characters
  escapeString(str: string): string {
    return str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  async sendMessage(
    inputText: string,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    const contents = conversationHistory.flatMap((message) => [
      {
        role: message.type === "question" ? "user" : "model",
        parts: [
          {
            text: message.text,
          },
        ],
      },
    ]);

    contents.push({
      role: "user",
      parts: [
        {
          text: inputText,
        },
      ],
    });

    const requestBody = {
      contents: contents,
      systemInstruction: {
        role: "user",
        parts: [
          {
            text: this.descriptionL || "Default system instruction here",
          },
        ],
      },
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      },
    };

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts
      ) {
        throw new Error("Invalid API response structure");
      }

      return data.candidates[0].content.parts
        .map((part: any) => part.text)
        .join(" ");
    } catch (error) {
      console.error("Error:", error);
      return "Error fetching response";
    }
  }
}

// Chatbot component
const ChatbotL: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
    []
  );
  const [chatApp, setChatApp] = useState<ChatApp | null>(null);
  const [lightFlag, setLight] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const processInputs = (input1: string, input2: string): string => {
    // Process the inputs and return the result
    return `First word: ${input1} - Second word: ${input2}`; // Example of combining both inputs
  };

  const [inputValue1, setInputValue1] = useState<string>("");
  const [inputValue2, setInputValue2] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Function to update the height
      const handleResize = () => {
        setHeight(window.innerHeight);
      };

      // Set initial height when the component mounts
      handleResize();

      // Add event listener for resizing
      window.addEventListener("resize", handleResize);

      // Cleanup on unmount
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const app = new ChatApp();
    app.fetchdescriptionL().then(() => {
      setChatApp(app);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue1.trim() !== "" && inputValue2.trim() !== "") {
      // Combine the inputs
      const newInputValue = processInputs(inputValue1, inputValue2);

      // Create the new user message
      const newUserMessage: ChatMessage = {
        type: "question",
        text: newInputValue,
      };
      // Update messages and conversation history before clearing inputs
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setConversationHistory((prevHistory) => [...prevHistory, newUserMessage]);

      // Update typing state
      setIsTyping(true);

      if (chatApp) {
        try {
          const responseText = await chatApp.sendMessage(newInputValue, [
            ...conversationHistory, // Ensure this uses the latest history
            newUserMessage,
          ]);

          // Create the bot response message
          const newBotMessage: ChatMessage = {
            type: "response",
            text: responseText,
          };

          // Update messages with the bot's response
          setMessages((prevMessages) => [...prevMessages, newBotMessage]);

          // Update conversation history with the bot's response
          setConversationHistory((prevHistory) => [
            ...prevHistory,
            newBotMessage,
          ]);

          // Set typing state to false once done
          setIsTyping(false);

          // Handle light mode condition
          if (responseText.includes("🔎")) {
            setLight(true);
          } else {
            setLight(false);
          }

          // Clear both input fields after the message is sent and processed
          setInputValue1(""); // Clear first input
          setInputValue2(""); // Clear second input
        } catch (error) {
          console.error("Error sending message:", error);
          setIsTyping(false);
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
        <div style={{ color: "white", padding: "8px 8px 8px 32px" }}>
          <h1>Related Links</h1>
        </div>
        <a
          href="/chatbotCS"
          style={styles.sidebarLink}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f1f1f1")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#818181")}
        >
          Cybersecurity Website
        </a>
        <a
          href="https://cybercap.qc.ca/"
          style={styles.sidebarLink}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f1f1f1")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#818181")}
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
            <span style={styles.headerLink}>Language Website</span>
            <a href="/commentutiliserL" style={styles.headerLink}>
              How to Use
            </a>
          </h1>
        </div>
        <div
          style={{
            background:
              "linear-gradient(45deg, brown 25%, orange 25%, orange 50%, brown 50%, brown 75%, orange 75%)",
            minHeight: height - 140,
            display: "flex",
            alignItems: "normal",
            justifyContent: "left",
          }}
        >
          <div style={styles.wrapper}>
            <div style={styles.imageContainer}>
              <ImageWithCaption
                imageUrl={"/cuneiform-tablet-assyria-905.jpg"}
                altText={"A clay tablet with cuneiform"}
                caption={
                  "A clay tablet with cuneiform from an Assyrian trading post, c. 1875-1840 BCE. (Los Angeles County Museum of Art, L.A.)"
                }
              />
            </div>
          </div>
          {/* Chatbot on the right */}
          <div style={styles.chatContainer}>
            <div className="App">
              <div style={styles.container}>
                <div style={styles.header}>
                  <span>Chatbot assistant powered language exercise</span>
                </div>
                <div style={styles.messages} id="messages">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      style={
                        msg.type === "question"
                          ? styles.userBubble
                          : {
                              background:
                                "linear-gradient(to bottom, " +
                                (lightFlag ? "#f1f0f0" : "#A6A2A2") +
                                " 0px," +
                                (lightFlag ? "#f1f0f0" : "#A6A2A2") +
                                " 52px, #f1f0f0 56px, #f1f0f0)",
                              borderRadius: "8px",
                              padding: "10px",
                              margin: "5px 0",
                              alignSelf: "flex-start",
                              maxWidth: "80%",
                            }
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
                    value={inputValue1}
                    onChange={(e) => setInputValue1(e.target.value)}
                    placeholder="Word one"
                    onKeyDown={handleKeyPress}
                    style={styles.input}
                  />

                  <input
                    type="text"
                    value={inputValue2}
                    onChange={(e) => setInputValue2(e.target.value)}
                    placeholder="Word two"
                    onKeyDown={handleKeyPress}
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
