# How to Test Your API

## ⚠️ Important: Use HTTP, NOT HTTPS

Your FastAPI backend runs on **HTTP** (not HTTPS). Always use:
- ✅ `http://localhost:8000` 
- ❌ NOT `https://localhost:8000`

## Quick Tests

### 1. Test in Browser

Open these URLs in your browser (use **http://**, not https://):

1. **API Documentation (Swagger UI):**
   ```
   http://localhost:8000/docs
   ```

2. **Alternative Docs (ReDoc):**
   ```
   http://localhost:8000/redoc
   ```

3. **Health Check:**
   ```
   http://localhost:8000/health
   ```

4. **Root Endpoint:**
   ```
   http://localhost:8000/
   ```

5. **Subscriptions Endpoint:**
   ```
   http://localhost:8000/subscriptions
   ```

### 2. Test with Python Script

Run the test script I created:

```bash
cd backend
python test_connection.py
```

### 3. Test with curl (Command Line)

```bash
# Health check
curl http://localhost:8000/health

# Get subscriptions
curl http://localhost:8000/subscriptions

# Root endpoint
curl http://localhost:8000/
```

### 4. Test with Browser Console

Open your browser console (F12) and run:

```javascript
// Test health endpoint
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test subscriptions
fetch('http://localhost:8000/subscriptions')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## Common Issues

### "Invalid HTTP request received" Warnings
- These are usually harmless
- Often caused by browser extensions or dev tools
- Your API should still work despite these warnings

### Connection Refused
- Make sure your backend server is running
- Check if port 8000 is already in use
- Verify you're using `http://` not `https://`

### CORS Errors
- Make sure frontend is on `http://localhost:4028`
- Check CORS configuration in `main.py`

## Expected Responses

### Health Check (`/health`)
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Subscriptions (`/subscriptions`)
```json
[
  {
    "subscription_id": 1,
    "service_name": "Netflix",
    "cost": 15.99,
    "payment_date": "2024-01-15T10:00:00",
    "category": "Entertainment",
    "description": "Monthly streaming subscription"
  },
  ...
]
```

