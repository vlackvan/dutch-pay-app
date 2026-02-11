# Dutch Pay App

A modern, interactive group expense management application with a unique gamification twist. Split bills, track settlements, and prove your toughness through challenging quiz games.

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)

</div>

## Features

### Expense Management
- **Group Creation & Management**: Create and manage multiple expense groups with custom icons
- **Expense Tracking**: Record expenses with detailed information including payer, amount, and participants
- **Smart Splitting**: Automatically calculate and split expenses among group members
- **Balance Sheet**: Real-time balance calculations showing who owes whom
- **Settlement Records**: Track payment history and settlement status

### User Experience
- **Modern UI/UX**: Beautiful, responsive design with smooth animations using Framer Motion
- **Custom Avatars**: Build your own avatar with a comprehensive avatar builder
- **Profile Management**: Track your spending habits and view payment history
- **Monthly Badges**: Earn achievements and badges based on your activity
- **Dark Theme**: Eye-friendly dark mode with oceanic blue accents

### Gamification
- **"Real Man" Quiz Game**: A unique quiz challenge system where users answer tough questions
- **Stakes System**: Set penalty amounts for losing the game
- **Automatic Settlement**: Game results automatically add to group settlements
- **Leaderboard**: Track scores and rankings among group members
- **Immersive Experience**: Full-screen game mode with custom graphics and animations

### Authentication
- **Google OAuth**: Quick sign-in with Google
- **Email/Password**: Traditional authentication with secure password hashing
- **Protected Routes**: Secure access control for authenticated users
- **Session Management**: Persistent sessions with token-based authentication

### Technical Features
- **Real-time Updates**: React Query for efficient data fetching and caching
- **State Management**: Zustand for lightweight, scalable state management
- **Form Validation**: React Hook Form with Zod schema validation
- **Audio Support**: Background music with volume control
- **Image Export**: Export settlement summaries as images (html-to-image)
- **Responsive Design**: Mobile-first approach with TailwindCSS

## Tech Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4
- **Styling**: TailwindCSS 4.1.18 with custom CSS modules
- **State Management**:
  - Zustand 5.0.10 (Global state)
  - TanStack React Query 5.90.17 (Server state)
- **Forms**: React Hook Form 7.71.1 + Zod 4.3.5
- **Routing**: React Router DOM 7.12.0
- **Animations**: Framer Motion 12.27.5
- **HTTP Client**: Axios 1.13.2
- **Icons**: Lucide React 0.562.0

### Backend
- **Framework**: FastAPI 0.109.0
- **Database**: MySQL with SQLAlchemy 2.0.25 ORM
- **Authentication**:
  - python-jose (JWT tokens)
  - passlib + bcrypt (Password hashing)
- **Validation**: Pydantic 2.5.3
- **HTTP Client**: httpx 0.26.0 (OAuth)
- **Server**: Uvicorn 0.27.0

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- MySQL 8.0+
- npm or pnpm

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/vlackvan/dutch-pay-app.git
cd dutch-pay-app
```

#### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.development .env

# Configure your environment variables
# Edit .env with your backend API URL
```

#### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure database
# Create a MySQL database and update config.py with your credentials
```

#### 4. Database Setup
```sql
CREATE DATABASE dutch_pay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `backend/app/config.py` with your database credentials.

### Running the Application

#### Development Mode

**Frontend:**
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be available at `http://localhost:8000`

#### Production Build

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Docker Deployment

```bash
docker-compose up -d
```

## Project Structure

```
dutch-pay-app/
├── src/
│   ├── app/                    # App shell and layout
│   ├── components/             # Reusable components
│   ├── contexts/               # React contexts (Audio, etc.)
│   ├── hooks/                  # Custom hooks
│   │   ├── queries/           # React Query hooks
│   │   ├── useAuthInit.ts     # Authentication initialization
│   │   └── useAudio.ts        # Audio player hook
│   ├── lib/
│   │   └── api/               # API client and endpoints
│   ├── pages/                  # Page components
│   │   ├── auth/              # Authentication pages
│   │   ├── games/             # Game pages
│   │   ├── profile/           # User profile
│   │   └── settlements/       # Settlement management
│   ├── stores/                 # Zustand stores
│   ├── styles/                 # Global styles
│   ├── types/                  # TypeScript type definitions
│   ├── data/                   # Static data (quiz questions)
│   └── App.tsx                 # Main app component
├── backend/
│   └── app/
│       ├── routers/           # API routes
│       ├── models/            # Database models
│       ├── schemas/           # Pydantic schemas
│       ├── services/          # Business logic
│       ├── database.py        # Database configuration
│       └── main.py            # FastAPI application
├── public/                     # Static assets
│   ├── avatar/                # Avatar components
│   ├── badges/                # Achievement badges
│   ├── icons/                 # UI icons
│   └── music/                 # Audio files
└── docker-compose.yaml         # Docker configuration
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Features Explained

### Quiz Game System

The "Real Man Test" (사나이 테스트) is a unique feature that adds a fun competitive element to expense splitting:

1. **Setup Phase**:
   - Select a group
   - Choose game difficulty
   - Set penalty amount
   - Select participants

2. **Game Phase**:
   - Players answer "toughness" questions
   - Each question has two choices with humorous explanations
   - Scoring based on "tough" answers

3. **Results**:
   - Winners and losers determined by score
   - Losers automatically owe the penalty amount
   - Results added to group settlements

### Avatar Builder

Customize your profile with a comprehensive avatar builder:
- Multiple face shapes, hairstyles, eyes, noses, mouths
- Accessories and clothing options
- Real-time preview
- Save and display on your profile

### Settlement Workflow

1. **Create Group**: Set up a group with members
2. **Add Expenses**: Record who paid and for what
3. **Track Balances**: See who owes whom in real-time
4. **Settle Up**: Mark debts as paid when settled
5. **View History**: Review past settlements and expenses

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend
Configure in `backend/app/config.py`:
- Database credentials
- JWT secret key
- Google OAuth credentials
- CORS settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Use CSS Modules for component-specific styles
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## Roadmap

- [ ] Push notifications for new expenses
- [ ] Multi-currency support
- [ ] Receipt image upload
- [ ] Recurring expenses
- [ ] Export data to CSV/PDF
- [ ] Mobile app (React Native)
- [ ] More quiz game modes
- [ ] Social features (friend requests, activity feed)

## Known Issues

Check the [Issues](https://github.com/vlackvan/dutch-pay-app/issues) page for current known issues and feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authors

- **vlackvan** - *Initial work* - [GitHub](https://github.com/vlackvan)

## Acknowledgments

- Quiz game concept inspired by SpongeBob SquarePants' "Salty Spitoon" episode
- UI/UX design inspired by modern fintech applications
- Community feedback and contributions

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the API documentation

---

<div align="center">
Made with ❤️ by the Dutch Pay App Team
</div>
