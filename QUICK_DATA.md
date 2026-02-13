# Quick Copy-Paste Data for Google Sheets

Use this data to quickly populate your Google Sheets manually. This matches the comprehensive schema from the original design.

## Projects Sheet
**Copy this and paste into cell A1:**

```
project_id	project_name	description	status	created_date	archived_date	expected_hours	type_id
P001	Website Redesign	Full site refresh for ABC Corp	active	2026-01-15		120	pt1
P002	Mobile App Development	iOS and Android app	active	2026-01-20		200	pt2
P003	E-commerce Platform	Online store with payment integration	active	2026-01-22		150	pt2
P004	Marketing Campaign	Q1 2026 digital marketing	active	2026-02-01		80	pt1
```

## SubProjects Sheet (Optional - can be empty initially)
**Copy this and paste into cell A1:**

```
subproject_id	subproject_name	parent_id	parent_type	description	level	created_date	status
SP001	Homepage Redesign	P001	project	New hero section and layout	1	2026-01-16	active
SP002	Mobile Navigation	SP001	subproject	Hamburger menu implementation	2	2026-01-17	active
```

## Tasks Sheet
**Copy this and paste into cell A1:**

```
task_id	task_description	parent_id	parent_type	action_type_id	assigned_person_id	deadline	status_id	completion_date	time_started	time_ended	total_hours	priority	created_date
T001	Design homepage mockup	P001	project	AT002	PER001	2026-02-15	ST002		2026-02-10 09:00	2026-02-10 14:30	5.5	high	2026-02-08
T002	Client call about requirements	P001	project	AT001	PER002	2026-02-06	ST001				0	urgent	2026-02-05
T003	Write proposal document	P002	project	AT003	PER001	2026-02-09	ST002		2026-02-07 10:00	2026-02-07 13:00	3	high	2026-02-06
T004	Review wireframes	P001	project	AT005	PER002	2026-02-20	ST001				0	medium	2026-02-08
T005	Setup payment gateway	P003	project	AT004	PER003	2026-02-12	ST002		2026-02-09 09:00	2026-02-09 17:00	8	high	2026-02-08
```

## People Sheet
**Copy this and paste into cell A1:**

```
person_id	person_name	email	role	hourly_rate	is_active
PER001	Rocky Swartz	rocky@example.com	Designer	75	TRUE
PER002	Sarah Johnson	sarah@example.com	Project Manager	85	TRUE
PER003	Tom Chen	tom@example.com	Developer	90	TRUE
```

## ActionTypes Sheet
**Copy this and paste into cell A1:**

```
action_type_id	action_name	action_order	color_hex	is_active
AT001	Client Call	1	#4A90E2	TRUE
AT002	Design Work	2	#E24A90	TRUE
AT003	Write Proposal	3	#90E24A	TRUE
AT004	Development	4	#9B59B6	TRUE
AT005	Review	5	#F39C12	TRUE
```

## StatusOptions Sheet
**Copy this and paste into cell A1:**

```
status_id	status_name	status_order	color_hex	is_complete	is_active
ST001	Not Started	1	#CCCCCC	FALSE	TRUE
ST002	In Progress	2	#FFA500	FALSE	TRUE
ST003	Blocked	3	#FF0000	FALSE	TRUE
ST004	Completed	4	#00FF00	TRUE	TRUE
```

## Attachments Sheet (Optional - can be empty initially)
**Copy this and paste into cell A1:**

```
attachment_id	task_id	attachment_type	attachment_url	title	created_date
ATT001	T001	url	https://figma.com/file/abc123	Design mockup v2	2026-02-09
ATT002	T003	doc	https://docs.google.com/document/d/xyz789	Proposal draft	2026-02-07
```

## ProjectTypes Sheet
**Copy this and paste into cell A1:**

```
pt_id	pt_name	pt_order	color_hex	is_active
pt1	Marketing	1	#3B82F6	TRUE
pt2	Development	2	#10B981	TRUE
pt3	Consulting	3	#F59E0B	TRUE
pt4	Internal	4	#6B7280	TRUE
```

## Notes Sheet
**Copy this and paste into cell A1:**

```
note_id	related_id	text	created_date	person_id	active
N001	P001	Initial setup complete.	2026-02-10T10:00:00Z	PER001	TRUE
```

---

## Instructions

1. Open your Google Spreadsheet (ID: `1NGE58ra7-hIfP8tZVahz2m1qNHIt0HEuCfP9DcYnl6w`)
2. Create these tabs with **exact names**:
   - `Projects` (required)
   - `SubProjects` (optional, for nested organization)
   - `Tasks` (required)
   - `People` (required)
   - `ActionTypes` (required)
   - `StatusOptions` (required)
   - `Attachments` (optional, for file tracking)

3. For each tab, copy the corresponding data block above
4. Paste into cell A1 of that tab
5. The data is tab-separated and will automatically fill into columns

**Important Notes:**
- The column names MUST match exactly (case-sensitive)
- Use `TRUE`/`FALSE` for boolean columns
- Use `YYYY-MM-DD` format for dates
- Use `YYYY-MM-DD HH:MM` format for date-times
- IDs should match between sheets (e.g., `PER001` in People matches `assigned_person_id` in Tasks)

