// Client-side API handler for GitHub Pages deployment
class TrendPilotAPI {
    constructor() {
        this.githubRepo = 'Sudzv1606/TrendPilot';
        this.dataPath = 'data/trends-latest.json';
    }

    // Fetch trends from GitHub repository file
    async fetchTrendsFromGitHub() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/${this.dataPath}`);

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();

            // GitHub API returns base64 encoded content
            const decodedContent = atob(data.content);
            const trendsData = JSON.parse(decodedContent);

            return trendsData;
        } catch (error) {
            console.error('Error fetching from GitHub:', error);
            throw error;
        }
    }

    // Fetch trends from local server (development)
    async fetchTrendsFromLocal() {
        try {
            const response = await fetch('/api/trends');

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching from local server:', error);
            throw error;
        }
    }

    // Main method to get trends (tries multiple sources)
    async getTrends() {
        const isLocalhost = window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === 'localhost';

        try {
            // Try local server first if in development
            if (isLocalhost) {
                return await this.fetchTrendsFromLocal();
            }

            // Try GitHub repository data
            return await this.fetchTrendsFromGitHub();

        } catch (error) {
            console.error('All API sources failed:', error);

            // Return demo data as final fallback
            return {
                success: true,
                trends: this.getDemoTrends(),
                totalItems: 5,
                timestamp: new Date().toISOString(),
                source: 'demo'
            };
        }
    }

    // Demo trends for fallback
    getDemoTrends() {
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

    // Health check
    async healthCheck() {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            deployment: 'GitHub Pages',
            api: 'GitHub Repository Data'
        };
    }
}

// Export for use in other files
window.TrendPilotAPI = TrendPilotAPI;
