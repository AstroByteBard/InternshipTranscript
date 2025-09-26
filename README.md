# InternshipTranscript

A full-stack web application built with NestJS backend and Nuxt.js frontend for managing internship transcripts and related documentation.

## 🚀 Project Overview

This project provides a comprehensive solution for handling internship transcripts with a modern tech stack:

- **Backend**: NestJS (Node.js framework) with TypeScript
- **Frontend**: Nuxt.js (Vue.js framework) with TypeScript
- **Package Manager**: pnpm

## 📁 Project Structure

```
InternshipTranscript/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── app.controller.ts   # Main application controller
│   │   ├── app.service.ts      # Main application service
│   │   ├── app.module.ts       # Root application module
│   │   ├── main.ts            # Application entry point
│   │   ├── config/            # Configuration files
│   │   ├── common/            # Shared utilities and helpers
│   │   └── modules/           # Feature modules
│   ├── test/                  # E2E tests
│   └── package.json
├── frontend/                # Nuxt.js client application
│   ├── app/
│   │   └── app.vue           # Root Vue component
│   ├── public/               # Static assets
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Frontend
- **Nuxt.js 4** - Vue.js framework
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Nuxt UI** - Component library
- **Nuxt Image** - Image optimization

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd InternshipTranscript
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   pnpm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   pnpm install
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   pnpm run dev
   ```
   The API will be available at `http://localhost:3000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   pnpm run dev
   ```
   The frontend will be available at `http://localhost:3001`

## 🔧 Configuration

The backend uses environment-based configuration. Create a `.env` file in the backend directory:

```env
PORT=3000
# DATABASE_URL=your_database_url
# JWT_SECRET=your_jwt_secret
```

## 📝 Available Scripts

### Backend Scripts
- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build the application
- `pnpm run start` - Start production server
- `pnpm run test` - Run unit tests
- `pnpm run test:e2e` - Run end-to-end tests
- `pnpm run lint` - Lint the code
- `pnpm run format` - Format the code

### Frontend Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run generate` - Generate static site
- `pnpm run preview` - Preview production build

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Jest framework for backend unit testing
- **E2E Tests**: End-to-end testing with Jest and Supertest
- **Code Coverage**: Available via `pnpm run test:cov`

## 📦 Building for Production

### Backend
```bash
cd backend
pnpm run build
pnpm run start:prod
```

### Frontend
```bash
cd frontend
pnpm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED license.

## 🔗 API Documentation

The backend provides a REST API. When running in development mode, you can access:
- Main endpoint: `GET /` - Returns server status and port information

## 🌐 Environment Variables

### Backend
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - Database connection string (optional)
- `JWT_SECRET` - JWT signing secret (optional)

### Frontend
- `NUXT_API_BASE_URL` - Backend API base URL (default: http://localhost:3000/api)

## 📞 Support

For support, please open an issue in the GitHub repository.