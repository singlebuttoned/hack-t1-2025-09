# Backend Mock API - Mockoon Server

## Overview

This directory contains **Mockoon configuration files** that provide a mock REST API server for the dashboard template. This allows frontend development to proceed without implementing a real backend.

**Purpose**: Simulate MongoDB-based API responses for rapid prototyping and frontend development.

## What is Mockoon?

Mockoon is a tool for creating mock APIs quickly. It allows you to:
- Define API endpoints with realistic responses
- Simulate database operations (CRUD)
- Add delays, errors, and various HTTP status codes
- Serve JSON data that matches your frontend expectations

## Setup Instructions

### 1. Install Mockoon
```bash
# Option 1: Desktop app (recommended for beginners)
# Download from: https://mockoon.com/

# Option 2: CLI (for automation)
npm install -g @mockoon/cli
```

### 2. Configuration Files
This directory will contain:
```
back/
├── CLAUDE.md           # This documentation
├── api-config.json     # Mockoon environment configuration
├── data/               # Mock data files
│   ├── products.json   # Sample products
│   └── analytics.json  # Sample analytics data
└── README.md          # Quick start guide
```

### 3. Start Mock Server
```bash
# Using Desktop App
# 1. Open Mockoon desktop app
# 2. Import api-config.json
# 3. Start the environment

# Using CLI
cd back
mockoon-cli start --data api-config.json --port 3001
```

## API Endpoints Structure

The mock API provides example endpoints for common dashboard functionality:

### Data Management (Example: Products)
```
GET /api/products           # Get user's items/products
POST /api/products          # Create a new item
PUT /api/products/:id       # Update an item
DELETE /api/products/:id    # Delete an item
```

### Data Structure
Mock responses follow a standard database-like structure:

**Example Item Object:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "user123",
  "title": "Sample Item",
  "description": "Sample description for template",
  "category": "category1",
  "value": 100,
  "status": "active",
  "metadata": {
    "views": 47,
    "interactions": 12
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## Frontend Integration

### API Base URL
The frontend is configured to call:
```
http://localhost:3001
```

### CORS Configuration
Mockoon will be configured to allow requests from:
```
http://localhost:3000  # Frontend development server
```

## Development Workflow

### 1. Start Backend First
```bash
cd back
# Start Mockoon server on port 3001
```

### 2. Start Frontend
```bash
cd front  
npm run dev
# Frontend runs on port 3000 and calls backend on 3001
```

### 3. Development Features
- **Hot Reload**: Mockoon supports configuration updates
- **Request Logging**: View all API calls in Mockoon interface
- **Response Simulation**: Test different scenarios (success, errors, delays)

## Configuration Management

### Environment Variables
No environment variables needed for Mockoon - it runs standalone.

### Data Persistence
Mock data is stored in JSON files and can be version controlled for consistent development experience.

### Realistic Delays
API responses will include realistic delays (100-500ms) to simulate network conditions.

## Migration to Real Backend

When ready to implement a real backend:

1. **Keep the same API endpoints** - frontend won't need changes
2. **Use the same data structure** - minimal frontend updates needed
3. **Maintain the same response formats** - seamless transition
4. **Replace Mockoon with Node.js/Express + MongoDB**

## Troubleshooting

### Common Issues
- **Port conflicts**: Ensure port 3001 is available
- **CORS errors**: Check Mockoon CORS configuration
- **File paths**: Verify configuration file locations

### Useful Commands
```bash
# Check if port is in use
lsof -i :3001

# Kill process on port
kill -9 $(lsof -ti:3001)
```

## Additional Resources

- **Mockoon Documentation**: https://mockoon.com/docs/latest/
- **API Testing**: Use tools like Postman or curl to test endpoints
- **Frontend Integration**: See `front/CLAUDE.md` for API client setup

---

*This mock backend enables rapid frontend development while maintaining realistic API interactions that can easily transition to a real backend implementation.*