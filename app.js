// Firebase configuration removed - using GitHub Pages deployment
// All Firebase dependencies removed for GitHub-native deployment

// DOM elements
const fetchButton = document.getElementById('fetchTrends');
const loadingSection = document.getElementById('loading');
const trendsContainer = document.getElementById('trendsContainer');
const trendsGrid = document.getElementById('trendsGrid');
const lastUpdated = document.getElementById('lastUpdated');
const sourceFilter = document.getElementById('sourceFilter');
const trendsChart = document.getElementById('trendsChart').getContext('2d');

// Chart.js instance
let chart;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadStoredTrends();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    fetchButton.addEventListener('click', fetchLatestTrends);
    sourceFilter.addEventListener('change', filterTrends);
}

// Fetch latest trends from backend
async function fetchLatestTrends() {
    try {
        // Disable button and show loading
        fetchButton.disabled = true;
        fetchButton.textContent = '🔄 Fetching...';
        loadingSection.style.display = 'block';
        trendsContainer.style.display = 'none';

        // Initialize API client
        const api = new TrendPilotAPI();

        // Fetch trends using the API client
        const result = await api.getTrends();

        if (result && result.success) {
            await displayTrends(result.trends);
            await updateChart(result.trends);
            updateLastUpdatedTime();

            // Cache the results
            try {
                localStorage.setItem('trendpilot-trends', JSON.stringify({
                    timestamp: new Date(),
                    trends: result.trends,
                    source: result.source || 'api'
                }));
            } catch (storageError) {
                console.log('Local storage not available');
            }

        } else {
            throw new Error('Invalid response from API');
        }

    } catch (error) {
        console.error('Error fetching trends:', error);

        // Try to load from cache
        try {
            const cached = localStorage.getItem('trendpilot-trends');
            if (cached) {
                const cachedData = JSON.parse(cached);
                await displayTrends(cachedData.trends);
                await updateChart(cachedData.trends);
                updateLastUpdatedTime(new Date(cachedData.timestamp));
                console.log('Loaded from cache');
                return;
            }
        } catch (cacheError) {
            console.log('No cached data available');
        }

        // No demo data fallback - force real data fetching
        alert('Unable to fetch real trend data. Please ensure GitHub Actions workflow is running properly.');
        console.error('Failed to fetch real data and no demo fallback available');

    } finally {
        // Re-enable button and hide loading
        fetchButton.disabled = false;
        fetchButton.textContent = '🔍 Fetch Latest Trends';
        loadingSection.style.display = 'none';
        trendsContainer.style.display = 'block';
    }
}

// Display trends in the UI
async function displayTrends(trends) {
    // Clear existing content
    const trendsGrid = document.getElementById('trendsGrid');
    const newsArticles = document.getElementById('newsArticles');

    trendsGrid.innerHTML = '';
    newsArticles.innerHTML = '';

    if (trends.length === 0) {
        trendsGrid.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1 / -1; padding: 2rem;">No trends found. Try fetching again!</p>';
        return;
    }

    // Separate breaking news (high score) from regular trends
    const breakingTrends = trends.filter(trend => trend.score >= 85);
    const regularTrends = trends.filter(trend => trend.score < 85);

    // Display breaking news in grid
    breakingTrends.forEach(trend => {
        const articleCard = createArticleCard(trend, true);
        trendsGrid.appendChild(articleCard);
    });

    // Display regular trends as articles
    regularTrends.forEach(trend => {
        const articleCard = createArticleCard(trend, false);
        newsArticles.appendChild(articleCard);
    });

    // Update trending sidebar
    updateTrendingSidebar(trends);
}

// Create a trend card element
function createTrendCard(trend) {
    const card = document.createElement('div');
    card.className = 'trend-card';

    const sources = trend.sources.map(source =>
        `<span class="source-tag">${source}</span>`
    ).join('');

    const examples = trend.examples.map(example =>
        `<li>${example}</li>`
    ).join('');

    card.innerHTML = `
        <div class="trend-topic">${trend.topic}</div>
        <div class="trend-score">Score: ${trend.score}</div>
        <div class="trend-summary">${trend.summary}</div>
        <div class="trend-sources">
            ${sources}
        </div>
        <div class="trend-examples">
            <h4>Examples:</h4>
            <ul>${examples}</ul>
        </div>
    `;

    return card;
}

// Update the trends chart
async function updateChart(trends) {
    const labels = trends.map(trend => trend.topic);
    const scores = trends.map(trend => trend.score);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(trendsChart, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Trend Score',
                data: scores,
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'white',
                        maxRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    });
}

// Load stored trends (now uses localStorage instead of Firestore)
async function loadStoredTrends() {
    try {
        // Try to load from localStorage cache
        const cached = localStorage.getItem('trendpilot-trends');
        if (cached) {
            const cachedData = JSON.parse(cached);
            await displayTrends(cachedData.trends);
            await updateChart(cachedData.trends);
            updateLastUpdatedTime(new Date(cachedData.timestamp));
            console.log('Loaded cached trends from localStorage');
        }
    } catch (error) {
        console.log('No cached data available, using demo data');
    }
}

// Store trends (now uses localStorage instead of Firestore)
async function storeTrends(trends) {
    try {
        localStorage.setItem('trendpilot-trends', JSON.stringify({
            timestamp: new Date(),
            trends: trends
        }));
        console.log('Trends cached in localStorage');
    } catch (error) {
        console.log('Could not cache trends in localStorage:', error.message);
    }
}

// Filter trends by source
function filterTrends() {
    const selectedSource = sourceFilter.value;
    const trendCards = document.querySelectorAll('.trend-card');

    trendCards.forEach(card => {
        const sourceTags = card.querySelectorAll('.source-tag');
        let hasSelectedSource = false;

        if (selectedSource === 'all') {
            hasSelectedSource = true;
        } else {
            sourceTags.forEach(tag => {
                if (tag.textContent.toLowerCase() === selectedSource.toLowerCase()) {
                    hasSelectedSource = true;
                }
            });
        }

        card.style.display = hasSelectedSource ? 'block' : 'none';
    });
}

// Update last updated time
function updateLastUpdatedTime(date = new Date()) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    let timeString;
    if (diff < 60) {
        timeString = 'Just now';
    } else if (diff < 3600) {
        timeString = `${Math.floor(diff / 60)} minutes ago`;
    } else if (diff < 86400) {
        timeString = `${Math.floor(diff / 3600)} hours ago`;
    } else {
        timeString = date.toLocaleDateString();
    }

    lastUpdated.textContent = `Last updated: ${timeString}`;
}

// Generate demo trends for local testing
async function generateDemoTrends() {
    return [
        {
            topic: "AI Agent Frameworks",
            score: 92,
            summary: "Open-source frameworks for building AI agents are gaining massive traction, with developers creating specialized tools for autonomous task completion.",
            sources: ["GitHub", "Reddit"],
            examples: [
                "AutoGPT framework reaches 50k+ stars",
                "LangChain agents for complex workflows",
                "BabyAGI-inspired productivity tools"
            ]
        },
        {
            topic: "Web3 Gaming Infrastructure",
            score: 87,
            summary: "Blockchain gaming platforms are evolving with better developer tools, making it easier to create play-to-earn experiences.",
            sources: ["Product Hunt", "Hacker News"],
            examples: [
                "Thirdweb gaming SDK launches",
                "Immutable X for NFT games",
                "Play-to-earn tokenomics platforms"
            ]
        },
        {
            topic: "Decentralized Social Media",
            score: 78,
            summary: "New social platforms built on blockchain technology are emerging, focusing on user ownership and censorship resistance.",
            sources: ["Reddit", "GitHub"],
            examples: [
                "Lens Protocol social dApps",
                "Farcaster decentralized Twitter",
                "Mastodon federation growth"
            ]
        },
        {
            topic: "Climate Tech SaaS",
            score: 85,
            summary: "B2B software solutions for carbon tracking and sustainability management are becoming essential for enterprise compliance.",
            sources: ["Product Hunt", "Hacker News"],
            examples: [
                "Carbon accounting platforms",
                "Supply chain emission tracking",
                "ESG reporting automation tools"
            ]
        },
        {
            topic: "No-Code AI Tools",
            score: 73,
            summary: "User-friendly platforms that let non-technical users build AI applications without coding knowledge.",
            sources: ["Product Hunt", "Reddit"],
            examples: [
                "GPT-powered app builders",
                "Visual AI workflow tools",
                "No-code machine learning platforms"
            ]
        }
    ];
}

// Create article card for news layout
function createArticleCard(trend, isBreaking = false) {
    const card = document.createElement('article');
    card.className = `article-card ${trend.isNew ? 'new' : ''}`;

    const categoryEmoji = getCategoryEmoji(trend.category);
    const timeAgo = getTimeAgo(trend.publishedAt);

    card.innerHTML = `
        <div class="article-image">
            ${categoryEmoji}
        </div>
        <div class="article-content">
            <div class="article-meta">
                <span class="article-category">${trend.category}</span>
                <span class="article-date">📅 ${timeAgo}</span>
                <span class="article-read-time">⏱️ ${trend.readTime} min read</span>
            </div>
            <h2 class="article-title">${trend.topic}</h2>
            <p class="article-excerpt">${trend.summary}</p>
            <div class="article-footer">
                <div class="article-sources">
                    ${trend.sources.map(source => `<span class="source-tag">${source}</span>`).join('')}
                </div>
                <span class="article-score">Score: ${trend.score}</span>
            </div>
        </div>
    `;

    return card;
}

// Update trending sidebar
function updateTrendingSidebar(trends) {
    const trendingNow = document.getElementById('trendingNow');
    if (!trendingNow) return;

    // Sort by score and take top 5
    const topTrends = trends
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    trendingNow.innerHTML = topTrends.map((trend, index) => `
        <div class="trending-item">
            <span class="trending-number">${index + 1}</span>
            <span class="trending-text">${trend.topic}</span>
        </div>
    `).join('');
}

// Get emoji for category
function getCategoryEmoji(category) {
    const emojiMap = {
        'AI & Machine Learning': '🤖',
        'Web3 & Blockchain': '⛓️',
        'Startups & Business': '🚀',
        'Developer Tools': '💻',
        'Web Development': '🌐',
        'Mobile & Apps': '📱',
        'Cloud & Infrastructure': '☁️',
        'Cybersecurity': '🔒',
        'Technology': '⚡'
    };

    return emojiMap[category] || '📊';
}

// Get time ago string
function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
}

// Error handling for missing Firebase config
window.addEventListener('error', function(event) {
    if (event.message.includes('firebase')) {
        console.log('Firebase not available - using GitHub deployment');
    }
});
