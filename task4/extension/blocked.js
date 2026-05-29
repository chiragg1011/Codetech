/**
 * blocked.js - FocusFlow Website Blocking Redirect Screen
 * 
 * Extracts query parameters to identify the blocked website, renders a random
 * deep focus quote, and helps navigate the user back to their work.
 */

document.addEventListener("DOMContentLoaded", () => {
  const domainLabel = document.getElementById("blockedDomainName");
  const quoteTextEl = document.getElementById("quoteText");
  const quoteAuthorEl = document.getElementById("quoteAuthor");
  const btnBackToWork = document.getElementById("btnBackToWork");

  // 1. Parse domain query param
  const urlParams = new URLSearchParams(window.location.search);
  const domain = urlParams.get("domain");
  if (domain) {
    domainLabel.innerText = domain;
  }

  // 2. Random Motivational Focus Quotes
  const quotes = [
    {
      text: "Real work requires uninterrupted blocks of focus. Protect your attention.",
      author: "Cal Newport (Deep Work)"
    },
    {
      text: "You do not rise to the level of your goals. You fall to the level of your systems.",
      author: "James Clear (Atomic Habits)"
    },
    {
      text: "Focusing is about saying 'No' to a hundred other good ideas.",
      author: "Steve Jobs"
    },
    {
      text: "To be everywhere is to be nowhere. Focus on what truly matters.",
      author: "Seneca"
    },
    {
      text: "The key to productivity is to rotate your mind, not your chair.",
      author: "Anonymous"
    },
    {
      text: "Distraction is the only thing that stands between you and your greatest potential.",
      author: "Deep Focus Guide"
    }
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteTextEl.innerText = `"${randomQuote.text}"`;
  quoteAuthorEl.innerText = randomQuote.author;

  // 3. Navigation Controls
  btnBackToWork.addEventListener("click", () => {
    // Navigate tab back or close tab
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If there's no back history, navigate to dashboard or close
      window.location.href = "https://github.com";
    }
  });
});
