# Comrade Kejani - Modern Student Housing Platform

A comprehensive, modern student housing website built with React, TypeScript, and Vite, designed specifically for Masinde Muliro University students. The platform features AI-powered recommendations, interactive maps, community features, and comprehensive housing insights.

![Comrade Kejani](https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800)

## 🌟 Features

### Core Features (MVP)
- **House Listings**: Comprehensive property listings with detailed information including price, type, photos, amenities, and availability
- **Location & Distance**: Distance calculations from Masinde Muliro University with walking, boda, and matatu options
- **Search & Filters**: Advanced filtering by price range, house type, distance, amenities, and safety ratings
- **Ratings & Reviews**: View-only tenant feedback system with detailed reviews and ratings

### Advanced Features
- **Interactive Map View**: Visual representation of properties with clickable markers (Google Maps integration ready)
- **House Comparison Tool**: Side-by-side comparison of up to 3 properties
- **Notifications & Alerts**: Real-time alerts for new listings, price drops, and vacancy updates
- **AI Recommendations**: Smart property suggestions based on user preferences and browsing patterns
- **Verification System**: Property and landlord verification badges for trust and safety
- **Safety Alerts**: Admin-published safety warnings and area security ratings

### Data Insights
- **Price Trends**: Historical rent data by estate and house type
- **Popular Estates**: Trending residential areas with statistics
- **Market Analytics**: Comprehensive insights for informed decision-making
- **Budget Helper**: Smart budget recommendations and cost analysis

### Community Features
- **Student Forums**: Discussion groups by estate and housing topics
- **Roommate Finder**: Compatibility-based roommate matching system
- **Peer Recommendations**: Community-driven housing suggestions
- **Activity Feed**: Recent community interactions and updates

## 🏗️ Architecture

The project follows a **modular, feature-based architecture** designed for scalability:

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   └── layout/         # Layout components (Header, Sidebar)
├── modules/            # Feature-based modules (future expansion)
│   ├── user/          # User management
│   ├── listings/      # House listings
│   ├── search/        # Search functionality
│   ├── map/           # Map integration
│   └── ai/            # AI recommendations
├── pages/             # Page components
├── services/          # API services and external integrations
│   └── api.ts         # Centralized API endpoints
├── store/             # State management (Zustand)
├── data/              # Mock data and types
│   └── dummyData.ts   # Development data (replace when backend ready)
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── hooks/             # Custom React hooks
```

### Key Architectural Decisions

1. **Feature-Based Organization**: Each major feature has its own module for better maintainability
2. **Separation of Concerns**: Clear separation between UI, logic, and data layers
3. **Centralized API Service**: Single point of API management for easy backend integration
4. **Type-Safe Development**: Comprehensive TypeScript types for better developer experience
5. **State Management**: Zustand for lightweight, scalable state management
6. **Component Reusability**: Modular UI components with consistent design patterns

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd comrade-kejani
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔌 Backend Integration

### Replacing Mock Data

The application currently uses mock data from `src/data/dummyData.ts`. To connect to a real backend:

1. **Update API endpoints** in `src/services/api.ts`
2. **Remove mock data** from `dummyData.ts`
3. **Update environment variables** in `.env`

```typescript
// Example: Replace mock data with real API calls
async getHouses(filters?: Partial<SearchFilters>): Promise<House[]> {
  // Replace this mock implementation
  await delay(800);
  return this.filterHouses(dummyHouses, filters);
  
  // With real API call
  const response = await fetch(`${API_BASE_URL}/houses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
  return response.json();
}
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Main brand color
- **Secondary**: Teal (#14B8A6) - Secondary actions
- **Accent**: Orange (#F97316) - Highlights and CTAs
- **Success**: Green - Positive states
- **Warning**: Yellow - Caution states  
- **Error**: Red - Error states
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Primary Font**: Inter (clean, modern sans-serif)
- **Hierarchy**: Clear heading structure (h1-h6)
- **Line Height**: 150% for body text, 120% for headings
- **Font Weights**: Regular (400), Medium (500), Bold (700)

### Components
- **Consistent Spacing**: 8px grid system
- **Border Radius**: Consistent rounded corners
- **Shadows**: Subtle depth with dark mode variants
- **Animations**: Smooth transitions and micro-interactions

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 
  - `xs`: 475px (small mobile)
  - `sm`: 640px (mobile)
  - `md`: 768px (tablet)
  - `lg`: 1024px (desktop)
  - `xl`: 1280px (large desktop)
  - `2xl`: 1400px (extra large)

## 🔮 Future Enhancements

### Phase 2: Advanced AI & ML
- Machine learning-based price predictions
- Advanced recommendation algorithms
- Natural language processing for reviews
- Computer vision for property verification

### Phase 3: Mobile & Offline
- React Native mobile app
- Offline map caching
- Progressive Web App (PWA) features
- Push notifications

### Phase 4: Multi-Campus Expansion
- Support for multiple universities
- Campus-specific features
- Scalable admin dashboard
- University partnership integrations

### Phase 5: Advanced Community Features
- Video property tours with AR previews
- Virtual reality house visits
- Blockchain-based verification
- Advanced fraud detection

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, CSS-in-JS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React
- **UI Components**: Custom component library
- **Maps**: Google Maps API (integration ready)
- **Build Tool**: Vite
- **Package Manager**: npm

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code formatting
- Write descriptive commit messages
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@comradekejani.com or join our Slack channel.

## 🙏 Acknowledgments

- MMUST students for inspiration and feedback
- Open source community for amazing tools and libraries
- Design inspiration from modern real estate platforms
- AI research community for recommendation algorithms

---

**Built with ❤️ for MMUST students by students**

*Comrade Kejani - Making student housing search simple, smart, and social.*