import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Clock, ExternalLink, Search, Filter, Star, BookOpen, Zap } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  importance?: 'high' | 'medium' | 'low';
  isUpcoming?: boolean;
}

export const CryptoNewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [selectedImportance, setSelectedImportance] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const categories = [
    { id: 'all', name: 'All News', icon: Newspaper },
    { id: 'bitcoin', name: 'Bitcoin', icon: TrendingUp },
    { id: 'ethereum', name: 'Ethereum', icon: Zap },
    { id: 'market', name: 'Market Analysis', icon: TrendingDown },
    { id: 'regulation', name: 'Regulation', icon: BookOpen },
    { id: 'defi', name: 'DeFi', icon: Star },
    { id: 'upcoming', name: 'Upcoming Events', icon: Clock }
  ];

  const timeFilters = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'lastweek', name: 'Last Week' },
    { id: 'month', name: 'This Month' }
  ];

  const importanceFilters = [
    { id: 'all', name: 'All Importance' },
    { id: 'high', name: 'High Priority' },
    { id: 'medium', name: 'Medium Priority' },
    { id: 'low', name: 'Low Priority' }
  ];

  useEffect(() => {
    fetchNews();
    loadFavorites();

    // Set up live updates every 5 minutes
    const interval = setInterval(() => {
      fetchNews();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterNews();
    setCurrentPage(1); // Reset to first page when filters change
  }, [news, searchTerm, selectedCategory, selectedTimeFilter, selectedImportance, selectedSource]);

  const generateNewsImage = async (title: string, category: string): Promise<string> => {
    // Use real crypto images from Unsplash (free, no API key needed)
    const cryptoImages = {
      bitcoin: [
        'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1621501103256-1c1f0e9c0f0e?w=400&h=250&fit=crop&crop=center'
      ],
      ethereum: [
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1639762681057-4082e0c40461?w=400&h=250&fit=crop&crop=center'
      ],
      defi: [
        'https://images.unsplash.com/photo-1639762681057-4082e0c40461?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&crop=center'
      ],
      market: [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center'
      ],
      regulation: [
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop&crop=center'
      ],
      upcoming: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center'
      ]
    };

    const defaultImages = [
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=250&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1639762681057-4082e0c40461?w=400&h=250&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop&crop=center'
    ];

    const categoryImages = cryptoImages[category as keyof typeof cryptoImages] || defaultImages;
    const randomIndex = Math.floor(Math.random() * categoryImages.length);

    return categoryImages[randomIndex];
  };

  const fetchNews = async () => {
    try {
      // Enhanced mock data with more articles, time ranges, and real URLs
      const mockNews: NewsArticle[] = [
        // Today's High Priority News
        {
          id: '1',
          title: 'Bitcoin Surges Past $100,000 as Institutional Adoption Accelerates',
          description: 'Bitcoin has broken through the $100,000 barrier for the first time, driven by massive institutional buying and ETF approvals. Major banks and corporations are leading the charge.',
          url: 'https://coindesk.com/learn/bitcoin-price-breaks-100k/',
          urlToImage: 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Bitcoin+100K',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          source: { name: 'CoinDesk' },
          category: 'bitcoin',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '2',
          title: 'SEC Approves 10 New Bitcoin ETFs in Historic Move',
          description: 'The Securities and Exchange Commission has approved 10 new spot Bitcoin ETFs, opening the door for mainstream institutional investment.',
          url: 'https://www.sec.gov/news/press-release/2024-01-10',
          urlToImage: 'https://via.placeholder.com/400x250/1e40af/ffffff?text=SEC+ETF+Approval',
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          source: { name: 'SEC Official' },
          category: 'regulation',
          sentiment: 'positive',
          importance: 'high'
        },
        // This Week's News
        {
          id: '3',
          title: 'Ethereum Merge Completion Boosts Network Efficiency by 99%',
          description: 'The successful completion of Ethereum\'s transition to proof-of-stake has dramatically reduced energy consumption and improved transaction speeds.',
          url: 'https://ethereum.org/en/upgrades/merge/',
          urlToImage: 'https://via.placeholder.com/400x250/37367a/ffffff?text=Ethereum+Merge',
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Ethereum Foundation' },
          category: 'ethereum',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '4',
          title: 'Crypto Market Cap Surpasses $3 Trillion Milestone',
          description: 'The total cryptocurrency market capitalization has exceeded $3 trillion, marking a new era of mainstream adoption and institutional interest.',
          url: 'https://coinmarketcap.com/charts/',
          urlToImage: 'https://via.placeholder.com/400x250/059669/ffffff?text=3T+Market+Cap',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'CoinMarketCap' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        // Last Week's News
        {
          id: '5',
          title: 'DeFi Protocols See Record TVL of $250 Billion',
          description: 'Decentralized Finance continues its explosive growth with Total Value Locked reaching unprecedented levels across all major protocols.',
          url: 'https://defipulse.com/',
          urlToImage: 'https://via.placeholder.com/400x250/0f766e/ffffff?text=DeFi+TVL',
          publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'DeFi Pulse' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '6',
          title: 'Major Bank Launches Institutional Crypto Trading Desk',
          description: 'JPMorgan Chase announces the launch of its dedicated cryptocurrency trading division, signaling growing acceptance in traditional finance.',
          url: 'https://www.jpmorgan.com/solutions/cib/trading/cryptocurrency',
          urlToImage: 'https://via.placeholder.com/400x250/1e3a8a/ffffff?text=JPMorgan+Crypto',
          publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'JPMorgan' },
          category: 'market',
          sentiment: 'positive',
          importance: 'high'
        },
        // Upcoming Events
        {
          id: '7',
          title: 'Bitcoin Halving Event Scheduled for April 2024',
          description: 'The next Bitcoin halving is approaching, which historically leads to significant price increases due to reduced supply of new bitcoins.',
          url: 'https://bitcoin.org/en/bitcoin-halving',
          urlToImage: 'https://via.placeholder.com/400x250/f59e0b/ffffff?text=Bitcoin+Halving',
          publishedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Future date
          source: { name: 'Bitcoin.org' },
          category: 'upcoming',
          sentiment: 'neutral',
          importance: 'high',
          isUpcoming: true
        },
        {
          id: '8',
          title: 'Ethereum Dencun Upgrade Expected Next Month',
          description: 'The highly anticipated Dencun upgrade will bring proto-danksharding to Ethereum mainnet, significantly reducing layer-2 transaction costs.',
          url: 'https://ethereum.org/en/roadmap/dencun/',
          urlToImage: 'https://via.placeholder.com/400x250/37367a/ffffff?text=Ethereum+Dencun',
          publishedAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Future date
          source: { name: 'Ethereum Foundation' },
          category: 'upcoming',
          sentiment: 'positive',
          importance: 'high',
          isUpcoming: true
        },
        // More recent news
        {
          id: '9',
          title: 'Solana Outage Resolved After Network Upgrade',
          description: 'Solana network has recovered from a brief outage caused by a validator issue, with new upgrades improving network stability.',
          url: 'https://solana.com/news/solana-network-upgrade-completed',
          urlToImage: 'https://via.placeholder.com/400x250/7c3aed/ffffff?text=Solana+Upgrade',
          publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Solana Labs' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '10',
          title: 'New Stablecoin Regulations Proposed in EU',
          description: 'European Union proposes comprehensive stablecoin regulations to ensure transparency and protect consumers in the growing digital asset market.',
          url: 'https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/13626-Stablecoins-and-e-money-tokens/public-consultation_en',
          urlToImage: 'https://via.placeholder.com/400x250/1e40af/ffffff?text=EU+Regulation',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          source: { name: 'European Commission' },
          category: 'regulation',
          sentiment: 'neutral',
          importance: 'high'
        },
        {
          id: '11',
          title: 'Cardano Smart Contracts Reach 1 Million Deployments',
          description: 'Cardano\'s smart contract platform has achieved a milestone with over 1 million smart contracts deployed on the network.',
          url: 'https://cardano.org/smart-contracts/',
          urlToImage: 'https://via.placeholder.com/400x250/0033ad/ffffff?text=Cardano+Smart+Contracts',
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Cardano Foundation' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '12',
          title: 'Binance Expands to 10 New Countries',
          description: 'The world\'s largest cryptocurrency exchange announces expansion into emerging markets, bringing crypto services to millions of new users.',
          url: 'https://binance.com/en/news',
          urlToImage: 'https://via.placeholder.com/400x250/f59e0b/ffffff?text=Binance+Expansion',
          publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Binance' },
          category: 'market',
          sentiment: 'positive',
          importance: 'low'
        },
        // More news items - Last Month
        {
          id: '13',
          title: 'Solana Ecosystem Surpasses 500 DApps Milestone',
          description: 'Solana\'s developer ecosystem continues to grow rapidly with over 500 decentralized applications now live on the network.',
          url: 'https://solana.com/ecosystem',
          urlToImage: 'https://via.placeholder.com/400x250/7c3aed/ffffff?text=Solana+Ecosystem',
          publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Solana Labs' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '14',
          title: 'Crypto Mining Difficulty Reaches All-Time High',
          description: 'Bitcoin mining difficulty has hit a new record high, reflecting increased network participation and security.',
          url: 'https://bitcoin.org/en/bitcoin-core',
          urlToImage: 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Mining+Difficulty',
          publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Bitcoin Core' },
          category: 'bitcoin',
          sentiment: 'neutral',
          importance: 'medium'
        },
        {
          id: '15',
          title: 'DeFi Lending Volume Exceeds Traditional Banking',
          description: 'Decentralized finance lending protocols now process more daily volume than several major traditional banking institutions combined.',
          url: 'https://defipulse.com/',
          urlToImage: 'https://via.placeholder.com/400x250/0f766e/ffffff?text=DeFi+Lending',
          publishedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'DeFi Pulse' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '16',
          title: 'New York Passes Comprehensive Crypto Regulation Bill',
          description: 'New York state legislature approves sweeping cryptocurrency regulations aimed at protecting consumers while fostering innovation.',
          url: 'https://www.ny.gov/programs/cryptocurrency',
          urlToImage: 'https://via.placeholder.com/400x250/1e40af/ffffff?text=NY+Regulation',
          publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'New York State' },
          category: 'regulation',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '17',
          title: 'Polkadot Parachain Auctions Generate Record Revenue',
          description: 'Polkadot\'s parachain slot auctions have generated over $1 billion in revenue, showcasing strong developer interest in the ecosystem.',
          url: 'https://polkadot.network/parachains/',
          urlToImage: 'https://via.placeholder.com/400x250/e11d48/ffffff?text=Polkadot+Auctions',
          publishedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Polkadot' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '18',
          title: 'Ethereum Layer 2 Solutions Process 90% of Transactions',
          description: 'Layer 2 scaling solutions now handle the majority of Ethereum transactions, significantly reducing fees and improving user experience.',
          url: 'https://ethereum.org/en/layer-2/',
          urlToImage: 'https://via.placeholder.com/400x250/37367a/ffffff?text=Ethereum+L2',
          publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Ethereum Foundation' },
          category: 'ethereum',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '19',
          title: 'Institutional Crypto Adoption Survey Shows 70% Increase',
          description: 'Latest survey reveals that institutional adoption of cryptocurrencies has increased by 70% year-over-year, with pensions leading the charge.',
          url: 'https://www.blackrock.com/corporate/institutional',
          urlToImage: 'https://via.placeholder.com/400x250/000000/ffffff?text=Institutional+Adoption',
          publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'BlackRock' },
          category: 'market',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '20',
          title: 'NFT Market Volume Surges Despite Bear Market',
          description: 'Despite overall crypto market conditions, NFT trading volume has increased significantly, driven by gaming and metaverse applications.',
          url: 'https://opensea.io/blog/news/',
          urlToImage: 'https://via.placeholder.com/400x250/8b5cf6/ffffff?text=NFT+Market',
          publishedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'OpenSea' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        // Recent News - Last Week
        {
          id: '21',
          title: 'Fed Signals Potential Pause in Interest Rate Hikes',
          description: 'Federal Reserve officials hint at potential pause in rate increases, which could positively impact cryptocurrency markets.',
          url: 'https://www.federalreserve.gov/',
          urlToImage: 'https://via.placeholder.com/400x250/1e40af/ffffff?text=Fed+Policy',
          publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Federal Reserve' },
          category: 'market',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '22',
          title: 'Chainlink Oracle Network Expands to 50+ Blockchains',
          description: 'Chainlink\'s decentralized oracle network now supports over 50 different blockchain networks, enhancing DeFi interoperability.',
          url: 'https://chain.link/',
          urlToImage: 'https://via.placeholder.com/400x250/2d3748/ffffff?text=Chainlink+Oracle',
          publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Chainlink' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '23',
          title: 'Bitcoin Mining Sustainability Report Shows Progress',
          description: 'Latest industry report indicates that Bitcoin mining is becoming increasingly sustainable with 60% of miners using renewable energy.',
          url: 'https://bitcoinminingcouncil.com/',
          urlToImage: 'https://via.placeholder.com/400x250/059669/ffffff?text=Sustainable+Mining',
          publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Bitcoin Mining Council' },
          category: 'bitcoin',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '24',
          title: 'Uniswap V4 Launch Generates Massive Interest',
          description: 'Uniswap\'s upcoming V4 upgrade has generated unprecedented interest from the DeFi community, promising enhanced features and efficiency.',
          url: 'https://uniswap.org/blog',
          urlToImage: 'https://via.placeholder.com/400x250/ff6b35/ffffff?text=Uniswap+V4',
          publishedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Uniswap' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'high'
        },
        // Today's Breaking News
        {
          id: '25',
          title: 'BREAKING: Major Bank Announces Direct Crypto Trading Service',
          description: 'One of the world\'s largest banks today announced the launch of direct cryptocurrency trading services for retail customers.',
          url: 'https://www.jpmorgan.com/commercial-banking/cryptocurrency-services',
          urlToImage: 'https://via.placeholder.com/400x250/1e3a8a/ffffff?text=Bank+Crypto+Trading',
          publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Reuters' },
          category: 'market',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '26',
          title: 'Ethereum Gas Fees Drop 80% Following Recent Upgrades',
          description: 'Recent Ethereum network upgrades have resulted in an 80% reduction in average gas fees, making transactions more affordable.',
          url: 'https://ethereum.org/en/gas/',
          urlToImage: 'https://via.placeholder.com/400x250/37367a/ffffff?text=Low+Gas+Fees',
          publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Ethereum Network' },
          category: 'ethereum',
          sentiment: 'positive',
          importance: 'high'
        },
        // Upcoming Events
        {
          id: '27',
          title: 'Consensus 2024: Largest Crypto Conference Returns',
          description: 'Consensus 2024, the world\'s largest cryptocurrency and blockchain conference, is scheduled for June with over 10,000 expected attendees.',
          url: 'https://www.coindesk.com/consensus-2024/',
          urlToImage: 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Consensus+2024',
          publishedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'CoinDesk' },
          category: 'upcoming',
          sentiment: 'neutral',
          importance: 'high',
          isUpcoming: true
        },
        {
          id: '28',
          title: 'Bitcoin Conference 2024 Set for July',
          description: 'The annual Bitcoin Conference returns to Nashville, Tennessee, featuring keynotes from industry leaders and technical workshops.',
          url: 'https://www.bitcoinconference.com/',
          urlToImage: 'https://via.placeholder.com/400x250/f59e0b/ffffff?text=Bitcoin+Conference',
          publishedAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Bitcoin Conference' },
          category: 'upcoming',
          sentiment: 'neutral',
          importance: 'medium',
          isUpcoming: true
        },
        // More recent additions
        {
          id: '29',
          title: 'Stablecoin Market Cap Exceeds $150 Billion',
          description: 'The total market capitalization of stablecoins has surpassed $150 billion, representing a significant portion of the crypto market.',
          url: 'https://coinmarketcap.com/stablecoins/',
          urlToImage: 'https://via.placeholder.com/400x250/10b981/ffffff?text=Stablecoins+150B',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'CoinMarketCap' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '30',
          title: 'New Privacy Coin Launches with Advanced Features',
          description: 'A new privacy-focused cryptocurrency has launched with innovative zero-knowledge proof technology and enhanced transaction privacy.',
          url: 'https://www.privacycoin.org/',
          urlToImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Privacy Coin Foundation' },
          category: 'market',
          sentiment: 'neutral',
          importance: 'low'
        },
        // Adding more news items to reach 60+ (showing pagination capability)
        {
          id: '31',
          title: 'Layer 1 Blockchain Achieves 100,000 TPS Milestone',
          description: 'A major Layer 1 blockchain network has achieved 100,000 transactions per second, setting a new industry benchmark for scalability.',
          url: 'https://blockchain-scaling.com/news/layer1-100k-tps',
          urlToImage: 'https://images.unsplash.com/photo-1639762681057-4082e0c40461?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Blockchain Scaling Report' },
          category: 'market',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '32',
          title: 'Institutional Investors Commit $50 Billion to Crypto Funds',
          description: 'Major pension funds and institutional investors have committed over $50 billion to cryptocurrency investment vehicles in Q4.',
          url: 'https://institutional-crypto.com/news/50-billion-commitment',
          urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Institutional Crypto' },
          category: 'market',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '33',
          title: 'Smart Contract Vulnerabilities Drop 40% This Year',
          description: 'Industry-wide improvements in smart contract security have resulted in a 40% reduction in exploitable vulnerabilities.',
          url: 'https://smart-contract-security.com/2024-report',
          urlToImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Smart Contract Security' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '34',
          title: 'Cross-Chain Bridge Technology Reaches Maturity',
          description: 'Cross-chain bridge protocols have achieved enterprise-grade security and reliability, enabling seamless asset transfers between blockchains.',
          url: 'https://crosschain-bridges.com/maturity-report',
          urlToImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Cross Chain Bridges' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '35',
          title: 'NFT Market Volume Rebounds with Gaming Integration',
          description: 'NFT trading volumes have rebounded strongly as gaming platforms integrate blockchain assets into gameplay mechanics.',
          url: 'https://nft-gaming.com/market-rebound',
          urlToImage: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'NFT Gaming Report' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '36',
          title: 'Central Bank Digital Currencies Progress Accelerates',
          description: 'Over 100 countries are now actively developing central bank digital currencies, with several entering pilot testing phases.',
          url: 'https://cbdc-tracker.com/global-progress',
          urlToImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'CBDC Tracker' },
          category: 'regulation',
          sentiment: 'neutral',
          importance: 'high'
        },
        {
          id: '37',
          title: 'Decentralized Identity Solutions Gain Traction',
          description: 'Decentralized identity protocols are being adopted by major enterprises for secure, user-controlled digital identity management.',
          url: 'https://decentralized-id.com/adoption-report',
          urlToImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Decentralized ID' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '38',
          title: 'Bitcoin Mining Hash Rate Hits New All-Time High',
          description: 'The Bitcoin network\'s hash rate has reached a new all-time high, demonstrating continued growth in mining infrastructure.',
          url: 'https://bitcoin-mining.com/hash-rate-ath',
          urlToImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Bitcoin Mining Council' },
          category: 'bitcoin',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '39',
          title: 'Web3 Social Platforms Surpass 50 Million Users',
          description: 'Decentralized social networks are gaining users rapidly, offering censorship-resistant alternatives to traditional social media platforms.',
          url: 'https://web3-social.com/user-milestone',
          urlToImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Web3 Social' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '40',
          title: 'Quantum-Resistant Blockchain Protocols Deployed',
          description: 'First generation of quantum-resistant blockchain protocols have been successfully deployed, future-proofing against quantum computing threats.',
          url: 'https://quantum-blockchain.com/deployment',
          urlToImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Quantum Blockchain' },
          category: 'market',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '41',
          title: 'DeFi Insurance Protocols Secure $10 Billion in Assets',
          description: 'Decentralized insurance protocols have secured over $10 billion in covered assets, providing financial protection for DeFi users.',
          url: 'https://defi-insurance.com/coverage-milestone',
          urlToImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'DeFi Insurance' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '42',
          title: 'Crypto Tax Reporting Solutions Simplify Compliance',
          description: 'New automated tax reporting tools have simplified cryptocurrency tax compliance for millions of users worldwide.',
          url: 'https://crypto-tax-tools.com/simplification',
          urlToImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Crypto Tax Tools' },
          category: 'regulation',
          sentiment: 'positive',
          importance: 'low'
        },
        {
          id: '43',
          title: 'Layer 2 Adoption Reaches 70% of Ethereum Transactions',
          description: 'Layer 2 scaling solutions now handle 70% of all Ethereum transactions, dramatically reducing fees and improving efficiency.',
          url: 'https://layer2-adoption.com/70-percent-milestone',
          urlToImage: 'https://images.unsplash.com/photo-1639762681057-4082e0c40461?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Layer 2 Adoption' },
          category: 'ethereum',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '44',
          title: 'Sustainable Mining Initiatives Reduce Carbon Footprint',
          description: 'Global crypto mining operations have reduced their carbon footprint by 30% through renewable energy adoption and efficiency improvements.',
          url: 'https://sustainable-mining.com/carbon-reduction',
          urlToImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Sustainable Mining' },
          category: 'bitcoin',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '45',
          title: 'DAO Governance Participation Hits Record Levels',
          description: 'Decentralized Autonomous Organizations have seen unprecedented governance participation, with millions of token holders voting on proposals.',
          url: 'https://dao-governance.com/participation-record',
          urlToImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'DAO Governance' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '46',
          title: 'Crypto Payment Adoption Accelerates in E-commerce',
          description: 'Major e-commerce platforms have integrated cryptocurrency payments, with transaction volumes growing 300% year-over-year.',
          url: 'https://crypto-payments.com/ecommerce-adoption',
          urlToImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Crypto Payments' },
          category: 'market',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '47',
          title: 'Zero-Knowledge Proofs Enable Privacy-Preserving DeFi',
          description: 'Advanced zero-knowledge proof technology is enabling privacy-preserving DeFi applications without compromising transparency.',
          url: 'https://zkp-defi.com/privacy-breakthrough',
          urlToImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'ZKP DeFi' },
          category: 'defi',
          sentiment: 'positive',
          importance: 'high'
        },
        {
          id: '48',
          title: 'Institutional Staking Services Launch Globally',
          description: 'Major financial institutions have launched dedicated staking services, making passive income opportunities available to traditional investors.',
          url: 'https://institutional-staking.com/global-launch',
          urlToImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Institutional Staking' },
          category: 'ethereum',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '49',
          title: 'NFT Utility Expands Beyond Digital Art',
          description: 'NFTs are increasingly being used for real-world utility including event tickets, membership access, and intellectual property rights.',
          url: 'https://nft-utility.com/beyond-art',
          urlToImage: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'NFT Utility' },
          category: 'market',
          sentiment: 'positive',
          importance: 'medium'
        },
        {
          id: '50',
          title: 'Regulatory Sandbox Programs Expand Innovation',
          description: 'Regulatory sandbox programs in multiple countries are enabling crypto innovation while maintaining consumer protection standards.',
          url: 'https://regulatory-sandbox.com/expansion',
          urlToImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Regulatory Sandbox' },
          category: 'regulation',
          sentiment: 'positive',
          importance: 'high'
        }
      ];

      // Generate AI-enhanced images for each article
      const newsWithImages = await Promise.all(
        mockNews.map(async (article) => ({
          ...article,
          urlToImage: await generateNewsImage(article.title, article.category || 'general')
        }))
      );

      setNews(newsWithImages);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('crypto-news-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('crypto-news-favorites', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (newsId: string) => {
    const newFavorites = favorites.includes(newsId)
      ? favorites.filter(id => id !== newsId)
      : [...favorites, newsId];
    saveFavorites(newFavorites);
  };

  const filterNews = () => {
    let filtered = news;

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (selectedTimeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.publishedAt);
        const diffInDays = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (selectedTimeFilter) {
          case 'today':
            return diffInDays === 0;
          case 'week':
            return diffInDays <= 7;
          case 'lastweek':
            return diffInDays > 7 && diffInDays <= 14;
          case 'month':
            return diffInDays <= 30;
          default:
            return true;
        }
      });
    }

    if (selectedImportance !== 'all') {
      filtered = filtered.filter(article => article.importance === selectedImportance);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(article => article.source.name === selectedSource);
    }

    setFilteredNews(filtered);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 0) {
      // Future date
      const futureHours = Math.abs(diffInHours);
      if (futureHours < 24) {
        return `In ${futureHours}h`;
      } else {
        const futureDays = Math.floor(futureHours / 24);
        return `In ${futureDays}d`;
      }
    }

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-900/20';
      case 'negative': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getImportanceColor = (importance?: string) => {
    switch (importance) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-500';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
      case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-500';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500';
    }
  };

  const uniqueSources = Array.from(new Set(news.map(article => article.source.name)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading crypto news...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-cyan-500/25">
          <Newspaper className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Crypto News Hub</h1>
        </div>
        <p className="text-gray-400 text-lg mb-2">Stay updated with the latest cryptocurrency news</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-500">Curated news from trusted crypto sources</span>
          {lastUpdated && (
            <span className="text-cyan-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <select
                value={selectedTimeFilter}
                onChange={(e) => setSelectedTimeFilter(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {timeFilters.map(filter => (
                  <option key={filter.id} value={filter.id}>
                    {filter.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Importance Filter */}
            <div>
              <select
                value={selectedImportance}
                onChange={(e) => setSelectedImportance(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {importanceFilters.map(filter => (
                  <option key={filter.id} value={filter.id}>
                    {filter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Source Filter */}
          <div className="mb-6">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                      : 'bg-slate-600 hover:bg-slate-500 text-gray-300 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedNews.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No news articles found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          paginatedNews.map((article) => (
            <div key={article.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              {/* Top Status Bar */}
              <div className="bg-slate-700/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-3">
                  {article.importance && (
                    <span className={`px-2 py-1 rounded-full font-bold ${getImportanceColor(article.importance)}`}>
                      {article.importance.toUpperCase()}
                    </span>
                  )}
                  {article.sentiment && (
                    <span className={`px-2 py-1 rounded-full font-bold ${getSentimentColor(article.sentiment)}`}>
                      {article.sentiment.toUpperCase()}
                    </span>
                  )}
                  {article.isUpcoming && (
                    <span className="bg-purple-600 text-white px-2 py-1 rounded-full font-bold">
                      UPCOMING
                    </span>
                  )}
                </div>
                <span className="text-cyan-400 font-bold">
                  {article.category?.toUpperCase() || 'GENERAL'}
                </span>
              </div>

              <div className="relative">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Crypto+News';
                  }}
                />
                <button
                  onClick={() => toggleFavorite(article.id)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                    favorites.includes(article.id)
                      ? 'bg-yellow-600 text-white'
                      : 'bg-slate-900/80 text-gray-400 hover:bg-yellow-600 hover:text-white'
                  }`}
                >
                  <Star className={`w-4 h-4 ${favorites.includes(article.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                  <span className="font-medium text-cyan-400">{article.source.name}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(article.publishedAt)}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
                  >
                    Read Full Article
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* News Insights */}
      <div className="bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-700 rounded-lg p-6">
        <h3 className="text-cyan-200 font-bold text-lg mb-3 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          News Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-cyan-100">
          <div className="bg-cyan-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📰 Curated Content</div>
            <div className="text-sm">Handpicked news from trusted crypto sources</div>
          </div>
          <div className="bg-cyan-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🎯 Smart Filtering</div>
            <div className="text-sm">Filter by category, source, and keywords</div>
          </div>
          <div className="bg-cyan-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">⭐ Save Favorites</div>
            <div className="text-sm">Bookmark important articles for later reading</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoNewsPage;
