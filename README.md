# RecommendUsUK Marketplace

A modern freelance marketplace built with Next.js and Supabase, connecting clients with skilled professionals across the UK.

## 🚀 Features

### ✅ Complete Authentication System
- User registration with role selection (Client/Freelancer)
- Secure login with Supabase Auth
- Free signup credits (25 for clients, 10 for freelancers)
- Protected routes and session management

### 📊 Professional Dashboards
- **Client Dashboard**: Manage credits, active jobs, post new projects
- **Freelancer Dashboard**: Browse jobs, track bids, view earnings
- Real-time statistics and activity tracking

### 💼 Job Management System
- Browse all available jobs with filtering
- Detailed job pages with bidding functionality
- Professional job posting forms
- 3-bid maximum limit per job
- Credit-based posting system (5 credits per job)

### 💳 Credit System
- Free credits on signup
- Credit deduction for job postings
- Balance tracking and management
- Future: Credit purchasing system

### 🎨 Modern UI/UX
- Clean, professional design inspired by industry leaders
- Fully responsive layout
- Smooth animations and transitions
- Intuitive navigation and user flows

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Ready for Vercel/Netlify

## 🗄 Database Schema

### Users Table
- User profiles with roles (client/freelancer/both)
- Credit balances and ratings
- Authentication via Supabase Auth

### Jobs Table
- Job postings with budgets and descriptions
- Status tracking (open/closed/completed)
- Bid counting and management

### Bids Table
- Freelancer proposals on jobs
- Amount and detailed messages
- Status tracking (pending/accepted/rejected)

### Ratings Table
- 5-star rating system
- "I recommend" checkbox feature
- Detailed reviews and responses

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freelance-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 User Flows

### For Clients
1. **Register** → Select "Hire professionals" → Get 25 free credits
2. **Dashboard** → View credits and active jobs
3. **Post Job** → Fill form → Pay 5 credits → Job goes live
4. **Review Bids** → Receive up to 3 proposals → Select freelancer
5. **Complete Project** → Rate and review freelancer

### For Freelancers
1. **Register** → Select "Find work" → Get 10 free credits
2. **Dashboard** → Browse available jobs
3. **Submit Proposals** → Write compelling bids → Track status
4. **Win Projects** → Complete work → Build reputation
5. **Get Rated** → Earn 5-star reviews and recommendations

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📊 Current Database Status

- **9 registered users** (mix of clients and freelancers)
- **4 active jobs** with real project descriptions
- **6 submitted bids** from freelancers
- **1 completed rating** with 5-star review

## 🎯 Key Features Implemented

### Authentication & Security
- ✅ Secure user registration and login
- ✅ Role-based access control
- ✅ Protected routes and middleware
- ✅ Session management

### Marketplace Functionality
- ✅ Job posting with credit system
- ✅ Real-time job browsing
- ✅ Bidding system with 3-bid limit
- ✅ User dashboards with statistics
- ✅ Rating and review system

### User Experience
- ✅ Clean, professional design
- ✅ Mobile-responsive layout
- ✅ Intuitive navigation
- ✅ Real-time updates
- ✅ Form validation and error handling

## 🚧 Future Enhancements

- [ ] Credit purchasing with payment integration
- [ ] Advanced search and filtering
- [ ] Message system between users
- [ ] File upload for project attachments
- [ ] Admin dashboard for platform management
- [ ] Email notifications
- [ ] Advanced user profiles
- [ ] Portfolio showcases for freelancers

## 🔗 Live Database Connection

This application connects to a live Supabase database with real user data:
- Production URL: `https://vltamaobaqamxnpkftiq.supabase.co`
- All user interactions, job postings, and bids are stored in real-time
- Credit transactions are tracked and persistent

## 📞 Support

For support or questions about the RecommendUsUK Marketplace:
- Email: support@recommendusuk.com
- Website: https://recommendusuk.com

## 📝 License

This project is proprietary software for RecommendUsUK.

---

**Built with ❤️ for the UK freelance community**
