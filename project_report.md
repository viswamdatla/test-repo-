## Campus360Pro Frontend — Admin Dashboard Architecture Report

### 0. Scope and constraints
- **Scope**: Frontend only (this repository). Backend is separate and is not assumed beyond what is visible in UI code.
- **Method**: Reverse-engineered from routing, layouts, shared components, page-level modules, validation utilities, and mock data sources.
- **Key constraint**: Current app behavior is largely **mock-data driven** (local JSON + in-file mock objects) with **no network/API layer** observed.

---

## 1. PROJECT OVERVIEW

### Tech stack (evidence-based)
- **Framework**: **React 19**
- **Build tool**: **Vite**
- **Routing**: **React Router DOM v7** (`BrowserRouter`, nested routes with `Outlet`)
- **UI libraries**:
  - **MUI** (`@mui/material`, `@mui/icons-material`)
  - **MUI X Data Grid** (`@mui/x-data-grid`) used as the primary “enterprise table” base
  - **Lucide React** icons (`lucide-react`) used for sidebar + some page actions
- **Styling**:
  - **SCSS (Sass)** for app/page/component styles
  - MUI `sx` usage in some components (notably `DataTable` wrapper and certain pages)
- **Language**: **JavaScript / JSX** (no TypeScript project config detected)

### Architecture pattern
- **Component-based React application**
- **Domain-oriented pages** under `src/pages/` (Academics / FinancialServices / Employees / Admissions)
- Shared UI primitives and composites under `src/components/`
- No clear “services/API layer” abstraction currently; data is imported from `src/data/*.json` or defined as mock constants in modules.

### Routing system
- Central route table in `src/App.jsx`, nested under a single layout:
  - Root: `path="/" element={<PageLayout />}`
  - Children routes render inside `PageLayout`’s `<Outlet />`.

### State management approach
- **Local component state** (`useState`, `useMemo`, `useEffect`) dominates.
- **Context** only for **theme** (light/dark) and indirectly for **page title** via `Outlet` context.
- **No Redux/Zustand/Recoil/MobX/TanStack Query** usage detected.

### API handling approach
- **No API calls observed** (no `fetch`, no `axios` usage patterns in the analyzed surfaces).
- No `src/api`, `src/services`, interceptors, request middleware, or environment-based API base URL patterns observed.
- The app is currently a **UI shell** with mock datasets.

### Folder organization philosophy (observed)
- `src/pages/**`: domain modules aligned to an ERP taxonomy
- `src/components/**`: shared UI building blocks and shared composites (Navbar/Sidebar/Table/Popup/Tabs)
- `src/data/**`: mock JSON data sources
- `src/helpers/**`: configuration and common utilities (sidebar model, form validation)
- `src/theme/**`: theme provider + palette/typography definitions

---

## 2. COMPLETE FOLDER STRUCTURE BREAKDOWN

### Repository tree (high level)
```text
Campus360Pro_Frontend/
├─ README.md
├─ eslint.config.js
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ App.jsx
   ├─ main.jsx
   ├─ index.scss
   ├─ components/
   ├─ data/
   ├─ helpers/
   ├─ hooks/
   ├─ layout/
   ├─ pages/
   └─ theme/
```

### `src/` (recursive)
```text
src/
├─ App.jsx
├─ main.jsx
├─ index.scss
├─ components/
│  ├─ Avatar/
│  ├─ Card/
│  ├─ Chips/
│  ├─ Form/
│  │  ├─ Button/
│  │  ├─ Calender/
│  │  ├─ Input/
│  │  ├─ Select/
│  │  └─ TextArea/
│  ├─ Navbar/
│  ├─ Popup/
│  ├─ Sidebar/
│  ├─ Typography/
│  ├─ progressBar/
│  ├─ table/
│  │  ├─ columnRenderers.jsx
│  │  └─ index.jsx
│  └─ tabs/
├─ data/
│  ├─ administrationData.json
│  ├─ dashboard.json
│  ├─ feeManagement.json
│  ├─ operationalStaff.json
│  ├─ salaryManagement.json
│  └─ teachersData.json
├─ helpers/
│  ├─ sidebarItems.js
│  └─ validation.js
├─ hooks/
│  └─ usePageTitle.js
├─ layout/
│  └─ PageLayout/
│     └─ index.jsx
├─ pages/
│  ├─ Academics/
│  │  ├─ Attendance/
│  │  ├─ Grades/
│  │  └─ StudentManagement/
│  ├─ Admissions/
│  ├─ Dashboard/
│  ├─ Employees/
│  │  ├─ Administration/
│  │  ├─ OperationalStaff/
│  │  └─ Teachers/
│  ├─ FinancialServices/
│  │  ├─ FeeManagement/
│  │  ├─ SalaryManagement/
│  │  ├─ OtherExpenses/
│  │  └─ FinancialReports/
│  ├─ Home/
│  ├─ Settings/
│  └─ UserManagement/
└─ theme/
   ├─ AppThemeProvider.jsx
   ├─ index.js
   └─ theme.js
```

### Folder-by-folder responsibility map

### `src/`
- **Purpose**: app bootstrap, global wiring, and domain modules.
- **Key files**:
  - `main.jsx`: React root + router + theme provider.
  - `App.jsx`: route table (module registry).
  - `index.scss`: global styles.

### `src/layout/`
- **Purpose**: top-level layout(s) and composition of navigation + routed content.
- **Key file**:
  - `layout/PageLayout/index.jsx`: renders `Sidebar`, `Navbar`, and `Outlet`. Holds navbar title state.

### `src/components/`
- **Purpose**: shared UI blocks used across multiple modules.
- **Key subfolders**:
  - `Form/*`: Input/Select/TextArea/Button, used in most forms and popups.
  - `table/`: shared DataGrid wrapper with standardized edit/delete actions.
  - `Popup/`: shared modal/popup shell used by Admin/Fee/Salary forms.
  - `Sidebar/`, `Navbar/`, `tabs/`: navigation primitives.

### `src/pages/`
- **Purpose**: route-level screens grouped by domain (ERP modules).
- **Structure**: `pages/<Domain>/<Module>/index.jsx` plus local `components/` and SCSS.

### `src/data/`
- **Purpose**: mock data “backend” for UI.
- **Usage**: imported directly into modules; mutated in component state copies for edits/adds.

### `src/helpers/`
- **Purpose**: config + shared utilities.
- **Key files**:
  - `sidebarItems.js`: defines the sidebar navigation model.
  - `validation.js`: generic rule-based validation helper (`validateForm`).

### `src/hooks/`
- **Purpose**: shared React hooks.
- **Key file**:
  - `usePageTitle.js`: sets layout `navTitle` via `useOutletContext`.

### `src/theme/`
- **Purpose**: theming.
- **Key file**:
  - `AppThemeProvider.jsx`: MUI ThemeProvider + `CssBaseline`, toggles `body.dark`, persists `theme` in localStorage.

---

## 3. MODULE-LEVEL ANALYSIS (VERY IMPORTANT)

### System navigation model (modules list)
The sidebar and router align to these top-level modules:
- **Dashboard**
- **Admission**
- **Employees**
  - Teachers
  - Administration
  - Operational Staff
- **Financial Services**
  - Fee Management
  - Salary Management
  - Other Expenses (placeholder)
  - Financial Reports (placeholder)
- **Academics**
  - Student Management
  - Attendance
  - Grades
- **User Management** (placeholder)
- **Settings** (placeholder)

### Route table (module registry)
Defined in `src/App.jsx`:
- `/` → Dashboard
- `/home` → Home (demo/showcase)
- `/admission` → Admissions
- `/employees` → redirects to `/teachers`
- `/teachers` → Teachers
- `/administration` → Administration
- `/operational-staff` → Operational Staff
- `/fee-management` → Fee Management
- `/salary-management` → Salary Management
- `/other-expenses` → Other Expenses (placeholder)
- `/financial-reports` → Financial Reports (placeholder)
- `/student-management` → Student Management
- `/student-attendence` → Attendance
- `/student-grades` → Grades
- `/user-management` → User Management (placeholder)
- `/settings` → Settings (placeholder)

### Module: Admissions (`/admission`)
- **Pattern**: multi-step wizard
- **State**:
  - `currentStep` (1..7)
  - `formData` aggregate object merged per step
- **Steps**:
  - Step 1: Student Information
  - Step 2: Academic Information
  - Step 3: Guardian Information
  - Step 4: Address Information
  - Step 5: Fee & Documents
  - Step 6: Review & Submit
  - Step 7: Success
- **API calls**: none
- **Business logic**: validations + conditional UI + fee plan discount calculation (details in section 5)

### Module: Employees → Teachers (`/teachers`)
- **Data source**: `src/data/teachersData.json` seeded into local state
- **UI flow**:
  - Category cards → Teachers table → Teacher detail modal
  - Add/Edit opens `TeacherForm` modal
- **Search/filters**:
  - Search by name, employeeId, subjects, designation, department
  - Status filter
  - Designation filter
- **API calls**: none

### Module: Employees → Administration (`/administration`)
- **Data source**: `src/data/administrationData.json` seeded to local state
- **Key UI**:
  - Custom HTML table with row click → details modal
  - Add staff popup with validation
- **Validation**: uses shared `validateForm()` with declarative rules
- **API calls**: none

### Module: Employees → Operational Staff (`/operational-staff`)
- **Data source**: `src/data/operationalStaff.json` seeded to local state
- **UI**: category selection → staff list table → detail view + add form (module implemented at UI level)
- **API calls**: none

### Module: Financial Services → Fee Management (`/fee-management`)
- **Data source**: `src/data/feeManagement.json`
- **Tabs**: Overview / Students / Payments / Reports
- **Tables**:
  - Students (editable DataGrid)
  - Payments (editable DataGrid)
- **Popups/forms**:
  - Record Payment popup (validated via `validateForm`)
- **API calls**: none

### Module: Financial Services → Salary Management (`/salary-management`)
- **Data source**: `src/data/salaryManagement.json`
- **Tabs**: Employees / Advances / Reports / History
- **Popups/forms**:
  - Add Employee popup (validated via `validateForm`)
- **API calls**: none

### Module: Financial Services → Other Expenses (`/other-expenses`)
- **Status**: placeholder page

### Module: Financial Services → Financial Reports (`/financial-reports`)
- **Status**: placeholder page

### Module: Academics → Student Management (`/student-management`)
- **Data**: generated in-file (categories/classes/sections + student list generator)
- **UI flow**: category → class → section → student table → student detail popup
- **API calls**: none

### Module: Academics → Attendance (`/student-attendence`)
- **Data**: in-file mock dataset
- **Tabs**: Daily Marking / Reports / Calendar / Analytics
- **Actions**: Notifications, Export, Settings (UI-only)
- **API calls**: none

### Module: Academics → Grades (`/student-grades`)
- **Data**: in-file mock dataset
- **Tabs**: Dashboard / Schedule / Grades / Reports / Analytics
- **Actions**: Export Report (UI-only), Class selector (local state)
- **API calls**: none

### Module: User Management (`/user-management`)
- **Status**: placeholder page

### Module: Settings (`/settings`)
- **Status**: placeholder page; theme toggle currently lives in Navbar (not here).

### Non-module: Home (`/home`)
- **Purpose**: appears to be a component showcase/demo screen (not part of sidebar modules).

---

## 4. SCREEN-BY-SCREEN UI BREAKDOWN (high-signal screens)

### Global shell: `PageLayout`
- **Composition**:
  - Left: `Sidebar`
  - Top: `Navbar`
  - Main: routed content via `Outlet`
- **Cross-cutting UI state**:
  - `navTitle` stored in layout state, passed to `Navbar`
  - Pages call `usePageTitle("...")` to set it via `useOutletContext`.

### Admissions wizard screens

### Step 1 — Student Information
- **Purpose**: capture student basic identity and academic year.
- **Fields**:
  - First Name* (text)
  - Last Name* (text)
  - Gender* (select)
  - Date of Birth* (date)
  - Blood Group (select)
  - Religion (text)
  - Nationality (select)
  - Previous School (text)
  - Academic Year (select)
- **Actions**: Next
- **Validation**:
  - required: firstName, lastName, gender, dob
  - DOB age must be 3–18
- **Data transformation**:
  - derives `fullName`

### Step 2 — Academic Information
- **Fields**:
  - Class Applied For* (select)
  - Section Preference (select)
  - Medium of Instruction (select)
  - Previous Class/Grade (text)
  - Previous School Final Grade/Percentage (text; numeric validation if provided)
  - Transfer Certificate Number (text)
- **Actions**: Previous, Next

### Step 3 — Guardian Information
- **Fields**:
  - Father’s: Name, Occupation, Phone, Email
  - Mother’s: Name, Occupation, Phone, Email
  - Parents Annual Income (select)* (required)
  - Emergency Contact: Name, Phone, Relationship
- **Actions**: Previous, Next
- **Validation**:
  - Must fill either Father group or Mother group (at least one)
  - If a group is present: name + phone required; phone must be 10 digits
  - Email validated if provided
  - Emergency phone validated if provided

### Step 4 — Address Information
- **Present Address**:
  - Present Address* (textarea)
  - City* (text)
  - State (select)
  - PIN Code* (6-digit pattern validation)
- **Permanent Address**:
  - “Same as present address” checkbox
  - If not same: Permanent Address/City/State/PIN Code required with PIN validation
- **Transport Information**:
  - Transport Required* (radio: Yes/No)
  - If Yes:
    - Pickup Point* (text)
    - Drop Point* (text) OR “Same as pickup point”
- **Actions**: Previous, Next

### Step 5 — Fee & Documents
- **Fee plan** (radio):
  - Tuition Only
  - Tuition + Transport
  - Tuition + Hostel
  - Selecting a plan sets default `initialPaymentAmount` from a plan map.
- **Document checklist** (checkbox + file input for each):
  - Birth Certificate
  - Previous School Report
  - Address Proof
  - Transfer Certificate
  - Passport Photos
  - Medical Certificate
  - Upload captures file metadata `{ name, size }` only.
- **Payment**:
  - Initial Payment Amount (required numeric > 0)
  - Payment Method* (radio)
- **Discount**:
  - Apply Discount (checkbox)
  - Discount Type (percentage or fixed amount)
  - Discount Value
  - Computes `totalAmount` with floor at 0.
- **Actions**: Previous, Next

### Step 6 — Review & Submit
- **Tabbed review**: Student / Academic / Guardian / Address / Fee & Docs
- **Terms gating**:
  - Submit disabled until user checks “I confirm all provided information is accurate.”
- **Actions**: Previous, Submit

### Step 7 — Success
- **Purpose**: displays completion and offers “New Application”.

### Teachers screen
- **Purpose**: staff management for teachers.
- **Top area**:
  - Add Teacher button
  - KPI cards (computed)
  - Search bar + status/designation dropdowns
- **Main body**:
  - If no category selected: category hero card + category list
  - If category selected: teachers table
- **Modals**:
  - Teacher detail modal (view)
  - Teacher add/edit form modal

### Teacher form modal (Add/Edit)
- **Personal**: Name*, Employee ID*, Gender, DOB, Email*, Phone, Address
- **Professional**: Teacher Level*, Experience, Qualification, Department, Designation, Salary, Status, Join Date, Work Hours
- **Lists**: Subjects (select list), Classes Assigned (free text list), Previous Schools (free text list)
- **Emergency**: Emergency Contact*, Relation*
- **Validation**:
  - required: name, employeeId, email, teacherLevel, emergencyContact, emergencyRelation
  - email format
  - phone numeric 10-digit when provided
  - experience 0..50, salary >= 0
  - DOB and joinDate cannot be in the future

### Administration screen
- **Purpose**: manage administrative staff list.
- **Table columns**:
  - ID, Name, Position, Department, Contact, Status
- **Interactions**:
  - Row click opens staff detail modal
  - Add Staff opens popup form
- **Add staff fields**:
  - Full Name*, Position*, Department*, Phone Number* (10 digits), Email* (regex), Status*

### Fee Management screen
- **Top**:
  - Record Payment button (popup)
  - Summary metric cards with per-card select
- **Tabs**: Overview / Students / Payments / Reports
- **Students tab**:
  - Filters: search, grade, section, status (applies via Search button)
  - Editable DataGrid columns: studentId(link), name, grade, totalFee, paid, balance, totalDiscount, status(chip), lastPayment
  - Row actions: Edit/Save/Cancel/Delete
  - Note: student link is generated as `/student-management/<slug>` but no matching route currently exists.
- **Payments tab**:
  - Editable DataGrid columns: student(link), feeType, amount, date, status(chip), transactionId

### Salary Management screen
- **Top**:
  - Add Employee popup
  - KPI cards, month selectors
- **Tabs**: Employees / Advances / Reports / History
- **Add Employee fields**:
  - Full Name*, Employee ID*, Designation*, Department*, Basic Salary* (>0)

### Student Management screen
- **Purpose**: browse student lists by hierarchy.
- **Flow**:
  - Category cards → class cards → section cards → student list → student detail popup
- **Student object shape used**:
  - roll, name, guardian, phone, status, attendance, feeStatus, className, section

### Attendance screen
- **Purpose**: attendance dashboard shell
- **Tabs**: Daily Marking / Reports / Calendar View / Analytics
- **Data**: mock only
- **Actions**: Notifications / Export / Settings (UI only)

### Grades screen
- **Purpose**: exam & grade management dashboard shell
- **Tabs**: Dashboard / Schedule / Grades / Reports / Analytics
- **Data**: mock only
- **Actions**: class dropdown + Export Report

---

## 5. BUSINESS LOGIC ANALYSIS (frontend-only)

### Shared generic validation helper (`validateForm`)
- Validates a flat values object against declarative rules:
  - required checks (including trimmed string emptiness)
  - optional per-field validation callback `(value, allValues) => string | null`
- Used in:
  - Administration “Add Staff”
  - Fee Management “Record Payment”
  - Salary Management “Add Employee”

### Admissions-specific business logic
- **Student age rule**: DOB must result in age between 3 and 18 (inclusive).
- **Guardian rule**: must provide either Father’s or Mother’s details (at least one group).
- **PIN validation**: 6-digit Indian PIN pattern used.
- **Address mirroring**:
  - “Same as present address” copies present address values → permanent and disables permanent fields.
- **Transport conditionality**:
  - Transport Required = Yes triggers pickup/drop fields; “Same as pickup” disables drop field.
- **Fee computation**:
  - Plan sets base amount; discount reduces it by percentage or fixed; total floored at 0.
- **Submission gating**:
  - Review step requires terms accepted to enable submit.
- **Workflow note**:
  - UI displays “Changes after submission require approval,” but no approval workflow is implemented in frontend.

### Teachers-specific business logic
- **Category → teacher assignment heuristic**:
  - Attempts to map teachers based on classes assigned and sections; fallback mapping uses subject set membership.
- **KPI computation**:
  - totalTeachers, activeStaff (active + on_duty), leadership count (designation contains “Head” or “Principal”), avgSalary.
- **Form submission augmentation**:
  - Adds derived flags: `isActiveToday`, `onDuty`
  - Adds defaults like leaveBalance, lastAttendance, performanceRating
  - Generates ID using timestamp for new teachers

### Fee Management table business logic
- **Inline edit normalization**:
  - status → statusScheme for chip rendering.
- **Student link slugging**:
  - When studentId changes, it creates a slug and sets `studentLink = /student-management/<slug|id>`.
  - This is currently **not routable** because `App.jsx` has no param route.

### Attendance and Grades
- Primarily presentation of mock datasets; no persistence, no calculated workflows beyond displayed summary values.

---

## 6. USER ROLES & PERMISSIONS (FRONTEND)

### What exists
- Theme mode persistence (light/dark) in localStorage.
- Some domain data fields labelled “role” (e.g., operational staff job role) but not used for authorization.

### What is missing (explicit)
- **Authentication**: no login/logout, no token storage, no refresh strategy, no session timeout handling.
- **Route protection**: no protected routes, no “RequireAuth”, no redirect-to-login.
- **RBAC/permissions**: no permission model and no UI hiding/showing based on roles.
- **Menu filtering**: sidebar is static, not role-aware.

---

## 7. STUDENT DATA HANDLING

### Sources
- **Academics → Student Management**: generated mock students in-module (no JSON import).
- **Finance → Fee Management**: student fee rows from `feeManagement.json`.

### Storage pattern
- Stored in **page-local component state**:
  - StudentManagement uses `useMemo` to derive lists from selection state.
  - FeeManagement Students tab stores rows in state and mutates them via inline edit/delete.

### Display pattern
- Hierarchical navigation (category/class/section) in Student Management.
- Tabular display (MUI DataGrid) in Fee Management Students tab.

### Filters/search
- Fee Management Students tab includes search by name/ID plus grade/section/status selects.
- Student Management navigation is based on hierarchy selection; no global search observed at entry module level.

### Student profile structure (frontend)
- Student objects include:
  - identity: `id`, `roll`, `name`
  - guardian + phone
  - academic placement: className, section
  - indicators: attendance %, feeStatus, status

---

## 8. ACADEMICS MODULE DEEP ANALYSIS

### Student Management
- **Implemented**:
  - Hierarchy drilldown cards
  - Students list + detail popup
- **Missing to be ERP-complete**:
  - Student CRUD (add/edit/archive)
  - Real student profile route (e.g., `/student-management/:studentId`)
  - Promotion, class change workflows
  - Integration with fees/attendance/grades as single student profile

### Attendance
- **Implemented**:
  - Tabbed UX shell with plausible datasets
  - KPIs + daily list presentation
- **Missing**:
  - Marking attendance persistence
  - Class/section picker and date selector tied to real data
  - Exports wired to real report generation

### Grades
- **Implemented**:
  - Tabbed exam & grade UX shell
  - Mock schedule and grade distribution visualization scaffolding
- **Missing**:
  - Exam creation workflow
  - Marks entry forms + validation + publishing flow
  - Grading rules configuration
  - Student-level result pages and exports wired to real data

### Timetable, subjects, teacher-class allocations
- Not implemented as dedicated modules; only implied in mock schedule data.

---

## 9. FINANCE MODULE ANALYSIS

### Fee Management (most mature finance UI)
- **Strengths**:
  - Students ledger-style table (total/paid/balance/discount/status)
  - Payments list table with transaction IDs
  - Record Payment popup with validation including discount constraints
- **Missing to be ERP-complete**:
  - Fee structure configuration (by class/section/category)
  - Installments, due dates, late fee computation
  - Receipt/invoice generation and print/download flows
  - Payment gateway integration
  - Cross-linking to a real student profile route

### Salary Management
- **Strengths**:
  - KPI scaffolding and tabbed layout
  - Add Employee form with validation
- **Missing**:
  - Payroll run processing, deductions/allowances
  - Payslip generation
  - Approval flows and exports
  - Real data integration

### Other Expenses / Financial Reports
- Placeholders only.

---

## 10. GAP ANALYSIS (CRITICAL)

### Missing major ERP modules (typical)
- **Auth + RBAC** (Admin/Principal/Teacher/Accountant/etc.)
- **Student lifecycle** end-to-end: admissions → enrollment → profile → promotion/TC
- **Academics**: timetable, subjects, teacher allocations, exam/marks workflows
- **Finance**: fee structures, invoicing/receipts, expenses, reporting
- **HR**: staff attendance, leave management, payroll processing
- **Communication**: notifications, circulars, email/SMS integration
- **Reporting**: downloadable reports across modules

### Structural/scalability issues visible now
- **No API layer**: all state is local; no standardized loading/error flows.
- **No server-state management**: no caching/invalidation/mutation patterns.
- **Inconsistent table patterns**: mix of custom HTML tables and DataGrid-based tables.
- **Routing mismatch**: Fee student links target a route that doesn’t exist.
- **Placeholders**: User Management, Settings, Other Expenses, Financial Reports.

---

## 11. IMPROVEMENT SUGGESTIONS

### Architecture improvements (recommended target shape)
- Add an API boundary:
  - `src/api/` (client, interceptors, base URL, auth headers, error mapping)
  - `src/services/` (domain services: students/fees/payroll)
- Consider `src/features/` (feature-first structure):
  - Each feature owns its pages/components/hooks/queries.
- Centralize route definitions:
  - route constants + sidebar items derived from the same source to prevent drift.

### State & data improvements
- Adopt server-state library:
  - **TanStack Query** for fetching/caching/mutations (recommended for React Router + Vite apps).
- Keep UI state local, but unify form state patterns (validation, field errors, submission flow).

### Routing improvements
- Add student detail route:
  - `/student-management/:studentId` and make Fee module links resolve.
- Add NotFound route and error boundaries once API integration begins.

### UI consistency
- Standardize list screens:
  - Prefer `DataTable` wrapper for all modules to unify editing, delete, pagination.
- Extract common popup patterns:
  - Header, footer actions, validation wiring, and form grid layout.

### UX improvements
- Provide filter reset, empty states, and skeleton loading states.
- Convert placeholders into real screens or remove until ready to reduce navigation noise.

---

## 12. FINAL SUMMARY

### Overall maturity level
- **UI scaffolding**: medium
- **End-to-end system readiness**: low (mock-only; no auth/API persistence)

### Estimated ERP completeness (frontend)
- Approximately **25–35%** of expected admin-dashboard UI surfaces exist, but most are **not wired to real workflows**.

### Recommended next priorities
- **P0**: Authentication + RBAC + route protection
- **P0**: API layer + environment configuration + error/loading patterns
- **P1**: Implement `/student-management/:id` and unify student profile cross-module linking
- **P1**: Build out placeholders (User Management, Settings, Expenses, Reports) as real modules
- **P2**: Normalize tables/forms/validation into reusable patterns

---

## Visual mental model: modules + data flow (current state)

```mermaid
flowchart LR
  subgraph Shell[App Shell]
    Sidebar[Sidebar: SIDEBAR_ITEMS]
    Navbar[Navbar: navTitle + theme toggle]
    Router[Routes: src/App.jsx]
  end

  subgraph Data[Current data sources]
    MockJSON[src/data/*.json]
    InlineMocks[In-file mock objects]
  end

  Router --> Dashboard[Dashboard]
  Router --> Admissions[Admissions Wizard]
  Router --> Teachers[Employees: Teachers]
  Router --> AdminStaff[Employees: Administration]
  Router --> OpsStaff[Employees: Operational Staff]
  Router --> FeeMgmt[Finance: Fee Management]
  Router --> SalaryMgmt[Finance: Salary Management]
  Router --> StudentMgmt[Academics: Student Management]
  Router --> Attendance[Academics: Attendance]
  Router --> Grades[Academics: Grades]
  Router --> Settings[Settings (placeholder)]
  Router --> UserMgmt[User Management (placeholder)]

  Dashboard --> MockJSON
  Teachers --> MockJSON
  AdminStaff --> MockJSON
  OpsStaff --> MockJSON
  FeeMgmt --> MockJSON
  SalaryMgmt --> MockJSON

  StudentMgmt --> InlineMocks
  Attendance --> InlineMocks
  Grades --> InlineMocks

  FeeMgmt -. "builds links to /student-management/:id (route missing)" .-> StudentMgmt
```