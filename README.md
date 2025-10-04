# 🚀 TrendPilot

A lightweight SaaS dashboard that helps founders, investors, and curious professionals track emerging tech and business trends in real-time using AI analysis.

![TrendPilot Dashboard](https://img.shields.io/badge/Status-Active-success)
![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-blue)
![AI Powered](https://img.shields.io/badge/AI-OpenRouter-orange)

## 🌟 Features

- **🤖 AI-Powered Analysis** - Uses advanced AI models to identify and analyze emerging trends
- **📊 Multi-Source Data** - Aggregates data from Reddit, GitHub, Hacker News, and Product Hunt
- **📈 Real-time Insights** - Live trend analysis with scoring and categorization
- **🎨 Interactive Dashboard** - Beautiful, responsive UI with charts and filtering
- **⚡ Automated Updates** - GitHub Actions fetch fresh data every 6 hours
- **🔄 Smart Caching** - Local storage fallback for offline access

## 🚀 Quick Start

### Live Demo
Visit the live application: **[TrendPilot on GitHub Pages](https://sudzv1606.github.io/TrendPilot/)**

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sudzv1606/TrendPilot.git
   cd TrendPilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local server** (optional)
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Architecture

### GitHub-Powered Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript (GitHub Pages)
- **Backend**: GitHub Actions + Node.js scripts
- **AI Engine**: OpenRouter API with Alibaba Tongyi model
- **Data Storage**: JSON files in repository
- **Deployment**: Automated GitHub Actions workflows

### Data Sources
- **Reddit API** - r/startups, r/technology, r/ArtificialIntelligence
- **GitHub API** - Trending repositories and developer activity
- **Hacker News** - Top stories and discussions
- **Product Hunt** - Latest product launches (with API key)

## 🤖 AI Integration

TrendPilot uses **OpenRouter AI** with the `alibaba/tongyi-deepresearch-30b-a3b:free` model for:

- **Trend Identification** - Finds patterns across multiple data sources
- **Smart Clustering** - Groups related content into coherent trends
- **Scoring Algorithm** - Rates trends 0-100 based on relevance and impact
- **Summary Generation** - Creates concise explanations of why trends matter

## 📊 Data Collection

### Automated Updates
- **Frequency**: Every 6 hours via GitHub Actions
- **Process**: Fetches → AI Analysis → Storage → Visualization
- **Storage**: JSON files with historical trend data

### Trend Analysis Pipeline
1. **Data Collection** - Parallel API calls to all sources
2. **Content Aggregation** - Combine and deduplicate items
3. **AI Processing** - Advanced trend analysis and clustering
4. **Scoring & Ranking** - Rate trends by relevance and impact
5. **Storage & Visualization** - Save and display results

## 🎨 User Interface

### Dashboard Features
- **Trend Cards** - Visual display of identified trends
- **Interactive Charts** - Bar charts showing trend scores
- **Source Filtering** - Filter trends by platform
- **Real-time Updates** - Fresh data with one click
- **Responsive Design** - Works on all devices

### Trend Information
Each trend includes:
- **Topic Name** - Clear, concise trend identification
- **Relevance Score** - 0-100 rating based on impact
- **Summary** - AI-generated explanation
- **Source Platforms** - Where the trend appears
- **Examples** - Specific instances and evidence

## 🔧 Configuration

### Required API Keys
- **OpenRouter API Key** - For AI analysis (already configured)
- **Reddit API Credentials** - For enhanced Reddit access (already configured)

### Optional Enhancements
- **Product Hunt API Key** - For product launch data
- **GitHub Token** - For private repository access

## 🚀 Deployment

### Automatic Deployment
- **Trigger**: Push to main branch
- **Process**: GitHub Actions builds and deploys
- **Result**: Live on GitHub Pages within minutes

### Manual Deployment
```bash
# Deploy to GitHub Pages
git add .
git commit -m "Update TrendPilot"
git push origin main
```

## 📈 Usage

1. **Visit the Dashboard** - Go to the live URL or run locally
2. **Fetch Latest Trends** - Click the "Fetch Latest Trends" button
3. **Explore Results** - View AI-analyzed trends with scores and summaries
4. **Filter by Source** - Use dropdown to filter by platform
5. **View Charts** - See visual representation of trend scores

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Areas for Enhancement
- Additional data sources
- Advanced filtering options
- Historical trend tracking
- Export functionality
- Mobile app development

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **OpenRouter** - AI model access and API
- **GitHub** - Hosting, Actions, and repository services
- **Reddit API** - Community discussion data
- **Hacker News** - Tech community insights
- **Chart.js** - Beautiful, responsive charts

---

**Built with ❤️ for the tech community** | [View on GitHub](https://github.com/Sudzv1606/TrendPilot) | [Report Issues](https://github.com/Sudzv1606/TrendPilot/issues)
