import { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import api from "./api";
import { db } from "./firebase";
import { onValue, push, ref, set } from "firebase/database";
import { ChatProvider, useChat } from "./ChatContext";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post("/users/login", {
        email,
        password,
      });

      navigate("/");
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "Invalid email or password") {
        setError("Invalid password");
      } else {
        setError(message || "Login failed");
      }
    }
  };

  return (
    <div id="login-page">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          id="email-input"
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          id="password-input"
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button id="login-button" type="submit">
          Login
        </button>
      </form>

      {error && <p id="login-error">{error}</p>}
    </div>
  );
}

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post("/users/register", formData);

      navigate("/login");
    } catch (error) {
      if (error.response?.status === 409) {
        setError("Email is already registered");
      } else {
        setError(
          error.response?.data?.message || "Registration failed"
        );
      }
    }
  };

  return (
    <div id="register-page">
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <input
          id="fullname-input"
          name="fullName"
          type="text"
          placeholder="Full name"
          required
          value={formData.fullName}
          onChange={handleChange}
        />

        <input
          id="email-input"
          name="email"
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
        />

        <input
          id="username-input"
          name="username"
          type="text"
          placeholder="Username"
          required
          value={formData.username}
          onChange={handleChange}
        />

        <input
          id="password-input"
          name="password"
          type="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
        />

        <button id="register-button" type="submit">
          Register
        </button>
      </form>

      {error && <p id="register-error">{error}</p>}
    </div>
  );
}

function Chat() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { currentUser: user, setCurrentUser: setUser } = useChat();

useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data.data);
    } catch (error) {
      navigate("/login");
    }
  };

  fetchUser();
}, [navigate]);

useEffect(() => {
  const fetchRooms = async () => {
    try {
      const response = await api.get("/rooms/userrooms");
      setRooms(response.data.data);
    } catch (error) {
      console.error("Fetch rooms error:", error);
    }
  };

  fetchRooms();
}, []);

useEffect(() => {
  if (!activeRoom) {
    setMessages([]);
    return;
  }

  const messagesRef = ref(db, `messages/${activeRoom._id}`);

  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      setMessages([]);
      return;
    }

    const loadedMessages = Object.entries(data).map(([id, message]) => ({
      id,
      ...message,
    }));

    loadedMessages.sort((a, b) => a.timestamp - b.timestamp);

    setMessages(loadedMessages);
  });

  return () => unsubscribe();
}, [activeRoom]);

useEffect(() => {
  if (!activeRoom || !user) {
    setIsTyping(false);
    return;
  }

  const otherUser = activeRoom.users.find(
    (roomUser) => roomUser._id !== user._id
  );

  if (!otherUser) {
    return;
  }

  console.log("Typing listener:", {
  roomId: activeRoom._id,
  currentUserId: user._id,
  otherUserId: otherUser._id,
});

  const typingRef = ref(
    db,
  `typing/${activeRoom._id}/${otherUser._id}`
  );

  const unsubscribe = onValue(typingRef, (snapshot) => {
    setIsTyping(snapshot.val() === true);
  });

  return () => {
  unsubscribe();

  const typingRef = ref(
    db,
    `typing/${activeRoom._id}/${user._id}`
  );

  set(typingRef, false);
};
}, [activeRoom, user]);

  const handleSearch = async (event) => {
      const value = event.target.value;

      setSearchTerm(value);

      if (!value.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await api.get("/users/search", {
          params: {
            searchTerm: value,
          },
      });

      setSearchResults(response.data.data);
    } catch (error) {
      console.error("Search users error:", error);
      setSearchResults([]);
    }
};


const handleUserSelect = async (selectedUser) => {
  try {
    const response = await api.post("/rooms/init", {
      otheruser: selectedUser._id,
    });

    const room = response.data.data;

    setRooms((previousRooms) => {
      const alreadyExists = previousRooms.some(
        (existingRoom) => existingRoom._id === room._id
      );

      if (alreadyExists) {
        return previousRooms;
      }

      return [...previousRooms, room];
    });

    setActiveRoom(room);
    setShowSearch(false);
    setSearchTerm("");
    setSearchResults([]);
  } catch (error) {
    console.error("Create room error:", error);
  }
};

const handleSendMessage = async (event) => {
  event.preventDefault();

  if (!messageText.trim() || !activeRoom || !user) {
    return;
  }

  try {
    const messagesRef = ref(db, `messages/${activeRoom._id}`);

    await push(messagesRef, {
      content: messageText.trim(),
      senderId: user._id,
      timestamp: Date.now(),
    });

    setMessageText("");
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};

const handleTyping = async (event) => {
  const value = event.target.value;
  setMessageText(value);

  if (!activeRoom || !user) {
    return;
  }

  const typingRef = ref(
    db,
    `typing/${activeRoom._id}/${user._id}`
  );

  await set(typingRef, value.length > 0);
};

  return (
    <div id="chat-layout">
      <aside>
        <div>
          <h2 id="user-name">{user?.fullName || "Loading..."}</h2>
          <p id="user-username">{user ? `@${user.username}` : "@loading"}
          </p>
        </div>

        <button id="new-chat-button" onClick={() => setShowSearch(true)}>
          New Chat
        </button>
        {showSearch && (
          <div>
            <input id="search-input" type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <div>
              {searchResults.map((result) => (
                <div key={result._id}
                    id={`user-result-${result._id}`}
                    onClick={() => handleUserSelect(result)}
                    style={{ cursor: "pointer" }}>
                    <strong>{result.fullName}</strong>
                    <span>@{result.username}</span>
                </div>
              ))}
            </div>

            <button id="close-search" onClick={() => setShowSearch(false)}>
              Close
            </button>
          </div>
        )}

        <div id="chat-rooms-list">
          {rooms.map((room) => {
            const otherUser = room.users.find(
              (roomUser) => roomUser._id !== user?._id
            );

          return (
            <button
                key={room._id}
                id={`room-${room._id}`}
                onClick={() => setActiveRoom(room)}
              >
                {otherUser?.fullName || "Chat"}
            </button>
          );
      })}
    </div>

        <button
          id="logout-button"
          onClick={async () => {
              await api.get("/users/logout");
              setUser(null);
              window.location.href = "/login";
        }}>
          Logout
      </button>
      </aside>

      <main id="chat-window">
        {!activeRoom ? (
          <h2>Select a chat</h2>
            ) : (
          <>
            {isTyping && <p id="typing-indicator">Typing...</p>}

            <div id="messages-list">
              {messages.map((message) => (
                <div key={message.id}>
                  <p>{message.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage}>
              <input
                id="message-input"
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={handleTyping}
              />
              <button id="send-button" type="submit">
                Send
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </ChatProvider>
  );
}

export default App;