import React, { useState } from 'react';
import {
  Search,
  Code2,
  BookOpen,
  TrendingUp,
  Award,
  Target,
  FileCode,
  ExternalLink,
  Zap,
  Database,
  ChevronRight,
  Menu,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Next.js API Routes (internal proxy to your FastAPI backend)
const API_BASE_URL = '/api';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [problemsData, setProblemsData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchProfile = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);
    setProfileData(null);
    setStatsData(null);
    setProblemsData(null);

    try {
      const [profile, stats, problems] = await Promise.all([
        fetch(`${API_BASE_URL}/profile/${username}`).then((r) => {
          if (!r.ok) throw new Error('Profile not found');
          return r.json();
        }),
        fetch(`${API_BASE_URL}/stats/${username}`).then((r) => {
          if (!r.ok) throw new Error('Stats not found');
          return r.json();
        }),
        fetch(`${API_BASE_URL}/problems/${username}`).then((r) => {
          if (!r.ok) throw new Error('Problems not found');
          return r.json();
        }),
      ]);

      if (profile.error || stats.error || problems.error) {
        throw new Error(profile.error || stats.error || problems.error);
      }

      setProfileData(profile);
      setStatsData(stats);
      setProblemsData(problems);
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : String(err)) ||
          'Failed to fetch profile data. Please check the username and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchProfile();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              <Code2 className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                GFG Profile Analytics
              </span>
            </div>

            <div className="hidden md:flex space-x-1">
              {['home', 'docs', 'api'].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    currentPage === page
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-green-50'
                  }`}
                >
                  {page === 'api' ? 'API Reference' : page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-green-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {['home', 'docs', 'api'].map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    currentPage === page
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-green-50'
                  }`}
                >
                  {page === 'api' ? 'API Reference' : page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && (
          <HomePage
            username={username}
            setUsername={setUsername}
            loading={loading}
            error={error}
            profileData={profileData}
            statsData={statsData}
            problemsData={problemsData}
            fetchProfile={fetchProfile}
            handleKeyPress={handleKeyPress}
          />
        )}
        {currentPage === 'docs' && <DocsPage />}
        {currentPage === 'api' && <APIPage />}
      </div>

      <footer className="bg-white/50 backdrop-blur-sm border-t border-green-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-green-600" />
              <span className="text-gray-600">GFG Profile Analytics</span>
            </div>
            <div className="text-sm text-gray-500">Built with Next.js, FastAPI & Playwright</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HomePage = ({
  username,
  setUsername,
  loading,
  error,
  profileData,
  statsData,
  problemsData,
  fetchProfile,
  handleKeyPress,
}: {
  username: string;
  setUsername: (value: string) => void;
  loading: boolean;
  error: string | null;
  profileData: any;
  statsData: any;
  problemsData: any;
  fetchProfile: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <Zap className="w-4 h-4" />
          <span>Fast • Secure • Real-time</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          GeeksforGeeks Profile Analytics
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get comprehensive insights into any GFG profile including stats, streaks, and detailed
          problem lists
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter GFG username..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
            <button
              onClick={fetchProfile}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze Profile</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {profileData && statsData && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {profileData.fullName || username}
                </h2>
                {profileData.designation && (
                  <p className="text-gray-600 mt-1">{profileData.designation}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">@{username}</p>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-br from-yellow-50 to-orange-50 px-6 py-4 rounded-xl border-2 border-yellow-200">
                <Award className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Coding Score</p>
                  <p className="text-3xl font-bold text-green-600">{profileData.codingScore}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Target className="w-6 h-6" />}
              label="Problems Solved"
              value={profileData.problemsSolved}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Institute Rank"
              value={profileData.instituteRank || 'N/A'}
              color="purple"
            />
            <StatCard
              icon={<FileCode className="w-6 h-6" />}
              label="Articles"
              value={profileData.articlesPublished}
              color="orange"
            />
            <StatCard
              icon={<Zap className="w-6 h-6" />}
              label="Longest Streak"
              value={profileData.longestStreak}
              color="green"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Database className="w-6 h-6 text-green-600" />
              <span>Problems by Difficulty</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statsData)
                .filter(([key]) => !['userName', 'totalProblemsSolved', 'error'].includes(key))
                .map(([difficulty, count]) => (
                  <DifficultyCard
                    key={difficulty}
                    difficulty={difficulty}
                    count={count as number}
                  />
                ))}
            </div>
          </div>

          {problemsData && problemsData.Problems && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  <span>Solved Problems</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['All', ...Object.keys(problemsData.Problems)].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDifficulty === diff
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <ProblemList
                problems={problemsData.Problems}
                selectedDifficulty={selectedDifficulty}
              />
            </div>
          )}

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border-2 border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-green-600" />
              <span>Embeddable Stats Card</span>
            </h3>
            <p className="text-gray-600 mb-6">
              Use this card in your GitHub README or personal website
            </p>
            <div className="bg-white rounded-xl p-6 mb-4 border border-green-200">
              <img
                src={`${API_BASE_URL}/stats/${username}?format=svg`}
                alt="GFG Stats Card"
                className="mx-auto max-w-full"
              />
            </div>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <code className="text-green-400 text-sm font-mono">
                {`![GFG Stats](${typeof window !== 'undefined' ? window.location.origin : ''}${API_BASE_URL}/stats/${username}?format=svg)`}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'purple' | 'orange' | 'green';
}) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all hover:scale-105">
      <div
        className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colors[color]} text-white mb-3`}
      >
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const DifficultyCard = ({ difficulty, count }: { difficulty: string; count: number }) => {
  const colors: { [key: string]: string } = {
    School: 'bg-gray-100 text-gray-700 border-gray-300',
    Basic: 'bg-blue-100 text-blue-700 border-blue-300',
    Easy: 'bg-green-100 text-green-700 border-green-300',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Hard: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div
      className={`rounded-xl p-4 border-2 ${colors[difficulty]} hover:scale-105 transition-transform cursor-default`}
    >
      <p className="text-sm font-semibold mb-1">{difficulty}</p>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
};

const ProblemList = ({
  problems,
  selectedDifficulty,
}: {
  problems: { [key: string]: Array<{ question: string; questionUrl: string }> };
  selectedDifficulty: string;
}) => {
  const displayProblems =
    selectedDifficulty === 'All'
      ? Object.values(problems).flat()
      : problems[selectedDifficulty] || [];

  if (displayProblems.length === 0) {
    return (
      <div className="text-center py-12">
        <FileCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No problems found for this difficulty</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
      {displayProblems.map((problem, index) => (
        <a
          key={index}
          href={problem.questionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 rounded-lg hover:bg-green-50 transition-colors group border border-gray-100 hover:border-green-200"
        >
          <span className="text-gray-700 group-hover:text-green-700 font-medium flex-1">
            {problem.question}
          </span>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 ml-2 flex-shrink-0" />
        </a>
      ))}
    </div>
  );
};

const DocsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <BookOpen className="w-16 h-16 mx-auto text-green-600" />
        <h1 className="text-4xl font-bold text-gray-900">Documentation</h1>
        <p className="text-lg text-gray-600">Learn how to use the GFG Profile Analytics platform</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 space-y-8">
        <Section title="Overview">
          <p className="text-gray-700 leading-relaxed">
            GFG Profile Analytics is a powerful tool that provides comprehensive insights into
            GeeksforGeeks user profiles. Built with Next.js and powered by FastAPI with Playwright
            for reliable data extraction, it offers real-time statistics, problem-solving history,
            and detailed analytics.
          </p>
        </Section>

        <Section title="Features">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start space-x-3">
              <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Profile Statistics:</strong> View coding score, institute rank, articles
                published, and streak information
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Problem Breakdown:</strong> See problems solved categorized by difficulty
                (School, Basic, Easy, Medium, Hard)
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Detailed Problem Lists:</strong> Access complete lists of solved problems
                with direct links
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Embeddable Cards:</strong> Generate SVG cards for GitHub READMEs and
                personal websites
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Rate Limited & Secure:</strong> Protected API endpoints with rate limiting
                and input validation
              </span>
            </li>
          </ul>
        </Section>

        <Section title="How to Use">
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-900 mb-2">Step 1: Enter Username</p>
              <p className="text-gray-700 text-sm">
                Type the GeeksforGeeks username in the search box on the home page
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="font-semibold text-blue-900 mb-2">Step 2: Analyze Profile</p>
              <p className="text-gray-700 text-sm">
                Click "Analyze Profile" or press Enter to fetch the data
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="font-semibold text-purple-900 mb-2">Step 3: Explore Results</p>
              <p className="text-gray-700 text-sm">
                View comprehensive statistics, filter problems by difficulty, and copy embeddable
                cards
              </p>
            </div>
          </div>
        </Section>

        <Section title="API Integration">
          <p className="text-gray-700 mb-4">
            The platform uses Next.js API routes that act as a secure proxy to the FastAPI backend.
            This architecture ensures your backend remains hidden and protected.
          </p>
          <CodeBlock
            code={`// Example API call
fetch('/api/profile/username')
  .then(res => res.json())
  .then(data => console.log(data));`}
          />
        </Section>

        <Section title="Embeddable Cards">
          <p className="text-gray-700 mb-4">
            Generate beautiful SVG cards to showcase your GFG stats on GitHub or personal websites:
          </p>
          <CodeBlock code={`![GFG Stats](https://your-domain.com/api/stats/username?format=svg)`} />
          <p className="text-gray-600 text-sm mt-4">
            Cards are cached for 4 hours to improve performance and reduce server load
          </p>
        </Section>

        <Section title="Rate Limits">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-900 font-medium mb-2">⚠️ Fair Use Policy</p>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Profile & Stats endpoints: 10 requests per minute per IP</li>
              <li>• Problems endpoint: 5 requests per minute per IP (resource intensive)</li>
              <li>• Results are cached to improve performance</li>
            </ul>
          </div>
        </Section>
      </div>
    </div>
  );
};

const APIPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <Database className="w-16 h-16 mx-auto text-green-600" />
        <h1 className="text-4xl font-bold text-gray-900">API Reference</h1>
        <p className="text-lg text-gray-600">Complete API documentation for developers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 space-y-8">
        <Section title="Base URL">
          <CodeBlock
            code={`${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api`}
          />
        </Section>

        <Section title="Authentication">
          <p className="text-gray-700">
            No authentication required. All endpoints are publicly accessible with rate limiting
            applied per IP address.
          </p>
        </Section>

        <Section title="Endpoints">
          <EndpointDoc
            method="GET"
            path="/profile/:username"
            description="Retrieve comprehensive profile information including coding score, rank, streaks, and overall statistics"
            response={{
              userName: 'example_user',
              fullName: 'John Doe',
              designation: 'Software Engineer',
              codingScore: 1250,
              problemsSolved: 145,
              instituteRank: 5,
              articlesPublished: 3,
              longestStreak: 28,
              potdsSolved: 42,
            }}
          />

          <EndpointDoc
            method="GET"
            path="/stats/:username"
            description="Get problem-solving statistics broken down by difficulty level"
            params={[
              {
                name: 'format',
                type: 'query',
                description: 'Response format: "json" or "svg"',
                default: 'json',
              },
            ]}
            response={{
              userName: 'example_user',
              School: 15,
              Basic: 25,
              Easy: 45,
              Medium: 40,
              Hard: 20,
              totalProblemsSolved: 145,
            }}
          />

          <EndpointDoc
            method="GET"
            path="/problems/:username"
            description="Get detailed list of all solved problems with titles and direct links to each problem"
            response={{
              userName: 'example_user',
              problemsByDifficulty: {
                School: 15,
                Basic: 25,
                Easy: 45,
                Medium: 40,
                Hard: 20,
              },
              Problems: {
                Easy: [
                  {
                    question: 'Two Sum',
                    questionUrl: 'https://practice.geeksforgeeks.org/...',
                  },
                ],
              },
            }}
          />
        </Section>

        <Section title="Error Handling">
          <p className="text-gray-700 mb-4">
            The API returns standard HTTP status codes along with error messages in JSON format.
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-mono text-sm text-gray-700 mb-2">400 Bad Request</p>
              <CodeBlock code={`{ "error": "Invalid username format" }`} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-mono text-sm text-gray-700 mb-2">404 Not Found</p>
              <CodeBlock code={`{ "error": "Profile not found or private" }`} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-mono text-sm text-gray-700 mb-2">429 Too Many Requests</p>
              <CodeBlock code={`{ "error": "Rate limit exceeded. Please try again later." }`} />
            </div>
          </div>
        </Section>

        <Section title="Example Usage">
          <p className="text-gray-700 mb-4">JavaScript/TypeScript example:</p>
          <CodeBlock
            code={`// Fetch user profile
async function getUserProfile(username) {
  try {
    const response = await fetch(\`/api/profile/\${username}\`);
    if (!response.ok) {
      throw new Error('Profile not found');
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get stats as SVG
const svgUrl = \`/api/stats/\${username}?format=svg\`;`}
          />
        </Section>

        <Section title="Rate Limiting">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-blue-900 font-medium mb-3">
              Rate limits are applied per IP address:
            </p>
            <ul className="text-blue-800 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>
                  <code className="text-sm">/profile</code> and{' '}
                  <code className="text-sm">/stats</code>: 10 requests per 60 seconds
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>
                  <code className="text-sm">/problems</code>: 5 requests per 60 seconds (more
                  resource intensive)
                </span>
              </li>
            </ul>
            <p className="text-blue-700 text-sm mt-3">
              Rate limit headers are included in responses: X-RateLimit-Remaining
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
      <ChevronRight className="w-6 h-6 text-green-600" />
      <span>{title}</span>
    </h2>
    <div className="ml-8">{children}</div>
  </div>
);

const EndpointDoc = ({
  method,
  path,
  description,
  params = [],
  response,
}: {
  method: string;
  path: string;
  description: string;
  params?: Array<{ name: string; type: string; description: string; default: string }>;
  response: any;
}) => (
  <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-green-50 rounded-xl border-2 border-green-100">
    <div className="flex items-center space-x-3 mb-3">
      <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded uppercase tracking-wide">
        {method}
      </span>
      <code className="text-sm text-gray-800 font-mono font-semibold">{path}</code>
    </div>
    <p className="text-gray-700 mb-4">{description}</p>
    {params.length > 0 && (
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">Query Parameters:</p>
        <div className="space-y-2">
          {params.map((param, i) => (
            <div
              key={i}
              className="text-sm text-gray-700 ml-4 bg-white rounded p-2 border border-gray-200"
            >
              <code className="text-green-600 font-semibold">{param.name}</code>
              <span className="text-gray-500"> ({param.type})</span>
              {param.default && (
                <span className="text-gray-500">
                  {' '}
                  - default: <code>{param.default}</code>
                </span>
              )}
              <p className="text-gray-600 mt-1">{param.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}
    {response && (
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">Example Response:</p>
        <CodeBlock code={JSON.stringify(response, null, 2)} />
      </div>
    )}
  </div>
);

const CodeBlock = ({ code }: { code: string }) => (
  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
    <code className="text-green-400 text-sm font-mono whitespace-pre">{code}</code>
  </div>
);

export default App;
