// Chatbot.tsx

// Interface for chat messages
interface ChatMessage {
  type: 'question' | 'response';
  text: string;
}

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
    minHeight: '92.17vh',
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
    <figure style={{ display: 'flex', flexDirection: 'row', alignItems: 'top' }}>
      <img
        src={imageUrl}
        alt={altText}
        title={altText}
        style={{
          width: '100%',
          maxWidth: '600px',
          height: 'auto',
        }}
      />
      <figcaption
        style={{
          textAlign: 'left', // Align text to the left of the caption
          fontFamily: 'Arial, sans-serif',
          maxHeight: 'fit-content',
          fontSize: '16pt',
          marginLeft: '16px', // Space between the image and the caption
          backgroundColor: '#E3D7C1',
          padding: '8px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Optional: soft shadow around the caption
          maxWidth: '400px', // Max width of the caption box
          display: 'block', // Makes sure the caption takes up a block-level width
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

  async fetchDescription(): Promise<void> {
    try {
      const response = await fetch('/descriptionL.txt');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.descriptionL = await response.text();
      console.log('Description loaded:', this.descriptionL);
    } catch (err) {
      console.error('Failed to load description:', err);
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

  return ( <div style={{ backgroundColor: '#E3D7C1', padding: '10px' }}>
    
    <h1>
      <a style={{ color: 'midnightblue', marginRight: '10px' }}>
        Cybersecurity Site
      </a>
      <a href="/chatbotCS" style={{ color: 'midnightblue', marginRight: '10px' }}>
        Back
      </a>
    </h1>
    <div style={styles.bgStyle}>
      <div style={styles.wrapper}>
        
        {/* Image with caption on the left */}
        <div style={styles.imageContainer}>
          <ImageWithCaption 
            imageUrl={'/Question-mark-image-4.webp'} 
            altText={'A question mark'}
            caption={'To use the cybersecurity exercise chatbot, prepare by refreshing your memory on a glossary of cybersecurity terms and test your memory by following the chatbot\'s instructions to complete the cybersecurity exercise. You may also do this preparation by showing intent do so in response to one of the chatbot\'s questions.'} 
          />
        </div>
        </div>
        {/* Chatbot on the right */}
        
      </div>
    </div>
  );
};


export default ChatbotCS;
