import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const mockSettings = {
  profile: {
    fullName: 'Dr. Julian Sterling',
    email: 'j.sterling@scholarflow.edu',
    designation: 'Head of Operations',
    department: 'Administration',
  },
  alerts: {
    emailNotifications: true,
    smsAlerts: false,
  },
  institutionDefaults: {
    academicPeriod: 'Fall 2024',
    branchIdentity: 'North Campus Main',
    autoReplenish: 'Disabled',
  },
};

export const fetchSettings = createAsyncThunk('settings/fetchSettings', async () => mockSettings);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    loadStatus: 'idle',
    profile: {
      fullName: '',
      email: '',
      designation: '',
      department: '',
    },
    alerts: {
      emailNotifications: false,
      smsAlerts: false,
    },
    institutionDefaults: {
      academicPeriod: '',
      branchIdentity: '',
      autoReplenish: '',
    },
  },
  reducers: {
    updateProfileField(state, action) {
      const { field, value } = action.payload;
      state.profile[field] = value;
    },
    toggleAlert(state, action) {
      const key = action.payload;
      state.alerts[key] = !state.alerts[key];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loadStatus = 'loading';
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.profile = action.payload.profile;
        state.alerts = action.payload.alerts;
        state.institutionDefaults = action.payload.institutionDefaults;
      })
      .addCase(fetchSettings.rejected, (state) => {
        state.loadStatus = 'failed';
      });
  },
});

export const { updateProfileField, toggleAlert } = settingsSlice.actions;
export default settingsSlice.reducer;

