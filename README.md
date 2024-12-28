# PrepZoneApi

A robust REST API backend service built with Node.js, Express, and TypeScript for handling test preparation and educational content management.

## 🚀 Features

- User authentication and authorization
  - Local authentication with email/password
  - Google OAuth integration
  - JWT-based session management
- Role-based access control
- Content management for educational materials
- File upload capabilities with multer
- MongoDB database integration
- Docker support for containerization
- Production-ready configuration for Vercel deployment

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: 
  - Passport.js
  - JWT
  - Google OAuth 2.0
- **File Handling**: Multer
- **Security**: bcrypt for password hashing
- **Development Tools**:
  - ESLint for linting
  - Prettier for code formatting
  - Nodemon for development server

## 🏗️ Installation

1. Clone the repository:
```bash
git clone https://github.com/HaroonSaifi17/PrepZoneApi.git
cd PrepZoneApi
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=4040
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🚦 Development

Start the development server with hot reload:
```bash
npm run dev
```

Other available scripts:
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📝 API Documentation

[API documentation will be added soon]

## 🧪 Testing

[Testing instructions will be added soon]

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

HaroonSaifi17

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Note

Make sure to set up all environment variables before running the application. For security reasons, never commit the `.env` file to version control.
