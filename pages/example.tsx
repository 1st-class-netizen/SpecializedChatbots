import React, { useEffect, useState } from 'react';

// Définir une classe simple Chatbot
class Chatbot {
  username: string; // Nom d'utilisateur du chatbot ou de l'utilisateur
  message: string; // Message du chatbot ou de l'utilisateur

  constructor(username: string, message: string) {
    this.username = username; // Initialiser le nom d'utilisateur
    this.message = message; // Initialiser le message
  }

  static randomResponse(): string {
    const responses = [
      'Bonjour! Comment puis-je vous aider aujourd\'hui?', // Réponse 1
      'Bien sûr, je peux vous aider avec ça.', // Réponse 2
      'Merci de votre question, je vais vérifier cela.', // Réponse 3
      'Au revoir! Passez une excellente journée!' // Réponse 4
    ];
    return responses[Math.floor(Math.random() * responses.length)]; // Retourne une réponse aléatoire
  }

  printMessage(): string {
    return `${this.username} dit: ${this.message}`; // Retourne le message formaté avec le nom d'utilisateur
  }
}
const Example: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]); // État pour stocker les messages
  const [inputValue, setInputValue] = useState<string>(''); // État pour stocker la valeur de la boîte de texte

  useEffect(() => {
    const messageList = document.createElement('ul'); // Créer une liste pour afficher les messages

    messages.forEach((msg) => { // Pour chaque message dans l'état messages
      const messageItem = document.createElement('li'); // Créer un élément de liste
      messageItem.textContent = msg; // Définir le contenu textuel de l'élément de liste
      messageList.appendChild(messageItem); // Ajouter l'élément de liste à la liste
    });

    document.body.appendChild(messageList); // Ajouter la liste au corps du document

    return () => {
      document.body.removeChild(messageList); // Nettoyage : supprimer la liste lorsque le composant est démonté
    };
  }, [messages]); // Exécuter l'effet à chaque changement des messages

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') { // Vérifier que la boîte de texte n'est pas vide
      const userMessage = new Chatbot('Utilisateur', inputValue); // Créer un message d'utilisateur
      setMessages((prevMessages) => [...prevMessages, userMessage.printMessage()]); // Ajouter le message de l'utilisateur à l'état messages

      const botMessage = new Chatbot('Chatbot', Chatbot.randomResponse()); // Créer une réponse aléatoire du chatbot
      setMessages((prevMessages) => [...prevMessages, botMessage.printMessage()]); // Ajouter la réponse du chatbot à l'état messages

      setInputValue(''); // Effacer la boîte de texte
    }
  };

  
  return (
    <div>
      <input
        type="text" // Type de l'entrée : texte
        value={inputValue} // Valeur de l'entrée
        onChange={(e) => setInputValue(e.target.value)} // Mettre à jour la valeur de l'entrée lorsqu'elle change
        placeholder="Entrez votre message ici" // Texte de l'espace réservé
      />
      <button onClick={handleSendMessage}>Envoyer</button>
      <div id="messages"></div>
    </div>
  );
};

export default Example; // Exporter le composant Example comme exportation par défaut