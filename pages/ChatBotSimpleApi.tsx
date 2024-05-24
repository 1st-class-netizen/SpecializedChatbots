import React, { useEffect, useState } from 'react'; // Importation des hooks React

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
    this.apiKey = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U';
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
              .replace(/'/g, "\\'") // Échappe les guillemets simples
              .replace(/\n/g, '\\n') // Échappe les nouvelles lignes
              .replace(/\r/g, '\\r') // Échappe les retours chariot
              .replace(/\t/g, '\\t'); // Échappe les tabulations
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
  const [messages, setMessages] = useState<string[]>([]); // État pour stocker les messages du chat
  const [inputValue, setInputValue] = useState<string>(''); // État pour stocker la valeur de l'input utilisateur
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]); // État pour stocker l'historique de la conversation
  const chatApp = new ChatApp(); // Instance de la classe ChatApp

  // Effet pour mettre à jour l'affichage des messages
  useEffect(() => {
    const messageList = document.createElement('ul'); // Crée un élément de liste non ordonnée

    // Ajoute chaque message à la liste
    messages.forEach((msg) => {
      const messageItem = document.createElement('li'); // Crée un élément de liste
      messageItem.textContent = msg; // Définit le texte de l'élément de liste
      messageList.appendChild(messageItem); // Ajoute l'élément de liste à la liste non ordonnée
    });

    // Ajoute la liste des messages au DOM
    document.getElementById('messages')?.appendChild(messageList);

    // Nettoie la liste des messages quand le composant est démonté
    return () => {
      document.getElementById('messages')?.removeChild(messageList); // Supprime la liste des messages du DOM
    };
  }, [messages]); // Exécute cet effet chaque fois que 'messages' change

  // Fonction pour gérer l'envoi des messages
  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') { // Vérifie que l'input n'est pas vide
      const newUserMessage: ChatBubble = { type: 'question', text: inputValue }; // Crée un nouvel objet ChatBubble pour le message utilisateur

      setMessages((prevMessages) => [...prevMessages, `Utilisateur dit: ${inputValue}`]); // Ajoute le message utilisateur à la liste des messages
      setConversationHistory((prevHistory) => [...prevHistory, newUserMessage]); // Ajoute le message utilisateur à l'historique de la conversation

      const responseText = await chatApp.sendMessage(inputValue, [...conversationHistory, newUserMessage]); // Envoie le message à l'API et récupère la réponse
      const newBotMessage: ChatBubble = { type: 'response', text: responseText }; // Crée un nouvel objet ChatBubble pour la réponse du chatbot

      setMessages((prevMessages) => [...prevMessages, `Chatbot dit: ${responseText}`]); // Ajoute la réponse du chatbot à la liste des messages
      setConversationHistory((prevHistory) => [...prevHistory, newBotMessage]); // Ajoute la réponse du chatbot à l'historique de la conversation

      setInputValue(''); // Réinitialise la valeur de l'input utilisateur
    }
  };

  return (
    <div>
      <input
        type="text" // Définit le type de l'input comme texte
        value={inputValue} // Associe l'état inputValue à la valeur de l'input
        onChange={(e) => setInputValue(e.target.value)} // Met à jour inputValue lorsque l'utilisateur tape
        placeholder="Entrez votre message ici" // Texte d'espace réservé dans l'input
      />
      <button onClick={handleSendMessage}>Envoyer</button> // Bouton pour envoyer le message
      <div id="messages"></div> // Conteneur pour afficher les messages
    </div>
  );
};

export default ChatBotSimpleApi; // Exporte le composant pour pouvoir l'utiliser dans d'autres fichiers
