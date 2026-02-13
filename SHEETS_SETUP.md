# Google Sheets Data Population Guide

## Sheet Structure

Your Google Spreadsheet should have the following tabs (sheets):

### 1. Projects
**Columns (A-H):**
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| project_id | project_name | description | status | created_date | archived_date | expected_hours | type_id |

**Sample Data:**
```
P001 | Website Redesign | Full site refresh for ABC Corp | active | 2026-01-15 | | 120 | pt1
```

### 2. Tasks
**Columns (A-P):**
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| task_id | task_description | parent_id | parent_type | action_type_id | assigned_person_id | deadline | status_id | completion_date | time_started | time_ended | total_hours | priority | created_date | instructions | deadline_history |

**Sample Data:**
```
t1 | Design homepage mockup | p1 | project | at2 | p1 | 2026-02-15 | st2 | | 2026-02-10 09:00 | 2026-02-10 14:30 | 5.5 | high | 2026-02-08
```

### 3. ActionTypes
**Columns (A-F):**
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| ID | Name | Order | Color | Active | IsSubtaskType |

**Sample Data:**
```
at1 | Client Call | 1 | #4A90E2 | TRUE
at2 | Design Work | 2 | #E24A90 | TRUE
at3 | Write Proposal | 3 | #90E24A | TRUE
at4 | Development | 4 | #9B59B6 | TRUE
at5 | Review | 5 | #F39C12 | TRUE
```

### 4. StatusOptions
**Columns (A-F):**
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| ID | Name | Order | Color | Is Complete | Active |

**Sample Data:**
```
st1 | Not Started | 1 | #CCCCCC | FALSE | TRUE
st2 | STARTED | 2 | #3B82F6 | FALSE | TRUE
st3 | In Progress | 3 | #FFA500 | FALSE | TRUE
st4 | Blocked | 4 | #FF0000 | FALSE | TRUE
st5 | Completed | 5 | #00FF00 | TRUE | TRUE
```

### 5. People
**Columns (A-F):**
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| ID | Name | Email | Role | HourlyRate | Active |

**Sample Data:**
```
p1 | Rocky Swartz | rocky@example.com | Designer | 75 | TRUE
p2 | Sarah Johnson | sarah@example.com | Project Manager | 85 | TRUE
p3 | Tom Chen | tom@example.com | Developer | 90 | TRUE
```

### 6. ProjectTypes
**Columns (A-E):**
| A | B | C | D | E |
|---|---|---|---|---|
| ID | Name | Order | Color | Active |

**Sample Data:**
```
pt1 | Marketing | 1 | #3B82F6 | TRUE
pt2 | Development | 2 | #10B981 | TRUE
pt3 | Consulting | 3 | #F59E0B | TRUE
pt4 | Internal | 4 | #6B7280 | TRUE
```

### 7. SubProjects
**Columns (A-H):**
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| subproject_id | subproject_name | parent_id | parent_type | description | level | created_date | status |

### 8. Attachments
**Columns (A-F):**
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| attachment_id | task_id | attachment_type | attachment_url | title | created_date |

### 9. Notes
**Columns (A-F):**
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| note_id | related_id | text | created_date | person_id | active |

### 10. SubTasks
**Columns (A-G):**
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| subtask_id | task_id | description | action_type_id | status | created_date | completion_date |

### 11. ChangeLog
**Columns (A-H):**
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| log_id | item_id | item_type | field_name | old_value | new_value | timestamp | person_id |

### 12. TimeLogs
**Columns (A-I):**
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| log_id | task_id | person_id | date | start_time | end_time | duration | description | is_billable |

**Sample Data:**
```
TL001 | t1 | p1 | 2026-02-10 | 09:00 | 14:30 | 5.5 | Worked on initial mockups | TRUE
```

## Quick Setup Steps

1. **Create the tabs** in your Google Sheet with the exact names above
2. **Add headers** (row 1) for each tab using the column names
3. **Copy the sample data** into rows 2+ for each tab
4. **Format the data**:
   - Use `TRUE`/`FALSE` for boolean columns (Active, Is Complete)
   - Use `YYYY-MM-DD` format for dates (e.g., 2026-02-15)
   - Use hex colors with # (e.g., #4A90E2)

## Alternative: Use the CSV Import Script

I've created a Node.js script (`populate-sheets.js`) that can automatically populate your Google Sheet with the demo data. See that file for instructions.
