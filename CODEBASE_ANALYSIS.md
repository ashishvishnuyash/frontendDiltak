# Codebase Analysis - Technology Stack, User Roles & Architecture

## 1. Technology Stack (Frontend & Backend)

### Frontend Technology

**Core Framework:**
- **Next.js 13.5.1** - React framework with App Router architecture
- **React 18.2.0** - UI library
- **TypeScript 5.2.2** - Type-safe development

**Styling & UI:**
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **Framer Motion 12.23.22** - Animation library
- **Lucide React** - Icon library
- **next-themes** - Dark mode support

**3D & Media:**
- **Three.js 0.180.0** - 3D graphics library for avatar rendering
- **@react-three/fiber 8.18.0** - React renderer for Three.js
- **@react-three/drei 9.122.0** - Useful helpers for react-three-fiber

**Data Visualization:**
- **Recharts 2.12.7** - Chart library for analytics dashboards

**Forms & Validation:**
- **React Hook Form 7.53.0** - Form management
- **Zod 3.23.8** - Schema validation
- **@hookform/resolvers** - Zod integration for React Hook Form

**PDF Generation:**
- **jsPDF 3.0.3** - PDF generation
- **jspdf-autotable 5.0.2** - Table support for jsPDF
- **html2canvas 1.4.1** - HTML to canvas conversion

### Backend Technology

**API Layer:**
- **Next.js API Routes** - Serverless API endpoints (`app/api/*/route.ts`)
- **Node.js** - Runtime environment

**Database:**
- **Firebase Firestore** - NoSQL document database (real-time)
- **Firebase Admin SDK 13.4.0** - Server-side Firebase operations

**Authentication:**
- **Firebase Auth** - User authentication and session management
- **JWT** - Token-based authentication (via jsonwebtoken 9.0.2)
- **bcryptjs 2.4.3** - Password hashing

**File Storage:**
- **Firebase Storage** - File uploads and media storage

### AI/ML Services

**Primary AI Providers:**
- **OpenAI** (openai 5.8.2)
  - GPT-4 / GPT-4o-mini for chat conversations
  - TTS-1 for text-to-speech
  - 6 voice options (alloy, echo, fable, onyx, nova, shimmer)

- **Google Generative AI** (@google/genai 1.8.0, @google/generative-ai 0.21.0)
  - AI chat and recommendations

- **Perplexity AI** - Deep search capabilities for wellness research

**Audio Processing:**
- **ElevenLabs** (@elevenlabs/elevenlabs-js 2.28.0) - Advanced TTS
- Custom lip-sync implementation for 3D avatar

### Additional Services

**Utilities:**
- **date-fns 3.6.0** - Date manipulation
- **uuid 9.0.1** - Unique ID generation
- **mime 4.0.4** - MIME type detection

### Database Structure

**Firestore Collections:**
- `users` - User profiles with role, company, hierarchy information
- `companies` - Company/organization data
- `mental_health_reports` - Wellness reports and analytics
- `chat_sessions` - AI chat session data
- `chat_messages` - Individual chat messages
- `departments` - Organizational departments
- Additional collections for gamification, community, escalations

**Database Schema (from `types/database.ts` and `types/index.ts`):**
- Users table with roles: `employee`, `manager`, `employer`, `hr`, `admin`
- Mental health reports with comprehensive metrics
- Chat sessions and messages with emotion analysis
- Company and department structures
- Hierarchy relationships (manager_id, direct_reports, reporting_chain)

### Repository & Database Access Requirements

**For Code Changes:**
- ✅ **Repository Access Required**: Yes - Full codebase is in this repository
- ✅ **Database Access Required**: Yes - Need Firebase project credentials
  - Firebase project ID: `mindtest-94298` (visible in `lib/firebase.ts`)
  - Need Firebase Admin credentials for server-side operations
  - Need Firebase client config for frontend operations
  - Environment variables needed (see `.env.example`)

**Required Environment Variables:**
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
OPENAI_API_KEY=your_openai_key
PERPLEXITY_API_KEY=your_perplexity_api_key

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
```

---

## 2. Project Flow for Different User Roles

### User Roles Overview

The platform supports **5 main user roles**:
1. **Employee** - Individual contributors
2. **Manager** - Team leaders with management responsibilities
3. **Employer** - Company owners/administrators
4. **HR** - Human resources administrators
5. **Admin** - System administrators

### Employee Role Flow

**Primary Features:**
- Personal wellness dashboard (`/employee/dashboard`)
- AI chat assistant (text & voice) (`/employee/chat`)
- Personal wellness reports (`/employee/reports`)
- Wellness hub access (`/employee/wellness-hub`)
- Community participation
- Gamification (points, badges, achievements)

**Key Workflows:**

1. **Wellness Check-in Flow:**
   - Employee logs in → Dashboard
   - Initiates AI chat (text or voice)
   - Conversational wellness assessment (15-18 questions)
   - AI generates comprehensive wellness report
   - Report saved to Firestore
   - Employee views personal analytics and trends

2. **Wellness Hub Access:**
   - Access to escalation support (anonymous tickets)
   - AI-curated wellness recommendations
   - Gamification challenges and rewards
   - Community spaces (anonymous discussions)

3. **Report Viewing:**
   - View personal wellness history
   - Track progress over time
   - Export reports as PDF

**Complexity Level:** Medium
- Core features: Chat, reports, dashboard
- AI integration complexity: High (OpenAI, sentiment analysis)
- Timeline Estimate: 2-3 weeks for basic features, 4-6 weeks for full implementation

### Manager Role Flow

**Primary Features:**
- **Personal Dashboard** (`/manager/personal/dashboard`) - Personal wellness tracking
- **Management Dashboard** (`/manager/dashboard`) - Team oversight
- Team wellness analytics
- Organization chart (`/manager/org-chart`)
- Direct reports management
- Team reports viewing (hierarchy-aware)
- Personal AI chat (leadership-focused context)

**Key Workflows:**

1. **Dual Dashboard System:**
   - Manager selects between Personal or Management dashboard
   - Personal: Same as employee features
   - Management: Team analytics and oversight

2. **Team Management Flow:**
   - View direct reports list
   - Access team wellness metrics (aggregated)
   - View individual team member reports (with permissions)
   - Organization chart visualization
   - Team statistics and analytics

3. **Hierarchy-Aware Access:**
   - Can view direct reports' data
   - Can view subordinates' subordinates (if `skip_level_access` enabled)
   - Department head can view all department members
   - Permission-based data filtering

**Hierarchy Levels:**
- Level 0: Executive (CEO, President)
- Level 1: Senior Management (VP, SVP)
- Level 2: Middle Management (Director)
- Level 3: Team Lead (Manager)
- Level 4: Individual Contributor (Employee)

**Permissions:**
- `can_view_team_reports` - View aggregated team data
- `can_view_direct_reports` - View direct subordinates
- `can_manage_employees` - Manage team members
- `can_approve_leaves` - Approve time off
- `is_department_head` - Department-wide access
- `skip_level_access` - Multi-level access

**Complexity Level:** High
- Hierarchy system complexity: High (multi-level, permissions)
- Team analytics: Medium-High
- Timeline Estimate: 4-6 weeks for basic features, 8-10 weeks for full implementation

### Employer Role Flow

**Primary Features:**
- Company-wide analytics dashboard (`/employer/dashboard`)
- Employee management (`/employer/employees`)
- Advanced analytics (`/employer/analytics`)
- Report management (`/employer/reports`)
- Wellness hub oversight (`/employer/wellness-hub`)
- Custom report generation
- PDF export functionality

**Key Workflows:**

1. **Company Analytics Flow:**
   - View company-wide wellness metrics
   - Department-wise breakdowns
   - Risk assessment (high/medium/low risk employees)
   - Trend analysis over time
   - Participation rates

2. **Employee Management Flow:**
   - Create new employees (`/employer/employees/new`)
   - Assign roles and hierarchy levels
   - Set manager relationships
   - Configure permissions
   - View employee details (`/employer/employees/[id]`)

3. **Report Management:**
   - View all company reports
   - Filter by department, date, risk level
   - Export comprehensive PDF reports
   - Custom report generation

4. **Wellness Program Oversight:**
   - Monitor wellness hub usage
   - Track gamification engagement
   - Manage wellness challenges
   - ROI tracking

**Complexity Level:** Very High
- Analytics complexity: Very High (aggregations, trends, insights)
- Employee management: High (hierarchy, permissions)
- Report generation: High (PDF export, custom reports)
- Timeline Estimate: 6-8 weeks for basic features, 12-16 weeks for full implementation

### HR/Admin Role Flow

**Primary Features:**
- Similar to Employer with additional:
- Compliance reporting
- Employee privacy management
- Policy insights
- Enhanced analytics

**Complexity Level:** Very High
- Timeline Estimate: Similar to Employer role

---

## 3. Current Architecture Implementation

### Architecture Pattern: **Next.js App Router with Serverless API**

The application follows a **monorepo full-stack architecture** using Next.js 13 App Router pattern.

### Frontend Architecture

**Structure:**
```
app/
├── api/                    # API routes (backend)
├── employee/               # Employee pages
├── manager/                # Manager pages
├── employer/               # Employer pages
├── auth/                   # Authentication pages
├── wellness-hub/          # Wellness hub pages
└── page.tsx               # Homepage
```

**Key Patterns:**

1. **App Router Pattern:**
   - File-based routing (`app/[route]/page.tsx`)
   - Server Components by default
   - Client Components with `'use client'` directive
   - Layout components for shared UI

2. **Component Architecture:**
   ```
   components/
   ├── avatar/              # 3D avatar components
   ├── dashboard/           # Dashboard components
   ├── hierarchy/            # Org chart components
   ├── layout/               # Layout components
   ├── mental-health/       # Wellness components
   ├── modals/               # Modal dialogs
   ├── shared/               # Shared components
   ├── ui/                   # UI primitives (Radix UI)
   └── wellness-hub/         # Wellness hub components
   ```

3. **State Management:**
   - React Context API (`contexts/auth-context.tsx`, `contexts/theme-context.tsx`)
   - Custom hooks (`hooks/use-user.ts`, `hooks/use-employer.ts`, `hooks/use-audio.ts`)
   - Local component state with React hooks
   - Real-time updates via Firestore listeners

4. **Authentication Flow:**
   - Firebase Auth for authentication
   - AuthContext provides user state globally
   - Protected routes via `ProtectedRoute` component
   - Role-based redirects based on user role
   - Middleware for route protection (currently disabled, using client-side)

### Backend Architecture

**API Routes Structure:**
```
app/api/
├── auth/
│   ├── login/route.ts
│   └── register/route.ts
├── chat/route.ts              # Main AI chat endpoint
├── ai-chat/route.ts           # Alternative AI chat
├── text-to-speech/route.ts    # TTS generation
├── transcribe/route.ts        # Speech-to-text
├── call/route.ts              # Voice call management
├── reports/recent/route.ts    # Report fetching
├── export/pdf/route.ts        # PDF generation
├── createEmployee/route.ts    # Employee creation
├── employer/export-reports/route.ts
├── gamification/route.ts
├── community/route.ts
├── recommendations/generate/route.ts
├── escalation/create-ticket/route.ts
└── hierarchy/test/route.ts
```

**API Design Patterns:**

1. **RESTful API Routes:**
   - Each route file exports HTTP methods (GET, POST, etc.)
   - Type-safe request/response handling
   - Error handling with proper status codes

2. **Serverless Functions:**
   - Each API route is a serverless function
   - Stateless design
   - Environment variable access for secrets

3. **Database Access:**
   - Client-side: Firebase SDK (`lib/firebase.ts`)
   - Server-side: Firebase Admin SDK (`lib/firebase-admin.ts`)
   - Real-time listeners for live updates
   - Batch operations for performance

### Data Flow Architecture

**Authentication Flow:**
```
User Login → Firebase Auth → AuthContext → Protected Routes → Role-based Dashboard
```

**Chat/AI Flow:**
```
User Input → API Route (/api/chat) → OpenAI/Perplexity → Response → Firestore Save → UI Update
```

**Report Generation Flow:**
```
Chat Session End → API Route (/api/chat with endSession=true) → 
AI Analysis (GPT-4) → Report Generation → Firestore Save → 
Dashboard Display → PDF Export (optional)
```

**Real-time Updates:**
```
Firestore Changes → onSnapshot Listeners → React State Update → UI Re-render
```

### Security Architecture

**Authentication:**
- Firebase Auth for user authentication
- JWT tokens for session management
- Role-based access control (RBAC)
- Protected routes with role checking

**Data Security:**
- Firestore Security Rules (not visible in codebase, but referenced)
- Environment variables for sensitive data
- Server-side validation with Zod schemas
- API key management via environment variables

**Access Control:**
- Hierarchy-based permissions (`lib/hierarchy-service.ts`)
- `canAccessEmployeeData()` function for permission checking
- Role-based feature access
- Department-based filtering

### Integration Architecture

**AI Services Integration:**
- OpenAI: Chat completions, TTS, wellness analysis
- Google Generative AI: Recommendations
- Perplexity: Deep search for wellness research
- Multiple AI providers for redundancy

**Third-party Services:**
- Firebase: Auth, Database, Storage
- ElevenLabs: Advanced TTS
- jsPDF: PDF generation

### Performance Optimizations

1. **Code Splitting:**
   - Next.js automatic code splitting
   - Dynamic imports for heavy components (3D avatar)

2. **Caching:**
   - Next.js built-in caching
   - Firebase query caching

3. **Real-time Efficiency:**
   - Firestore listeners for live updates
   - Optimized queries with indexes

4. **API Optimization:**
   - Parallel API calls where possible
   - Reduced token usage for faster responses
   - Model selection (GPT-4o-mini for speed, GPT-4 for analysis)

### Deployment Architecture

**Build Process:**
- Next.js build (`npm run build`)
- Static optimization where possible
- Serverless function generation

**Deployment Options:**
- Vercel (recommended for Next.js)
- Firebase Hosting
- Any Node.js hosting platform

**Environment Management:**
- `.env.local` for local development
- Environment variables for production
- Separate Firebase projects for dev/prod (recommended)

### Key Architectural Decisions

1. **Monorepo Approach:**
   - Frontend and backend in single repository
   - Shared types and utilities
   - Simplified deployment

2. **Serverless API:**
   - Scalable serverless functions
   - No server management needed
   - Pay-per-use cost model

3. **Real-time Database:**
   - Firestore for live updates
   - No need for WebSocket management
   - Built-in offline support

4. **Type Safety:**
   - TypeScript throughout
   - Shared type definitions
   - Compile-time error checking

5. **Component Reusability:**
   - Shared UI components
   - Role-based component variants
   - Responsive design utilities

---

## Summary & Recommendations

### For Code Changes:

1. **Repository Access:** ✅ Available - Full codebase in this repo
2. **Database Access:** ⚠️ Required - Need Firebase project credentials
3. **Environment Setup:** ⚠️ Required - Need all API keys and Firebase config

### Complexity Assessment:

- **Employee Features:** Medium complexity (2-3 weeks basic, 4-6 weeks full)
- **Manager Features:** High complexity (4-6 weeks basic, 8-10 weeks full)
- **Employer Features:** Very High complexity (6-8 weeks basic, 12-16 weeks full)

### Architecture Strengths:

- ✅ Modern tech stack (Next.js 13, TypeScript)
- ✅ Scalable serverless architecture
- ✅ Real-time capabilities
- ✅ Type-safe development
- ✅ Role-based access control
- ✅ Comprehensive AI integration

### Architecture Considerations:

- ⚠️ Firebase vendor lock-in (consider migration path if needed)
- ⚠️ Serverless cold starts (optimize critical paths)
- ⚠️ Firestore query limitations (plan indexes carefully)
- ⚠️ API costs (monitor OpenAI/Perplexity usage)

---

**Document Generated:** January 29, 2026  
**Codebase Version:** Based on current repository state  
**Analysis Scope:** Complete codebase scan
