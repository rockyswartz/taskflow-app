// Configuration file for Google Sheets API
// IMPORTANT: This is a PUBLIC DEMO config - replace with your own credentials

var CONFIG = {
    GOOGLE_API_KEY: 'YOUR_API_KEY_HERE',
    GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID_HERE',
    GOOGLE_SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

    // API Settings
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',

    // Sheet Names (customize these to match your Google Sheet tabs)
    SHEETS: {
        PROJECTS: 'Projects',
        TASKS: 'Tasks',
        ACTION_TYPES: 'ActionTypes',
        STATUS_OPTIONS: 'StatusOptions',
        PEOPLE: 'People',
        PROJECT_TYPES: 'ProjectTypes',
        SUBPROJECTS: 'SubProjects',
        ATTACHMENTS: 'Attachments',
        NOTES: 'Notes',
        SUBTASKS: 'SubTasks',
        CHANGELOG: 'ChangeLog',
        TIMELOGS: 'TimeLogs'
    }
};
