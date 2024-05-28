import React, { useEffect, useRef, useState } from 'react'; // Importation des hooks React
import { marked } from 'marked'; // Importation du parser Markdown

// Interface qui définit la structure des messages du chat
interface ChatBubble {
  type: 'question' | 'response'; // Le type peut être une question ou une réponse
  text: string; // Le texte du message
}

// Classe qui gère la logique du chatbot et la communication avec l'API Gemini 1.5 Flash
class ChatApp {
  apiKey: string; // Clé API pour authentifier les requêtes
  apiUrl: string; // URL de l'API Gemini 1.5 Flash
  assistantPurpose: string; // But de l'assistant

  constructor() {
    // Initialisation de la clé API
    this.apiKey = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U'; // Utilise la clé API à partir des variables d'environnement
    // Initialisation de l'URL de l'API
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    // Définition du but de l'assistant
    this.assistantPurpose = "Je suis votre aide Cybercap et je répond à toutes vos questions en lien avec Cybercap.";
  }

  // Méthode pour échapper les caractères spéciaux dans une chaîne de caractères
  escapeString(str: string): string {
    // Remplacement des caractères spéciaux par leurs équivalents échappés
    return str.replace(/\\/g, '\\\\') // Échappe les antislash
              .replace(/"/g, '\\"') // Échappe les guillemets doubles
              .replace(/'/g, "\\'"); // Échappe les guillemets simples
  }

  // Méthode asynchrone pour envoyer un message à l'API et obtenir une réponse
  async sendMessage(inputText: string, conversationHistory: ChatBubble[]): Promise<string> {
    // Échappe les chaînes de caractères pour éviter les erreurs
    const escapedPurpose = this.escapeString(this.assistantPurpose);
    const escapedInputText = this.escapeString(inputText);
    const escapedHistory = conversationHistory.map(bubble => ({
      ...bubble, // Copie toutes les propriétés de l'objet bubble
      text: this.escapeString(bubble.text) // Échappe le texte du message
    }));

    // Prépare le corps de la requête
    const requestBody = {
      contents: [
        { role: "user", parts: [{ text: escapedPurpose }] }, // Ajoute le but de l'assistant comme message utilisateur
        { role: "model", parts: [{ text: "Je suis votre aide Cybercap et je répond à toutes vos questions en lien avec Cybercap." }] }, // Réponse initiale du modèle
        ...escapedHistory.map(bubble => ({
          role: bubble.type === 'question' ? "user" : "model", // Définit le rôle en fonction du type de message
          parts: [{ text: bubble.text }] // Ajoute le texte du message
        })),
        { role: "user", parts: [{ text: escapedInputText }] }, // Ajoute le message utilisateur
      ]
    };

    try {
      // Envoie la requête à l'API
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST', // Utilise la méthode POST
        headers: { 'Content-Type': 'application/json' }, // Définit le type de contenu comme JSON
        body: JSON.stringify(requestBody) // Convertit le corps de la requête en JSON
      });

      // Récupère les données de la réponse
      const data = await response.json();
      console.log('API response:', data); // Affiche la réponse de l'API dans la console

      // Vérifie la structure de la réponse
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure'); // Lance une erreur si la structure de la réponse est invalide
      }

      // Extrait le texte de la réponse
      const responseText = data.candidates[0].content.parts.map((part: any) => part.text).join(' ');
      return responseText; // Retourne le texte de la réponse
    } catch (error) {
      console.error('Error:', error); // Affiche l'erreur dans la console
      return 'Error fetching response'; // Retourne un message d'erreur
    }
  }
}

// Composant React qui gère l'interface utilisateur du chatbot
const ChatBotSimpleApi: React.FC = () => {
  const [messages, setMessages] = useState<ChatBubble[]>([]); // État pour stocker les messages du chat
  const [inputValue, setInputValue] = useState<string>(''); // État pour stocker la valeur de l'input utilisateur
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]); // État pour stocker l'historique de la conversation
  const chatApp = new ChatApp(); // Instance de la classe ChatApp
  const messagesEndRef = useRef<HTMLDivElement>(null); // Référence pour l'élément de fin de messages
  const containerRef = useRef<HTMLDivElement>(null); // Référence pour le conteneur du chatbot

  // Effet pour mettre à jour l'affichage des messages et faire défiler vers le bas
  useEffect(() => {
    const messagesDiv = document.getElementById('messages');
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight; // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
    }
  }, [messages]); // Exécute cet effet chaque fois que 'messages' change

  // Fonction pour gérer l'envoi des messages
  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') { // Vérifie que l'input n'est pas vide
      const newUserMessage: ChatBubble = { type: 'question', text: inputValue }; // Crée un nouvel objet ChatBubble pour le message utilisateur

      setMessages((prevMessages) => [...prevMessages, newUserMessage]); // Ajoute le message utilisateur à la liste des messages
      setConversationHistory((prevHistory) => [...prevHistory, newUserMessage]); // Ajoute le message utilisateur à l'historique de la conversation

      setInputValue(''); // Réinitialise la valeur de l'input utilisateur avant l'envoi du message

      const responseText = await chatApp.sendMessage(inputValue, [...conversationHistory, newUserMessage]); // Envoie le message à l'API et récupère la réponse
      const newBotMessage: ChatBubble = { type: 'response', text: responseText }; // Crée un nouvel objet ChatBubble pour la réponse du chatbot

      setMessages((prevMessages) => [...prevMessages, newBotMessage]); // Ajoute la réponse du chatbot à la liste des messages
      setConversationHistory((prevHistory) => [...prevHistory, newBotMessage]); // Ajoute la réponse du chatbot à l'historique de la conversation
    }
  };

  // Fonction pour gérer la pression des touches dans l'input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Si "Enter" est pressé sans "Shift"
      e.preventDefault(); // Empêche le comportement par défaut (nouvelle ligne)
      handleSendMessage(); // Envoie le message
    } else if (e.key === 'Enter' && e.shiftKey) { // Si "Shift+Enter" est pressé
      e.preventDefault(); // Empêche le comportement par défaut
      setInputValue(inputValue + '\n'); // Ajoute une nouvelle ligne dans l'input
    }
  };

  // Fonction pour afficher le texte avec Markdown
  const renderMarkdown = (text: string) => {
    // Replace newlines with <br> tags
    const textWithLineBreaks = text.replace(/\n/g, '<br>');
    // Parse the Markdown text into HTML
    const html = marked(textWithLineBreaks);
    return { __html: html }; // Retourne un objet avec le HTML pour l'injection sécurisée
  };

  // Fonction pour gérer le redimensionnement du conteneur
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
    <div ref={containerRef} style={styles.container} onMouseDown={handleMouseDown}> {/* Ajoute le style pour le conteneur du chatbot */}
      <div style={styles.header}>Support Assistant</div> {/* Ajoute un en-tête pour le chatbot */}
      <div style={styles.messages} id="messages"> {/* Conteneur pour afficher les messages */}
        {messages.map((msg, index) => (
          <div key={index} style={msg.type === 'question' ? styles.userBubble : styles.botBubble} dangerouslySetInnerHTML={renderMarkdown(msg.text)} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.inputContainer}> {/* Conteneur pour l'input et le bouton */}
        <input
          type="text" // Définit le type de l'input comme texte
          value={inputValue} // Associe l'état inputValue à la valeur de l'input
          onChange={(e) => setInputValue(e.target.value)} // Met à jour inputValue lorsque l'utilisateur tape
          onKeyDown={handleKeyPress} // Gère la pression des touches
          placeholder="Entrez votre message ici" // Texte d'espace réservé dans l'input
          style={styles.input} // Applique le style à l'input
        />
        <button onClick={handleSendMessage} style={styles.button}>Envoyer</button> {/* Bouton pour envoyer le message */}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '300px',
    height: '400px', // Initial height
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    padding: '10px',
    zIndex: 1000,
    resize: 'both', // Make it resizable
    overflow: 'auto', // Handle overflow
    display: 'flex',
    flexDirection: 'column', // Use column layout to stack elements vertically
  },
  header: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
  },
  messages: {
    flex: 1, // Allow messages container to grow and fill the available space
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    display: 'flex',
    marginTop: 'auto', // Push the input container to the bottom
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
    padding: '2px 5px', // Further reduced padding
    margin: '2px 0',
    alignSelf: 'flex-end', // Align user's message to the right
    maxWidth: '80%', // Adjust as necessary
    textAlign: 'right',
  },
  botBubble: {
    backgroundColor: '#f1f0f0',
    borderRadius: '10px',
    padding: '2px 5px', // Further reduced padding
    margin: '2px 0',
    alignSelf: 'flex-start', // Align bot's message to the left
    maxWidth: '80%', // Adjust as necessary
  },
};

export default ChatBotSimpleApi; // Exporte le composant pour pouvoir l'utiliser dans d'autres fichiers
