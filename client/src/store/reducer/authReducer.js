// propertySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { api } from "./api";

export const register = createAsyncThunk(
  "auth/register",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/register", info);
      Cookies.set("auth", data.data, { secure: true, sameSite: "None" });
      localStorage.setItem("token", data.data);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, pwd }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/login", {
        username: username,
        pwd: pwd,
      });
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 5);
      // expires: expirationDate
      Cookies.set("auth", data.value, {
        expires: expirationDate, // Set expiration date
        secure: true,
        sameSite: "None"
      });
      // localStorage.setItem('token', data.user.token);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);



export const userDetail = createAsyncThunk(
  "auth/user-details",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const ddd = Date.now();

      const { data } = await api.get(`/webapi/GetUserInfo?rand=${ddd}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const changeUserName = createAsyncThunk(
  "auth/change-user",
  async (name, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/change/userInfo",
        { name: name },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const changeUserPhoto = createAsyncThunk(
  "auth/change-photo",
  async (photo, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/change/userPhoto",
        { photo: photo },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const changePassword = createAsyncThunk(
  "auth/change-password",
  async (state, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/change/pass", state, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const emailotp = createAsyncThunk(
  "auth/email-otp",
  async (email, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        `/webapi/email-otp`,
        { email: email },
        { withCredentials: true }
      );
      return fulfillWithValue(data); // Return data directly
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);

export const emailsubmit = createAsyncThunk(
  "auth/email-submit",
  async ({ otp, email }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        `/webapi/email`,
        { otp: otp, email: email },
        { withCredentials: true }
      );
      return fulfillWithValue(data); // Return data directly
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);

export const emailLogin = createAsyncThunk(
  "auth/email-login",
  async ({ email, pwd }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(`/webapi/login-email`, {
        email: email,
        pwd: pwd,
      });
      Cookies.set("auth", data.value, { secure: true, sameSite: "None" });
      return fulfillWithValue(data); // Return data directly
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);



export const forgotPassword = createAsyncThunk(
  'auth/forgot-password',
  async (state, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post('/resetPasword', state, { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const otpSend = createAsyncThunk(
  "auth/otpSend",
  async (phone, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(`/sent/otp/verify/reset`, {
        phone: phone,    
      });
      return fulfillWithValue(data); // Return data directly
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);

export const registerOtp = createAsyncThunk(
  "auth/verify",
  async (phone, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(`/sent/otp/verify`, {
        phone: phone,    
      });
      return fulfillWithValue(data); // Return data directly
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);


export const authReducer = createSlice({
  name: "auth",
  initialState: {
    loader: false,
    userInfo: null,
    errorMessage: "",
    successMessage: "",   
    // add userDetail to initialState
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    auth_reset: (state) => {
      state.userInfo = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loader = true;
      })
      .addCase(register.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
    
        state.successMessage = payload.message;
        state.loader = false;
      })
      .addCase(login.pending, (state) => {
        state.loader = true;
      })
      .addCase(login.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        const userInfo = payload.value;
        state.successMessage = payload.message;
        state.loader = false;
        state.userInfo = userInfo;
      })
     
      .addCase(emailLogin.pending, (state) => {
        state.loader = true;
      })
      .addCase(emailLogin.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(emailLogin.fulfilled, (state, { payload }) => {
        const userInfo = payload.value;
        state.successMessage = payload.message;
        state.loader = false;
        state.userInfo = userInfo;
      })
      .addCase(userDetail.pending, (state) => {
        state.loader = true;
      })
      .addCase(userDetail.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(userDetail.fulfilled, (state, { payload }) => {
        const userInfo = payload.data;
        state.successMessage = payload.message;
        state.loader = false;
        state.userInfo = userInfo;
      })
      .addCase(changeUserName.pending, (state) => {
        state.loader = true;
      })
      .addCase(changeUserName.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(changeUserName.fulfilled, (state, { payload }) => {
        const userInfo = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.userInfo = userInfo;
      })
      .addCase(changeUserPhoto.pending, (state) => {
        state.loader = true;
      })
      .addCase(changeUserPhoto.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(changeUserPhoto.fulfilled, (state, { payload }) => {
        const userInfo = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.userInfo = userInfo;
      })
      .addCase(changePassword.pending, (state) => {
        state.loader = true;
      })
      .addCase(changePassword.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(changePassword.fulfilled, (state, { payload }) => {
        const userInfo = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.userInfo = userInfo;
      })
      .addCase(emailotp.pending, (state) => {
        state.loader = true;
      })
      .addCase(emailotp.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(emailotp.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.emailotpData = payload.data || [];
        state.loader = false;
      })

      .addCase(emailsubmit.pending, (state) => {
        state.loader = true;
      })
      .addCase(emailsubmit.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(emailsubmit.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.emailotpData = payload.data || [];
        state.loader = false;
      })
       .addCase(forgotPassword.pending, (state) => {
        state.loader = true;
      })
      .addCase(forgotPassword.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || 'An error occurred';
        state.loader = false;
      })
      .addCase(forgotPassword.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
      })
      
      .addCase(otpSend.pending, (state) => {
        state.loader = true;
      })
      .addCase(otpSend.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(otpSend.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
         state.loader = false;
      })
      .addCase(registerOtp.pending, (state) => {
        state.loader = true;
      })
      .addCase(registerOtp.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(registerOtp.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
         state.loader = false;
      })

  },
});

export const { messageClear, auth_reset } = authReducer.actions;
export default authReducer.reducer;
