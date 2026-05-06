## Campus360Pro Frontend — Admin Dashboard Architecture Report (Current Repo)

### 0. Scope and constraints
- **Scope**: Frontend only (this repository). Backend is not assumed beyond what the UI implies.
- **Method**: Reverse-engineered from `src/App.jsx` routes, `PageLayout`, Redux store slices, and route-level pages/forms.
- **Data reality**: App is a **hybrid** of:
  - **Redux-driven mock async** slices (fees/salary/expenses/employees/academics/settings/userManagement)
  - **In-file mock constants** for some flows (Finance overview transactions, Collect Fee flow, Admissions wizard, Section roster/time table pages)

---

## 1. PROJECT OVERVIEW

### Tech stack (evidence-based)
- **Framework**: React (rendered via `createRoot`)
- **Build tool**: Vite (`npm run dev`, `vite build`)
- **Routing**: React Router DOM v7 (`BrowserRouter`, nested `Routes`, `Outlet` contexts)
- **State**: **Redux Toolkit** (`configureStore`, multiple slices) + local component state
- **UI / styling**:
  - SCSS (page/component SCSS files across modules)
  - MUI ThemeProvider/CssBaseline used in `AppThemeProvider`
  - Material Symbols icons used heavily (class `material-symbols-outlined`)
- **Language**: JavaScript / JSX (no TypeScript project)

### Architecture pattern
- **Layout Shell**: `PageLayout` renders `Sidebar`, `Navbar`, and nested route content via `<Outlet />`
- **Domain pages**: under `src/pages/*` (Admissions, Employees, FinancialServices, Academics, Settings, UserManagement, Dashboard)
- **Redux feature slices**: under `src/store/*` with selectors + thunk-like fetch actions (mocked)

### Routing system (current)
Defined in `src/App.jsx`:
- `/` → `Dashboard`
- `/admission` → Admissions wizard (`Admission`)
- `/employees/*` (nested under `EmployeesLayout`)
  - `/employees/dashboard` → `EmployeesDashboard`
  - `/employees/teachers` → `TeachersDirectory`
  - `/employees/teachers/onboarding` → `TeacherOnboardingPage`
  - `/employees/administration` → `AdministrationDirectory`
  - `/employees/operational-staff` → `OperationalStaffDirectory`
  - `/employees/leave-management` → `LeaveManagementPage`
  - `/employees/leave-management/new` → `LeaveApplicationPage`
- `/financial-services/*` (nested under `FinancialServicesLayout`)
  - `/financial-services` → `FinancialServicesOverview`
  - `/financial-services/collect-fee` → `CollectFeeFlowPage`
  - `/financial-services/fee-management` → `FeeManagement`
  - `/financial-services/salary-management` → `SalaryManagement`
  - `/financial-services/other-expenses` → `OtherExpenses`
- `/academics/*` (nested under `AcademicsLayout`)
  - `/academics/student-management` → `AcademicsModernPage` (`pageKey="studentManagement"`)
  - `/academics/student-management/section/:sectionId` → `SectionStudentsPage`
  - `/academics/time-table` → `AcademicsModernPage` (`pageKey="timeTable"`)
  - `/academics/time-table/section/:sectionId` → `SectionTimeTablePage`
  - `/academics/attendance` → `AcademicsModernPage` (`pageKey="attendance"`)
  - `/academics/attendance/:classSlug/:sectionSlug` → `AttendanceLogPage` (wrapped by `AcademicsKeyedOutlet`)
  - `/academics/grades` → `AcademicsModernPage` (`pageKey="grades"`)
  - `/academics/grades/:classSlug/:sectionSlug` → `GradesLogPage` (wrapped by `AcademicsKeyedOutlet`)
- `/user-management` → `UserManagementPage`
- `/settings` → `SettingsPage`

### App bootstrap
- `src/main.jsx`:
  - Wraps app with `AppThemeProvider`
  - Wraps app with Redux `<Provider store={store}>`

### Store (global state)
- `src/store/store.js` reducers:
  - `expenses`, `fees`, `salary`, `employees`, `academics`, `settings`, `userManagement`

---

## 2. COMPLETE FOLDER STRUCTURE BREAKDOWN (current)

### Repository tree (high-level, current)
```text
src/
├─ App.jsx
├─ main.jsx
├─ index.scss
├─ components/
│  ├─ Navbar/
│  └─ Sidebar/
├─ data/
│  ├─ collectFeeMock.js
│  ├─ dashboard.json
│  └─ leaveManagementMock.js
├─ hooks/
│  └─ usePageTitle.js
├─ layout/
│  └─ PageLayout/
│     ├─ index.jsx
│     └─ PageLayout.scss
├─ pages/
│  ├─ Admission/
│  │  ├─ index.jsx
│  │  ├─ Admission.scss
│  │  └─ components/
│  │     ├─ Step1Student.jsx
│  │     ├─ Step2Academic.jsx
│  │     ├─ Step3Guardian.jsx
│  │     ├─ Step4Address.jsx
│  │     ├─ Step5Transport.jsx
│  │     ├─ Step6Documents.jsx
│  │     ├─ Step7Review.jsx
│  │     └─ SuccessView.jsx
│  ├─ Employees/
│  │  ├─ EmployeesLayout.jsx
│  │  ├─ EmployeesDashboard.jsx
│  │  ├─ EmployeesTopTabs.jsx
│  │  ├─ TeachersDirectory.jsx
│  │  ├─ TeachersStaffDirectory.jsx
│  │  ├─ AdministrationDirectory.jsx
│  │  ├─ OperationalStaffDirectory.jsx
│  │  ├─ LeaveManagementPage.jsx
│  │  ├─ LeaveApplicationPage.jsx
│  │  └─ onboarding/
│  │     └─ TeacherOnboardingWizard.jsx
│  ├─ FinancialServices/
│  │  ├─ FinancialServicesLayout.jsx
│  │  ├─ FinancialServicesOverview.jsx
│  │  ├─ CollectFeeFlowPage.jsx
│  │  ├─ FeeManagement.jsx
│  │  ├─ SalaryManagement.jsx
│  │  └─ OtherExpenses.jsx
│  ├─ Academics/
│  │  ├─ AcademicsLayout.jsx
│  │  ├─ AcademicsModernPage.jsx
│  │  ├─ AcademicsKeyedOutlet.jsx
│  │  ├─ SectionStudentsPage.jsx
│  │  ├─ SectionTimeTablePage.jsx
│  │  ├─ AttendanceLogPage.jsx
│  │  ├─ GradesLogPage.jsx
│  │  ├─ classSectionRegistry.js
│  │  ├─ studentManagement/
│  │  └─ wizard/
│  ├─ Settings/
│  │  └─ SettingsPage.jsx
│  ├─ UserManagement/
│  │  └─ UserManagementPage.jsx
│  └─ Dashboard/
│     └─ index.jsx
├─ store/
│  ├─ store.js
│  ├─ fees/feesSlice.js
│  ├─ salary/salarySlice.js
│  ├─ expenses/expensesSlice.js
│  ├─ employees/employeesSlice.js
│  ├─ academics/academicsSlice.js
│  ├─ settings/settingsSlice.js
│  └─ userManagement/userManagementSlice.js
└─ theme/
   └─ AppThemeProvider.jsx
```

---

## 3. GLOBAL SHELL / NAVIGATION

### `PageLayout` (global shell)
File: `src/layout/PageLayout/index.jsx`
- **Renders**:
  - `Sidebar` (hidden for `/financial-services/collect-fee` full-screen flow)
  - `Navbar` (also hidden for collect-fee full-screen)
  - `<Outlet context={{ setNavTitle }} />` so pages can set the navbar title
- **Floating action button**:
  - “New Admission” FAB navigates to `/admission`
  - FAB hidden on onboarding flows and roster detail pages

### `Sidebar` (collapsible + branch picker)
File: `src/components/Sidebar/index.jsx`
- **Collapse state**: `sessionStorage.sidebarCollapsed` (`'1'` = collapsed)
- **Branch state**:
  - Stored in `sessionStorage.selectedBranch`
  - Emits `CustomEvent('branch:change', { detail: branchName })`
  - Academics wizard pages listen to this event to sync branch UI
- **Nav items**:
  - Dashboard `/`
  - Admission `/admission`
  - Employees `/employees/teachers` (active for any `/employees/*`)
  - Financial Services `/financial-services`
  - Academics `/academics`
  - User Management `/user-management`
  - Settings `/settings`

### `Navbar`
File: `src/components/Navbar/index.jsx`
- Shows module-specific top tabs:
  - Employees tabs (`EmployeesTopTabs`) for most `/employees/*`
  - Financial tabs (`FinancialTopTabs`) for `/financial-services/*`
  - Academics tabs (`AcademicsTopTabs`) for `/academics/*` except roster detail routes
- Theme toggle uses `ThemeContext` from `AppThemeProvider`

### Theme provider
File: `src/theme/AppThemeProvider.jsx`
- Persists `localStorage.theme = 'dark' | 'light'`
- Applies `body.dark` / `body.light`
- Provides MUI theme + `ThemeContext` with:
  - `toggleTheme()`
  - `isDark`

---

## 4. MODULE-LEVEL ANALYSIS (Current)

## 4.1 Admissions (`/admission`) — 7-step wizard + success
Entry: `src/pages/Admission/index.jsx`
- **State**:
  - `currentStep` (1..8)
  - `formData` (plain object; merged by `updateFormData`)
- **No API calls** observed; data remains in memory.

### Step 1 — Student Information (`Step1Student.jsx`)
**Field keys written into `formData`:**
- `firstName` *(text, required)*
- `lastName` *(text, required)*
- `gender` *(select, required; Male/Female/Other)*
- `bloodGroup` *(select; A+/A-/B+/B-/O+/O-/AB+/AB-)*
- `nationality` *(select; default “India”)*
- `academicYear` *(select; “2024-25”, “2025-26”)*
- `dob` *(date, required)*
- `religion` *(text)*
- `previousSchool` *(text)*

**UI actions**
- “Save Draft” button exists (currently UI-only; no persistence logic)
- “Next” submits and advances

### Step 2 — Academic Information (`Step2Academic.jsx`)
**Field keys:**
- `classApplied` *(select, required; Nursery…10th Grade)*
- `medium` *(select; English/Hindi/Telugu/Tamil/Kannada)*
- `previousClass` *(text)*
- `previousGrade` *(text)*
- `sectionPref` *(select; Section A/B/C)*
- `tcNumber` *(text)*

### Step 3 — Guardian Information (`Step3Guardian.jsx`)
**Field keys:**
- Father group:
  - `fatherName` *(text, required)*
  - `fatherOccupation` *(text)*
  - `fatherPhone` *(tel, required)*
  - `fatherEmail` *(email)*
- Mother group:
  - `motherName` *(text, required)*
  - `motherOccupation` *(text)*
  - `motherPhone` *(tel, required)*
  - `motherEmail` *(email)*
- Income:
  - `income` *(number)*
  - `incomeBracket` *(select, required; “< 1 lakh”… “> 9 lakhs”)*
- Emergency:
  - `emergencyName` *(text)*
  - `emergencyPhone` *(tel)*
  - `emergencyRelation` *(text)*

> Note: This implementation currently marks both father and mother “Name/Phone” as required in the browser, which differs from your old report’s “either Father or Mother required” rule.

### Step 4 — Address Information (`Step4Address.jsx`)
**Local UI state**
- `sameAsPresent` default: `formData.sameAsPresent ?? true`

**Field keys:**
- Present:
  - `presAddress` *(textarea, required)*
  - `presCity` *(text, required)*
  - `presState` *(select, required)*
  - `presPin` *(text, required)*
- Permanent:
  - `sameAsPresent` *(boolean checkbox)*
  - `permAddress` *(textarea)*
  - `permCity` *(text)*
  - `permState` *(select)*
  - `permPin` *(text)*

Behavior:
- When `sameAsPresent` is true, permanent fields are auto-copied from present and disabled.

### Step 5 — Transport (`Step5Transport.jsx`)
**Field keys:**
- `transportRequired` *(radio; stored as `'yes' | 'no'`; default treated as “yes” if missing)*
- If transport required:
  - `pickupPoint` *(select, required; zone1..zone4)*
  - `dropPoint` *(select, required; zone1..zone4)*

### Step 6 — Fee & Documents (`Step6Documents.jsx`)
**Fee plan**
- `feePlan` *(radio; `'Standard' | 'Commute' | 'Residential'`)*

**Documents**
Each file input sets the raw `File` object:
- `birthCert` *(file; required by label but not enforced programmatically)*
- `reportCard` *(file)*
- `addressProof` *(file)*
- `tc` *(file)*
- `photos` *(file)*
- `medicalCert` *(file)*

**Payment**
- `initialPayment` *(number input; default “5000”)*
- `applyDiscount` *(boolean; toggle UI)*
- `paymentMethod` *(set by clicking cards; `'Cash' | 'Card' | 'Online' | 'Bank'`)*

### Step 7 — Review (`Step7Review.jsx`)
- Displays values from `formData` with fallbacks (example placeholder names)
- Actions:
  - Back
  - Confirm & Submit (calls `onSubmit` → advances to Success view)

---

## 4.2 Employees (`/employees/*`)

### Teachers directory
- Route: `/employees/teachers`
- Wrapper: `TeachersDirectory.jsx` → `EmployeesDirectoryView section="teachers"`
- Another implementation exists: `TeachersStaffDirectory.jsx` (a full directory screen wired to Redux employees slice)

**Teacher directory filter inputs (in `TeachersStaffDirectory.jsx`)**
- Search: `ui.searchQuery` (input type `search`)
- Department filter: `ui.departmentFilter` (select)
- Status filter: `ui.statusFilter` (segmented buttons: Active / On Leave)
- Pagination:
  - `ui.page`, `ui.pageSize`

Actions:
- Export CSV (generates `teachers-directory.csv`)
- Add New Teacher → `/employees/teachers/onboarding`

### Leave management
- Route: `/employees/leave-management`
- File: `LeaveManagementPage.jsx`
- Key inputs:
  - KPI filter buttons: `activeFilter` (`'all' | 'pending' | 'approved_today' | 'rejected_today' | ...'`)
  - Date range filters:
    - `dateFrom` *(input type="date")*
    - `dateTo` *(input type="date")*
- Export:
  - CSV download filename includes filter + date range + today’s date

### New leave application
- Route: `/employees/leave-management/new`
- File: `LeaveApplicationPage.jsx`
- Local state inputs:
  - `leaveType` *(select id="leave-type")*
  - `startDate` *(date id="start-date")*
  - `endDate` *(date id="end-date")*
  - `reason` *(textarea id="leave-reason")*
  - Attachments:
    - `leave-attachments` *(file input, multiple; accepts pdf/jpg/png; drag-and-drop supported)*

---

## 4.3 Financial Services (`/financial-services/*`)

### Finance dashboard (Overview)
- Route: `/financial-services`
- File: `FinancialServicesOverview.jsx`
- Filter inputs:
  - Search: `search` *(input type="search")*
  - Date preset dropdown:
    - `datePreset` (preset object from `DATE_PRESETS`)
    - `dateMenuOpen` (dropdown state)
  - Type filter dropdown:
    - `typeFilter` (object from `TYPE_FILTERS`)
    - `typeMenuOpen`

### Collect Fee (full-screen flow)
- Route: `/financial-services/collect-fee`
- File: `CollectFeeFlowPage.jsx`
- Steps (`step` state): 1 → 2 → 3 → success receipt

**Step 1 inputs**
- Class selection:
  - `selectedClass` (tile buttons)
- Section selection:
  - `selectedSection` (pill buttons)
- Student selection:
  - `studentSearch` *(input type="search")*
  - `studentId` (selected listbox option)

**Step 2 inputs**
- Fee lines:
  - `lines[]` checkboxes (`checked` toggles per line)

**Step 3 inputs**
- Payment method:
  - `paymentMethod` (buttons from `collectFeePaymentMethods`)
- Remarks:
  - `remarks` *(textarea id="cf-remarks")*

On completion:
- Generates `receiptMeta = { orderId, issuedAt }`
- Uses `window.print()` for receipt printing
- Emits `CustomEvent('skm-order-confirmed', { detail: { studentId } })`

### Fee Management
- Route: `/financial-services/fee-management`
- File: `FeeManagement.jsx`
- Redux UI state (from `feesSlice`):
  - `searchQuery` *(search input)*
  - `statusFilter` *(menu)*
  - `page`, `pageSize`
- Local UI state:
  - `periodPreset` (date range preset id)
  - `classKey` (class filter id) **(UI present; currently not applied to `filteredFees` logic)**
  - menus open/close: `isDateMenuOpen`, `isClassMenuOpen`

### Salary Management
- Route: `/financial-services/salary-management`
- File: `SalaryManagement.jsx`
- Redux UI:
  - `searchQuery`, `statusFilter`, `page`, `pageSize`
- Local UI:
  - `isFilterOpen` (status menu)

### Other Expenses
- Route: `/financial-services/other-expenses`
- File: `OtherExpenses.jsx`
- Redux UI:
  - `searchQuery`, `statusFilter`, `page`, `pageSize`
- Local UI:
  - `isFilterOpen`

---

## 4.4 Academics (`/academics/*`)

### AcademicsModernPage (class & section explorer)
Routes:
- `/academics/student-management` (`pageKey="studentManagement"`)
- `/academics/time-table` (`pageKey="timeTable"`)
- `/academics/attendance` (`pageKey="attendance"`)
- `/academics/grades` (`pageKey="grades"`)

File: `AcademicsModernPage.jsx`
- State:
  - `selectedClassCode`
  - `sectionsByClass` (local editable copy of sections)
  - `sectionsPerCardEditMode` (toggles delete/edit actions)
- Section navigation:
  - Student management + timetable go to:
    - `/academics/<tab>/section/:sectionId`
  - Attendance/Grades go to:
    - `/academics/<tab>/:classSlug/:sectionSlug`

### Section roster (students)
- Route: `/academics/student-management/section/:sectionId`
- File: `SectionStudentsPage.jsx`
- Inputs:
  - Search: `search` *(input type="search")*
  - Payment filter: `paymentFilter` (buttons: `all|paid|unpaid|partial`)
  - Selection:
    - `selectedIds` (Set) + select-all checkbox with indeterminate state

Displayed columns:
- Student Name, Roll No, Attendance%, Hostel Status, Payment Status, Actions

### Time table (section)
- Route: `/academics/time-table/section/:sectionId`
- File: `SectionTimeTablePage.jsx`
- No editable inputs; renders a generated grid.

### Attendance log + marking
- Route: `/academics/attendance/:classSlug/:sectionSlug`
- File: `AttendanceLogPage.jsx`
- Two modes:
  - **Overview dashboard** (search, calendar, daily roll)
    - `searchQuery` *(search input)*
    - calendar day selection: `viewDate`, `selectedDay`
  - **Mark attendance** mode
    - `markSearchQuery` *(search input)*
    - Bulk action:
      - `bulkAction` *(select: all_present/all_absent/all_leave/all_sick)*
    - Per student:
      - status select (`present|absent|leave|sick`)
      - remark input (text)
    - Save dispatches `saveAttendanceMarks(...)` to academics slice

### Grades log
- Route: `/academics/grades/:classSlug/:sectionSlug`
- File: `GradesLogPage.jsx`
- Inputs:
  - Search: `searchQuery`
  - Filters: `gradeFilter` (`all|published|pending|atRisk`)
  - Pagination: `page`
  - Row selection:
    - `selectedIds` object + header checkbox with indeterminate

---

## 4.5 User Management (`/user-management`)
File: `UserManagementPage.jsx`
- Redux state: `users`, `templates`, `assignmentDraft`, `templateDraft`, `editingTemplateName`, `searchQuery`, `page`, `pageSize`
- Inputs:
  - Search: `searchQuery` *(search input)*
  - Status filter (popover chips): `statusFilter` local state (`all|Active|Pending|Inactive`)
  - Add user modal fields (`assignmentDraft.*`):
    - `name` *(text)*
    - `email` *(email)*
    - `role` *(select; `ROLE_OPTIONS`)*
    - `branch` *(select; `BRANCH_OPTIONS`)*
    - `template` *(select; derived from `templates`)*
  - Template editor fields (`templateDraft.*`):
    - `name` *(text)*
    - `description` *(text)*

---

## 4.6 Settings (`/settings`)
File: `SettingsPage.jsx`
- Redux state: `profile`, `alerts`, `institutionDefaults`
- Inputs:
  - Profile fields (dispatch `updateProfileField`):
    - `profile.fullName` *(text)*
    - `profile.email` *(text)*
    - `profile.designation` *(text)*
    - `profile.department` *(text)*
  - Alerts (dispatch `toggleAlert`):
    - `alerts.emailNotifications` *(toggle button)*
    - `alerts.smsAlerts` *(toggle button)*
- Institutional defaults displayed (not editable in UI):
  - `institutionDefaults.academicPeriod`
  - `institutionDefaults.branchIdentity`
  - `institutionDefaults.autoReplenish`

---

## 5. BUSINESS LOGIC NOTES (Current)

### Branch selection (cross-cutting)
- Stored at `sessionStorage.selectedBranch`
- `Sidebar` emits `branch:change` event
- Academics wizard pages can sync their own branch select to this value (example: `WizardSectionPage.jsx`)

### Redux “fetch” pattern
- Pages like Fee/Salary/OtherExpenses call `dispatch(fetchX())` on mount.
- This suggests mocked thunks returning seeded data rather than real network I/O.

### Exports / downloads
- Teachers directory: CSV export (Blob → object URL → download)
- Leave management: CSV export with BOM + safe filename

---

## 6. GAPS VS OLD REPORT (High-signal changes)

- **Redux Toolkit is now present** with a real `store` and multiple slices.
- **Admissions wizard field keys changed** (e.g. `presAddress`/`permAddress`, `feePlan`, `initialPayment`, doc keys like `birthCert`).
- **Finance module expanded** with a full-screen **Collect Fee** wizard and a richer finance overview filter UI.
- **Academics is deeper**: class/section explorer + roster pages + attendance mark flow + grades log flow.
- **Branch selector exists** but is currently **UI + sessionStorage** only (not connected to any data filtering yet).

---

## 7. Visual mental model (current)

```mermaid
flowchart LR
  subgraph Shell[App Shell]
    Sidebar[Sidebar\n- Collapse state (sessionStorage)\n- Branch picker (sessionStorage + event)]
    Navbar[Navbar\n- Top tabs per module\n- Theme toggle]
    Routes[Routes\nsrc/App.jsx]
  end

  subgraph State[State]
    Redux[Redux Store\nfees/salary/expenses/employees/academics/settings/userManagement]
    Local[Local component state\n(Admissions, Finance overview, CollectFee, roster search)]
    Storage[Storage\nlocalStorage: theme\nsessionStorage: selectedBranch, sidebarCollapsed]
  end

  Routes --> Admissions[/admission\nAdmissions wizard/]
  Routes --> Emp[/employees/*\nEmployees module/]
  Routes --> Fin[/financial-services/*\nFinance module/]
  Routes --> Acad[/academics/*\nAcademics module/]
  Routes --> UM[/user-management/]
  Routes --> Settings[/settings/]

  Admissions --> Local
  Fin --> Local
  Fin --> Redux
  Emp --> Redux
  Acad --> Redux
  UM --> Redux
  Settings --> Redux

  Sidebar --> Storage
  Navbar --> Storage
```

---

## 8. Immediate next upgrades (optional, based on current structure)
- **Unify “Branch”** into Redux `settings.institutionDefaults.branchIdentity` (single source of truth) and have modules filter by it.
- **Admissions Draft persistence**: implement “Save Draft” to localStorage/sessionStorage, since button exists.
- **FeeManagement “Class” filter** is currently UI-only; apply `classKey` inside `filteredFees` filtering.

