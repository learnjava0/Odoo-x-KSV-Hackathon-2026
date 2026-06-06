import { configureStore, createSlice } from '@reduxjs/toolkit';

const savedUser = localStorage.getItem('vendorbridge_user');

const authSlice = createSlice({
  name: 'auth',
  initialState: savedUser ? JSON.parse(savedUser) : { token: null, user: null },
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('vendorbridge_user', JSON.stringify(state));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('vendorbridge_user');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer
  }
});
