//hooks/useChatBubble.ts
import { useState } from 'react';

interface ChatBubble {
  type: 'question' | 'response';
  text: string;
}

export function useChatBubble() {
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]);

  const addChatBubble = (bubble: ChatBubble) => {
    setConversationHistory(prev => [...prev, bubble]);
  };

  return { conversationHistory, addChatBubble };
}