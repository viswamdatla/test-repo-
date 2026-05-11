# Campus360Pro Frontend — Implementation Status (UI Inventory)

> **Scope**: Frontend UI only (this repo).  
> **Constraints followed**: No code changes suggested, no backend/schema designed.  
> **Routing source of truth**: `src/App.jsx`.  
> **Aux reference**: `Campus360Pro-Frontend-Architecture-Report.md`.

---

## Global shell / navigation (applies to most screens)

### `PageLayout`
- **File**: `src/layout/PageLayout/index.jsx`
- **Purpose**: App shell wrapper (Sidebar + Navbar + routed content).
- **Special**: Hides Sidebar/Navbar for `'/financial-services/collect-fee'` (fullscreen flow).

### `Sidebar`
- **File**: `src/components/Sidebar/index.jsx`
- **Purpose**: Primary navigation + branch picker + collapse.
- **Interactive elements**
  - **Collapse**
    - **Button**: icon `menu`
    - **Action**: toggles collapsed state; persists `sessionStorage.sidebarCollapsed` (`'1'` / `'0'`)
  - **Nav links**
    - Dashboard → `/`
    - Admission → `/admission`
    - Employees → `/employees/teachers`
    - Financial Services → `/financial-services`
    - Academics → `/academics`
    - User Management → `/user-management`
    - Settings → `/settings`
  - **Branch selector**
    - **Button**: current branch label + chevron
    - **Popup menu**: branch options from `BRANCHES = ['Darga','Main Campus','North Block']`
    - **Action**: saves `sessionStorage.selectedBranch`, dispatches `CustomEvent('branch:change', { detail: branchName })`

### Top tabs (rendered by navbar depending on route)
- **Employees tabs**
  - **File**: `src/pages/Employees/EmployeesTopTabs.jsx`
  - **Tabs**: Dashboard, Teachers, Administration, Operational Staff, Leaves
- **Academics tabs**
  - **File**: `src/pages/Academics/AcademicsTopTabs.jsx`
  - **Tabs**: Student Dashboard, Time Table, Attendance, Grades
- **Financial services tabs**
  - **File**: `src/pages/FinancialServices/FinancialTopTabs.jsx`
  - **Tabs**: Dashboard, Fee Management, Salary Management, Other expenses

---

## 1) Screens / Routes (from `src/App.jsx`)

- **`/` (Dashboard)**: `src/pages/Dashboard/index.jsx`
- **`/admission` (Admissions Directory)**: `src/pages/AdmissionsDirectory/index.jsx`
- **`/admission/new` (Admission wizard)**: `src/pages/Admission/index.jsx`
- **`/employees/*`**
  - Layout wrapper: `src/pages/Employees/EmployeesLayout.jsx`
  - `/employees/dashboard`: `src/pages/Employees/EmployeesDashboard.jsx`
  - `/employees/teachers`: `src/pages/Employees/TeachersDirectory.jsx` → `src/pages/Employees/EmployeesDirectoryView.jsx`
  - `/employees/teachers/onboarding`: `src/pages/Employees/TeacherOnboardingPage.jsx` → `src/pages/Employees/onboarding/TeacherOnboardingWizard.jsx`
  - `/employees/administration`: `src/pages/Employees/AdministrationDirectory.jsx` → `src/pages/Employees/EmployeesDirectoryView.jsx`
  - `/employees/operational-staff`: `src/pages/Employees/OperationalStaffDirectory.jsx` → `src/pages/Employees/EmployeesDirectoryView.jsx`
  - `/employees/leave-management`: `src/pages/Employees/LeaveManagementPage.jsx`
  - `/employees/leave-management/new`: `src/pages/Employees/LeaveApplicationPage.jsx`
  - `/employees/profile/:section/:employeeId`: `src/pages/Employees/EmployeeDetailPage.jsx`
- **`/financial-services/*`**
  - Layout wrapper: `src/pages/FinancialServices/FinancialServicesLayout.jsx`
  - `/financial-services` (Overview): `src/pages/FinancialServices/FinancialServicesOverview.jsx`
  - `/financial-services/collect-fee`: `src/pages/FinancialServices/CollectFeeFlowPage.jsx`
  - `/financial-services/fee-management`: `src/pages/FinancialServices/FeeManagement.jsx`
  - `/financial-services/salary-management`: `src/pages/FinancialServices/SalaryManagement.jsx`
  - `/financial-services/other-expenses`: `src/pages/FinancialServices/OtherExpenses.jsx`
- **`/academics/*`**
  - Layout wrapper: `src/pages/Academics/AcademicsLayout.jsx`
  - `/academics/student-management`: `src/pages/Academics/AcademicsModernPage.jsx` (`pageKey="studentManagement"`)
  - `/academics/student-management/section/:sectionId`: `src/pages/Academics/SectionStudentsPage.jsx`
  - `/academics/student-management/section/:sectionId/student/:studentId`: `src/pages/Academics/studentManagement/StudentManagementStudentDetailPage.jsx`
  - `/academics/time-table`: `src/pages/Academics/AcademicsModernPage.jsx` (`pageKey="timeTable"`)
  - `/academics/time-table/section/:sectionId`: `src/pages/Academics/SectionTimeTablePage.jsx`
  - `/academics/attendance` (keyed outlet): `src/pages/Academics/AcademicsKeyedOutlet.jsx`
  - `/academics/attendance` (index): `src/pages/Academics/AcademicsModernPage.jsx` (`pageKey="attendance"`)
  - `/academics/attendance/:classSlug/:sectionSlug`: `src/pages/Academics/AttendanceLogPage.jsx`
  - `/academics/grades` (keyed outlet): `src/pages/Academics/AcademicsKeyedOutlet.jsx`
  - `/academics/grades` (index): `src/pages/Academics/AcademicsModernPage.jsx` (`pageKey="grades"`)
  - `/academics/grades/:classSlug/:sectionSlug`: `src/pages/Academics/GradesLogPage.jsx`
  - `/academics/grades/:classSlug/:sectionSlug/student/:studentSlug`: `src/pages/Academics/StudentGradesDetailPage.jsx`
- **`/user-management`**: `src/pages/UserManagement/UserManagementPage.jsx`
- **`/settings`**: `src/pages/Settings/SettingsPage.jsx`

---

## 2) Screen-by-screen implementation inventory

### Dashboard (`/`)
- **File**: `src/pages/Dashboard/index.jsx`
- **Purpose**: KPI overview + financial snapshots + recent activity + events.
- **Sub-screens / conditional views**
  - **Event details modal** (conditional on `activeEvent`; closes on Escape).
- **Filters / menus**
  - **Pending fees term chip** (custom dropdown via button+menu)
    - **Type**: menu
    - **Data**: string (`all|term1|term2|term3`)
  - **Monthly collection month chip**
    - **Type**: menu
    - **Data**: string (`may|apr|mar|feb`)
  - **Financial overview term chip**
    - **Type**: menu
    - **Data**: string (`all|term1|term2|term3`)
- **Buttons / links**
  - KPI chip buttons open/close menus and set selection.
  - Upcoming event cards: action buttons open modal.
  - Modal: close icon + Close button.
- **Tables / lists**
  - Recent activities (list)
  - Recent collections (list)
  - Upcoming events (cards list)

---

### Admissions Directory (`/admission`)
- **File**: `src/pages/AdmissionsDirectory/index.jsx`
- **Purpose**: Admissions KPI dashboard + student directory.
- **Filters**
  - KPI cards (buttons) set `activeKpi`:
    - Total Applications / Pending Review / Saved Drafts / Successfully Enrolled
- **Buttons / links**
  - **Add Student** (Link) → `/admission/new`
  - Toolbar buttons: **Filter**, **Export CSV** (present; no handlers in file)
  - Filter summary **Show all** button (resets KPI)
  - Row action:
    - placeholder row: **Continue** (Link → `/admission/new`)
    - normal row: **View Details** (button; no handler)
- **Table**
  - **Columns**
    - Application ID (string)
    - Student Name (string)
    - Applied Grade (string)
    - Submission Date (string/date label)
    - Current Stage (string; pill)
    - Action (link/button)
- **Pagination**
  - Prev / page numbers / Next (static/mostly disabled in current component)

---

### Admission Wizard (`/admission/new`)
- **File**: `src/pages/Admission/index.jsx`
- **Purpose**: Stepper-based admission form with Save Draft.
- **Sub-screens (Stepper steps)**
  1. Student Info — `src/pages/Admission/components/Step1Student.jsx`
  2. Academic — `src/pages/Admission/components/Step2Academic.jsx`
  3. Guardian — `src/pages/Admission/components/Step3Guardian.jsx`
  4. Address & Transport — `src/pages/Admission/components/Step4Address.jsx`
  5. Documents — `src/pages/Admission/components/Step6Documents.jsx`
  6. Fee & Payment — `src/pages/Admission/components/StepPayment.jsx`
  7. Review — `src/pages/Admission/components/Step7Review.jsx`
  8. Success — `src/pages/Admission/components/SuccessView.jsx`
- **Other interactive**
  - Stepper buttons allow direct navigation to any step.
- **Save Draft**
  - **Utility**: `src/utils/admissionDraftStorage.js`
  - **Storage**: `localStorage['campus360-admission-draft-v1']`
  - **Behavior**: Files are serialized to `{__draftFile:true,name,size}`.

#### Step 1 — Student Information
- **File**: `src/pages/Admission/components/Step1Student.jsx`
- **Inputs**
  - First Name* — text; string; required
  - Last Name* — text; string; required
  - Gender* — select; string; required (Male/Female/Other)
  - Blood Group — select; string; optional
  - Nationality — select; string; optional (default India)
  - Academic Year — select; string; optional
  - Date of Birth* — date; string; required
  - Religion — text; string; optional
  - Previous School — text; string; optional
- **Buttons**
  - Save Draft
  - Next

#### Step 2 — Academic Information
- **File**: `src/pages/Admission/components/Step2Academic.jsx`
- **Inputs**
  - Class Applied For* — select; string; required (Nursery..10th Grade)
  - Medium of Instruction — select; string; optional
  - Previous Class/Grade — text; string; optional
  - Final Grade / Percentage — text; string; optional
  - Section Preference — select; string; optional
  - Transfer Certificate Number — text; string; optional
- **Buttons**
  - Back
  - Save Draft
  - Next

#### Step 3 — Guardian Information
- **File**: `src/pages/Admission/components/Step3Guardian.jsx`
- **Inputs**
  - Father
    - Name* — text; string; required
    - Occupation — text; string; optional
    - Phone* — tel; string; required
    - Email — email; string; optional
  - Mother
    - Name* — text; string; required
    - Occupation — text; string; optional
    - Phone* — tel; string; required
    - Email — email; string; optional
  - Income
    - Parents Annual Income — number; number; optional
    - Income Bracket (in lakhs)* — select; string; required (values `"1"`..`"6"`)
  - Emergency Contact
    - Name — text; string; optional
    - Phone — tel; string; optional
    - Relationship — text; string; optional
- **Buttons**
  - Back
  - Save Draft
  - Next

#### Step 4 — Address & Transport
- **File**: `src/pages/Admission/components/Step4Address.jsx`
- **Inputs**
  - Present Address
    - Address Line* — textarea; string; required
    - City* — text; string; required
    - State* — select; string; required
    - PIN Code* — text; string; required
  - Permanent Address
    - Same as present address — checkbox; boolean; optional (default true)
    - If unchecked:
      - Address Line* — textarea; string; required
      - City* — text; string; required
      - State* — select; string; required
      - PIN Code* — text; string; required
  - Transport Information
    - Transport Required* — radio; string; required (`yes|no`)
    - If yes:
      - Bus Route Number* — select; string; required
      - Pickup / Drop Point* — select; string; required (disabled until route chosen)
- **Buttons**
  - Back
  - Save Draft
  - Next

#### Step 5 — Document Checklist
- **File**: `src/pages/Admission/components/Step6Documents.jsx`
- **Inputs (File uploads)**
  - Birth Certificate* — file; File/null
  - Report Card* — file; File/null
  - Address Proof* — file; File/null
  - Transfer Certificate (TC) — file; File/null
  - Student Photos (3)* — file; File/null
  - Medical Certificate — file; File/null
- **Buttons**
  - Back
  - Save Draft
  - Next

#### Step 6 — Fee & Payment
- **File**: `src/pages/Admission/components/StepPayment.jsx`
- **Inputs**
  - Fee Plan — radio cards; string; optional (Standard/Commute/Residential)
  - Amount to pay now — number; number/string; optional (blank = full payable)
  - Payment method — method-card grid (buttons); string; required-by-flow; default `cash`
  - Enable split payment — switch; boolean; optional
  - If split enabled:
    - Amount via primary method — number; number; optional
    - Second method — select; string; required in split mode
    - Remaining (2nd method) — readonly; computed number
  - Remarks — textarea; string; optional; maxLength 200
  - Sidebar Payment Info:
    - Initial Payment Amount (₹)* — number; number/string; required indicator shown
    - Admission Fee (₹)* — number; number/string; required indicator shown
    - Apply Discount — toggle; boolean; optional
    - Discount Amount (₹) — number; number/string; optional (conditional)
- **Buttons**
  - Back
  - Save Draft
  - Next

#### Step 7 — Review
- **File**: `src/pages/Admission/components/Step7Review.jsx`
- **Inputs**: none (read-only review)
- **Buttons**
  - Back
  - Save Draft
  - Confirm & Submit

#### Step 8 — Success
- **File**: `src/pages/Admission/components/SuccessView.jsx`
- **Buttons**
  - View Application Status → `/applications` (note: route not declared in `src/App.jsx`)
  - Return to Dashboard → `/`

---

### Employees (`/employees/*`)

#### Employees Dashboard (`/employees/dashboard`)
- **File**: `src/pages/Employees/EmployeesDashboard.jsx`
- **Purpose**: Overview KPI cards.
- **Inputs / modals / tables**: none in this component.

#### Employees Directories (Teachers / Administration / Operational)
- Teachers route: `src/pages/Employees/TeachersDirectory.jsx`
- Administration route: `src/pages/Employees/AdministrationDirectory.jsx`
- Operational route: `src/pages/Employees/OperationalStaffDirectory.jsx`
- Shared implementation: `src/pages/Employees/EmployeesDirectoryView.jsx`

##### EmployeesDirectoryView (shared)
- **Purpose**: Directory listing with search, filters, KPI tiles, pagination.
- **Filters**
  - Department pill strip (buttons, `role="tab"`)
  - Search input (string)
  - Advanced filters popover (status):
    - All statuses / Active / On Leave / Inactive
- **Buttons**
  - Header CTA:
    - Teachers: Add Teacher → `/employees/teachers/onboarding`
    - Admin/Operational: Add Staff Member → `/admission` (placeholder)
  - KPI tiles (buttons) set status filter
  - Pagination buttons
- **Tables**
  - Teachers columns: Teacher, Role, Category, Department, Contact Info, Status
  - Administration columns: Staff Member, Role, Department, Contact Info, Status
  - Operational columns: Name, Role, Shift Time, Contact, Status
  - Rows are clickable and open Employee Detail:
    - `/employees/profile/:section/:employeeId`

#### Employee Detail (`/employees/profile/:section/:employeeId`)
- **File**: `src/pages/Employees/EmployeeDetailPage.jsx`
- **Purpose**: Employee profile view (loading/not-found/normal states).
- **Filters**: date range selector with From/To when custom (present in component).
- **Buttons**: Back (navigate(-1)) etc.

#### Leave Management (`/employees/leave-management`)
- **File**: `src/pages/Employees/LeaveManagementPage.jsx`
- **Purpose**: Leave request registry with KPI filters and date filtering.
- **Inputs**
  - Range preset dropdown (menu): 1 Day / 1 Week / 1 Month / Custom
  - If custom: From date, To date
- **Buttons**
  - Export Report (CSV)
  - New Leave Application → `/employees/leave-management/new`
  - Table row buttons for pending: Approve / Reject
- **Table**
  - Columns: Staff Name, Leave Type, Duration, Status, Actions

#### New Leave Application (`/employees/leave-management/new`)
- **File**: `src/pages/Employees/LeaveApplicationPage.jsx`
- **Inputs**
  - Leave Type — select; string
  - Start Date — date; string
  - End Date — date; string
  - Reason — textarea; string
  - Attachments — file; FileList; multiple
  - Total Days — computed display
- **Buttons**
  - Cancel (navigates back)
  - Submit Application (submit; no backend action in component)
  - Dropzone button (opens file picker; drag/drop supported)

#### Teacher Onboarding (`/employees/teachers/onboarding`)
- **Entry**: `src/pages/Employees/TeacherOnboardingPage.jsx`
- **Wizard**: `src/pages/Employees/onboarding/TeacherOnboardingWizard.jsx`
- **Steps**
  1. Personal Info
  2. Professional Info
  3. Documents
  4. Review
- **Inputs**
  - Step 1:
    - Full Name* (text)
    - Employee ID* (text)
    - Date of Birth (date)
    - Gender (radio: male/female)
    - Email Address* (email)
    - Phone Number (tel)
    - Residential Address (textarea)
  - Step 2:
    - Teacher Level* (required)
    - Experience Years
    - Qualification
    - Department
    - Designation
    - Salary
    - Status (Active/Inactive)
    - Join Date
    - Work hours start/end
    - Subjects (picker + add; removable chips)
    - Classes (input + add; removable chips)
    - Previous schools (input + add; removable list)
  - Step 3:
    - Profile photo (file, image)
    - ID proof (file)
    - Certificates (file, multiple)
  - Step 4:
    - Review (no new inputs; edit/jump actions)
- **Buttons**
  - Continue / Back
  - Save Draft (stores `sessionStorage.teacherOnboardingDraft`)
  - Save & Exit / Close (return to teachers directory)

---

### Financial Services (`/financial-services/*`)

#### Finance Overview (`/financial-services`)
- **File**: `src/pages/FinancialServices/FinancialServicesOverview.jsx`
- **Purpose**: Summary metrics + recent transactions + filters.
- **Inputs**
  - Search transactions — search; string
  - Date preset — dropdown/menu; preset object
  - Type filter — dropdown/menu; filter object
- **Buttons / links**
  - Collect Fee / Record New Payment → `/financial-services/collect-fee`
- **Table**
  - Recent Transactions table includes: date/time, transaction, category, reference, amount, status, action.

#### Collect Fee Flow (`/financial-services/collect-fee`) (fullscreen)
- **File**: `src/pages/FinancialServices/CollectFeeFlowPage.jsx`
- **Purpose**: Wizard to select student, fee lines, and record payment with partial/split support; includes printable receipt.
- **Steps**
  1. Class & student
  2. Fee lines
  3. Payment
  - Completion: success screen + printable receipt
- **Inputs**
  - Class selection tiles (buttons)
  - Section pills (buttons)
  - Student search (search input)
  - Fee line checkboxes
  - Discount amount (number)
  - Pay now amount (number)
  - Payment method (method grid buttons)
  - Split payment toggle (switch)
  - Split primary amount (number)
  - Second method (select)
  - Notes + Remarks (textareas)
- **Buttons**
  - Back (navigate(-1))
  - Step navigation (continue/back)
  - Complete payment
  - Print receipt
  - Reset flow / links back to dashboards
- **Receipt table**
  - Columns: Description, Unit Price, Total

#### Fee Management (`/financial-services/fee-management`)
- **File**: `src/pages/FinancialServices/FeeManagement.jsx`
- **Inputs**
  - Search (search input)
  - Date preset dropdown
  - Class dropdown
  - Status dropdown
- **Buttons**
  - New Fee Record → collect fee flow
  - Pagination controls
- **Table**
  - Columns: Period, Fee Type, Students, Amount, Status

#### Salary Management (`/financial-services/salary-management`)
- **File**: `src/pages/FinancialServices/SalaryManagement.jsx`
- **Inputs**
  - Search salaries (text)
  - Status filter popover (Approved/Pending/Rejected/All)
- **Buttons**
  - New Payroll Record (Link → `/admission` placeholder)
  - Pagination
- **Table**
  - Columns: Month, Department, Amount, Status

#### Other Expenses (`/financial-services/other-expenses`)
- **File**: `src/pages/FinancialServices/OtherExpenses.jsx`
- **Inputs**
  - Search expenses (text)
  - Status filter popover
- **Buttons**
  - Generate Statement
  - Record New Expense (Link → `/admission` placeholder)
  - Pagination
- **Table**
  - Columns: Date, Category, Description, Amount, Status

---

### Academics (`/academics/*`)

#### Academics Modern Page (Student Dashboard / Time Table / Attendance index / Grades index)
- **File**: `src/pages/Academics/AcademicsModernPage.jsx`
- **Purpose**: Class cards grid, section panel, add class/section modals.
- **Inputs**
  - Add Section modal:
    - Section name (text)
  - Add Class modal:
    - Class name* (text)
    - Class code* (text)
    - Sections count (number)
    - Teacher (text)
    - Description (textarea)
- **Buttons**
  - Filter View (button)
  - CTA (varies by `pageKey`, e.g. “+ Add Class”, “Mark Attendance”, “Publish Results”)
  - Section add/edit/delete (edit uses `prompt()`, delete uses `confirm()`)
  - Section card click navigates to section detail routes.
- **Modals**
  - Add Section modal
  - Add Class modal

#### Section Students (Roster) (`/academics/student-management/section/:sectionId`)
- **File**: `src/pages/Academics/SectionStudentsPage.jsx`
- **Inputs**
  - Search students (search input)
  - Payment filter chips (buttons): All/Paid/Unpaid/Partial
  - Select-all checkbox
  - Per-row checkbox
- **Buttons**
  - “More filters” icon button (present; no panel wired)
  - Floating action: “Proceed to Order” (when selections exist)
- **Table**
  - Columns (as implemented by component):
    - Select checkbox
    - Student Name
    - Roll No
    - Attendance
    - Hostel Status
    - Payment
    - Actions

#### Student Detail (Student Management) (`/academics/student-management/section/:sectionId/student/:studentId`)
- **File**: `src/pages/Academics/studentManagement/StudentManagementStudentDetailPage.jsx`
- **Buttons**
  - Back to Students
  - Edit Profile
  - Message Guardian
- **Table**
  - Subject-wise performance columns: Subject, Marks, Grade, (bar column)

#### Section Time Table (`/academics/time-table/section/:sectionId`)
- **File**: `src/pages/Academics/SectionTimeTablePage.jsx`
- **Table**
  - Grid columns: Period + Monday–Friday
  - Grid rows: periods 1–8 with lunch break handling
- **Inputs / buttons**: none beyond breadcrumb links.

#### Attendance Log (`/academics/attendance/:classSlug/:sectionSlug`)
- **File**: `src/pages/Academics/AttendanceLogPage.jsx`
- **Modes**
  - Overview mode
  - Mark attendance mode (`markMode`)
- **Inputs (overview)**
  - Search (text)
  - Calendar day selection (buttons)
  - Month navigation (buttons)
- **Inputs (mark mode)**
  - Mark search input (search)
  - Date input (date)
  - Bulk action select + apply
  - Per-student: status select + remarks text
- **Buttons**
  - Back to sections / overview / cancel / reset / save attendance

#### Grades Log (`/academics/grades/:classSlug/:sectionSlug`)
- **File**: `src/pages/Academics/GradesLogPage.jsx`
- **Inputs**
  - Filter chips (buttons): All Students / Remedial Focus
  - Search input (search)
  - Pagination buttons
- **Buttons**
  - Back to Sections
  - Notify Parents (demo)
  - Export CSV (demo)
- **Table**
  - Matrix includes: roll no, student name, multiple assessment columns, overall, grade, action.

#### Student Grades Detail (`/academics/grades/:classSlug/:sectionSlug/student/:studentSlug`)
- **File**: `src/pages/Academics/StudentGradesDetailPage.jsx`
- **Buttons**
  - Back to Gradebook
  - Print / Export report
  - Retry (on load fail)
- **Table**
  - Columns: Subject, FA1, FA2, H-Yearly, FA3, FA4, Annual, Internal, Total, Grade

---

### User Management (`/user-management`)
- **File**: `src/pages/UserManagement/UserManagementPage.jsx`
- **Purpose**: System registry of users + filters + assignment + template tools.
- **Inputs**
  - Search users (search input)
  - Filters popover: status chips (buttons)
  - Assign/Add user modal:
    - Name (text)
    - Email (email)
    - Role (select)
    - Branch (select)
    - Template (select)
  - Template editor:
    - Template name (text)
    - Description (text)
- **Buttons**
  - Theme toggle
  - Filters toggle
  - Add User (opens modal)
  - Pagination controls
  - Row kebab action button (no menu wired)
- **Table**
  - Columns: User name, Role, Branch, Status, Actions
- **Modals / drawers**
  - Assign/Add user modal (conditional)
  - Filters popover (conditional)

---

### Settings (`/settings`)
- **File**: `src/pages/Settings/SettingsPage.jsx`
- **Purpose**: Personal profile + alert toggles + institutional defaults.
- **Inputs**
  - Personal profile (text inputs):
    - Full Name
    - Email Address
    - Designation
    - Department
  - Alerts (toggle buttons):
    - Email Notifications
    - SMS Alerts
- **Buttons**
  - Save Changes

---

## 3) Known navigation gaps (as implemented in UI)

- `SuccessView` includes **“View Application Status”** → `/applications`, but `/applications` is **not declared** in `src/App.jsx`.
- `SectionStudentsPage` uses a relative navigation `student/${row.id}`; the declared route in `src/App.jsx` is `/academics/student-management/section/:sectionId/student/:studentId`.

