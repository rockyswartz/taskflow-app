# TaskFlow Setup Guide

## Google Sheets API Configuration

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create API Credentials

#### API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (you'll add this to `config.js`)
4. **Recommended**: Restrict the API key:
   - Click "Edit API key"
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Under "Application restrictions", choose "HTTP referrers" and add your domain

#### OAuth 2.0 Client ID
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - For local development: `http://localhost:8000` (or your port)
   - For production: `https://yourdomain.com`
5. Copy the Client ID (you'll add this to `config.js`)

### Step 3: Configure Your Application

1. Copy `config.example.js` to `config.js`:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and add your credentials:
   ```javascript
   const CONFIG = {
       GOOGLE_API_KEY: 'your-api-key-here',
       GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com',
       GOOGLE_SPREADSHEET_ID: 'your-spreadsheet-id',
       // ... rest of config
   };
   ```

3. Find your Spreadsheet ID:
   - Open your Google Sheet
   - The ID is in the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### Step 4: Security Best Practices

✅ **DO:**
- Keep `config.js` in `.gitignore` (already configured)
- Use `config.example.js` for documentation
- Restrict your API key to specific domains
- Use OAuth 2.0 for user authentication

❌ **DON'T:**
- Commit `config.js` to version control
- Share your API keys publicly
- Use unrestricted API keys in production

### Step 5: Run the Application

1. Start a local web server (required for Google API):
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Or using Node.js
   npx http-server -p 8000
   ```

2. Open your browser to `http://localhost:8000`

3. Sign in with your Google account when prompted

## Troubleshooting

### "API key not valid" error
- Check that the API key is correct in `config.js`
- Verify the Google Sheets API is enabled in your project
- Check API key restrictions

### "Origin not allowed" error
- Add your domain to authorized JavaScript origins in OAuth client settings
- For local development, ensure `http://localhost:8000` is added

### Data not loading
- Check browser console for errors
- Verify spreadsheet ID is correct
- Ensure you've signed in with a Google account that has access to the sheet
- Check that sheet tab names match those in `CONFIG.SHEETS`
