const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API for demonstration

let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Function to display quotes
function displayQuotes(filteredQuotes) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "No quotes available for this category.";
    } else {
        quoteDisplay.innerHTML = filteredQuotes.map(q => `"${q.text}" - <strong>${q.category}</strong>`).join('<br/>');
    }
}

// Function to filter quotes
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === "all" 
        ? quotes 
        : quotes.filter(q => q.category === selectedCategory);
    
    displayQuotes(filteredQuotes);
    localStorage.setItem('selectedCategory', selectedCategory); // Save selected category
}

// Function to populate categories
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(q => q.category))];

    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset filter options

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    const lastSelectedCategory = localStorage.getItem('selectedCategory') || 'all';
    categoryFilter.value = lastSelectedCategory;
    filterQuotes(); // Display quotes based on the last selected category
}

// Function to show a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    const quoteDisplay = document.getElementById('quoteDisplay');

    quoteDisplay.innerHTML = `"${quote.text}" - <strong>${quote.category}</strong>`;
}

// Function to add a new quote
async function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value;
    const quoteCategory = document.getElementById('newQuoteCategory').value;

    if (quoteText && quoteCategory) {
        const newQuote = { text: quoteText, category: quoteCategory };
        quotes.push(newQuote);
        await saveQuotesToServer(newQuote); // Save to server
        saveQuotes(); // Save to local storage
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('Quote added successfully!');
        populateCategories(); // Update the categories dropdown
    } else {
        alert('Please enter both a quote and a category.');
    }
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to save a new quote to the server
async function saveQuotesToServer(quote) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: quote.text,
                body: quote.category
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Quote saved to server:', data);
    } catch (error) {
        console.error('Error saving quote to server:', error);
    }
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const serverQuotes = await response.json();
        const processedQuotes = serverQuotes.map(q => ({
            text: q.title,
            category: q.body || 'General'
        }));
        return processedQuotes;
    } catch (error) {
        console.error('Error fetching quotes:', error);
    }
}

// Sync quotes with the server and local storage
async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();
    if (serverQuotes) {
        resolveConflicts(serverQuotes);
    }
}

// Periodically sync quotes from the server
setInterval(syncQuotes, 30000); // Sync every 30 seconds

function resolveConflicts(serverQuotes) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

    const mergedQuotes = [...localQuotes];

    serverQuotes.forEach(serverQuote => {
        const existingQuoteIndex = localQuotes.findIndex(q => q.text === serverQuote.title);
        if (existingQuoteIndex === -1) {
            mergedQuotes.push({ text: serverQuote.title, category: serverQuote.body });
        } else {
            // Conflict: quote exists locally
            mergedQuotes[existingQuoteIndex] = { text: serverQuote.title, category: serverQuote.body };
            notifyUser(`Conflict resolved for: "${serverQuote.title}". Updated to server version.`);
        }
    });

    localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
    quotes = mergedQuotes; // Update the quotes variable
    populateCategories();
    displayQuotes(mergedQuotes);
}

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

// Initialize the app
window.onload = function() {
    populateCategories(); // Populate categories on load
    showRandomQuote(); // Show a random quote
};
