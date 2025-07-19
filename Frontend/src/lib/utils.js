export function formatMessageTime(date) {
  const messageDate = new Date(date);
  const now = new Date();

  const isToday =
    messageDate.toDateString() === now.toDateString();

  if (isToday) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  const isYesterday = new Date(now - 86400000).toDateString() === messageDate.toDateString();

  if (isYesterday) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short", // e.g., "Jul"
    year: "numeric",
  });
}
