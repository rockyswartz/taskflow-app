/**
 * Google Sheets Data Population Script
 * 
 * This script populates your Google Sheet with demo data
 * 
 * Prerequisites:
 * 1. Install dependencies: npm install googleapis
 * 2. Set up Google Service Account credentials
 * 3. Share your spreadsheet with the service account email
 * 
 * Usage:
 * node populate-sheets.js
 */

const { google } = require('googleapis');
const fs = require('fs');

// Load your service account credentials
// Download from: https://console.cloud.google.com/ > IAM & Admin > Service Accounts
const credentials = require('./service-account-key.json');

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your actual ID

// Demo data to populate
const demoData = {
    Projects: [
        ['ID', 'Name', 'Description', 'Status', 'Expected Hours', 'Type ID'],
        ['p1', 'Website Redesign', 'Full site refresh for ABC Corp', 'active', 120, 'pt1'],
        ['p2', 'Mobile App Development', 'iOS and Android app', 'active', 200, 'pt2'],
        ['p3', 'E-commerce Platform', 'Online store with payment integration', 'active', 150, 'pt2'],
        ['p4', 'Marketing Campaign', 'Q1 2026 digital marketing', 'active', 80, 'pt1']
    ],
    Tasks: [
        ['ID', 'Description', 'Project ID', 'Project Name', 'Action Type', 'Assigned To', 'Deadline', 'Status', 'Priority', 'Hours', 'Notes'],
        ['t1', 'Design homepage mockup', 'p1', 'Website Redesign', 'Design Work', 'Rocky Swartz', '2026-02-15', 'In Progress', 'high', 5.5, 'Initial sketches done. Waiting for client feedback on color palette.'],
        ['t2', 'Client call about requirements', 'p1', 'Website Redesign', 'Client Call', 'Sarah Johnson', '2026-02-06', 'Not Started', 'urgent', 0, ''],
        ['t3', 'Write proposal document', 'p2', 'Mobile App', 'Write Proposal', 'Rocky Swartz', '2026-02-09', 'In Progress', 'high', 3, ''],
        ['t4', 'Review wireframes', 'p1', 'Website Redesign', 'Review', 'Sarah Johnson', '2026-02-20', 'Not Started', 'medium', 0, ''],
        ['t5', 'Setup payment gateway', 'p3', 'E-commerce Platform', 'Development', 'Tom Chen', '2026-02-12', 'In Progress', 'high', 8, '']
    ],
    ActionTypes: [
        ['ID', 'Name', 'Color', 'Active'],
        ['at1', 'Client Call', '#4A90E2', true],
        ['at2', 'Design Work', '#E24A90', true],
        ['at3', 'Write Proposal', '#90E24A', true],
        ['at4', 'Development', '#9B59B6', true],
        ['at5', 'Review', '#F39C12', true]
    ],
    StatusOptions: [
        ['ID', 'Name', 'Order', 'Color', 'Is Complete', 'Active'],
        ['st1', 'Not Started', 1, '#CCCCCC', false, true],
        ['st2', 'In Progress', 2, '#FFA500', false, true],
        ['st3', 'Blocked', 3, '#FF0000', false, true],
        ['st4', 'Completed', 4, '#00FF00', true, true]
    ],
    People: [
        ['ID', 'Name', 'Email', 'Role', 'Active'],
        ['p1', 'Rocky Swartz', 'rocky@example.com', 'Designer', true],
        ['p2', 'Sarah Johnson', 'sarah@example.com', 'Project Manager', true],
        ['p3', 'Tom Chen', 'tom@example.com', 'Developer', true]
    ],
    ProjectTypes: [
        ['ID', 'Name', 'Color', 'Active'],
        ['pt1', 'Marketing', '#3B82F6', true],
        ['pt2', 'Development', '#10B981', true],
        ['pt3', 'Consulting', '#F59E0B', true],
        ['pt4', 'Internal', '#6B7280', true]
    ]
};

async function populateSheets() {
    try {
        // Authenticate
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Populate each sheet
        for (const [sheetName, data] of Object.entries(demoData)) {
            console.log(`Populating ${sheetName}...`);

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: data
                }
            });

            console.log(`✓ ${sheetName} populated with ${data.length - 1} rows`);
        }

        console.log('\n✅ All sheets populated successfully!');
    } catch (error) {
        console.error('Error populating sheets:', error);
    }
}

populateSheets();
