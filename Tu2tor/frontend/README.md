# Tu2tor - Campus Peer Tutoring Platform

A modern web platform connecting students with peer tutors at Temasek Polytechnic, featuring smart matching algorithms and comprehensive session management.

## 🎯 Project Overview

Tu2tor is a peer-to-peer tutoring platform designed specifically for Temasek Polytechnic students. It helps students find qualified tutors for their courses, book sessions, leave reviews, and manage their academic support efficiently.

## ✨ Key Features

### For Students
- **Smart Tutor Matching**: Advanced algorithm matching students with ideal tutors based on:
  - Time slot compatibility
  - Location preferences
  - Subject expertise
  - Ratings and reviews
  - Same school preference

- **Comprehensive Search**: Filter tutors by:
  - Subject/Course code
  - Minimum rating
  - Preferred location
  - Availability

- **Booking Management**:
  - Create, confirm, and cancel bookings
  - Track booking status (Pending, Confirmed, Completed, Cancelled)
  - View booking history with detailed information
  - Leave reviews after completed sessions

- **Review System**:
  - Submit ratings and detailed reviews
  - Add descriptive tags
  - Option for anonymous reviews
  - View rating distribution and statistics

- **Profile Management**:
  - Edit personal and academic information
  - View statistics (sessions, credits, ratings)
  - Track achievements and badges
  - Monitor profile completion

### For Tutors
- **Tutor Profile**:
  - Showcase subjects and grades achieved
  - Set hourly rates (in credits)
  - Define availability (time slots and locations)
  - Display achievements and badges

- **Session Management**:
  - Accept or decline booking requests
  - Mark sessions as completed
  - Receive and respond to reviews

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 7.1** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Chart library for data visualization

### State Management
- **React Context API** - Global state management
  - `AuthContext` - User authentication and session
  - `AppContext` - Application data (tutors, bookings, reviews)

### Data Storage
- **LocalStorage** - Client-side data persistence
- **Mock Data** - Pre-populated with realistic TP data

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx          # Main layout with sidebar
│   ├── context/
│   │   ├── AuthContext.jsx         # Authentication state
│   │   └── AppContext.jsx          # App-wide state
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Booking/
│   │   │   └── BookingPage.jsx     # Manage bookings
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx       # Main dashboard
│   │   ├── Landing/
│   │   │   └── LandingPage.jsx     # Public landing page
│   │   ├── Messages/
│   │   │   └── MessagesPage.jsx    # (Coming soon)
│   │   ├── Notifications/
│   │   │   └── NotificationsPage.jsx # (Coming soon)
│   │   ├── Profile/
│   │   │   └── Profile.jsx         # User profile
│   │   ├── Reviews/
│   │   │   ├── ReviewsPage.jsx     # View reviews
│   │   │   └── ReviewSubmitPage.jsx # Submit review
│   │   ├── Search/
│   │   │   └── SearchPage.jsx      # Search tutors
│   │   ├── Sessions/
│   │   │   └── SessionsPage.jsx    # (Coming soon)
│   │   └── TutorDetail/
│   │       └── TutorDetailPage.jsx # Tutor profile
│   ├── utils/
│   │   ├── constants.js            # App constants
│   │   ├── mockData.js             # Mock data
│   │   └── smartMatching.js        # Matching algorithm
│   ├── App.jsx                     # Root component
│   ├── index.css                   # Global styles
│   └── main.jsx                    # App entry point
├── package.json
├── vite.config.js
├── postcss.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd Tu2tor/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5174` (or the port shown in terminal)

### Demo Accounts

Use these credentials to test different user roles:

**Student Account:**
- Email: `student@tp.edu.sg`
- Password: `password123`

**Tutor Account:**
- Email: `tutor@tp.edu.sg`
- Password: `password123`

## 📱 User Flows

### 1. Finding a Tutor
1. Log in to your account
2. Navigate to "Find Tutors" from sidebar
3. (Optional) Enable "Smart Matching" and adjust priority slider
4. Filter by subject, location, or minimum rating
5. Click on a tutor card to view their full profile
6. Select a subject from their profile
7. Click "Book Session" to proceed to bookings page

### 2. Booking a Session
1. From Tutor Detail page, select a subject
2. Click "Book Session"
3. System navigates to Bookings page (booking creation would happen here)
4. View your booking in "Pending" tab
5. Wait for tutor confirmation or cancel if needed

### 3. Completing a Session & Reviewing
1. After session is completed, go to "My Bookings"
2. Find the completed session
3. Click "Leave Review"
4. Rate your experience (1-5 stars)
5. Write a detailed comment
6. Add optional tags
7. Choose whether to post anonymously
8. Submit review

### 4. Managing Your Profile
1. Go to "Settings" or click your avatar
2. Click "Edit Profile"
3. Update personal information, academic details
4. (For tutors) Add/edit subjects, set availability, and hourly rate
5. Click "Save Changes"

## 🎨 Design Features

### Color Scheme
- **Primary**: Indigo (#4f46e5)
- **Secondary**: Purple, Pink, Cyan
- **Accent**: Orange, Yellow, Green for status indicators

### UI Components
- Responsive design (mobile-first approach)
- Card-based layouts
- Tab navigation
- Modal dialogs
- Toast notifications (conceptual)
- Loading states
- Empty states with call-to-action

### Animations
- Circular progress charts with staggered animations
- Hover effects on interactive elements
- Smooth page transitions
- Button hover states

## 🧪 Testing Guide

### Manual Testing Checklist

#### Authentication
- [ ] Register new account
- [ ] Login with credentials
- [ ] Logout functionality
- [ ] Protected route redirects

#### Dashboard
- [ ] View statistics (sessions, bookings, profile views)
- [ ] Circular progress charts animate on load
- [ ] Last activities display correctly
- [ ] Quick action links navigate properly

#### Search & Matching
- [ ] Search by name/course code
- [ ] Filter by subject, location, rating
- [ ] Smart matching toggle works
- [ ] Priority slider affects results
- [ ] Match scores display with reasons
- [ ] Top Match badges show for top 3 results

#### Tutor Profile
- [ ] View tutor information
- [ ] See all subjects taught
- [ ] Check availability (locations & time slots)
- [ ] View reviews and ratings
- [ ] Select subject for booking
- [ ] Navigate to bookings page

#### Bookings
- [ ] View all bookings in tabs (All, Upcoming, Completed, Cancelled)
- [ ] Status badges display correctly
- [ ] Tutor can confirm pending bookings
- [ ] Users can cancel bookings
- [ ] Mark sessions as completed
- [ ] Navigate to tutor profile
- [ ] Access review submission for completed sessions

#### Reviews
- [ ] View received reviews (as tutor)
- [ ] View given reviews (as student)
- [ ] Filter by rating (1-5 stars, All)
- [ ] Rating distribution chart displays correctly
- [ ] Submit new review from completed booking
- [ ] Star rating selector works
- [ ] Add tags to review
- [ ] Toggle anonymous option
- [ ] Validation prevents empty submissions

#### Profile
- [ ] View profile information
- [ ] Edit mode toggle works
- [ ] Update personal information
- [ ] Update academic information
- [ ] (Tutors) Add/remove subjects
- [ ] (Tutors) Update hourly rate
- [ ] (Tutors) Edit availability
- [ ] View statistics sidebar
- [ ] See achievements and badges
- [ ] Profile completion progress displays

## 🔧 Configuration

### Environment Variables
Currently using client-side only setup. For production:

```env
VITE_API_URL=your_api_url
VITE_APP_NAME=Tu2tor
```

### Tailwind Configuration
Custom theme colors defined in `src/index.css`:
```css
@theme {
  --color-primary-600: #4f46e5;
  --color-purple-500: #a855f7;
  /* ... more colors */
}
```

## 📊 Smart Matching Algorithm

The platform uses a sophisticated matching algorithm that considers:

### Fixed Factors (Always Considered)
1. **Time Compatibility** (30% weight)
   - Matches student's preferred times with tutor availability
2. **Location Match** (15% weight)
   - Matches student's preferred study location
3. **Rating** (25% weight)
   - Tutor's average rating from reviews
4. **Response Time** (15% weight)
   - How quickly tutor typically responds
5. **Total Sessions** (10% weight)
   - Experience based on completed sessions
6. **Same School** (5% weight)
   - Bonus for same school affiliation

### Dynamic Weighting
Users can adjust priority between:
- **Student Preferences** (Schedule and location match)
- **Tutor Quality** (Rating, experience, responsiveness)

Priority slider: 0 (100% preferences) to 100 (100% quality)

## 🎯 Future Enhancements

### Planned Features
- [ ] Real-time messaging system
- [ ] Video call integration for virtual sessions
- [ ] File sharing and session materials
- [ ] Payment integration (credit system)
- [ ] Push notifications
- [ ] Email notifications
- [ ] Session reminders
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Admin dashboard for platform management

### Technical Improvements
- [ ] Backend API integration (MongoDB, Express, Node.js)
- [ ] Real-time updates with WebSockets
- [ ] Image upload for avatars and materials
- [ ] Advanced search with Elasticsearch
- [ ] Automated testing (Jest, React Testing Library)
- [ ] E2E testing (Playwright)
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Accessibility improvements (WCAG compliance)

## 📝 License

This is an academic project for Temasek Polytechnic coursework.

## 📞 Support

For questions or issues, please contact the development team.

---

**Note**: This is a prototype/demo application. All data is mock data stored in browser localStorage. For production use, proper backend infrastructure and security measures would be required.
