// ===== GLOBAL STATE =====
let timerState = {
    taskId: null,
    startTime: null,
    interval: null,
    accumulatedTime: 0
};

const demoData = {
    actionTypes: [
        { id: 'at1', name: 'Client Call', color: '#4A90E2', active: true },
        { id: 'at2', name: 'Design Work', color: '#E24A90', active: true },
        { id: 'at3', name: 'Write Proposal', color: '#90E24A', active: true },
        { id: 'at4', name: 'Development', color: '#9B59B6', active: true },
        { id: 'at5', name: 'Review', color: '#F39C12', active: true }
    ],
    statusOptions: [
        { id: 'st1', name: 'Not Started', order: 1, color: '#CCCCCC', isComplete: false, active: true },
        { id: 'st2', name: 'In Progress', order: 2, color: '#FFA500', isComplete: false, active: true },
        { id: 'st3', name: 'Blocked', order: 3, color: '#FF0000', isComplete: false, active: true },
        { id: 'str', name: 'In Review', order: 4, color: '#3B82F6', isComplete: false, active: true },
        { id: 'st4', name: 'Completed', order: 5, color: '#10B981', isComplete: true, active: true },
        { id: 'sta', name: 'Accepted', order: 6, color: '#059669', isComplete: true, active: true }
    ],
    people: [
        { id: 'p1', name: 'Rocky Swartz', email: 'rocky@example.com', role: 'Designer', active: true },
        { id: 'p2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Project Manager', active: true },
        { id: 'p3', name: 'Tom Chen', email: 'tom@example.com', role: 'Developer', active: true }
    ],
    projectTypes: [
        { id: 'pt1', name: 'Marketing', color: '#3B82F6', active: true },
        { id: 'pt2', name: 'Development', color: '#10B981', active: true },
        { id: 'pt3', name: 'Consulting', color: '#F59E0B', active: true },
        { id: 'pt4', name: 'Internal', color: '#6B7280', active: true }
    ],
    projects: [
        {
            id: 'p1',
            name: 'Website Redesign',
            description: 'Full site refresh for ABC Corp',
            status: 'active',
            expectedHours: 120,
            typeId: 'pt1'
        },
        {
            id: 'p2',
            name: 'Mobile App Development',
            description: 'iOS and Android app',
            status: 'active',
            expectedHours: 200,
            typeId: 'pt2'
        },
        {
            id: 'p3',
            name: 'E-commerce Platform',
            description: 'Online store with payment integration',
            status: 'active',
            expectedHours: 150,
            typeId: 'pt2'
        },
        {
            id: 'p4',
            name: 'Marketing Campaign',
            description: 'Q1 2026 digital marketing',
            status: 'active',
            expectedHours: 80,
            typeId: 'pt1'
        }
    ],
    tasks: [
        {
            id: 't1',
            description: 'Design homepage mockup',
            projectId: 'p1',
            projectName: 'Website Redesign',
            actionType: 'Design Work',
            assignedTo: 'Rocky Swartz',
            startDate: '2026-02-01',
            deadline: '2026-02-15',
            status: 'In Progress',
            priority: 'high',
            hours: 5.5,
            notes: 'Initial sketches done. Waiting for client feedback on color palette.',
            deadlineHistory: ['2026-02-10']
        },
        {
            id: 't2',
            description: 'Client call about requirements',
            projectId: 'p1',
            projectName: 'Website Redesign',
            actionType: 'Client Call',
            assignedTo: 'Sarah Johnson',
            startDate: '2026-02-02',
            deadline: '2026-02-06',
            status: 'Not Started',
            priority: 'urgent',
            hours: 0
        },
        {
            id: 't3',
            description: 'Write proposal document',
            projectId: 'p2',
            projectName: 'Mobile App',
            actionType: 'Write Proposal',
            assignedTo: 'Rocky Swartz',
            startDate: '2026-02-03',
            deadline: '2026-02-09',
            status: 'In Progress',
            priority: 'high',
            hours: 3
        },
        {
            id: 't4',
            description: 'Review wireframes',
            projectId: 'p1',
            projectName: 'Website Redesign',
            actionType: 'Review',
            assignedTo: 'Sarah Johnson',
            startDate: '2026-02-10',
            deadline: '2026-02-20',
            status: 'Not Started',
            priority: 'medium',
            hours: 0
        },
        {
            id: 't5',
            description: 'Setup payment gateway',
            projectId: 'p3',
            projectName: 'E-commerce Platform',
            actionType: 'Development',
            assignedTo: 'Tom Chen',
            startDate: '2026-02-05',
            deadline: '2026-02-12',
            status: 'In Progress',
            priority: 'high',
            hours: 8
        }
    ],
    timeLogs: [
        { id: 'tl1', taskId: 't1', personId: 'p1', date: '2026-02-10', duration: 2.5, description: 'Created initial wireframes and color palette options.', isBillable: true },
        { id: 'tl2', taskId: 't1', personId: 'p1', date: '2026-02-11', duration: 1.5, description: 'Refined color palette based on internal review.', isBillable: true },
        { id: 'tl3', taskId: 't3', personId: 'p3', date: '2026-02-12', duration: 4.0, description: 'Working on technical architecture section of proposal.', isBillable: false }
    ]
};

// ===== GOOGLE SHEETS INTEGRATION (GIS) =====
let tokenClient;
let gapiInited = false;
let gisInited = false;

// Load libraries
function gapiLoaded() {
    gapi.load('client', intializeGapiClient);
}

async function intializeGapiClient() {
    await gapi.client.init({
        apiKey: CONFIG.GOOGLE_API_KEY,
        discoveryDocs: CONFIG.DISCOVERY_DOCS,
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        scope: CONFIG.SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

// Initial triggers
if (typeof gapi !== 'undefined') gapiLoaded();
const checkGis = setInterval(() => {
    if (typeof google !== 'undefined' && google.accounts) {
        gisLoaded();
        clearInterval(checkGis);
    }
}, 100);

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        const loginBtn = document.getElementById('googleLoginBtn');
        const dashConnectBtn = document.getElementById('dashboardConnectBtn');
        const logoutBtn = document.getElementById('googleLogoutBtn');

        if (loginBtn) loginBtn.onclick = handleAuthClick;
        if (dashConnectBtn) dashConnectBtn.onclick = handleAuthClick;
        if (logoutBtn) logoutBtn.onclick = handleSignoutClick;

        const savedTokenStr = localStorage.getItem('gapi_token');
        if (savedTokenStr) {
            try {
                const tokenObj = JSON.parse(savedTokenStr);
                if (tokenObj && (tokenObj.token || tokenObj.access_token)) {
                    const token = tokenObj.token || tokenObj;
                    gapi.client.setToken(token);
                    // Also load the Picker API
                    gapi.load('picker');
                    updateSigninStatus(true);
                    console.log('🚀 Session restored from local storage.');
                }
            } catch (e) {
                console.error('Failed to restore session:', e);
                localStorage.removeItem('gapi_token');
                updateSigninStatus(false);
            }
        } else {
            updateSigninStatus(false);
        }
    }
}

// Google Drive Picker Setup
async function showPicker() {
    const token = gapi.client.getToken();
    if (!token) {
        alert('Please login first');
        return;
    }

    // Ensure the picker library is loaded before proceeding
    if (typeof google.picker === 'undefined') {
        gapi.load('picker', { 'callback': openPicker });
    } else {
        openPicker();
    }

    function openPicker() {
        const view = new google.picker.View(google.picker.ViewId.DOCS);
        const picker = new google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(token.access_token)
            .setDeveloperKey(CONFIG.GOOGLE_API_KEY)
            .setCallback(pickerCallback)
            .setOrigin(window.location.origin)
            .build();
        picker.setVisible(true);
    }
}

function pickerCallback(data) {
    if (data.action == google.picker.Action.PICKED) {
        const file = data.docs[0];
        document.getElementById('newTaskAttTitle').value = file.name;
        document.getElementById('newTaskAttUrl').value = file.url;
        document.getElementById('newTaskAttType').value = 'gdrive';
    }
}

function handleAuthClick() {
    console.log('🔑 Initiating Google Login...');
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            console.error('Auth Error:', resp);
            localStorage.removeItem('gapi_token');
            updateSigninStatus(false);
            return;
        }

        // Verify scopes were actually granted (granular permissions check)
        const grantedScopes = resp.scope || '';
        if (!grantedScopes.includes('https://www.googleapis.com/auth/spreadsheets')) {
            alert('⚠️ Permission Error: You MUST check the boxes on the sign-in screen to allow access to your Google Sheets, otherwise the app cannot load your data.');
            handleSignoutClick(); // Force reset
            return;
        }

        localStorage.setItem('gapi_token', JSON.stringify(resp));
        // Load picker on login
        gapi.load('picker');
        await fetchUserInfo(); // Get email for diagnostics
        updateSigninStatus(true);
        console.log('✅ Login successful!');
    };

    // Use 'select_account' to avoid re-showing checkboxes if already granted
    tokenClient.requestAccessToken({ prompt: 'select_account' });
}

async function fetchUserInfo() {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${gapi.client.getToken().access_token}` }
        });
        const user = await response.json();
        if (user.email) {
            localStorage.setItem('gapi_user_email', user.email);
            console.log('👤 Logged in as:', user.email);
        }
    } catch (e) {
        console.warn('Could not fetch user info:', e);
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        localStorage.removeItem('gapi_token');
        updateSigninStatus(false);
        console.log('👋 Signed out successfully.');
    }
}

function updateSigninStatus(isSignedIn) {
    const loginBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('googleLogoutBtn');
    const statusIndicator = document.getElementById('connectionStatus');

    if (isSignedIn) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (statusIndicator) {
            statusIndicator.innerHTML = '<span class="status-dot online"></span> Connected to Google Sheets';
            statusIndicator.className = 'connection-status connected';
        }
        loadDataFromSheets();
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (statusIndicator) {
            statusIndicator.innerHTML = '<span class="status-dot offline"></span> Demo Mode (Offline)';
            statusIndicator.className = 'connection-status offline';
        }
        initializeApp();
    }
}

// Google Sheets Read/Write Operations
async function fetchSheetData(sheetName, range) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID,
            range: `${sheetName}!${range}`
        });
        return response.result.values || [];
    } catch (e) {
        console.warn(`Could not fetch sheet ${sheetName}:`, e);
        return [];
    }
}

async function saveToSheets(sheetName, rowData) {
    if (!gapi.client.getToken()) {
        alert('Please login to Google Sheets first.');
        return false;
    }

    try {
        console.log(`Sync Request: Appending to ${sheetName}...`, rowData);
        // Using the sheet name alone finds the first empty row below the header range
        const range = `'${sheetName}'!A1`;
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [rowData]
            }
        });

        const updatedRange = response.result.updates?.updatedRange;
        console.log('Server response:', response.result, updatedRange);
        alert('Item added successfully!');
        return true;
    } catch (e) {
        console.error('API Error:', e);
        const errorMsg = e.result?.error?.message || e.message;
        alert('Failed to save changes: ' + errorMsg);
        return false;
    }
}

async function loadDataFromSheets() {
    try {
        console.log('Syncing starting with Google Sheets...');

        // Diagnostic: Check sheet availability
        let spreadsheet;
        try {
            spreadsheet = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID
            });
        } catch (e) {
            console.error('Handshake failed:', e);
            const status = e.status || e.result?.error?.code;
            if (status === 404) {
                alert(`Error 404: Spreadsheet not found!\n\nPlease check your GOOGLE_SPREADSHEET_ID in config.js. It must match the ID in your browser's URL bar exactly.`);
            } else if (status === 403) {
                const userEmail = localStorage.getItem('gapi_user_email') || 'Unknown';
                alert(`Error 403: Access Denied!\n\nYour Google account (${userEmail}) does not have permission to view this spreadsheet.\n\nIMPORTANT: When you log in, you MUST check the boxes that allow this app to access your files or you will get this error.`);
            } else {
                alert(`Connection Error (${status}): ${e.result?.error?.message || e.message}`);
            }
            updateSigninStatus(false);
            return;
        }

        // Reset demoData to empty arrays so we don't mix real data with fallback
        demoData.projects = [];
        demoData.tasks = [];
        demoData.people = [];
        demoData.actionTypes = [];
        demoData.statusOptions = [];
        demoData.projectTypes = [];
        demoData.subProjects = [];
        demoData.attachments = [];
        demoData.notes = [];
        demoData.subTasks = [];
        demoData.changeLog = [];
        demoData.timeLogs = [];
        demoData.archivedProjects = [];

        const actualSheets = spreadsheet.result.sheets.map(s => s.properties.title);
        console.log('Tabs found in your Google Sheet:', actualSheets);

        // Auto-fix: Match config names to actual names (handles trailing spaces)
        Object.keys(CONFIG.SHEETS).forEach(key => {
            const configName = CONFIG.SHEETS[key];
            const match = actualSheets.find(s => s.trim().toLowerCase() === configName.trim().toLowerCase());
            if (match && match !== configName) {
                console.warn(`Fuzzy matched tab "${configName}" to "${match}"`);
                CONFIG.SHEETS[key] = match;
            }
        });

        const missingSheets = Object.values(CONFIG.SHEETS).filter(s => !actualSheets.includes(s));
        if (missingSheets.length > 0) {
            alert(`⚠️ Tab Name Mismatch!\n\nThe app is looking for a tab named "${missingSheets[0]}", but I can't find it precisely. \n\nPlease ensure your tab names match config.js exactly!`);
        }

        // Load all data from sheets in parallel
        const [
            projectsData,
            tasksData,
            peopleData,
            actionTypesData,
            statusOptionsData,
            projectTypesData,
            subProjectsData,
            attachmentsData,
            notesData,
            subTasksData,
            changeLogData,
            timeLogsData
        ] = await Promise.all([
            fetchSheetData(CONFIG.SHEETS.PROJECTS, 'A2:I'),
            fetchSheetData(CONFIG.SHEETS.TASKS, 'A2:R'),
            fetchSheetData(CONFIG.SHEETS.PEOPLE, 'A2:F'),
            fetchSheetData(CONFIG.SHEETS.ACTION_TYPES, 'A2:F'),
            fetchSheetData(CONFIG.SHEETS.STATUS_OPTIONS, 'A2:F'),
            fetchSheetData(CONFIG.SHEETS.PROJECT_TYPES || 'ProjectTypes', 'A2:E'),
            fetchSheetData(CONFIG.SHEETS.SUBPROJECTS || 'SubProjects', 'A2:H'),
            fetchSheetData(CONFIG.SHEETS.ATTACHMENTS || 'Attachments', 'A2:F'),
            fetchSheetData(CONFIG.SHEETS.NOTES || 'Notes', 'A2:G'),
            fetchSheetData(CONFIG.SHEETS.SUBTASKS || 'SubTasks', 'A2:G'),
            fetchSheetData(CONFIG.SHEETS.CHANGELOG || 'ChangeLog', 'A2:H'),
            fetchSheetData(CONFIG.SHEETS.TIMELOGS || 'TimeLogs', 'A2:I')
        ]);

        // Transform ProjectTypes: Smart mapping for 4 or 5 columns
        if (projectTypesData.length > 0) {
            demoData.projectTypes = projectTypesData.map(row => {
                const hasOrder = row.length >= 5;
                return {
                    id: row[0],
                    name: row[1],
                    order: hasOrder ? (parseInt(row[2]) || 0) : 0,
                    color: hasOrder ? row[3] : row[2],
                    active: (hasOrder ? row[4] : row[3])?.toUpperCase() === 'TRUE'
                };
            });
        }

        // Transform Projects: [project_id, project_name, description, status, created_date, archived_date, expected_hours, type_id]
        if (projectsData.length > 0) {
            demoData.projects = projectsData.map(row => ({
                id: row[0],
                name: row[1],
                description: row[2],
                status: row[3],
                createdDate: row[4],
                archivedDate: row[5],
                expectedHours: parseFloat(row[6]) || 0,
                typeId: row[7] || 'pt1', // Shifted from index 8 to 7
                completedTasks: 0,
                tasks: 0,
                progress: 0,
                actualHours: 0
            }));
        }

        // Transform People: [person_id, person_name, email, role, hourly_rate, is_active]
        if (peopleData.length > 0) {
            demoData.people = peopleData.map(row => ({
                id: row[0],
                name: row[1],
                email: row[2],
                role: row[3],
                hourlyRate: parseFloat(row[4]) || 0,
                active: row[5]?.toUpperCase() === 'TRUE'
            }));
        }

        // Transform ActionTypes: [id, name, order, color, active, isSubtaskType]
        if (actionTypesData.length > 0) {
            demoData.actionTypes = actionTypesData.map(row => ({
                id: row[0],
                name: row[1],
                order: parseInt(row[2]) || 0,
                color: row[3],
                active: row[4]?.trim().toUpperCase() === 'TRUE',
                isSubtaskType: row[5]?.trim().toUpperCase() === 'TRUE'
            }));
        }

        // Transform StatusOptions: [status_id, status_name, status_order, color_hex, is_complete, is_active]
        if (statusOptionsData.length > 0) {
            demoData.statusOptions = statusOptionsData.map(row => ({
                id: row[0],
                name: row[1],
                order: parseInt(row[2]) || 0,
                color: row[3],
                isComplete: row[4]?.toUpperCase() === 'TRUE',
                active: row[5]?.toUpperCase() === 'TRUE'
            }));
        }

        // Transform SubProjects: [subproject_id, subproject_name, parent_id, parent_type, description, level, created_date, status]
        if (subProjectsData.length > 0) {
            demoData.subProjects = subProjectsData.map(row => ({
                id: row[0],
                name: row[1],
                parentId: row[2],
                parentType: row[3],
                description: row[4],
                level: parseInt(row[5]) || 1,
                createdDate: row[6],
                status: row[7] || 'active'
            }));
        } else {
            demoData.subProjects = [];
        }

        // Transform Attachments: [attachment_id, task_id, attachment_type, attachment_url, title, created_date]
        if (attachmentsData.length > 0) {
            demoData.attachments = attachmentsData.map(row => ({
                id: row[0],
                taskId: row[1],
                type: row[2],
                url: row[3],
                title: row[4],
                createdDate: row[5]
            }));
        } else {
            demoData.attachments = [];
        }

        // Transform SubTasks: [id, task_id, description, action_type_id, status, created_date, completion_date]
        if (typeof subTasksData !== 'undefined' && subTasksData.length > 0) {
            demoData.subTasks = subTasksData.map(row => ({
                id: row[0],
                taskId: row[1],
                description: row[2],
                actionTypeId: row[3],
                status: row[4],
                createdDate: row[5],
                completionDate: row[6]
            }));
        } else {
            demoData.subTasks = [];
        }

        // Transform ChangeLog: [id, item_id, item_type, field_name, old_val, new_val, timestamp, person_id]
        if (typeof changeLogData !== 'undefined' && changeLogData.length > 0) {
            demoData.changeLog = changeLogData.map(row => ({
                id: row[0],
                itemId: row[1],
                itemType: row[2],
                fieldName: row[3],
                oldValue: row[4],
                newValue: row[5],
                timestamp: row[6],
                personId: row[7]
            }));
        } else {
            demoData.changeLog = [];
        }
        // Transform Notes: [note_id, related_id, text, created_date, person_id, active]
        if (typeof notesData !== 'undefined' && notesData.length > 0) {
            demoData.notes = notesData.map(row => ({
                id: row[0],
                relatedId: row[1],
                text: row[2],
                createdDate: row[3],
                personId: row[4],
                active: row[5]?.toUpperCase() === 'TRUE'
            }));
        } else {
            demoData.notes = [];
        }

        // Transform TimeLogs: [id, task_id, person_id, date, start, end, duration, description, is_billable]
        if (typeof timeLogsData !== 'undefined' && timeLogsData.length > 0) {
            demoData.timeLogs = timeLogsData.map(row => ({
                id: row[0],
                taskId: row[1],
                personId: row[2],
                date: row[3],
                startTime: row[4],
                endTime: row[5],
                duration: parseFloat(row[6]) || 0,
                description: row[7],
                isBillable: row[8]?.toUpperCase() === 'TRUE'
            }));
        } else {
            demoData.timeLogs = [];
        }

        // Transform Tasks: [task_id, task_description, parent_id, parent_type, action_type_id, assigned_person_id, deadline, status_id, completion_date, time_started, time_ended, total_hours, priority, created_date]
        if (tasksData.length > 0) {
            demoData.tasks = tasksData.map(row => {
                const parentId = row[2];
                const parentType = row[3];
                let parentName = 'Unknown';

                if (parentType === 'project') {
                    const project = demoData.projects.find(p => p.id === parentId);
                    if (project) parentName = project.name;
                } else if (parentType === 'subproject') {
                    const sub = demoData.subProjects.find(s => s.id === parentId);
                    if (sub) parentName = sub.name;
                }

                const actionType = demoData.actionTypes.find(at => at.id === row[4]);
                const person = demoData.people.find(p => p.id === row[5]);
                const status = demoData.statusOptions.find(s => s.id === row[7]);

                return {
                    id: row[0],
                    description: row[1],
                    projectId: parentId, // Keep for backward compatibility
                    projectName: parentName,
                    parentType: parentType,
                    actionType: actionType ? actionType.name : 'Unknown',
                    actionTypeId: row[4],
                    assignedTo: person ? person.name : 'Unassigned',
                    assignedPersonId: row[5],
                    deadline: row[6],
                    startDate: row[17] || row[13] || '', // Col R (Index 17), fallback to createdDate
                    status: status ? status.name : 'Unknown',
                    statusId: row[7],
                    completionDate: row[8],
                    timeStarted: row[9],
                    timeEnded: row[10],
                    hours: parseFloat(row[11]) || 0,
                    priority: row[12],
                    createdDate: row[13],
                    instructions: row[14] || '', // Renamed from notes
                    deadlineHistory: row[15] ? JSON.parse(row[15]) : [],
                    isArchived: row[16]?.toUpperCase() === 'TRUE'
                };
            });
        }

        console.log('Dynamic sync success! UI Refreshing...');
        initializeApp();

    } catch (error) {
        console.error('Error loading data from sheets:', error);
    }
}

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
        return 'Due today';
    } else if (diffDays <= 7) {
        return `${diffDays} days remaining`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

function isOverdue(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return date < today;
}

function isDueSoon(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= today && date <= weekLater;
}

// ===== NAVIGATION =====
const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = link.dataset.view;

        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show corresponding view
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(`${viewName}View`).classList.add('active');

        // Close mobile menu
        sidebar.classList.remove('active');
        overlay.classList.remove('active');

        // Load view content
        loadViewContent(viewName);
    });
});

// Mobile menu toggle
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
}

overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    closeModal();
});

// ===== MODAL CONTROLS =====
const quickAddModal = document.getElementById('quickAddModal');
const quickAddBtn = document.getElementById('quickAddBtn');
const fabBtn = document.getElementById('fabBtn');
const closeQuickAdd = document.getElementById('closeQuickAdd');
const modalTabBtns = document.querySelectorAll('.modal-content .tab-btn');
const modalTabContents = document.querySelectorAll('.modal-content .tab-content');

const notesModal = document.getElementById('notesModal');
const closeNotes = document.getElementById('closeNotes');

function openModal() {
    quickAddModal.classList.add('active');
    overlay.classList.add('active');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    overlay.classList.remove('active');
}
function closeAllModals() {
    closeModal();
}

[quickAddBtn, fabBtn].forEach(btn => {
    if (btn) {
        btn.addEventListener('click', openModal);
    }
});

if (closeQuickAdd) closeQuickAdd.addEventListener('click', closeModal);
if (closeNotes) closeNotes.addEventListener('click', closeModal);
document.getElementById('closeLogTime')?.addEventListener('click', closeModal);
document.getElementById('cancelLogTime')?.addEventListener('click', closeModal);

// ===== NOTES LOGIC =====
let currentNotesRelatedId = null;
let currentNotesType = null;

async function openNotesModal(relatedId, type) {
    currentNotesRelatedId = relatedId;
    currentNotesType = type;

    const title = type === 'project' ? 'Project Notes' : 'Task Notes';
    let subtitle = '';

    if (type === 'project') {
        const p = demoData.projects.find(proj => proj.id === relatedId);
        subtitle = p ? p.name : '';
    } else {
        const t = demoData.tasks.find(tk => tk.id === relatedId);
        subtitle = t ? t.description : '';
    }

    document.getElementById('notesModalTitle').textContent = title;
    document.getElementById('notesModalSubtitle').textContent = subtitle;

    // Populate Person dropdown in note form
    const personSelect = document.getElementById('notePerson');
    if (personSelect) {
        personSelect.innerHTML = '<option value="">Select person...</option>' +
            demoData.people.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    loadNotesHistory(relatedId);
    notesModal.classList.add('active');
    overlay.classList.add('active');
}

function loadNotesHistory(relatedId) {
    const historyDiv = document.getElementById('notesHistory');
    // Display all notes for management, sorted newest first (descending)
    const relevantNotes = demoData.notes
        .filter(n => n.relatedId === relatedId)
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    if (relevantNotes.length === 0) {
        historyDiv.innerHTML = '<p style="text-align:center; color:var(--gray-500); padding:20px;">No notes yet. Be the first to add one!</p>';
        return;
    }

    historyDiv.innerHTML = relevantNotes.map(note => {
        const person = demoData.people.find(p => p.id === note.personId);
        const dateStr = new Date(note.createdDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
        const isActive = note.active === true || String(note.active).toUpperCase() === 'TRUE';

        return `
            <div class="note-card" style="background:${isActive ? 'var(--bg-card)' : 'var(--gray-50)'}; padding:12px; border-radius:8px; margin-bottom:12px; border:1px solid ${isActive ? 'var(--border-color)' : 'var(--gray-200)'}; box-shadow:var(--shadow-sm); opacity:${isActive ? '1' : '0.8'};">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px;">
                    <span style="font-weight:600; color:${isActive ? 'var(--primary)' : 'var(--text-muted)'};">${person ? person.name : 'Unknown User'}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="color:var(--text-muted);">${dateStr}</span>
                        <div style="display:flex; align-items:center; gap:4px; margin-left:8px; padding:2px 6px; background:var(--gray-100); border-radius:4px;">
                            <input type="checkbox" id="chk_${note.id}" ${isActive ? 'checked' : ''} onchange="toggleNoteActive('${note.id}', this.checked)" style="cursor:pointer; width:14px; height:14px;">
                            <label for="chk_${note.id}" style="font-size:10px; font-weight:700; color:var(--text-muted); cursor:pointer;">ACTIVE</label>
                        </div>
                    </div>
                </div>
                <div style="font-size:14px; line-height:1.4; color:${isActive ? 'var(--text-main)' : 'var(--text-muted)'}; white-space:pre-wrap;">${note.text}</div>
            </div>
        `;
    }).join('');
}

async function toggleNoteActive(noteId, isActive) {
    const note = demoData.notes.find(n => n.id === noteId);
    if (!note) return;

    // Row: [ID, RelatedId, Text, Date, PersonId, Active]
    const rowData = [
        note.id,
        note.relatedId,
        note.text,
        note.createdDate,
        note.personId,
        isActive ? 'TRUE' : 'FALSE'
    ];

    const success = await updateSheetRow(CONFIG.SHEETS.NOTES, noteId, rowData);
    if (success) {
        note.active = isActive;
        loadNotesHistory(currentNotesRelatedId);
        // Refresh project count if applicable
        if (currentNotesType === 'project') loadProjects();
    } else {
        // Revert UI on failure
        document.getElementById(`chk_${noteId}`).checked = !isActive;
    }
}

document.getElementById('addNoteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('noteText').value;
    const personId = document.getElementById('notePerson').value;

    if (!currentNotesRelatedId) return;

    const newNote = {
        id: getNextId('NOTE', demoData.notes),
        relatedId: currentNotesRelatedId,
        text: text,
        createdDate: new Date().toISOString(),
        personId: personId,
        active: true
    };

    // Save to Sheet: [ID, RelatedId, Text, Date, PersonId, Active]
    const rowData = [newNote.id, newNote.relatedId, newNote.text, newNote.createdDate, newNote.personId, 'TRUE'];
    const success = await saveToSheets(CONFIG.SHEETS.NOTES, rowData);

    if (success) {
        demoData.notes.push(newNote);
        document.getElementById('noteText').value = '';
        loadNotesHistory(currentNotesRelatedId);

        // Refresh project count
        if (currentNotesType === 'project') loadProjects();

        // Return choice
        setTimeout(() => {
            if (!confirm('Note successfully posted! Would you like to add another?')) {
                closeModal();
            } else {
                document.getElementById('noteText').focus();
            }
        }, 300);
    }
});

// Modal tabs
modalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        modalTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        modalTabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}Tab`) {
                content.classList.add('active');
            }
        });
    });
});

// ===== COLLAPSIBLE SECTIONS =====
document.querySelectorAll('.collapsible').forEach(header => {
    header.addEventListener('click', () => {
        const targetId = header.dataset.target;
        const target = document.getElementById(targetId);

        header.classList.toggle('collapsed');
        target.classList.toggle('collapsed');
    });
});

// ===== UTILITY: ID GENERATION =====
function getNextId(prefix, data, idKey = 'id') {
    if (!data || data.length === 0) return prefix + '001';

    const numericIds = data
        .map(item => {
            const id = item[idKey];
            if (!id || typeof id !== 'string') return 0;
            const match = id.match(/\d+/);
            if (!match) return 0;

            const num = parseInt(match[0]);
            // Safeguard: If the number is huge (like a timestamp), ignore it
            // for the purpose of incremental ID generation.
            return num < 1000000 ? num : 0;
        })
        .filter(n => n > 0);

    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return prefix + String(maxId + 1).padStart(3, '0');
}

// ===== FORM HANDLERS =====
const quickTaskForm = document.getElementById('quickTaskForm');
const quickProjectForm = document.getElementById('quickProjectForm');

if (quickTaskForm) {
    quickTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const taskId = getNextId('T', demoData.tasks);
        const parentId = document.getElementById('taskProject').value;

        // Determine parent_type by checking if it's in projects or subprojects
        let parentType = 'project';
        if (demoData.subProjects && demoData.subProjects.some(s => s.id === parentId)) {
            parentType = 'subproject';
        }

        const instructions = document.getElementById('taskInstructions').value;

        // [task_id, task_description, parent_id, parent_type, action_type_id, assigned_person_id, deadline, status_id, completion_date, time_started, time_ended, total_hours, priority, created_date, instructions]
        const rowData = [
            taskId,
            document.getElementById('taskDescription').value,
            parentId,
            parentType,
            document.getElementById('taskType').value,
            document.getElementById('taskAssignee').value,
            document.getElementById('taskDeadline').value,
            'ST001', // st1 - Not Started
            '',
            '', // time_started
            '', // time_ended
            0,  // total_hours
            document.querySelector('input[name="priority"]:checked')?.value || 'medium',
            new Date().toISOString().split('T')[0],
            instructions, // Col O (Index 14)
            '[]', // DeadlineHistory (Index 15)
            'FALSE', // isArchived (Index 16)
            document.getElementById('taskStartDate').value // Col R (Index 17)
        ];

        console.log('Sending row data for new task:', rowData);

        const success = await saveToSheets(CONFIG.SHEETS.TASKS, rowData);
        if (success) {
            alert('Task created successfully!');
            quickTaskForm.reset();
            closeModal();
            loadDataFromSheets();
        }
    });
}

if (quickProjectForm) {
    quickProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!document.getElementById('projectName').value.trim()) return alert('Project name is required');

        const projectId = getNextId('P', demoData.projects);

        // [project_id, project_name, description, status, created_date, archived_date, expected_hours, type_id]
        const rowData = [
            projectId,
            document.getElementById('projectName').value,
            document.getElementById('projectDescription').value,
            'active',
            new Date().toISOString().split('T')[0],
            '',
            parseFloat(document.getElementById('projectHours').value) || 0,
            document.getElementById('projectTypeSelect').value || 'pt1'
        ];

        const success = await saveToSheets(CONFIG.SHEETS.PROJECTS, rowData);
        if (success) {
            // Save instructions as initial note
            const instructions = document.getElementById('projectInstructions').value;
            if (instructions) {
                const noteId = getNextId('NOTE', demoData.notes);
                const noteRow = [noteId, projectId, instructions, new Date().toISOString(), 'p1', 'TRUE'];
                await saveToSheets(CONFIG.SHEETS.NOTES, noteRow);
            }
            alert('Project created successfully!');
            quickProjectForm.reset();
            closeModal();
            loadDataFromSheets();
        }
    });
}

// Quick Add SubProject and Attachment listeners removed as they are now managed post-creation.

// New Task Button on Tasks View
document.getElementById('newTaskBtn')?.addEventListener('click', () => {
    openModal();
    // Switch to task tab
    document.querySelectorAll('.modal .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.modal .tab-btn[data-tab="task"]').classList.add('active');
    modalTabContents.forEach(content => content.classList.remove('active'));
    document.getElementById('taskTab').classList.add('active');
});

// Cancel buttons
document.getElementById('cancelTask')?.addEventListener('click', closeModal);
document.getElementById('cancelProject')?.addEventListener('click', closeModal);

// ===== CONTENT LOADING =====
function loadViewContent(viewName) {
    switch (viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'archive':
            loadArchive();
            break;
        case 'gantt':
            loadGantt();
            break;
        case 'timesheets':
            loadTimesheets();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ===== STATISTICS CALCULATION =====
function calculateStats() {
    const activeProjects = demoData.projects.filter(p => p.status === 'active').length;
    const overdueTasks = demoData.tasks.filter(t => isOverdue(t.deadline) && t.status !== 'Completed').length;
    const dueSoonTasks = demoData.tasks.filter(t => isDueSoon(t.deadline) && !isOverdue(t.deadline) && t.status !== 'Completed').length;
    const completedTasks = demoData.tasks.filter(t => t.status === 'Completed').length;

    return { activeProjects, overdueTasks, dueSoonTasks, completedTasks };
}

function calculateProjectStats(projectId) {
    // Find all subprojects belonging to this project (one level deep for now)
    const subProjectIds = demoData.subProjects
        ? demoData.subProjects.filter(s => s.parentId === projectId).map(s => s.id)
        : [];

    const allRelevantIds = [projectId, ...subProjectIds];
    const projectTasks = demoData.tasks.filter(t => allRelevantIds.includes(t.projectId));

    const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
    const totalHours = projectTasks.reduce((sum, t) => sum + (t.hours || 0), 0);
    const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

    return {
        tasks: projectTasks.length,
        completedTasks,
        actualHours: totalHours,
        progress
    };
}

function calculateProjectNotesCount(projectId) {
    if (!demoData.notes) return 0;
    return demoData.notes.filter(n => n.relatedId === projectId && n.active).length;
}

function loadDashboard() {
    const stats = calculateStats();
    const activeTasks = demoData.tasks ? demoData.tasks.filter(t => !t.isArchived) : [];

    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards[0]) statCards[0].querySelector('.stat-value').textContent = stats.activeProjects;
    if (statCards[1]) statCards[1].querySelector('.stat-value').textContent = stats.overdueTasks;
    if (statCards[2]) statCards[2].querySelector('.stat-value').textContent = stats.dueSoonTasks;
    if (statCards[3]) statCards[3].querySelector('.stat-value').textContent = stats.completedTasks;

    // 📊 1. Task Distribution Donut
    const statusDonut = document.getElementById('statusDonut');
    const donutLegend = document.getElementById('donutLegend');
    const donutTotal = document.getElementById('donutTotal');

    if (statusDonut && activeTasks.length > 0) {
        const statusCounts = {};
        demoData.statusOptions.forEach(s => statusCounts[s.name] = 0);
        activeTasks.forEach(t => { if (statusCounts[t.status] !== undefined) statusCounts[t.status]++; });

        donutTotal.textContent = activeTasks.length;

        let lastPercentage = 0;
        const gradientParts = [];
        const legendParts = [];

        demoData.statusOptions.forEach(s => {
            const count = statusCounts[s.name];
            if (count > 0) {
                const percentage = (count / activeTasks.length) * 100;
                gradientParts.push(`${s.color} ${lastPercentage}% ${lastPercentage + percentage}%`);
                lastPercentage += percentage;

                legendParts.push(`
                    <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${s.color};"></span>
                        <span style="color: var(--gray-600); white-space: nowrap;">${s.name} (${count})</span>
                    </div>
                `);
            }
        });

        statusDonut.style.background = `conic-gradient(${gradientParts.join(', ')})`;
        donutLegend.innerHTML = legendParts.join('');
    }

    // 📈 2. Project Progress
    const dashProjectList = document.getElementById('dashboardProjectList');
    if (dashProjectList) {
        const topProjects = [...demoData.projects]
            .filter(p => p.status === 'active')
            .map(p => ({ ...p, stats: calculateProjectStats(p.id) }))
            .sort((a, b) => b.stats.progress - a.stats.progress)
            .slice(0, 4);

        if (topProjects.length > 0) {
            dashProjectList.innerHTML = topProjects.map(p => `
                <div onclick="openEditProjectModal('${p.id}')" style="cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
                        <span style="font-weight: 600; color: var(--gray-700);">${p.name}</span>
                        <span style="color: var(--primary); font-weight: 700;">${p.stats.progress}%</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: var(--gray-100); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${p.stats.progress}%; height: 100%; background: var(--primary); border-radius: 3px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `).join('');
        } else {
            dashProjectList.innerHTML = '<p style="color: var(--gray-400); font-style: italic; font-size: 13px; text-align: center;">No active projects.</p>';
        }
    }

    // 👥 3. Team Workload
    const teamList = document.getElementById('teamWorkloadList');
    if (teamList) {
        const workload = {};
        demoData.people.forEach(p => workload[p.name] = { count: 0, completed: 0 });
        activeTasks.forEach(t => {
            if (workload[t.assignedTo]) {
                workload[t.assignedTo].count++;
                if (t.status === 'Completed') workload[t.assignedTo].completed++;
            }
        });

        const sortedTeam = Object.entries(workload)
            .filter(([name, data]) => data.count > 0)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);

        if (sortedTeam.length > 0) {
            teamList.innerHTML = sortedTeam.map(([name, data]) => {
                const completionRate = Math.round((data.completed / data.count) * 100);
                return `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gray-100); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--primary);">
                            ${name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                                <span style="font-weight: 600;">${name}</span>
                                <span style="color: var(--gray-500);">${data.count} Tasks</span>
                            </div>
                            <div style="font-size: 10px; color: var(--success); font-weight: 600;">${completionRate}% Completion Rate</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            teamList.innerHTML = '<p style="color: var(--gray-400); font-style: italic; font-size: 13px; text-align: center;">No active team assignments.</p>';
        }
    }

    // ⚠️ Update attention needed list
    const attentionList = document.getElementById('attentionList');
    if (attentionList) {
        const urgentTasks = activeTasks
            .filter(t => (isOverdue(t.deadline) || isDueSoon(t.deadline)) && t.status !== 'Completed')
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 5);

        if (urgentTasks.length > 0) {
            attentionList.innerHTML = urgentTasks.map(task => {
                const daysOverdue = Math.floor((new Date() - new Date(task.deadline)) / (1000 * 60 * 60 * 24));
                const urgencyClass = isOverdue(task.deadline) ? 'urgent' : 'warning';
                const urgencyText = isOverdue(task.deadline)
                    ? `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`
                    : 'Due soon';

                return `
                    <div class="task-item ${urgencyClass}" onclick="openEditTaskModal('${task.id}')" style="cursor: pointer;">
                        <div class="task-info">
                            <div class="task-title">${task.description}</div>
                            <div class="task-meta">${task.projectName} • ${urgencyText}</div>
                        </div>
                        <button class="btn-icon" onclick="event.stopPropagation(); openEditTaskModal('${task.id}')">→</button>
                    </div>
                `;
            }).join('');
        } else {
            attentionList.innerHTML = '<p style="color: var(--gray-500); padding: 20px; text-align: center;">No urgent tasks! 🎉</p>';
        }
    }

    // Update attention badge
    const attentionBadge = document.querySelector('.card-header h3 .badge');
    if (attentionBadge) {
        const urgentCount = activeTasks.filter(t => (isOverdue(t.deadline) || isDueSoon(t.deadline)) && t.status !== 'Completed').length;
        attentionBadge.textContent = urgentCount;
    }

    // Hide the redundant Active Projects section
    const projectsList = document.getElementById('projectsList');
    if (projectsList) {
        projectsList.closest('.card').style.display = 'none';
    }
}

function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = demoData.projects.map(project => {
        const type = demoData.projectTypes.find(pt => pt.id === project.typeId);
        const stats = calculateProjectStats(project.id);
        const noteCount = calculateProjectNotesCount(project.id);
        return `
            <div class="card" onclick="openEditProjectModal('${project.id}')" style="cursor: pointer; display: flex; flex-direction: column;">
                <div class="card-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${type?.color || 'var(--gray-300)'};"></span>
                        <h3 style="margin: 0; font-size: 16px;">${project.name}</h3>
                    </div>
                </div>
                <div class="card-body" style="flex: 1;">
                    <p style="color: var(--gray-600); margin-bottom: 16px; font-size: 14px; line-height: 1.5;">${project.description}</p>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 13px; color: var(--gray-500);">Progress</span>
                        <span style="font-weight: 600; font-size: 13px;">${stats.progress}%</span>
                    </div>
                    <div class="progress-bar" style="width: 100%; margin-bottom: 16px; height: 6px; background: var(--gray-100); border-radius: 3px;">
                        <div class="progress-fill" style="width: ${stats.progress}%; height: 100%; border-radius: 3px;"></div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                        <div>
                            <div style="color: var(--gray-500);">Tasks</div>
                            <div style="font-weight: 600;">${stats.completedTasks}/${stats.tasks}</div>
                        </div>
                        <div>
                            <div style="color: var(--gray-500);">Hours</div>
                            <div style="font-weight: 600;">${stats.actualHours}/${project.expectedHours}</div>
                        </div>
                    </div>
                </div>
                <div class="card-footer" style="padding: 12px 20px; border-top: 1px solid var(--gray-100); background: var(--gray-50);">
                    <button class="btn btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; padding: 6px; position: relative;" onclick="event.stopPropagation(); openNotesModal('${project.id}', 'project')">
                        <span style="${noteCount > 0 ? 'color: var(--success); font-weight: 700;' : ''}">📝 Notes</span>
                        ${noteCount > 0 ? `<span class="badge" style="background: var(--success); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${noteCount}</span>` : ''}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    projectsGrid.style.display = 'grid';
    projectsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    projectsGrid.style.gap = 'var(--spacing-md)';
}

// ===== VIEW MODES =====
let taskViewMode = 'list';

function setTaskView(mode) {
    taskViewMode = mode;
    document.getElementById('listViewBtn')?.classList.toggle('active-view', mode === 'list');
    document.getElementById('boardViewBtn')?.classList.toggle('active-view', mode === 'board');
    loadTasks();
}

function loadTasks() {
    const tasksTable = document.getElementById('tasksTable');
    if (!tasksTable) return;

    const filtered = getFilteredTasks();

    if (taskViewMode === 'board') {
        renderKanban(filtered);
    } else {
        renderTaskTable(filtered);
    }
}

function renderKanban(tasks) {
    const container = document.getElementById('tasksTable');

    const statuses = demoData.statusOptions || [];

    container.innerHTML = `
        <div style="display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; align-items: flex-start;">
            ${statuses.map(status => {
        const columnTasks = tasks.filter(t => {
            const tId = (t.statusId || '').toString().trim();
            const sId = (status.id || '').toString().trim();
            return tId === sId || t.status === status.name;
        });
        return `
                    <div class="kanban-column" style="flex: 1; min-width: 300px; background: var(--kanban-col); border-radius: 8px; padding: 12px; min-height: 500px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${status.color};"></span>
                                ${status.name} (${columnTasks.length})
                            </h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${columnTasks.map(task => `
                                <div class="card" onclick="openEditTaskModal('${task.id}')" style="cursor: pointer; padding: 12px; border-left: 4px solid ${status.color};">
                                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${task.description}</div>
                                    <div style="font-size: 11px; color: var(--gray-500); margin-bottom: 8px;">${task.projectName}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="font-size: 11px; font-weight: 500; color: var(--primary);">${task.assignedTo}</div>
                                        <div style="font-size: 10px; color: ${isOverdue(task.deadline) ? 'var(--danger)' : 'var(--gray-400)'};">
                                            ${formatDate(task.deadline)}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function renderTaskTable(filtered) {
    const tasksTable = document.getElementById('tasksTable');
    tasksTable.innerHTML = `
        <div class="card">
            <div class="card-body" style="padding: 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--gray-200);">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--gray-700);">
                                <input type="checkbox">
                            </th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--gray-700);">Task</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--gray-700);">Type</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--gray-700);">Person</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--gray-700);">Deadline</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--gray-700);">Status</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--gray-700);">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.length === 0 ? '<tr><td colspan="7" style="padding: 24px; text-align: center; color: var(--gray-500);">No tasks found matching criteria.</td></tr>' : ''}
                        ${filtered.map(task => {
        const overdue = isOverdue(task.deadline);
        const dueSoon = isDueSoon(task.deadline);
        const rowStyle = overdue ? 'background: rgba(239, 68, 68, 0.05);' :
            dueSoon ? 'background: rgba(245, 158, 11, 0.05);' : '';
        const isTimerRunning = timerState.taskId === task.id;

        return `
                                    <tr style="border-bottom: 1px solid var(--gray-100); ${rowStyle} cursor: pointer;" onclick="openEditTaskModal('${task.id}')">
                                        <td style="padding: 12px;" onclick="event.stopPropagation()"><input type="checkbox"></td>
                                        <td style="padding: 12px;">
                                            <div style="font-weight: 600;">${task.description}</div>
                                            <div style="font-size: 12px; color: var(--gray-600); display: flex; align-items: center; gap: 8px;">
                                                <span>${task.parentType === 'subproject' ? 'SubProject: ' : ''}${task.projectName}</span>
                                                ${calculateProjectNotesCount(task.id) > 0 ? `<span class="badge" style="font-size: 10px; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); color: var(--success); cursor: pointer;" onclick="event.stopPropagation(); openNotesModal('${task.id}', 'task')">📝 ${calculateProjectNotesCount(task.id)} Note${calculateProjectNotesCount(task.id) > 1 ? 's' : ''}</span>` : ''}
                                            </div>
                                        </td>
                                        <td style="padding: 12px; color: var(--gray-700);">${task.actionType}</td>
                                        <td style="padding: 12px; color: var(--gray-700);">${task.assignedTo}</td>
                                        <td style="padding: 12px;">
                                            <span style="color: ${overdue ? 'var(--danger)' : dueSoon ? 'var(--warning)' : 'var(--gray-700)'};">
                                                ${formatDate(task.deadline)}
                                            </span>
                                        </td>
                                        <td style="padding: 12px;">
                                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; 
                                                         background: ${demoData.statusOptions.find(s => s.name === task.status)?.color || 'var(--gray-300)'};
                                                         color: ${task.status === 'Completed' ? 'white' : 'var(--gray-700)'};">
                                                ${task.status}
                                            </span>
                                        </td>
                                        <td style="padding: 12px;" onclick="event.stopPropagation()">
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <div style="display: flex; align-items: center; gap: 4px;">
                                                    ${isTimerRunning ?
                `<button onclick="stopTaskTimer()" class="btn btn-warning" style="padding: 4px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px;">🛑 Stop</button>` :
                `<button onclick="startTaskTimer('${task.id}')" class="btn btn-outline-primary" style="padding: 4px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px;">▶️ Start</button>`
            }
                                                    <button onclick="openLogTimeModal('${task.id}')" class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;">➕ Log</button>
                                                </div>
                                                ${(() => {
                const billableHours = (demoData.timeLogs || [])
                    .filter(l => l.taskId === task.id && l.isBillable)
                    .reduce((sum, l) => sum + l.duration, 0);
                return billableHours > 0 ? `<div style="font-size: 10px; font-weight: 700; color: var(--success); background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); padding: 2px 6px; border-radius: 4px;">${billableHours.toFixed(1)}h billable</div>` : '';
            })()}
                                            </div>
                                        </td>
                                    </tr>
                                `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ===== TIMESHEETS & TIMER =====
function loadTimesheets() {
    const container = document.getElementById('timesheetsContainer');
    if (!container) return;

    const personFilter = document.getElementById('timesheetPersonFilter')?.value;
    const dateFilter = document.getElementById('timesheetDateFilter')?.value;

    let logs = [...(demoData.timeLogs || [])];

    if (personFilter) logs = logs.filter(l => l.personId === personFilter);
    if (dateFilter) logs = logs.filter(l => l.date === dateFilter);

    // Sort by date (desc)
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate Stats
    const total = logs.reduce((sum, l) => sum + l.duration, 0);
    const billable = logs.filter(l => l.isBillable).reduce((sum, l) => sum + l.duration, 0);
    const nonBillable = total - billable;

    document.getElementById('totalLoggedHours').textContent = `${total.toFixed(1)}h`;
    document.getElementById('totalBillableHours').textContent = `${billable.toFixed(1)}h`;
    document.getElementById('totalNonBillableHours').textContent = `${nonBillable.toFixed(1)}h`;

    if (logs.length === 0) {
        container.innerHTML = '<p style="padding: 40px; text-align: center; color: var(--gray-500);">No time logs found for the selected criteria.</p>';
        return;
    }

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Task</th>
                    <th>Person</th>
                    <th>Description</th>
                    <th>Duration</th>
                    <th>Billable</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map(log => {
        const task = demoData.tasks.find(t => t.id === log.taskId);
        const person = demoData.people.find(p => p.id === log.personId);
        return `
                        <tr>
                            <td style="font-weight: 600;">${log.date}</td>
                            <td>
                                <div style="font-weight: 500;">${task ? task.description : 'Deleted Task'}</div>
                                <div style="font-size: 10px; color: var(--gray-500);">${task ? task.projectName : ''}</div>
                            </td>
                            <td>${person ? person.name : 'Unknown'}</td>
                            <td style="max-width: 300px; white-space: normal; line-height: 1.4; font-size: 13px;">${log.description}</td>
                            <td style="font-weight: 700; color: var(--primary);">${log.duration}h</td>
                            <td>${log.isBillable ? '✅' : '❌'}</td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

function openLogTimeModal(taskId = null) {
    const modal = document.getElementById('logTimeModal');
    const taskSelect = document.getElementById('logTask');
    const dateInput = document.getElementById('logDate');

    // Populate task dropdown
    taskSelect.innerHTML = '<option value="">Choose a task...</option>' +
        demoData.tasks.filter(t => !t.isArchived)
            .map(t => `<option value="${t.id}" ${t.id === taskId ? 'selected' : ''}>${t.description} (${t.projectName})</option>`)
            .join('');

    const personSelect = document.getElementById('logPerson');
    if (personSelect) {
        personSelect.innerHTML = '<option value="">Select person...</option>' +
            demoData.people.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    dateInput.value = new Date().toISOString().split('T')[0];

    // Update daily context
    const today = new Date().toISOString().split('T')[0];
    const loggedToday = (demoData.timeLogs || [])
        .filter(l => l.date === today)
        .reduce((sum, l) => sum + l.duration, 0);
    document.getElementById('dailyTimeContext').textContent = `Total Today: ${loggedToday.toFixed(1)}h`;

    modal.classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function startTaskTimer(taskId) {
    if (timerState.interval) {
        if (timerState.taskId === taskId) return alert('Timer is already running for this task.');
        if (!confirm('A timer is already running for another task. Stop it and start this one?')) return;
        stopTaskTimer();
    }

    const task = demoData.tasks.find(t => t.id === taskId);
    if (!task) return;

    timerState.taskId = taskId;
    timerState.startTime = new Date();
    timerState.accumulatedTime = 0;

    // Show a global floating timer widget if we had one, for now use a specific task UI update
    timerState.interval = setInterval(updateTimerUI, 1000);
    alert(`Timer started for: ${task.description}`);

    // Refresh UI to show running state
    if (document.getElementById('tasksView').classList.contains('active')) loadTasks();
}

function stopTaskTimer() {
    if (!timerState.interval) return;

    const durationMs = new Date() - timerState.startTime;
    const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(2);

    clearInterval(timerState.interval);

    const taskId = timerState.taskId;
    timerState = { taskId: null, startTime: null, interval: null, accumulatedTime: 0 };

    if (confirm(`Timer stopped. Log ${durationHours}h to this task?`)) {
        openLogTimeModal(taskId);
        document.getElementById('logHours').value = durationHours;
    }

    if (document.getElementById('tasksView').classList.contains('active')) loadTasks();
}

function updateTimerUI() {
    if (!timerState.interval) return;
    const durationMs = new Date() - timerState.startTime;
    const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(2);
    const contextEl = document.getElementById('dailyTimeContext');
    if (contextEl) {
        contextEl.textContent = `Running: ${durationHours}h`;
        contextEl.style.color = 'var(--primary)';
        contextEl.style.fontWeight = 'bold';
    }
}

async function saveTimeLog(e) {
    if (e) e.preventDefault();

    const taskId = document.getElementById('logTask').value;
    const personId = document.getElementById('logPerson').value;
    const date = document.getElementById('logDate').value;
    const hours = parseFloat(document.getElementById('logHours').value);
    const desc = document.getElementById('logNotes').value;
    const billable = document.getElementById('logBillable').checked;

    if (!taskId || !personId || !hours) return alert('Please fill in task, person and hours.');

    const logId = getNextId('TL', demoData.timeLogs || []);
    const newLog = {
        id: logId,
        taskId,
        personId,
        date,
        duration: hours,
        description: desc,
        isBillable: billable
    };

    // Add to demoData
    if (!demoData.timeLogs) demoData.timeLogs = [];
    demoData.timeLogs.push(newLog);

    // Also update Google Sheets if needed (omitted for now as we use demoData)
    // sheetIntegration.addRow('TimeLogs', [logId, taskId, personId, date, '', '', hours, desc, billable ? 'TRUE' : 'FALSE']);

    closeAllModals();

    // Refresh views
    if (document.getElementById('timesheetsView').classList.contains('active')) loadTimesheets();
    if (document.getElementById('tasksView').classList.contains('active')) loadTasks();
    if (document.getElementById('dashboardView').classList.contains('active')) loadDashboard();

    alert('Time logged successfully!');
}

// Initialization for timesheets
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logTimeForm')?.addEventListener('submit', saveTimeLog);
});

function loadGantt() {
    const container = document.getElementById('ganttChartContainer');
    if (!container) return;

    const projectIdFilter = document.getElementById('ganttProjectFilter')?.value;
    let allTasks = (demoData.tasks || []).filter(t => !t.isArchived && t.startDate && t.deadline);

    if (projectIdFilter) {
        allTasks = allTasks.filter(t => t.projectId === projectIdFilter);
    }

    if (allTasks.length === 0) {
        container.innerHTML = '<p style="padding: 40px; text-align: center; color: var(--gray-500);">No tasks with start and end dates found to display in timeline.</p>';
        return;
    }

    // Group tasks by project
    const projectGroups = {};
    allTasks.forEach(task => {
        if (!projectGroups[task.projectId]) {
            const project = demoData.projects.find(p => p.id === task.projectId);
            const pType = demoData.projectTypes.find(pt => pt.id === project?.typeId);
            const stats = calculateProjectStats(task.projectId);
            projectGroups[task.projectId] = {
                id: task.projectId,
                name: project ? project.name : 'Unknown Project',
                color: pType ? pType.color : '#3B82F6',
                progress: stats.progress,
                tasks: []
            };
        }
        projectGroups[task.projectId].tasks.push(task);
    });

    // Determine global date range
    const allDates = allTasks.flatMap(t => [new Date(t.startDate), new Date(t.deadline)]);
    let minDate = new Date(Math.min(...allDates));
    let maxDate = new Date(Math.max(...allDates));

    // Buffer: 7 days before, 21 days after
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 21);

    // Generate days
    const days = [];
    let curr = new Date(minDate);
    while (curr <= maxDate) {
        days.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
    }

    const dayWidth = 40;
    const sideWidth = 350;
    const totalWidth = days.length * dayWidth;

    let html = `<div class="gantt-wrapper" style="width: ${sideWidth + totalWidth}px;">`;


    // Header
    html += `
    <div class="gantt-header">
            <div class="gantt-header-side">STRUCTURE / TIMELINE</div>
            <div class="gantt-header-timeline" style="width: ${totalWidth}px;">
                ${days.map(d => {
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const isFirstOfMonth = d.getDate() === 1;
        return `
                        <div class="gantt-day-cell ${isWeekend ? 'weekend' : ''}">
                            <div style="font-weight: 800;">${d.getDate()}</div>
                            <div style="font-size: 9px; opacity: 0.8;">${d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            ${isFirstOfMonth ? `<div style="font-size: 8px; font-weight: 800; margin-top: 2px; color: var(--primary);">${d.toLocaleDateString('en-US', { month: 'short' })}</div>` : ''}
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;

    // Render Groups
    Object.keys(projectGroups).forEach(pid => {
        const group = projectGroups[pid];
        group.tasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        // Calculate Project Summary boundaries
        const pDates = group.tasks.flatMap(t => [new Date(t.startDate), new Date(t.deadline)]);
        const pStart = new Date(Math.min(...pDates));
        const pEnd = new Date(Math.max(...pDates));

        const pDiffStart = Math.max(0, Math.floor((pStart - minDate) / (1000 * 60 * 60 * 24)));
        const pDuration = Math.ceil((pEnd - pStart) / (1000 * 60 * 60 * 24)) + 1;
        const pLeft = pDiffStart * dayWidth;
        const pWidth = pDuration * dayWidth;

        // Project Header Row
        html += `
    <div class="gantt-row gantt-project-row">
                <div class="gantt-row-side" style="border-left: 6px solid ${group.color};">
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <div>
                            <span style="font-size: 14px; font-weight: 800;">${group.name}</span>
                        </div>
                        <span class="badge" style="background: ${group.color}; color: white; font-size: 10px;">${group.progress}%</span>
                    </div>
                </div>
                <div class="gantt-row-timeline" style="width: ${totalWidth}px;">
                    ${days.map(d => {
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            return `<div class="gantt-grid-cell ${isWeekend ? 'weekend' : ''}"></div>`;
        }).join('')}
                    <div class="gantt-summary-bar" style="left: ${pLeft}px; width: ${pWidth}px; --summary-color: ${group.color};"></div>
                </div>
            </div>
    `;

        // Task Rows
        group.tasks.forEach(task => {
            const start = new Date(task.startDate);
            const end = new Date(task.deadline);
            const diffStart = Math.max(0, Math.floor((start - minDate) / (1000 * 60 * 60 * 24)));
            const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

            const left = diffStart * dayWidth;
            const width = duration * dayWidth;

            const status = demoData.statusOptions.find(s => s.id === task.statusId || s.name === task.status);
            const color = status?.color || 'var(--primary)';

            let progress = 0;
            if (task.status === 'Completed' || task.status === 'Accepted') progress = 100;
            else if (task.status === 'In Progress') progress = 50;
            else if (task.status === 'In Review') progress = 85;
            else if (task.status === 'Blocked') progress = 10;
            else if (task.status === 'Started') progress = 20;

            const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            html += `
    <div class="gantt-row">
                    <div class="gantt-row-side" onclick="openEditTaskModal('${task.id}')" style="cursor: pointer; padding-left: 44px; border-left: 6px solid ${group.color}44;">
                        <div class="gantt-item-title" style="font-weight: 700; color: var(--text-main);">${task.description}</div>
                        <div style="font-size: 10px; color: var(--gray-500);">${task.assignedTo || 'Unassigned'} • ${task.actionType}</div>
                    </div>
                    <div class="gantt-row-timeline" style="width: ${totalWidth}px;">
                        ${days.map(d => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return `<div class="gantt-grid-cell ${isWeekend ? 'weekend' : ''}"></div>`;
            }).join('')}
                        
                        <div class="gantt-bar-container" style="left: ${left}px; width: ${width}px;" onclick="openEditTaskModal('${task.id}')">
                            <div class="gantt-bar-info">
                                <span style="color: ${color}; font-weight: 800;">${startStr} - ${endStr}</span>
                                <span style="color: var(--text-muted);">|</span>
                                <span style="color: var(--text-main); font-weight: 500;">${task.assignedTo || ''}</span>
                            </div>
                            <div class="gantt-bar" style="background: ${color};">
                                <div class="gantt-bar-progress" style="width: ${progress}%;"></div>
                            </div>
                        </div>
                    </div>
                </div >
    `;
        });
    });

    // Today indicator
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msInDay = 1000 * 60 * 60 * 24;
    const diffToday = (today - minDate) / msInDay;

    if (diffToday >= 0 && diffToday < days.length) {
        const todayLeft = sideWidth + (diffToday * dayWidth) + (dayWidth / 2);
        html += `
    <div class="gantt-today-line" style="left: ${todayLeft}px;">
        <div class="gantt-today-badge">TODAY</div>
            </div>
    `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function scrollGantt(direction) {
    const container = document.getElementById('ganttChartContainer');
    if (!container) return;

    const scrollAmount = 400; // Scroll by 400px at a time
    const currentScroll = container.scrollLeft;

    if (direction === 'left') {
        container.scrollTo({
            left: currentScroll - scrollAmount,
            behavior: 'smooth'
        });
    } else if (direction === 'right') {
        container.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    }
}


function loadArchive() {
    const archiveList = document.getElementById('archiveList');
    if (!archiveList) return;

    // Create sections for Projects and Tasks
    archiveList.innerHTML = `
    <div style="margin-bottom: 32px;">
            <h3 style="margin-bottom: 16px; color: var(--gray-700); border-bottom: 2px solid var(--gray-200); padding-bottom: 8px;">📁 Archived Projects</h3>
            <div id="archivedProjectsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;"></div>
        </div>
    <div>
        <h3 style="margin-bottom: 16px; color: var(--gray-700); border-bottom: 2px solid var(--gray-200); padding-bottom: 8px;">✓ Archived Tasks</h3>
        <div id="archivedTasksList" class="tasks-table"></div>
    </div>
`;

    const projectsGrid = document.getElementById('archivedProjectsGrid');
    const tasksList = document.getElementById('archivedTasksList');

    const archivedProjects = demoData.projects.filter(p => p.status === 'archived' || p.status === 'completed');
    const archivedTasks = demoData.tasks.filter(t => t.isArchived);

    if (archivedProjects.length > 0) {
        projectsGrid.innerHTML = archivedProjects.map(project => {
            const stats = calculateProjectStats(project.id);
            return `
    < div class="card" >
        <div class="card-body">
            <h3 style="margin-bottom: 8px;">${project.name}</h3>
            <p style="color: var(--gray-600); font-size: 14px; margin-bottom: 16px;">
                Archived: ${project.archivedDate ? formatDate(project.archivedDate) : 'Recently'}
            </p>
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-secondary" style="width: 100%;" onclick="openEditProjectModal('${project.id}')">View Details</button>
            </div>
        </div>
                </div >
    `;
        }).join('');
    } else {
        projectsGrid.innerHTML = '<p style="color: var(--gray-500); padding: 20px; text-align: center; grid-column: 1/-1;">No archived projects.</p>';
    }

    if (archivedTasks.length > 0) {
        tasksList.innerHTML = `
    < div class="card" >
        <div class="card-body" style="padding: 0;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--gray-200);">
                        <th style="padding: 12px; text-align: left;">Task</th>
                        <th style="padding: 12px; text-align: left;">Project</th>
                        <th style="padding: 12px; text-align: left;">Person</th>
                        <th style="padding: 12px; text-align: center;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${archivedTasks.map(task => `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    <td style="padding: 12px; font-weight: 500;">${task.description}</td>
                                    <td style="padding: 12px; color: var(--gray-600); font-size: 12px;">${task.projectName}</td>
                                    <td style="padding: 12px; color: var(--gray-600);">${task.assignedTo}</td>
                                    <td style="padding: 12px; text-align: center;">
                                        <button class="btn btn-secondary" style="padding: 4px 12px; font-size: 11px;" onclick="openEditTaskModal('${task.id}')">View</button>
                                    </td>
                                </tr>
                            `).join('')}
                </tbody>
            </table>
        </div>
            </div>
    `;
    } else {
        tasksList.innerHTML = '<p style="color: var(--gray-500); padding: 20px; text-align: center;">No archived tasks.</p>';
    }
}

function loadSettings() {
    const settingsContent = document.getElementById('settingsContent');
    if (!settingsContent) return;

    const activeTab = document.querySelector('.settings-tabs .tab-btn.active')?.dataset.tab || 'action-types';

    // Auto-calculate next order
    const getNextOrder = (list) => {
        if (!list || list.length === 0) return 1;
        const max = Math.max(...list.map(item => parseInt(item.order) || 0));
        return max + 1;
    };

    let html = '';
    if (activeTab === 'action-types') {
        const nextOrder = getNextOrder(demoData.actionTypes);
        html = `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header"><h3>Add New Action Type</h3></div>
                <div class="card-body">
                    <form id="addTypeForm" style="display: flex; gap: 12px; align-items: center;">
                        <input type="text" id="newTypeName" placeholder="e.g. Client Meeting" required class="filter-select" style="flex: 1; margin: 0;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <input type="number" id="newTypeOrder" value="${nextOrder}" required class="filter-select" style="width: 80px; margin: 0;">
                            <small style="font-size: 10px; color: var(--text-muted); text-align: center;">Order (Last: ${nextOrder - 1})</small>
                        </div>
                        <input type="color" id="newTypeColor" value="#3B82F6" style="height: 38px; width: 60px; border: 1px solid var(--border-color); border-radius: 4px; padding: 2px;">
                        <button type="submit" class="btn btn-primary">Add Action Type</button>
                    </form>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3>Existing Action Types</h3></div>
                <div class="card-body" style="padding: 0;">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th style="width: 120px; text-align: center;">Order</th>
                                <th style="width: 100px; text-align: center;">Color</th>
                                <th style="width: 120px; text-align: center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>${demoData.actionTypes.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name)).map(at => `
                            <tr>
                                <td><input type="text" value="${at.name}" class="filter-select" style="width: 100%; border:none; background:transparent; font-weight:500;" id="name_${at.id}"></td>
                                <td style="text-align: center;">
                                    <input type="number" value="${at.order || 0}" class="filter-select" style="width: 60px; padding: 2px 4px; border-radius: 4px;" id="order_${at.id}">
                                </td>
                                <td style="text-align: center;">
                                    <input type="color" value="${at.color}" style="height:24px; width:40px; border:none; padding:0; background:transparent; cursor:pointer;" id="color_${at.id}">
                                </td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 4px; justify-content: center;">
                                        <button class="btn btn-success" style="padding: 2px 8px; font-size: 11px; height: 24px;" onclick="updateItemRow('action-types', '${at.id}')">Save</button>
                                        <button class="btn btn-danger" style="padding: 2px 8px; font-size: 11px; height: 24px;" onclick="deleteItemPermanently('action-types', '${at.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    } else if (activeTab === 'people') {
        html = `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header"><h3>Add New Team Member</h3></div>
                <div class="card-body">
                    <form id="addPersonForm" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                        <input type="text" id="newName" placeholder="Full Name" required class="filter-select" style="flex: 1; min-width: 150px; margin: 0;">
                        <input type="email" id="newEmail" placeholder="Email Address" required class="filter-select" style="flex: 1; min-width: 150px; margin: 0;">
                        <input type="text" id="newRole" placeholder="Role (e.g. Designer)" class="filter-select" style="flex: 1; min-width: 150px; margin: 0;">
                        <button type="submit" class="btn btn-primary">Add Member</button>
                    </form>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3>Current Team</h3></div>
                <div class="card-body" style="padding: 0;">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th style="width: 100px; text-align: center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>${demoData.people.sort((a, b) => a.name.localeCompare(b.name)).map(p => `
                            <tr>
                                <td><input type="text" value="${p.name}" class="filter-select" style="width: 100%; border:none; background:transparent; font-weight:500;" id="name_${p.id}"></td>
                                <td><input type="text" value="${p.role}" class="filter-select" style="width: 100%; border:none; background:transparent;" id="role_${p.id}"></td>
                                <td><input type="email" value="${p.email}" class="filter-select" style="width: 100%; border:none; background:transparent;" id="email_${p.id}"></td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 4px; justify-content: center;">
                                        <button class="btn btn-success" style="padding: 2px 8px; font-size: 11px; height: 24px;" onclick="updateItemRow('people', '${p.id}')">Save</button>
                                        <button class="btn btn-danger" style="padding: 2px 8px; font-size: 11px; height: 24px;" onclick="deleteItemPermanently('people', '${p.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    } else if (activeTab === 'status-options') {
        const nextOrder = getNextOrder(demoData.statusOptions);
        html = `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header"><h3>Add New Status Option</h3></div>
                <div class="card-body">
                    <form id="addStatusForm" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                        <input type="text" id="newStatusName" placeholder="Status Name" required class="filter-select" style="flex: 1; margin: 0;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <input type="number" id="newStatusOrder" value="${nextOrder}" required class="filter-select" style="width: 80px; margin: 0;">
                            <small style="font-size: 10px; color: var(--text-muted); text-align: center;">Order (Last: ${nextOrder - 1})</small>
                        </div>
                        <input type="color" id="newStatusColor" value="#94A3B8" style="height: 38px; width: 60px; border: 1px solid var(--border-color); border-radius: 4px; padding: 2px;">
                        <label class="checkbox-label" style="margin-bottom: 0;">
                            <input type="checkbox" id="newStatusComplete"> Complete
                        </label>
                        <button type="submit" class="btn btn-primary">Add Status</button>
                    </form>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3>Current Statuses</h3></div>
                <div class="card-body" style="padding: 0;">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th style="width: 120px; text-align: center;">Order</th>
                                <th style="width: 100px; text-align: center;">Color</th>
                                <th style="width: 120px; text-align: center;">Marks Done</th>
                                <th style="width: 120px; text-align: center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>${demoData.statusOptions.sort((a, b) => (a.order || 0) - (b.order || 0)).map(st => `
                            <tr>
                                <td><input type="text" value="${st.name}" class="filter-select" style="width: 100%; border:none; background:transparent; font-weight:500;" id="name_${st.id}"></td>
                                <td style="text-align: center;">
                                    <input type="number" value="${st.order || 0}" class="filter-select" style="width: 60px; padding: 2px 4px; border-radius: 4px;" id="order_${st.id}">
                                </td>
                                <td style="text-align: center;">
                                    <input type="color" value="${st.color}" style="height:24px; width:40px; border:none; padding:0; background:transparent; cursor:pointer;" id="color_${st.id}">
                                </td>
                                <td style="text-align: center;">
                                    <input type="checkbox" id="complete_${st.id}" ${st.isComplete ? 'checked' : ''}>
                                </td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 4px; justify-content: center;">
                                        <button class="btn btn-success" style="padding: 2px 8px; font-size: 11px; height: 24px;" onclick="updateItemRow('status-options', '${st.id}')">Save</button>
                                        <button class="btn btn-danger" style="padding: 2px 8px; font-size: 11px; height: 24px;" onclick="deleteItemPermanently('status-options', '${st.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    } else if (activeTab === 'project-types') {
        const nextOrder = getNextOrder(demoData.projectTypes);
        html = `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header"><h3>Add New Project Type</h3></div>
                <div class="card-body">
                    <form id="addProjTypeForm" style="display: flex; gap: 12px; align-items: center;">
                        <input type="text" id="newProjTypeName" placeholder="Marketing, Dev, etc." required class="filter-select" style="flex: 1; margin: 0;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <input type="number" id="newProjTypeOrder" value="${nextOrder}" required class="filter-select" style="width: 80px; margin: 0;">
                            <small style="font-size: 10px; color: var(--text-muted); text-align: center;">Order (Last: ${nextOrder - 1})</small>
                        </div>
                        <input type="color" id="newProjTypeColor" value="#3B82F6" style="height: 38px; width: 60px; border: 1px solid var(--border-color); border-radius: 4px; padding: 2px;">
                        <button type="submit" class="btn btn-primary">Add Project Type</button>
                    </form>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3>Existing Project Types</h3></div>
                <div class="card-body" style="padding: 0;">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th style="width: 120px; text-align: center;">Order</th>
                                <th style="width: 100px; text-align: center;">Color</th>
                                <th style="width: 120px; text-align: center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>${demoData.projectTypes.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name)).map(pt => `
                            <tr>
                                <td><input type="text" value="${pt.name}" class="filter-select" style="width: 100%; border:none; background:transparent; font-weight:500;" id="name_${pt.id}"></td>
                                <td style="text-align: center;">
                                    <input type="number" value="${pt.order || 0}" class="filter-select" style="width: 60px; padding: 2px 4px; border-radius: 4px;" id="order_${pt.id}">
                                </td>
                                <td style="text-align: center;">
                                    <input type="color" value="${pt.color}" style="height:24px; width:40px; border:none; padding:0; background:transparent; cursor:pointer;" id="color_${pt.id}">
                                </td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 4px; justify-content: center;">
                                        <button class="btn btn-success" style="padding: 2px 8px; font-size: 11px; height: 24px;" onclick="updateItemRow('project-types', '${pt.id}')">Save</button>
                                        <button class="btn btn-danger" style="padding: 2px 8px; font-size: 11px; height: 24px;" onclick="deleteItemPermanently('project-types', '${pt.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }
    settingsContent.innerHTML = html;

    // Attach Settings Listeners
    document.getElementById('addTypeForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = getNextId('AT', demoData.actionTypes);
        const rowData = [
            id,
            document.getElementById('newTypeName').value,
            document.getElementById('newTypeOrder').value,
            document.getElementById('newTypeColor').value,
            'TRUE'
        ];
        const success = await saveToSheets(CONFIG.SHEETS.ACTION_TYPES, rowData);
        if (success) { loadDataFromSheets(); }
    });

    document.getElementById('addPersonForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = getNextId('PER', demoData.people);
        const rowData = [id, document.getElementById('newName').value, document.getElementById('newEmail').value, document.getElementById('newRole').value, '75', 'TRUE'];
        const success = await saveToSheets(CONFIG.SHEETS.PEOPLE, rowData);
        if (success) { loadDataFromSheets(); }
    });

    document.getElementById('addStatusForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = getNextId('ST', demoData.statusOptions);
        const rowData = [
            id,
            document.getElementById('newStatusName').value,
            document.getElementById('newStatusOrder').value,
            document.getElementById('newStatusColor').value,
            document.getElementById('newStatusComplete').checked ? 'TRUE' : 'FALSE',
            'TRUE'
        ];
        const success = await saveToSheets(CONFIG.SHEETS.STATUS_OPTIONS, rowData);
        if (success) { loadDataFromSheets(); }
    });

    document.getElementById('addProjTypeForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = getNextId('PT', demoData.projectTypes);
        const rowData = [
            id,
            document.getElementById('newProjTypeName').value,
            document.getElementById('newProjTypeOrder').value,
            document.getElementById('newProjTypeColor').value,
            'TRUE'
        ];
        const success = await saveToSheets(CONFIG.SHEETS.PROJECT_TYPES || 'ProjectTypes', rowData);
        if (success) { loadDataFromSheets(); }
    });
}

// Settings tabs
document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.settings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadSettings();
    });
});

// ===== NEW PROJECT BUTTONS =====
[document.getElementById('newProjectBtn'), document.getElementById('newProjectBtn2')].forEach(btn => {
    if (btn) {
        btn.addEventListener('click', () => {
            openModal();
            // Switch to project tab
            document.querySelectorAll('.modal-content .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.modal-content .tab-btn[data-tab="project"]').classList.add('active');
            modalTabContents.forEach(content => content.classList.remove('active'));
            document.getElementById('projectTab').classList.add('active');
        });
    }
});

// ===== DASHBOARD STATS INTERACTION =====
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
        const label = card.querySelector('.stat-label').textContent.toLowerCase();

        if (label.includes('active projects')) {
            switchView('projects');
        } else if (label.includes('overdue')) {
            switchView('tasks', { status: 'overdue' });
        } else if (label.includes('due this week')) {
            switchView('tasks', { status: 'due-soon' });
        } else if (label.includes('archived')) {
            switchView('archive');
        }
    });
});

function switchView(viewName, filters = null) {
    const link = document.querySelector(`.nav-link[data-view="${viewName}"]`);
    if (link) {
        link.click();
        if (filters && viewName === 'tasks') {
            applyTargetFilters(filters);
        }
    }
}

function applyTargetFilters(filters) {
    // This will be handled in loadTasks if we set some global filter state
    window.currentFilters = filters;

    // Update UI selects if they exist
    if (filters.status === 'overdue' || filters.status === 'due-soon') {
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) statusFilter.value = ''; // Reset status filter to show all but we'll filter logic-wise
    }

    loadTasks();
}

// ===== TASK FILTERING LOGIC =====
function getFilteredTasks() {
    let filtered = demoData.tasks ? demoData.tasks.filter(t => !t.isArchived) : [];

    const statusVal = document.getElementById('statusFilter')?.value;
    const personVal = document.getElementById('personFilter')?.value;
    const typeVal = document.getElementById('typeFilter')?.value;
    const searchVal = document.getElementById('searchInput')?.value.toLowerCase();

    // Global filters from dashboard
    if (window.currentFilters) {
        if (window.currentFilters.status === 'overdue') {
            filtered = filtered.filter(t => isOverdue(t.deadline));
        } else if (window.currentFilters.status === 'due-soon') {
            filtered = filtered.filter(t => isDueSoon(t.deadline));
        }
        // Clear global filters after use
        window.currentFilters = null;
    }

    if (statusVal) {
        filtered = filtered.filter(t => t.status && t.status.toLowerCase() === statusVal.toLowerCase());
    }
    if (personVal) {
        filtered = filtered.filter(t => t.assignedTo && t.assignedTo.toLowerCase() === personVal.toLowerCase());
    }
    if (typeVal) {
        filtered = filtered.filter(t => t.actionType && t.actionType.toLowerCase() === typeVal.toLowerCase());
    }
    if (searchVal) {
        filtered = filtered.filter(t =>
            (t.description && t.description.toLowerCase().includes(searchVal)) ||
            (t.projectName && t.projectName.toLowerCase().includes(searchVal))
        );
    }

    return filtered;
}

async function updateSheetRow(sheetName, id, rowData, idColumn = 'A') {
    if (!gapi.client.getToken()) return false;

    try {
        console.log(`Updating ${sheetName} row for ID ${id}...`);
        // 1. Find the row index
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID,
            range: `'${sheetName}'!${idColumn}:${idColumn}`
        });

        const rows = response.result.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id) + 1;

        if (rowIndex === 0) {
            console.error('ID not found for update:', id);
            return false;
        }

        // 2. Update the row
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID,
            range: `'${sheetName}'!A${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [rowData]
            }
        });

        console.log('Update successful!');
        return true;
    } catch (e) {
        console.error('Error updating sheets:', e);
        return false;
    }
}

// ===== EDIT MODAL LOGIC =====

function openEditTaskModal(taskId) {
    const task = demoData.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('Task not found:', taskId);
        return;
    }

    // Reset forms
    document.getElementById('subTaskAddForm').style.display = 'none';
    document.getElementById('taskAttachmentForm').style.display = 'none';

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    setVal('editTaskId', task.id);
    setVal('editTaskDescription', task.description);
    setVal('editTaskInstructions', task.instructions);
    setVal('editTaskDeadline', task.deadline);
    setVal('editTaskStartDate', task.startDate);
    setVal('editTaskTimeStarted', task.timeStarted);
    setVal('editTaskTimeEnded', task.timeEnded);

    // Locked Fields
    const pSelect = document.getElementById('editTaskProject');
    pSelect.innerHTML = `<option value="${task.projectId || ''}" selected>${task.projectName || 'Default'}</option>`;

    const tySelect = document.getElementById('editTaskType');
    tySelect.innerHTML = `<option value="${task.actionTypeId || ''}" selected>${task.actionType || 'Default'}</option>`;

    // Editable Selects
    const perSelect = document.getElementById('editTaskAssignee');
    perSelect.innerHTML = demoData.people.map(p =>
        `<option value="${p.id}" ${p.id === task.assignedPersonId ? 'selected' : ''}>${p.name}</option>`).join('');

    const sSelect = document.getElementById('editTaskStatus');
    sSelect.innerHTML = demoData.statusOptions.map(s =>
        `<option value="${s.id}" ${s.id === task.statusId ? 'selected' : ''}>${s.name}</option>`).join('');

    // Dynamic Time Visibility
    handleStatusChange(task.statusId);

    // Show/hide archive button
    const archiveBtn = document.getElementById('archiveTaskBtn');
    if (archiveBtn) {
        archiveBtn.style.display = task.status === 'Completed' && !task.isArchived ? 'inline-block' : 'none';
    }

    // Set deadline history button color if exists
    const deadlineHistoryIcon = document.getElementById('deadlineHistoryIcon');
    const notesBtn = document.getElementById('taskNotesButton'); // Moved definition here
    const taskNotes = demoData.notes ? demoData.notes.filter(n => n.relatedId === taskId) : [];
    if (notesBtn) {
        notesBtn.textContent = `📋 ${taskNotes.length} Notes`;
        if (taskNotes.length > 0) {
            notesBtn.classList.remove('btn-secondary');
            notesBtn.classList.add('btn-success');
            notesBtn.style.backgroundColor = '#10B981';
            notesBtn.style.color = 'white';
        } else {
            notesBtn.classList.add('btn-secondary');
            notesBtn.classList.remove('btn-success');
            notesBtn.style.backgroundColor = '';
        }
    }

    // History Indicators
    renderHistoryIcons(taskId);

    // Subtasks List
    renderSubTasks(taskId);

    // Attachments List
    renderAttachments(taskId);

    document.getElementById('editTaskModal').classList.add('active');
    overlay.classList.add('active');
}

function handleStatusChange(statusId) {
    const timeRow = document.getElementById('editTaskTimeRow');
    const startedInput = document.getElementById('editTaskTimeStarted');
    const status = demoData.statusOptions.find(s => s.id === statusId);

    // STARTED or In Progress logic
    const isStarted = status?.name?.toUpperCase() === 'STARTED';
    const isInProgress = status?.name?.toUpperCase() === 'IN PROGRESS';

    if (isStarted || isInProgress) {
        timeRow.style.display = 'grid';
        if (isStarted && !startedInput.value) {
            startedInput.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        }
        startedInput.required = true;
    } else {
        timeRow.style.display = 'none';
        startedInput.required = false;
    }
}

function renderHistoryIcons(taskId) {
    const history = demoData.changeLog ? demoData.changeLog.filter(l => l.itemId === taskId) : [];

    const getNameForId = (fieldName, id) => {
        if (!id) return 'None';
        if (fieldName === 'status_id') {
            return demoData.statusOptions.find(s => s.id === id)?.name || id;
        }
        if (fieldName === 'assigned_person_id') {
            return demoData.people.find(p => p.id === id)?.name || id;
        }
        if (fieldName === 'deadline') return formatDate(id);
        return id;
    };

    const updateIcon = (iconId, fieldName) => {
        const el = document.getElementById(iconId);
        if (!el) return;
        const fieldHistory = history.filter(h => h.fieldName === fieldName).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        if (fieldHistory.length > 0) {
            const latest = fieldHistory[0];
            const oldName = getNameForId(fieldName, latest.oldValue);
            const newName = getNameForId(fieldName, latest.newValue);

            el.innerHTML = `
                <span class="history-indicator">i
                    <div class="history-tooltip">
                        <b>Change Detected:</b><br>
                        ${formatDate(latest.timestamp)}<br>
                        From: <span style="color: #F87171">${oldName}</span><br>
                        To: <span style="color: #34D399">${newName}</span>
                    </div>
                </span>
            `;
        } else {
            el.innerHTML = '';
        }
    };

    updateIcon('statusHistoryIcon', 'status_id');
    updateIcon('deadlineHistoryIcon', 'deadline');
    updateIcon('assigneeHistoryIcon', 'assigned_person_id');
}

function renderSubTasks(taskId) {
    const list = document.getElementById('subTasksList');
    if (!list) return;

    const subTasks = demoData.subTasks ? demoData.subTasks.filter(s => s.taskId === taskId) : [];
    const typeSelect = document.getElementById('newSubTaskType');
    if (typeSelect) {
        // Find specific subtask types
        let subTypes = demoData.actionTypes ? demoData.actionTypes.filter(at => at.isSubtaskType === true && at.active) : [];

        // Fallback: If no types are explicitly marked as subtask types, show all active types
        if (subTypes.length === 0 && demoData.actionTypes) {
            subTypes = demoData.actionTypes.filter(at => at.active);
        }

        typeSelect.innerHTML = '<option value="">Select Type</option>' +
            subTypes.map(at => `<option value="${at.id}">${at.name}</option>`).join('');
    }

    if (subTasks.length === 0) {
        list.innerHTML = '<p style="color: var(--gray-400); font-style: italic; font-size: 11px; margin-top: 4px;">No sub-tasks yet.</p>';
        return;
    }

    list.innerHTML = subTasks.map(s => {
        const at = demoData.actionTypes.find(a => a.id === s.actionTypeId);
        return `
            <div class="subtask-item ${s.status === 'completed' ? 'completed' : ''}" style="padding: 6px 10px; gap: 12px;">
                <input type="checkbox" ${s.status === 'completed' ? 'checked' : ''} onchange="toggleSubTask('${s.id}', this.checked)" style="width: 16px; height: 16px; cursor: pointer;">
                <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
                    <div class="subtask-desc" style="font-size: 13px; font-weight: 500; flex: 1;">${s.description}</div>
                    <div style="font-size: 11px; font-weight: 600; color: white; background: ${at?.color || 'var(--gray-400)'}; padding: 2px 8px; border-radius: 4px; min-width: 80px; text-align: center;">
                        ${at ? at.name : 'Task'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAttachments(taskId) {
    const attList = document.getElementById('attachmentsList');
    if (!attList) return;

    const taskAtts = demoData.attachments ? demoData.attachments.filter(a => a.taskId === taskId) : [];
    if (taskAtts.length > 0) {
        attList.innerHTML = taskAtts.map(a => `
            <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px; border-radius: 6px; border: 1px solid var(--gray-200);">
                <span style="font-size: 16px;">${a.type === 'url' ? '🔗' : '📄'}</span>
                <a href="${a.url}" target="_blank" style="flex: 1; text-decoration: none; color: var(--primary); font-weight: 500; font-size: 12px;">${a.title || 'Untitled Attachment'}</a>
                <span style="font-size: 10px; color: var(--gray-400);">${formatDate(a.createdDate)}</span>
            </div>
        `).join('');
    } else {
        attList.innerHTML = '<p style="color: var(--gray-400); font-style: italic; font-size: 12px;">No attachments linked yet.</p>';
    }
}

// Helper toggles
function toggleSubTaskForm() {
    const f = document.getElementById('subTaskAddForm');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
}
function updateAttachmentMode() {
    const type = document.getElementById('newTaskAttType').value;
    const urlContainer = document.getElementById('urlInputContainer');
    const driveContainer = document.getElementById('driveInputContainer');

    if (type === 'gdrive') {
        urlContainer.style.display = 'none';
        driveContainer.style.display = 'flex';
    } else {
        urlContainer.style.display = 'flex';
        driveContainer.style.display = 'none';
    }
}

function toggleAttachmentForm() {
    const f = document.getElementById('taskAttachmentForm');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

async function addSubTask() {
    const taskId = document.getElementById('editTaskId').value;
    const desc = document.getElementById('newSubTaskDesc').value;
    const typeId = document.getElementById('newSubTaskType').value;
    if (!desc) return alert('Please enter a description for the sub-task.');
    if (!typeId) return alert('Please select a type for the sub-task.');

    const id = getNextId('ST', demoData.subTasks || []);
    const row = [id, taskId, desc, typeId, 'pending', new Date().toISOString().split('T')[0], ''];

    console.log('Adding SubTask:', row, 'to sheet:', CONFIG.SHEETS.SUBTASKS);

    const success = await saveToSheets(CONFIG.SHEETS.SUBTASKS, row);
    if (success) {
        console.log('SubTask saved successfully, refreshing data...');
        document.getElementById('newSubTaskDesc').value = '';
        await loadDataFromSheets();
        renderSubTasks(taskId); // Force re-render list
    }
}

async function addTaskAttachment() {
    const taskId = document.getElementById('editTaskId').value;
    const titleRaw = document.getElementById('newTaskAttTitle').value;
    const url = document.getElementById('newTaskAttUrl').value;
    const type = document.getElementById('newTaskAttType').value;

    if (!url) return alert('URL or File selection required');

    // Safety check for URL
    if (type === 'url' && !url.startsWith('http')) {
        return alert('Please enter a valid URL (starting with http:// or https://)');
    }

    // Limit title length for better UI
    const title = titleRaw.substring(0, 50) || (type === 'url' ? 'Link' : 'File');

    const id = getNextId('ATT', demoData.attachments);
    const row = [id, taskId, type, url, title, new Date().toISOString()];

    const success = await saveToSheets(CONFIG.SHEETS.ATTACHMENTS, row);
    if (success) {
        document.getElementById('newTaskAttTitle').value = '';
        document.getElementById('newTaskAttUrl').value = '';
        document.getElementById('newTaskAttType').value = 'url';
        loadDataFromSheets();
        renderAttachments(taskId);
    }
}

async function toggleSubTask(subTaskId, completed) {
    const st = demoData.subTasks.find(s => s.id === subTaskId);
    if (!st) return;

    const rowData = [
        st.id,
        st.taskId,
        st.description,
        st.actionTypeId,
        completed ? 'completed' : 'pending',
        st.createdDate,
        completed ? new Date().toISOString().split('T')[0] : ''
    ];

    const success = await updateSheetRow(CONFIG.SHEETS.SUBTASKS, subTaskId, rowData);
    if (success) loadDataFromSheets();
}

function openEditProjectModal(projectId) {
    const project = demoData.projects.find(p => p.id === projectId);
    if (!project) return;

    const type = demoData.projectTypes.find(pt => pt.id === project.typeId);
    document.getElementById('editProjectSubtitle').textContent = type ? type.name : 'Unknown Category';

    document.getElementById('editProjectId').value = project.id;
    document.getElementById('editProjectName').value = project.name;
    document.getElementById('editProjectDescription').value = project.description;
    document.getElementById('editProjectHours').value = project.expectedHours;
    document.getElementById('editProjectStatus').value = project.status;

    // Set Dates
    document.getElementById('displayProjectCreatedDate').textContent = project.createdDate ? new Date(project.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';

    const archiveContainer = document.getElementById('displayProjectArchivedContainer');
    if (project.status === 'completed' && project.archivedDate) {
        archiveContainer.style.display = 'block';
        document.getElementById('displayProjectArchivedDate').textContent = new Date(project.archivedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
        archiveContainer.style.display = 'none';
    }

    const typeSelect = document.getElementById('editProjectType');
    typeSelect.innerHTML = demoData.projectTypes.map(pt => `<option value="${pt.id}" ${pt.id === project.typeId ? 'selected' : ''}>${pt.name}</option>`).join('');

    document.getElementById('editProjectModal').classList.add('active');
    overlay.classList.add('active');
}

function closeEditModals() {
    document.getElementById('editTaskModal').classList.remove('active');
    document.getElementById('editProjectModal').classList.remove('active');
    overlay.classList.remove('active');
}

// ===== FORM SUBMISSIONS =====

async function archiveTask() {
    const id = document.getElementById('editTaskId').value;
    const task = demoData.tasks.find(t => t.id === id);
    if (!task) return;

    if (!confirm('Archive this task? It will be removed from the active list and moved to the Archive tab.')) return;

    // Build row data (matching current schema)
    const rowData = [
        id,
        task.description,
        task.projectId,
        task.parentType,
        task.actionTypeId,
        task.assignedPersonId,
        task.deadline,
        task.statusId,
        task.completionDate,
        task.timeStarted,
        task.timeEnded,
        task.hours,
        task.priority,
        task.createdDate,
        task.instructions,
        JSON.stringify(task.deadlineHistory || []),
        'TRUE', // Archived Column (Index 16)
        task.startDate || '' // Col R (Index 17)
    ];

    const success = await updateSheetRow(CONFIG.SHEETS.TASKS, id, rowData);
    if (success) {
        closeEditModals();
        loadDataFromSheets();
    }
}

document.getElementById('editTaskForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editTaskId').value;
    const task = demoData.tasks.find(t => t.id === id);
    if (!task) return;

    const tStart = document.getElementById('editTaskTimeStarted').value;
    const tEnd = document.getElementById('editTaskTimeEnded').value;
    const newStatusId = document.getElementById('editTaskStatus').value;
    const newDeadline = document.getElementById('editTaskDeadline').value;
    const newAssigneeId = document.getElementById('editTaskAssignee').value;
    const newInstructions = document.getElementById('editTaskInstructions').value;

    // Change Detection & Logging
    const checkAndLog = async (fieldName, oldVal, newVal) => {
        if (oldVal !== newVal) {
            const logId = getNextId('LOG', demoData.changeLog);
            const row = [logId, id, 'task', fieldName, oldVal, newVal, new Date().toISOString(), 'p1']; // Default p1
            await saveToSheets(CONFIG.SHEETS.CHANGELOG, row);
        }
    };

    await checkAndLog('status_id', task.statusId, newStatusId);
    await checkAndLog('deadline', task.deadline, newDeadline);
    await checkAndLog('assigned_person_id', task.assignedPersonId, newAssigneeId);

    // Calc Hours
    let totalHrs = task.hours || 0;
    if (tStart && tEnd) {
        try {
            const [h1, m1] = tStart.split(':').map(Number);
            const [h2, m2] = tEnd.split(':').map(Number);
            const startMin = h1 * 60 + m1;
            const endMin = h2 * 60 + m2;
            if (endMin > startMin) totalHrs = ((endMin - startMin) / 60).toFixed(1);
        } catch (err) { }
    }

    const rowData = [
        id,
        document.getElementById('editTaskDescription').value,
        task.projectId,
        task.parentType,
        task.actionTypeId,
        newAssigneeId,
        newDeadline,
        newStatusId,
        newStatusId === 'ST004' ? new Date().toISOString().split('T')[0] : (task.completionDate || ''),
        tStart,
        tEnd,
        totalHrs,
        task.priority,
        task.createdDate,
        newInstructions,
        JSON.stringify(task.deadlineHistory || []),
        task.isArchived ? 'TRUE' : 'FALSE', // Preserve archived status
        document.getElementById('editTaskStartDate').value // Col R (Index 17)
    ];

    const success = await updateSheetRow(CONFIG.SHEETS.TASKS, id, rowData);
    if (success) {
        closeEditModals();
        loadDataFromSheets();
    }
});

document.getElementById('editProjectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editProjectId').value;
    const project = demoData.projects.find(p => p.id === id);
    if (!project) return;

    // [project_id, project_name, description, status, created_date, archived_date, expected_hours, type_id]
    const rowData = [
        id,
        document.getElementById('editProjectName').value,
        document.getElementById('editProjectDescription').value,
        document.getElementById('editProjectStatus').value,
        project.createdDate,
        document.getElementById('editProjectStatus').value === 'completed' ? new Date().toISOString().split('T')[0] : '',
        parseInt(document.getElementById('editProjectHours').value) || 0,
        document.getElementById('editProjectType').value
    ];

    const success = await updateSheetRow(CONFIG.SHEETS.PROJECTS, id, rowData);
    if (success) {
        closeEditModals();
        loadDataFromSheets();
    }
});

// Close buttons
document.getElementById('closeEditTask')?.addEventListener('click', closeEditModals);
document.getElementById('cancelEditTask')?.addEventListener('click', closeEditModals);
document.getElementById('closeEditProject')?.addEventListener('click', closeEditModals);
document.getElementById('cancelEditProject')?.addEventListener('click', closeEditModals);

// ===== SEARCH & FILTERS =====
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const currentView = document.querySelector('.nav-link.active')?.dataset.view;
        if (currentView !== 'tasks') {
            switchView('tasks');
        }
        loadTasks();
    });
}

['statusFilter', 'personFilter', 'typeFilter'].forEach(filterId => {
    document.getElementById(filterId)?.addEventListener('change', () => loadTasks());
});

// ===== DROPDOWN POPULATION =====
function updateDropdowns() {
    // Modal Selects
    const projectSelects = [document.getElementById('taskProject'), document.getElementById('editTaskProject')];
    const personSelects = [document.getElementById('taskAssignee'), document.getElementById('editTaskAssignee')];
    const typeSelects = [document.getElementById('taskType'), document.getElementById('editTaskType')];
    const statusSelects = [document.getElementById('editTaskStatus')];

    // Filter Selects
    const filterStatus = document.getElementById('statusFilter');
    const filterPerson = document.getElementById('personFilter');
    const filterType = document.getElementById('typeFilter');

    projectSelects.forEach(select => {
        if (select) {
            let options = '<option value="">Select Parent</option>';
            options += '<optgroup label="Projects">';
            options += demoData.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            options += '</optgroup>';

            if (demoData.subProjects && demoData.subProjects.length > 0) {
                options += '<optgroup label="SubProjects">';
                options += demoData.subProjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
                options += '</optgroup>';
            }
            select.innerHTML = options;
        }
    });

    personSelects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Select Person</option>' +
                demoData.people.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    });

    if (filterPerson) {
        filterPerson.innerHTML = '<option value="">All People</option>' +
            demoData.people.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    }

    const timesheetPersonFilter = document.getElementById('timesheetPersonFilter');
    if (timesheetPersonFilter) {
        timesheetPersonFilter.innerHTML = '<option value="">All People</option>' +
            demoData.people.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    typeSelects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Select Action Type</option>' +
                demoData.actionTypes.map(at => `<option value="${at.id}">${at.name}</option>`).join('');
        }
    });

    const projectTypeSelect = document.getElementById('projectTypeSelect');
    if (projectTypeSelect) {
        projectTypeSelect.innerHTML = demoData.projectTypes.map(pt =>
            `<option value="${pt.id}">${pt.name}</option>`).join('');
    }

    const subparentSelect = document.getElementById('subprojectParent');
    if (subparentSelect) {
        subparentSelect.innerHTML = '<option value="">Select parent project...</option>' +
            demoData.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    const attachTaskSelect = document.getElementById('attachmentTask');
    if (attachTaskSelect) {
        attachTaskSelect.innerHTML = '<option value="">Select task...</option>' +
            demoData.tasks.map(t => `<option value="${t.id}">${t.description}</option>`).join('');
    }

    if (filterType) {
        filterType.innerHTML = '<option value="">All Types</option>' +
            demoData.actionTypes.map(at => `<option value="${at.name}">${at.name}</option>`).join('');
    }

    statusSelects.forEach(select => {
        if (select) {
            select.innerHTML = demoData.statusOptions.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
    });

    if (filterStatus) {
        filterStatus.innerHTML = '<option value="">All Status</option>' +
            demoData.statusOptions.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }

    const filterGantt = document.getElementById('ganttProjectFilter');
    if (filterGantt) {
        filterGantt.innerHTML = '<option value="">All Projects</option>' +
            demoData.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
}

// ===== INITIALIZE =====
function initializeApp() {
    updateDropdowns();
    loadDashboard();
    loadProjects();
    loadTasks();
    loadArchive();

    // Auto-refresh settings if we're on that view
    const settingsView = document.getElementById('settingsView');
    if (settingsView && settingsView.classList.contains('active')) {
        loadSettings();
    }

    console.log('TaskFlow UI updated');
}

async function deleteItemPermanently(type, id) {
    // Integrity Safeguard: Check if item is in use
    let inUse = false;
    let errorMessage = '';

    if (type === 'action-types') {
        const item = demoData.actionTypes.find(at => at.id === id);
        if (item && demoData.tasks.some(t => t.actionType === item.name)) {
            inUse = true;
            errorMessage = 'This Action Type is currently used by one or more tasks and cannot be deleted.';
        }
    } else if (type === 'people') {
        const item = demoData.people.find(p => p.id === id);
        if (item && demoData.tasks.some(t => t.assignedTo === item.name)) {
            inUse = true;
            errorMessage = 'This Team Member is currently assigned to one or more tasks and cannot be deleted.';
        }
    } else if (type === 'status-options') {
        const item = demoData.statusOptions.find(st => st.id === id);
        if (item && demoData.tasks.some(t => t.status === item.name)) {
            inUse = true;
            errorMessage = 'This Status is currently used by one or more tasks and cannot be deleted.';
        }
    } else if (type === 'project-types') {
        if (demoData.projects.some(p => p.typeId === id)) {
            inUse = true;
            errorMessage = 'This Project Type is currently used by one or more projects and cannot be deleted.';
        }
    }

    if (inUse) {
        alert('Blocked: ' + errorMessage);
        return;
    }

    if (!confirm('Are you sure you want to permanently delete this item?')) return;

    let sheetName = '';
    switch (type) {
        case 'action-types': sheetName = CONFIG.SHEETS.ACTION_TYPES; break;
        case 'people': sheetName = CONFIG.SHEETS.PEOPLE; break;
        case 'status-options': sheetName = CONFIG.SHEETS.STATUS_OPTIONS; break;
        case 'project-types': sheetName = CONFIG.SHEETS.PROJECT_TYPES || 'ProjectTypes'; break;
    }

    if (sheetName) {
        const success = await deleteSheetRow(sheetName, id);
        if (success) {
            alert('Item deleted successfully!');
            loadDataFromSheets();
        }
    }
}

async function deleteSheetRow(sheetName, id, idColumn = 'A') {
    if (!gapi.client.getToken()) return false;
    try {
        console.log(`Deleting row in ${sheetName} for ID ${id}...`);

        // 1. Get current rows to find the index
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID,
            range: `'${sheetName}'!${idColumn}:${idColumn}`
        });
        const rows = response.result.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            console.error('ID not found for deletion:', id);
            return false;
        }

        // 2. Get the numeric sheetId for this title
        const spreadsheet = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID
        });
        const sheet = spreadsheet.result.sheets.find(s => s.properties.title === sheetName);
        if (!sheet) return false;

        // 3. Send delete dimension request
        const res = await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID,
            resource: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheet.properties.sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1
                        }
                    }
                }]
            }
        });

        console.log('Delete response:', res.result);
        return true;
    } catch (e) {
        console.error('Delete API error:', e);
        alert('Delete failed: ' + (e.result?.error?.message || e.message));
        return false;
    }
}

async function updateSheetRow(sheetName, id, rowData, idColumn = 'A') {
    if (!gapi.client.getToken()) return false;
    try {
        console.log(`Updating row in ${sheetName} for ID ${id}...`, rowData);

        // 1. Find the row index
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID,
            range: `'${sheetName}'!${idColumn}:${idColumn}`
        });
        const rows = response.result.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            console.error('ID not found for update:', id);
            return false;
        }

        // 2. Update the row (1-indexed, so row index + 1)
        const range = `'${sheetName}'!A${rowIndex + 1}`;
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: CONFIG.GOOGLE_SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [rowData]
            }
        });

        console.log('Update successful');
        return true;
    } catch (e) {
        console.error('Update API error:', e);
        alert('Update failed: ' + (e.result?.error?.message || e.message));
        return false;
    }
}

async function updateItemRow(type, id) {
    let sheetName;
    let rowData;

    try {
        switch (type) {
            case 'action-types':
                sheetName = CONFIG.SHEETS.ACTION_TYPES;
                rowData = [
                    id,
                    document.getElementById(`name_${id}`).value,
                    document.getElementById(`order_${id}`).value,
                    document.getElementById(`color_${id}`).value,
                    'TRUE'
                ];
                break;
            case 'project-types':
                sheetName = CONFIG.SHEETS.PROJECT_TYPES || 'ProjectTypes';
                rowData = [
                    id,
                    document.getElementById(`name_${id}`).value,
                    document.getElementById(`order_${id}`).value,
                    document.getElementById(`color_${id}`).value,
                    'TRUE'
                ];
                break;
            case 'status-options':
                sheetName = CONFIG.SHEETS.STATUS_OPTIONS;
                const stComplete = document.getElementById(`complete_${id}`).checked;
                rowData = [
                    id,
                    document.getElementById(`name_${id}`).value,
                    document.getElementById(`order_${id}`).value,
                    document.getElementById(`color_${id}`).value,
                    stComplete ? 'TRUE' : 'FALSE',
                    'TRUE'
                ];
                break;
            case 'people':
                sheetName = CONFIG.SHEETS.PEOPLE;
                const p = demoData.people.find(item => item.id === id);
                rowData = [
                    id,
                    document.getElementById(`name_${id}`).value,
                    document.getElementById(`email_${id}`).value,
                    document.getElementById(`role_${id}`).value,
                    p ? p.hourlyRate : '75',
                    'TRUE'
                ];
                break;
        }

        if (rowData && sheetName) {
            const success = await updateSheetRow(sheetName, id, rowData);
            if (success) {
                alert('Saved successfully!');
                loadDataFromSheets();
            }
        }
    } catch (e) {
        console.error('Error updating row:', e);
        alert('Update failed. Check console for details.');
    }
}

// Helper to find the correct key in CONFIG.SHEETS from a tab title
function getConfigKeyBySheetName(name) {
    if (!CONFIG.SHEETS) return null;
    return Object.keys(CONFIG.SHEETS).find(key =>
        CONFIG.SHEETS[key].trim().toLowerCase() === name.trim().toLowerCase()
    );
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    if (typeof gapi === 'undefined') {
        initializeApp();
    }
});

// ===== THEME TOGGLE =====
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('taskflow-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('taskflow-theme', newTheme);
        updateThemeUI(newTheme);
    });
}

function updateThemeUI(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (theme === 'dark') {
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Light Mode';
    } else {
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Dark Mode';
    }
}
