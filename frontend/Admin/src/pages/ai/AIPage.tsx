import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Settings,
  Zap,
  Target,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatDate } from '../../lib/utils';

// Mock AI recommendations data
const mockRecommendations = [
  {
    id: '1',
    type: 'price_suggestion',
    title: 'Price Optimization for Listing #1234',
    description: 'Based on similar properties in Amalemba, consider reducing price from KES 8,500 to KES 7,800 for better visibility.',
    confidence: 0.87,
    impact: 'high',
    status: 'pending',
    data: {
      currentPrice: 8500,
      suggestedPrice: 7800,
      zone: 'Amalemba',
      reasoning: 'Similar 2BR apartments in the area average KES 7,600. Current price is 12% above market rate.'
    },
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'duplicate_detection',
    title: 'Potential Duplicate Listing Detected',
    description: 'Listing #1245 appears to be a duplicate of #1123 based on photos and location similarity.',
    confidence: 0.94,
    impact: 'medium',
    status: 'pending',
    data: {
      originalListing: '#1123',
      duplicateListing: '#1245',
      similarity: 94,
      matchedFeatures: ['photos', 'location', 'price']
    },
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    type: 'trending_prediction',
    title: 'Shirugu Zone Trending Upward',
    description: 'Search volume for Shirugu has increased 45% this week. Consider promoting listings in this area.',
    confidence: 0.76,
    impact: 'medium',
    status: 'approved',
    data: {
      zone: 'Shirugu',
      searchIncrease: 45,
      timeframe: '7 days',
      currentListings: 18
    },
    createdAt: '2024-01-14T16:22:00Z'
  },
  {
    id: '4',
    type: 'scam_detection',
    title: 'Suspicious Activity Alert',
    description: 'Phone number +254700123456 has been used across multiple listings with different addresses. Potential fraud.',
    confidence: 0.91,
    impact: 'high',
    status: 'approved',
    data: {
      phoneNumber: '+254700123456',
      listingCount: 5,
      differentAddresses: 5,
      riskLevel: 'high'
    },
    createdAt: '2024-01-13T14:45:00Z'
  }
];

// Mock AI models status
const mockModels = [
  {
    id: '1',
    name: 'Price Prediction Model',
    type: 'regression',
    status: 'active',
    accuracy: 0.89,
    lastTrained: '2024-01-10T08:00:00Z',
    predictions: 1234,
    description: 'Predicts optimal pricing based on location, amenities, and market trends'
  },
  {
    id: '2',
    name: 'Duplicate Detection Model',
    type: 'similarity',
    status: 'active',
    accuracy: 0.94,
    lastTrained: '2024-01-08T12:00:00Z',
    predictions: 567,
    description: 'Identifies potential duplicate listings using image and text analysis'
  },
  {
    id: '3',
    name: 'Trend Analysis Model',
    type: 'time_series',
    status: 'training',
    accuracy: 0.82,
    lastTrained: '2024-01-05T16:30:00Z',
    predictions: 890,
    description: 'Analyzes search patterns to predict trending zones and demand'
  },
  {
    id: '4',
    name: 'Fraud Detection Model',
    type: 'classification',
    status: 'active',
    accuracy: 0.96,
    lastTrained: '2024-01-12T10:15:00Z',
    predictions: 234,
    description: 'Detects suspicious patterns that may indicate fraudulent listings'
  }
];

const AIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'models' | 'insights'>('recommendations');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge variant="success">High Confidence</Badge>;
    if (confidence >= 0.7) return <Badge variant="warning">Medium Confidence</Badge>;
    return <Badge variant="destructive">Low Confidence</Badge>;
  };

  const getImpactBadge = (impact: string) => {
    const variants = {
      'high': 'destructive',
      'medium': 'warning',
      'low': 'secondary'
    } as const;
    return <Badge variant={variants[impact as keyof typeof variants]}>{impact.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_suggestion':
        return <TrendingUp className="h-4 w-4" />;
      case 'duplicate_detection':
        return <AlertTriangle className="h-4 w-4" />;
      case 'trending_prediction':
        return <Target className="h-4 w-4" />;
      case 'scam_detection':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getModelStatusBadge = (status: string) => {
    const variants = {
      'active': 'success',
      'training': 'warning',
      'inactive': 'secondary',
      'error': 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>;
  };

  const filteredRecommendations = mockRecommendations.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || rec.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleRecommendationAction = (id: string, action: 'approve' | 'reject') => {
    console.log(`${action} recommendation ${id}`);
    // Implementation would update the recommendation status
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Center</h1>
          <p className="text-gray-400">AI-powered insights and recommendations for platform optimization</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Models
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Models</p>
                <p className="text-2xl font-bold text-white">
                  {mockModels.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pending Reviews</p>
                <p className="text-2xl font-bold text-white">
                  {mockRecommendations.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Approved Today</p>
                <p className="text-2xl font-bold text-white">
                  {mockRecommendations.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Avg Confidence</p>
                <p className="text-2xl font-bold text-white">
                  {(mockRecommendations.reduce((acc, r) => acc + r.confidence, 0) / mockRecommendations.length * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-[hsl(220,10%,20%)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'recommendations', label: 'Recommendations', icon: Target },
            { id: 'models', label: 'AI Models', icon: Brain },
            { id: 'insights', label: 'Insights', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'recommendations' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle>AI Recommendations</CardTitle>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search recommendations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
                >
                  <option value="all">All Types</option>
                  <option value="price_suggestion">Price Suggestions</option>
                  <option value="duplicate_detection">Duplicate Detection</option>
                  <option value="trending_prediction">Trend Predictions</option>
                  <option value="scam_detection">Scam Detection</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(recommendation.type)}
                        <h3 className="text-lg font-semibold text-white">{recommendation.title}</h3>
                        {getConfidenceBadge(recommendation.confidence)}
                        {getImpactBadge(recommendation.impact)}
                        {getStatusBadge(recommendation.status)}
                      </div>
                      
                      <p className="text-gray-300 mb-4">{recommendation.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Confidence</p>
                          <p className="text-white font-medium">{(recommendation.confidence * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Impact</p>
                          <p className="text-white font-medium capitalize">{recommendation.impact}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Type</p>
                          <p className="text-white font-medium">{recommendation.type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Created</p>
                          <p className="text-white font-medium">{formatDate(recommendation.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRecommendation(recommendation);
                          setShowRecommendationModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {recommendation.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRecommendationAction(recommendation.id, 'approve')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRecommendationAction(recommendation.id, 'reject')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'models' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Models Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockModels.map((model) => (
                <div key={model.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                        {getModelStatusBadge(model.status)}
                      </div>
                      
                      <p className="text-gray-300 mb-4">{model.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Accuracy</p>
                          <p className="text-white font-medium">{(model.accuracy * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Type</p>
                          <p className="text-white font-medium capitalize">{model.type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Predictions</p>
                          <p className="text-white font-medium">{model.predictions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Last Trained</p>
                          <p className="text-white font-medium">{formatDate(model.lastTrained)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Performance charts would go here</p>
                  <p className="text-sm">Shows accuracy trends over time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendation Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price Optimizations Applied</span>
                  <span className="text-white font-semibold">23</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duplicates Removed</span>
                  <span className="text-white font-semibold">12</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Fraud Cases Prevented</span>
                  <span className="text-white font-semibold">8</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendation Detail Modal */}
      <Modal
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
        title="Recommendation Details"
        size="lg"
      >
        {selectedRecommendation && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              {getTypeIcon(selectedRecommendation.type)}
              <h3 className="text-lg font-semibold text-white">{selectedRecommendation.title}</h3>
              {getConfidenceBadge(selectedRecommendation.confidence)}
              {getImpactBadge(selectedRecommendation.impact)}
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-white mb-2">Description</h4>
              <p className="text-gray-300">{selectedRecommendation.description}</p>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-white mb-2">AI Analysis</h4>
              <div className="bg-gray-800/50 rounded-md p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(selectedRecommendation.data, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Confidence Level:</span>
                <p className="text-white font-medium">{(selectedRecommendation.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-gray-400">Expected Impact:</span>
                <p className="text-white font-medium capitalize">{selectedRecommendation.impact}</p>
              </div>
              <div>
                <span className="text-gray-400">Created:</span>
                <p className="text-white font-medium">{formatDate(selectedRecommendation.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <p className="text-white font-medium capitalize">{selectedRecommendation.status}</p>
              </div>
            </div>

            {selectedRecommendation.status === 'pending' && (
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleRecommendationAction(selectedRecommendation.id, 'reject');
                    setShowRecommendationModal(false);
                  }}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    handleRecommendationAction(selectedRecommendation.id, 'approve');
                    setShowRecommendationModal(false);
                  }}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve & Apply
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIPage;