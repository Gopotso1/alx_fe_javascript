const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API for demonstration

async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const serverQuotes = await response.json();
        // Simulate processing server data (using title as quote and body as category)
        const processedQuotes = serverQuotes.map(q => ({
            text: q.title,
            category: q.body || 'General' // Default category if none provided
        }));
        return processedQuotes;
    } catch (error) {
        console.error('Error fetching quotes:', error);
    }
}

// Periodically check for new quotes from the server
setInterval(async () => {
    const serverQuotes = await fetchQuotesFromServer();
    if (serverQuotes) {
        resolveConflicts(serverQuotes);
    }
}, 30000); // Check every 30 seconds

function resolveConflicts(serverQuotes) {
    // Load local quotes
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

    // Check for conflicts and update local storage
    const mergedQuotes = [...localQuotes];

    serverQuotes.forEach(serverQuote => {
        const existingQuoteIndex = localQuotes.findIndex(q => q.text === serverQuote.text);
        if (existingQuoteIndex === -1) {
            // If quote doesn't exist locally, add it
            mergedQuotes.push(serverQuote);
        } else {
            // Conflict: quote exists locally
            // Simple resolution strategy: keep the server version
            mergedQuotes[existingQuoteIndex] = serverQuote;
            notifyUser(`Conflict resolved for: "${serverQuote.text}". Updated to server version.`);
        }
    });

    // Save merged quotes back to local storage
    localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
    populateCategories(); // Update the dropdown with new categories
    displayQuotes(mergedQuotes); // Display updated quotes
}

// Notify the user about conflicts
function notifyUser(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.backgroundColor = '#f8d7da';
    notification.style.color = '#721c24';
    notification.style.padding = '10px';
    notification.style.margin = '10px 0';
    document.body.prepend(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000); // Remove notification after 5 seconds
}
