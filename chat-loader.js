// Chat Loader Script for Portfolio
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("chat-widget-toggle");
  const container = document.getElementById("chat-iframe-container");
  const iframe = document.getElementById("chat-iframe");

  if (!toggleBtn || !container || !iframe) return;

  // Determine iframe source dynamically based on environment
  const getIframeSrc = () => {
    const currentTheme = document.body.getAttribute("data-theme") || "dark";
    const timestamp = new Date().getTime();
    const queryTheme = `?theme=${currentTheme}&t=${timestamp}`;
    
    // If running on FastAPI port (8000), use /chat/
    if (window.location.port === "8000") {
      return `/chat/${queryTheme}`;
    }
    
    // In local development (Live Server, file protocol, etc.), use the compiled React widget
    // relative path so it runs out-of-the-box without requiring the Vite dev server.
    if (
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1" || 
      window.location.protocol === "file:" || 
      window.location.hostname === ""
    ) {
      return `./chat-widget/dist/index.html${queryTheme}`;
    }
    
    // Production default
    return `/chat/${queryTheme}`;
  };

  // Set the source of the iframe
  iframe.src = getIframeSrc();

  // Toggle chat widget visibility
  toggleBtn.addEventListener("click", () => {
    container.classList.toggle("active");
    
    const icon = toggleBtn.querySelector("i");
    if (container.classList.contains("active")) {
      icon.className = "fas fa-times";
      toggleBtn.classList.add("active");
    } else {
      icon.className = "fas fa-comments";
      toggleBtn.classList.remove("active");
    }
  });

  // Keep theme in sync when user toggles light/dark mode in the portfolio
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      // Use setTimeout to wait for the main script.js to update the data-theme attribute on <body>
      setTimeout(() => {
        const updatedTheme = document.body.getAttribute("data-theme") || "dark";
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            { type: "theme-change", theme: updatedTheme },
            "*"
          );
        }
      }, 100);
    });
  }
});
