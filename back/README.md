# Mock Backend API Server

This directory contains the Mockoon configuration for the dashboard template mock API.

## Quick Start

### 1. Start the Mock Server

```bash
cd back
mockoon-cli start --data api-config.json --port 3001
```

The server will start on `http://localhost:3001`

### 2. Available Endpoints

#### Data Management (Example: Products)
- `GET /api/products` - Get all items/products
- `POST /api/products` - Create new item
- `PUT /api/products/:id` - Update item
- `DELETE /api/products/:id` - Delete item

### 3. Test the API

```bash
# Get all products
curl http://localhost:3001/api/products

# Get analytics
curl http://localhost:3001/api/stats
```

## Configuration

- **Port**: 3001
- **CORS**: Enabled for `http://localhost:3000`
- **Response Delays**: 100-200ms simulation
- **Data Format**: MongoDB-like JSON structure

## Mock Data

Sample data includes:
- Example items with various categories and statuses
- Analytics with interaction counts and metrics
- Category breakdown and time-series data

## Frontend Integration

The frontend at `http://localhost:3000` is configured to call this mock API for all data management and analytics operations.