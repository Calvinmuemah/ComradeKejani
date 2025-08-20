
import { useState } from 'react';
import { Users, MessageCircle, ThumbsUp, Star, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { dummyAIRecommendations, dummyHouses } from '../data/dummyData';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  replies: number;
  likes: number;
  category: string;
}

const forumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Best areas for first-year students?',
    content: 'Just got admitted to MMUST. Looking for recommendations on the safest and most affordable areas for a first-year student. Budget is around 7k-8k per month.',
    author: 'NewStudent2024',
    timestamp: '2024-01-28T10:30:00Z',
    replies: 12,
    likes: 8,
    category: 'Housing Advice'
  },
  {
    id: '2',
    title: 'Reliable Internet in Shibuye area?',
    content: 'Anyone staying in Shibuye with good internet connection? I need stable WiFi for online classes. Which ISPs work best in that area?',
    author: 'TechStudent',
    timestamp: '2024-01-28T09:15:00Z',
    replies: 6,
    likes: 4,
    category: 'Amenities'
  },
  // ...existing code...
];

export const CommunityPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Housing Advice', 'Amenities', 'Safety', 'General'];

  const filteredPosts = selectedCategory === 'all' 
    ? forumPosts 
    : forumPosts.filter(post => post.category === selectedCategory);

  // For AI Recommendations, map dummyAIRecommendations to house data
  const recommendations = dummyAIRecommendations.map((rec, idx) => {
    const house = dummyHouses.find(h => h.id === rec.houseId);
    return {
      id: rec.houseId,
      title: house ? house.title : `Recommended House #${idx + 1}`,
      description: house ? `${house.location.estate} - KSh ${house.price.toLocaleString()}` : '',
      confidence: Math.round(rec.confidence * 100),
      reasons: rec.reasons,
    };
  });

  // For Recent Reviews, flatten all reviews from dummyHouses
  const reviews = dummyHouses.flatMap(house => house.reviews.map(r => ({
    ...r,
    houseTitle: house.title
  })));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Community Hub
          </h1>
          <p className="text-muted-foreground">
            Connect with fellow students, share experiences, and get advice
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  AI Recommendations for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {rec.confidence}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <div className="space-y-1">
                      {rec.reasons.map((reason, index) => (
                        <p key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {reason}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful
                      </Button>
                      <Button size="sm" variant="ghost">
                        Not useful
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ...existing code... */}

            {/* Forum Posts */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Student Forums
                  </CardTitle>
                  <Button>New Post</Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Posts */}
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-lg text-primary">
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                              {post.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(post.timestamp).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {post.replies} replies
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {post.likes} likes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Students</span>
                  <span className="font-semibold">2,341</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Posts This Week</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Houses Reviewed</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Success Stories</span>
                  <span className="font-semibold">456</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Discussion
                </Button>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary">
                        {review.userName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{review.userName}</span>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};