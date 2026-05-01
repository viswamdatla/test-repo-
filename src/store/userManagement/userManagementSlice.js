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

const mockUsers = [
  {
    id: 'usr-001',
    name: 'Elena Rodriguez',
    email: 'e.rodriguez@campus360.edu',
    role: 'Principal',
    branch: 'Oakwood Central',
    template: 'Teachers Template',
    status: 'Active',
  },
  {
    id: 'usr-002',
    name: 'Marcus Chen',
    email: 'm.chen@campus360.edu',
    role: 'Teacher',
    branch: 'Northside Heights',
    template: 'Teachers Template',
    status: 'Active',
  },
  {
    id: 'usr-003',
    name: 'Sarah Richardson',
    email: 's.rich@campus360.edu',
    role: 'Accountant',
    branch: 'Global Admin',
    template: 'Operations Template',
    status: 'Inactive',
  },
  {
    id: 'usr-004',
    name: 'Jordan Walker',
    email: 'j.walker@school.edu',
    role: 'Student',
    branch: 'Oakwood Central',
    template: 'Students Template',
    status: 'Active',
  },
  {
    id: 'usr-005',
    name: 'Rosa Castillo',
    email: 'r.castillo@school.edu',
    role: 'Parent',
    branch: 'Northside Heights',
    template: 'Parents Template',
    status: 'Pending',
  },
  {
    id: 'usr-006',
    name: 'Samuel Okoro',
    email: 's.okoro@school.edu',
    role: 'Operations',
    branch: 'Global Admin',
    template: 'Operations Template',
    status: 'Active',
  },
  {
    id: 'usr-007',
    name: 'Priya Nair',
    email: 'p.nair@campus360.edu',
    role: 'Teacher',
    branch: 'Oakwood Central',
    template: 'Teachers Template',
    status: 'Active',
  },
  {
    id: 'usr-008',
    name: 'James Liu',
    email: 'j.liu@campus360.edu',
    role: 'Finance',
    branch: 'Northside Heights',
    template: 'Operations Template',
    status: 'Pending',
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
      } else {
        const exists = state.templates.some((t) => t.name.toLowerCase() === name.toLowerCase());
        if (exists) return;
        state.templates.push({ name, description });
        if (!state.assignmentDraft.template) {
          state.assignmentDraft.template = name;
        }
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
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
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
} = userManagementSlice.actions;
export default userManagementSlice.reducer;

