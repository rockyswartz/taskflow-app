# TaskFlow - Project Management App

A modern, feature-rich project management application with time tracking, Gantt charts, and Google Sheets integration.

## ✨ Features

- 📊 **Dashboard** - Overview of all projects and tasks with analytics
- 📁 **Project Management** - Create and organize projects with custom types
- ✅ **Task Management** - Full task lifecycle with priorities, deadlines, and assignments
- ⏱️ **Time Tracking** - Log billable and non-billable hours with live timers
- 📅 **Gantt Timeline** - Visual project timeline with smooth scrolling
- 🎨 **Dark Mode** - Beautiful dark theme with seamless switching
- 📝 **Notes & Attachments** - Add context to projects and tasks
- 🔄 **Google Sheets Sync** - Optional cloud sync with Google Sheets

## 🚀 Quick Start

### Demo Mode (No Setup Required)
1. Open `index.html` in your browser
2. The app runs with demo data - no configuration needed!
3. Explore all features without connecting to Google Sheets

### Local Development
```bash
# Start the development server
./dev.sh

# Or use Python's built-in server
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## 🎯 Usage

### Navigation
- **Dashboard**: Overview and quick stats
- **Projects**: Manage all projects
- **My Tasks**: View and manage tasks (List or Board view)
- **Timeline**: Gantt chart view of project schedules
- **Timesheets**: Track and review logged hours
- **Settings**: Customize action types, statuses, people, and project types

### Time Tracking
1. Click **▶️ Start** on any task to begin a timer
2. Click **🛑 Stop** to automatically log the time
3. Or manually click **➕ Log** to add time entries
4. View all logs in the **Timesheets** view

### Dark Mode
Click the theme toggle button in the sidebar to switch between light and dark modes.

## 🔧 Google Sheets Integration (Optional)

To connect your own Google Sheets:

1. Copy `config.public.js` to `config.js`
2. Set up a Google Cloud project and enable Sheets API
3. Add your API credentials to `config.js`
4. Create a spreadsheet using the structure in `SHEETS_SETUP.md`
5. Click "Login with Google" in the sidebar

## 📱 Responsive Design

The app works beautifully on:
- 💻 Desktop
- 📱 Mobile
- 🖥️ Tablet

## 🎨 Customization

All colors, spacing, and typography are defined as CSS variables in `styles.css`, making it easy to customize the look and feel.

## 📄 License

This is a demonstration project. Feel free to use and modify as needed.

---

Built with ❤️ using vanilla JavaScript, HTML, and CSS
