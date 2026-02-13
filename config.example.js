// Configuration file template for Google Sheets API
// Copy this file to config.js and fill in your actual credentials

const CONFIG = {
    // Google API Configuration
    // Get these from: https://console.cloud.google.com/
    GOOGLE_API_KEY: 'YOUR_API_KEY_HERE',
    GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
    GOOGLE_SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

    // API Settings (usually don't need to change these)
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets',

    // Sheet Names (customize these to match your Google Sheet tabs)
    SHEETS: {
        PROJECTS: 'Projects',
        TASKS: 'Tasks',
        ACTION_TYPES: 'ActionTypes',
        STATUS_OPTIONS: 'StatusOptions',
        PEOPLE: 'People',
        PROJECT_TYPES: 'ProjectTypes'
    }
};
