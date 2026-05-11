import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const roleTemplateMap = {
  Principal: 'Teachers Template',
  Teacher: 'Teachers Template',
  Student: 'Students Template',
  Parent: 'Parents Template',
  Finance: 'Operations Template',
  Operations: 'Operations Template',
  Accountant: 'Operations Template',
};

const seedAuditLogs = () => [
  {
    id: 'log-001',
    at: '2023-10-19T14:22:45.000Z',
    admin: 'Alex Rivera',
    adminInitials: 'AR',
    action: 'Changed Fee Structure',
    actionKey: 'financial',
    target: 'Global Pricing Model v2',
    ip: '192.168.1.104',
  },
  {
    id: 'log-002',
    at: '2023-10-19T13:05:12.000Z',
    admin: 'Sarah Chen',
    adminInitials: 'SC',
    action: 'Onboarded Staff',
    actionKey: 'user',
    target: 'Central Valley Academy',
    ip: '172.16.254.1',
  },
  {
    id: 'log-003',
    at: '2023-10-18T18:44:00.000Z',
    admin: 'Marcus Thorne',
    adminInitials: 'MT',
    action: 'Revoked Access',
    actionKey: 'security',
    target: 'Service Account #492',
    ip: '45.22.129.88',
  },
  {
    id: 'log-004',
    at: '2023-10-18T09:12:33.000Z',
    admin: 'Alex Rivera',
    adminInitials: 'AR',
    action: 'System Patch Applied',
    actionKey: 'system',
    target: 'Core Engine 4.5.2',
    ip: '192.168.1.104',
  },
];

const buildAccessMatrix = () => {
  const full = {
    academics: { modifyCurriculum: true, publishGrades: true, manageEnrollment: true, facultyAssignments: true },
    finance: { auditTransactions: true, executeRefunds: true, taxConfiguration: true, payrollDisbursement: true },
    inventory: { stockRequisition: true, vendorManagement: true, assetLiquidation: true },
    personnel: { hiringControl: true, leaveApproval: true, terminationRoot: true },
  };
  const branchAdmin = {
    ...full,
    finance: { ...full.finance, payrollDisbursement: false },
    personnel: { ...full.personnel, terminationRoot: false },
  };
  const registrar = {
    academics: full.academics,
    finance: { auditTransactions: true, executeRefunds: false, taxConfiguration: false, payrollDisbursement: false },
    inventory: { stockRequisition: true, vendorManagement: false, assetLiquidation: false },
    personnel: { hiringControl: false, leaveApproval: true, terminationRoot: false },
  };
  const accountant = {
    academics: { modifyCurriculum: false, publishGrades: false, manageEnrollment: false, facultyAssignments: false },
    finance: full.finance,
    inventory: { stockRequisition: true, vendorManagement: true, assetLiquidation: false },
    personnel: { hiringControl: false, leaveApproval: false, terminationRoot: false },
  };
  const storeManager = {
    academics: { modifyCurriculum: false, publishGrades: false, manageEnrollment: false, facultyAssignments: false },
    finance: { auditTransactions: true, executeRefunds: false, taxConfiguration: false, payrollDisbursement: false },
    inventory: full.inventory,
    personnel: { hiringControl: false, leaveApproval: false, terminationRoot: false },
  };
  return {
    'super-admin': JSON.parse(JSON.stringify(full)),
    'branch-admin': JSON.parse(JSON.stringify(branchAdmin)),
    registrar: JSON.parse(JSON.stringify(registrar)),
    accountant: JSON.parse(JSON.stringify(accountant)),
    'store-manager': JSON.parse(JSON.stringify(storeManager)),
  };
};

const mockUsers = [
  {
    id: 'usr-001',
    name: 'Elena Rodriguez',
    email: 'e.rodriguez@campus360.edu',
    role: 'Principal',
    branch: 'Oakwood Central',
    template: 'Teachers Template',
    status: 'Active',
    lastLogin: '2 minutes ago',
  },
  {
    id: 'usr-002',
    name: 'Marcus Chen',
    email: 'm.chen@campus360.edu',
    role: 'Teacher',
    branch: 'Northside Heights',
    template: 'Teachers Template',
    status: 'Active',
    lastLogin: '1 hour ago',
  },
  {
    id: 'usr-003',
    name: 'Sarah Richardson',
    email: 's.rich@campus360.edu',
    role: 'Accountant',
    branch: 'Global Admin',
    template: 'Operations Template',
    status: 'Inactive',
    lastLogin: '14 days ago',
  },
  {
    id: 'usr-004',
    name: 'Jordan Walker',
    email: 'j.walker@school.edu',
    role: 'Student',
    branch: 'Oakwood Central',
    template: 'Students Template',
    status: 'Active',
    lastLogin: 'Today',
  },
  {
    id: 'usr-005',
    name: 'Rosa Castillo',
    email: 'r.castillo@school.edu',
    role: 'Parent',
    branch: 'Northside Heights',
    template: 'Parents Template',
    status: 'Pending',
    lastLogin: '—',
  },
  {
    id: 'usr-006',
    name: 'Samuel Okoro',
    email: 's.okoro@school.edu',
    role: 'Operations',
    branch: 'Global Admin',
    template: 'Operations Template',
    status: 'Active',
    lastLogin: 'Yesterday',
  },
  {
    id: 'usr-007',
    name: 'Priya Nair',
    email: 'p.nair@campus360.edu',
    role: 'Teacher',
    branch: 'Oakwood Central',
    template: 'Teachers Template',
    status: 'Active',
    lastLogin: '3 hours ago',
  },
  {
    id: 'usr-008',
    name: 'James Liu',
    email: 'j.liu@campus360.edu',
    role: 'Finance',
    branch: 'Northside Heights',
    template: 'Operations Template',
    status: 'Pending',
    lastLogin: '5 days ago',
  },
];

export const fetchUserManagement = createAsyncThunk('userManagement/fetchUserManagement', async () => {
  return {
    users: mockUsers,
    templates: [
      { name: 'Teachers Template', description: 'Teacher-facing academic and attendance tools.' },
      { name: 'Students Template', description: 'Student dashboard with classes, grades, and announcements.' },
      { name: 'Parents Template', description: 'Parent view for student progress and communication.' },
      { name: 'Operations Template', description: 'Finance and operations workflows.' },
    ],
    auditLogs: seedAuditLogs(),
    accessMatrix: buildAccessMatrix(),
  };
});

const getTemplateNameList = (templates) => templates.map((t) => t.name);
const getTemplateForRole = (templates, role) => {
  const names = getTemplateNameList(templates);
  const mapped = roleTemplateMap[role];
  if (mapped && names.includes(mapped)) return mapped;
  return names[0] ?? '';
};

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState: {
    loadStatus: 'idle',
    users: [],
    templates: [],
    auditLogs: [],
    accessMatrix: {},
    editingTemplateName: null,
    templateDraft: {
      name: '',
      description: '',
    },
    assignmentDraft: {
      name: '',
      email: '',
      role: 'Teacher',
      branch: 'Oakwood Central',
      template: 'Teachers Template',
    },
    searchQuery: '',
    page: 1,
    pageSize: 10,
    auditAdminFilter: 'all',
    auditActionFilter: 'all',
    auditSearch: '',
  },
  reducers: {
    setAssignmentField(state, action) {
      const { field, value } = action.payload;
      state.assignmentDraft[field] = value;
      if (field === 'role') {
        state.assignmentDraft.template = getTemplateForRole(state.templates, value);
      }
    },
    setTemplateDraftField(state, action) {
      const { field, value } = action.payload;
      state.templateDraft[field] = value;
    },
    startTemplateEdit(state, action) {
      const templateName = action.payload;
      const template = state.templates.find((t) => t.name === templateName);
      if (!template) return;
      state.editingTemplateName = templateName;
      state.templateDraft = {
        name: template.name,
        description: template.description || '',
      };
    },
    cancelTemplateEdit(state) {
      state.editingTemplateName = null;
      state.templateDraft = { name: '', description: '' };
    },
    saveTemplateDraft(state) {
      const name = state.templateDraft.name.trim();
      const description = state.templateDraft.description.trim();
      if (!name) return;

      if (state.editingTemplateName) {
        const oldName = state.editingTemplateName;
        const target = state.templates.find((t) => t.name === oldName);
        if (!target) return;
        const conflict = state.templates.some(
          (t) => t.name.toLowerCase() === name.toLowerCase() && t.name !== oldName
        );
        if (conflict) return;

        target.name = name;
        target.description = description;
        state.users.forEach((u) => {
          if (u.template === oldName) u.template = name;
        });
        if (state.assignmentDraft.template === oldName) {
          state.assignmentDraft.template = name;
        }
        state.auditLogs.unshift({
          id: `log-${Date.now()}`,
          at: new Date().toISOString(),
          admin: 'Alex Rivera',
          adminInitials: 'AR',
          action: 'Template Updated',
          actionKey: 'system',
          target: `${oldName} → ${name}`,
          ip: '10.0.0.1',
        });
      } else {
        const exists = state.templates.some((t) => t.name.toLowerCase() === name.toLowerCase());
        if (exists) return;
        state.templates.push({ name, description });
        if (!state.assignmentDraft.template) {
          state.assignmentDraft.template = name;
        }
        state.auditLogs.unshift({
          id: `log-${Date.now()}`,
          at: new Date().toISOString(),
          admin: 'Alex Rivera',
          adminInitials: 'AR',
          action: 'Template Created',
          actionKey: 'system',
          target: name,
          ip: '10.0.0.1',
        });
      }

      state.editingTemplateName = null;
      state.templateDraft = { name: '', description: '' };
    },
    assignUserTemplate(state) {
      const draft = state.assignmentDraft;
      const newUser = {
        id: `usr-${String(state.users.length + 1).padStart(3, '0')}`,
        name: draft.name || `${draft.role} User`,
        email: draft.email || `${draft.role.toLowerCase()}.${state.users.length + 1}@school.edu`,
        role: draft.role,
        branch: (draft.branch || 'Oakwood Central').trim() || 'Oakwood Central',
        template: draft.template,
        status: 'Active',
        lastLogin: 'Just now',
      };
      state.users.unshift(newUser);
      state.assignmentDraft = {
        name: '',
        email: '',
        role: 'Teacher',
        branch: 'Oakwood Central',
        template: getTemplateForRole(state.templates, 'Teacher'),
      };
      state.page = 1;
      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        at: new Date().toISOString(),
        admin: 'Alex Rivera',
        adminInitials: 'AR',
        action: 'User Provisioned',
        actionKey: 'user',
        target: `${newUser.name} (${newUser.role})`,
        ip: '10.0.0.1',
      });
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setAuditAdminFilter(state, action) {
      state.auditAdminFilter = action.payload;
    },
    setAuditActionFilter(state, action) {
      state.auditActionFilter = action.payload;
    },
    setAuditSearch(state, action) {
      state.auditSearch = action.payload;
    },
    setAccessPermission(state, action) {
      const { roleKey, module, key, value } = action.payload;
      const matrix = state.accessMatrix[roleKey];
      if (!matrix?.[module]) return;
      state.accessMatrix[roleKey][module][key] = value;
    },
    appendAuditLog(state, action) {
      state.auditLogs.unshift({
        admin: 'Alex Rivera',
        adminInitials: 'AR',
        actionKey: 'system',
        ip: '10.0.0.1',
        ...action.payload,
        id: `log-${Date.now()}`,
        at: new Date().toISOString(),
      });
    },
    resetAccessMatrix(state) {
      state.accessMatrix = buildAccessMatrix();
    },
    bulkSetUsersStatus(state, action) {
      const { ids, status } = action.payload;
      const setIds = new Set(ids);
      state.users.forEach((u) => {
        if (setIds.has(u.id)) u.status = status;
      });
      if (ids.length) {
        state.auditLogs.unshift({
          id: `log-${Date.now()}`,
          at: new Date().toISOString(),
          admin: 'Alex Rivera',
          adminInitials: 'AR',
          action: 'Bulk Status Update',
          actionKey: 'user',
          target: `${ids.length} users → ${status}`,
          ip: '10.0.0.1',
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserManagement.pending, (state) => {
        state.loadStatus = 'loading';
      })
      .addCase(fetchUserManagement.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.users = action.payload.users;
        state.templates = action.payload.templates;
        state.auditLogs = action.payload.auditLogs || seedAuditLogs();
        state.accessMatrix = action.payload.accessMatrix || buildAccessMatrix();
        state.assignmentDraft.template = getTemplateForRole(state.templates, state.assignmentDraft.role);
      })
      .addCase(fetchUserManagement.rejected, (state) => {
        state.loadStatus = 'failed';
      });
  },
});

export const {
  setAssignmentField,
  setTemplateDraftField,
  startTemplateEdit,
  cancelTemplateEdit,
  saveTemplateDraft,
  assignUserTemplate,
  setSearchQuery,
  setPage,
  setAuditAdminFilter,
  setAuditActionFilter,
  setAuditSearch,
  setAccessPermission,
  appendAuditLog,
  resetAccessMatrix,
  bulkSetUsersStatus,
} = userManagementSlice.actions;
export default userManagementSlice.reducer;
