import { createContext, useContext, useState } from "react";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <ChatContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}