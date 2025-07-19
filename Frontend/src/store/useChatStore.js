import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadMessages: {}, // { userId: count }
  notifications: [], // Array of notification objects

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      // Sort users by last message time (most recent first)
      const sortedUsers = res.data.sort((a, b) => {
        const aTime = new Date(a.lastMessageTime || 0);
        const bTime = new Date(b.lastMessageTime || 0);
        return bTime - aTime;
      });
      set({ users: sortedUsers });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/conversation/${userId}`);
      set({ messages: res.data });
      
      // Mark messages as read when opening conversation
      get().markMessagesAsRead(userId);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      
      // Update user list order after sending message
      get().updateUserOrder(selectedUser._id);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/mark-read/${userId}`);
      
      // Clear unread count for this user
      const { unreadMessages } = get();
      const newUnreadMessages = { ...unreadMessages };
      delete newUnreadMessages[userId];
      set({ unreadMessages: newUnreadMessages });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  updateUserOrder: (userId) => {
    const { users } = get();
    const userIndex = users.findIndex(user => user._id === userId);
    
    if (userIndex > 0) {
      const updatedUsers = [...users];
      const [movedUser] = updatedUsers.splice(userIndex, 1);
      updatedUsers.unshift({ ...movedUser, lastMessageTime: new Date().toISOString() });
      set({ users: updatedUsers });
    }
  },

  showNotification: (message, sender) => {
    // Browser notification
    if (Notification.permission === "granted") {
      const notification = new Notification(`New message from ${sender.fullName}`, {
        body: message.text || "📷 Image",
        icon: sender.profilePic || "/avatar.svg",
        tag: sender._id, // Prevent duplicate notifications
      });

      // Auto close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }

    // Toast notification
    toast.success(`New message from ${sender.fullName}`, {
      duration: 3000,
      position: 'top-right',
    });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { users, unreadMessages } = get();
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser?._id;
      
      // Find sender info
      const sender = users.find(user => user._id === newMessage.senderId);
      
      if (isMessageSentFromSelectedUser) {
        // Add message to current conversation
        set({
          messages: [...get().messages, newMessage],
        });
        
        // Mark as read immediately since user is viewing the conversation
        get().markMessagesAsRead(newMessage.senderId);
      } else {
        // Update unread count
        const currentCount = unreadMessages[newMessage.senderId] || 0;
        set({
          unreadMessages: {
            ...unreadMessages,
            [newMessage.senderId]: currentCount + 1
          }
        });
        
        // Show notification
        if (sender) {
          get().showNotification(newMessage, sender);
        }
      }
      
      // Update user order regardless
      get().updateUserOrder(newMessage.senderId);
    });

    // Listen for message read receipts
    socket.on("messagesRead", ({ userId, messageIds }) => {
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        messageIds.includes(msg._id) ? { ...msg, seen: true } : msg
      );
      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesRead");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      // Mark messages as read when selecting a user
      get().markMessagesAsRead(selectedUser._id);
    }
  },

  // Request notification permission
  requestNotificationPermission: () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          toast.success("Notifications enabled!");
        }
      });
    }
  },

  // Get total unread count
  getTotalUnreadCount: () => {
    const { unreadMessages } = get();
    return Object.values(unreadMessages).reduce((total, count) => total + count, 0);
  },
}));
