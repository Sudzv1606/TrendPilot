const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// OpenRouter configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Reddit API Configuration
const REDDIT_CLIENT_ID = '80N8tEC46YsfNaqRmtkIIg';
const REDDIT_CLIENT_SECRET = '5k08_UYfYAPG-9QLq49OeKdYV00BLg';
const REDDIT_USER_AGENT = 'TrendPilot/1.0 (by /u/OnePieceTheoriesBot)';

// API endpoints and configurations
const API_SOURCES = {
    reddit: {
        url: 'https://www.reddit.com/r/startups+technology+ArtificialIntelligence/top.json?limit=25&t=day',
        headers: {
            'User-Agent': REDDIT_USER_AGENT
        }
    },
    github: {
        url: 'https://api.github.com/search/repositories?q=created:>2024-01-01&sort=stars&order=desc&per_page=20',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'TrendPilot/1.0'
        }
    },
    hackernews: {
        url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
        limit: 30
    }
};

// Serve static files for GitHub Pages
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname)));
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
}

// API endpoint for fetching trends
app.get('/api/trends', async (req, res) => {
    try {
        console.log('Fetching trends from all sources...');

        // Fetch data from all sources
        const [redditData, githubData, hackerNewsData] = await Promise.allSettled([
            fetchRedditData(),
            fetchGitHubData(),
            fetchHackerNewsData()
        ]);

        // Process the results
        const allItems = [
            ...(redditData.status === 'fulfilled' ? redditData.value : []),
            ...(githubData.status === 'fulfilled' ? githubData.value : []),
            ...(hackerNewsData.status === 'fulfilled' ? hackerNewsData.value : [])
        ];

        console.log(`Collected ${allItems.length} items from all sources`);

        if (allItems.length === 0) {
            return res.status(500).json({
                success: false,
                error: 'No data collected from any source'
            });
        }

        // Analyze trends with AI
        const trends = await analyzeTrendsWithAI(allItems);

        res.json({
            success: true,
            trends: trends,
            totalItems: allItems.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in trends API:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Fetch data from Reddit
async function fetchRedditData() {
    try {
        const response = await axios.get(API_SOURCES.reddit.url, {
            headers: API_SOURCES.reddit.headers,
            timeout: 10000
        });

        return response.data.data.children.map(post => ({
            title: post.data.title,
            source: 'Reddit',
            url: `https://reddit.com${post.data.permalink}`,
            score: post.data.score,
            created: new Date(post.data.created_utc * 1000).toISOString(),
            subreddit: post.data.subreddit,
            type: 'discussion'
        }));
    } catch (error) {
        console.error('Error fetching Reddit data:', error.message);
        return [];
    }
}

// Fetch data from GitHub
async function fetchGitHubData() {
    try {
        const response = await axios.get(API_SOURCES.github.url, {
            headers: API_SOURCES.github.headers,
            timeout: 10000
        });

        return response.data.items.map(repo => ({
            title: repo.name,
            description: repo.description || 'No description available',
            source: 'GitHub',
            url: repo.html_url,
            score: repo.stargazers_count,
            created: repo.created_at,
            language: repo.language,
            type: 'repository'
        }));
    } catch (error) {
        console.error('Error fetching GitHub data:', error.message);
        return [];
    }
}

// Fetch data from Hacker News
async function fetchHackerNewsData() {
    try {
        const response = await axios.get(API_SOURCES.hackernews.url, { timeout: 10000 });
        const storyIds = response.data.slice(0, API_SOURCES.hackernews.limit);

        const stories = await Promise.allSettled(
            storyIds.map(id => fetchHackerNewsStory(id))
        );

        return stories
            .filter(story => story.status === 'fulfilled')
            .map(story => story.value);
    } catch (error) {
        console.error('Error fetching Hacker News data:', error.message);
        return [];
    }
}

// Fetch individual Hacker News story
async function fetchHackerNewsStory(id) {
    try {
        const response = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 5000 });
        const story = response.data;

        return {
            title: story.title,
            source: 'Hacker News',
            url: story.url || `https://news.ycombinator.com/item?id=${id}`,
            score: story.score,
            created: new Date(story.time * 1000).toISOString(),
            type: 'story'
        };
    } catch (error) {
        console.error(`Error fetching HN story ${id}:`, error.message);
        return null;
    }
}

// Analyze trends using OpenRouter AI
async function analyzeTrendsWithAI(items) {
    try {
        // Prepare data for AI analysis
        const itemsText = items.map((item, index) =>
            `${index + 1}. [${item.source}] ${item.title}${item.description ? ': ' + item.description : ''} (Score: ${item.score})`
        ).join('\n');

        const prompt = `
Analyze these ${items.length} tech and startup related items and identify emerging trends. Please respond with a JSON array of 3-5 trend objects, each containing:

{
    "topic": "Clear, concise trend name",
    "score": 85,
    "summary": "Brief explanation of why this is trending and its importance",
    "sources": ["Source1", "Source2"],
    "examples": ["Specific example 1", "Specific example 2"]
}

Focus on:
- Cross-platform patterns and recurring themes
- Emerging technologies and business models
- Items with high engagement scores
- Recent and relevant content

Items to analyze:
${itemsText}

Return only valid JSON array, no other text.`;

        const response = await axios.post(`${OPENROUTER_BASE_URL}/chat/completions`, {
            model: 'alibaba/tongyi-deepresearch-30b-a3b:free',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert trend analyst. Always respond with valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://trendpilot.app',
                'X-Title': 'TrendPilot'
            },
            timeout: 30000
        });

        const aiResponse = response.data.choices[0].message.content.trim();

        // Try to parse JSON response
        let trends;
        try {
            trends = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            console.log('AI response:', aiResponse);
            // Fallback: create basic trends from items
            trends = generateFallbackTrends(items);
        }

        // Enhance trends with source mapping
        return trends.map(trend => ({
            ...trend,
            sources: [...new Set(trend.sources)], // Remove duplicates
            score: Math.min(100, Math.max(0, trend.score)), // Ensure score is 0-100
            timestamp: new Date().toISOString()
        }));

    } catch (error) {
        console.error('Error analyzing trends with AI:', error.message);
        // Return fallback trends if AI fails
        return generateFallbackTrends(items);
    }
}

// Generate basic trends if AI analysis fails
function generateFallbackTrends(items) {
    const trends = [];
    const sourceGroups = {};

    // Group items by source
    items.forEach(item => {
        if (!sourceGroups[item.source]) {
            sourceGroups[item.source] = [];
        }
        sourceGroups[item.source].push(item);
    });

    // Create trends from source groups
    Object.entries(sourceGroups).forEach(([source, sourceItems]) => {
        if (sourceItems.length > 0) {
            const topItems = sourceItems
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            trends.push({
                topic: `Trending on ${source}`,
                score: Math.min(100, sourceItems.length * 10),
                summary: `Popular content from ${source} with ${sourceItems.length} relevant items`,
                sources: [source],
                examples: topItems.map(item => item.title)
            });
        }
    });

    return trends.slice(0, 5); // Return top 5 trends
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'TrendPilot API'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`TrendPilot API server running on port ${PORT}`);
});

module.exports = app;
