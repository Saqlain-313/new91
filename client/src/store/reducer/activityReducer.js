// propertySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { api } from "./api";

export const RedeemGiftCode = createAsyncThunk(
  "auth/redeem",
  async (code, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/use/redenvelope", code, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const getRedeemGift = createAsyncThunk(
  "auth/redeem-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/get/redenvelope", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const notification = createAsyncThunk(
  "auth/notification",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/notification", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const notificationDelete = createAsyncThunk(
  "auth/notification-delete",
  async (id, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        `/webapi/notification`,
        { id: id },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const attendance = createAsyncThunk(
  "auth/attendance",
  async (datas, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        `/webapi/checkIn`,
        { data: datas },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const newSubordinate = createAsyncThunk(
  "auth/new-subordinate",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/new-subordinate`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const invitationBonus = createAsyncThunk(
  "auth/invitation-bonus",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/calculateDownlineBonuses`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rebateCreate = createAsyncThunk(
  "auth/rebate",
  async (amount, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        `/webapi/rebateCreate`,
        { amount: amount },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rebateget = createAsyncThunk(
  "auth/rebate-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/getRebate`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const commissiondatas = createAsyncThunk(
  "auth/commissiondatas",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/commissiondata", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const notificationgets = createAsyncThunk(
  "auth/notification-get",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/get-Notification`, {
        withCredentials: true,
      });
      return data; // Return data directly
    } catch (error) {
      // Log error to debug
      console.error("Error fetching notifications:", error);

      // Return a custom error message or error response
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);
export const unseenmessage = createAsyncThunk(
  "auth/unseen-message",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/logincount`, {
        withCredentials: true,
      });
      return data; // Return data directly
    } catch (error) {
      // Log error to debug
      console.error("Error fetching notifications:", error);

      // Return a custom error message or error response
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);
export const updatemessage = createAsyncThunk(
  "auth/update-message",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/loginupdate`, {
        withCredentials: true,
      });
      return data; // Return data directly
    } catch (error) {
      // Log error to debug
      console.error("Error fetching notifications:", error);

      // Return a custom error message or error response
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);

export const vipLevel = createAsyncThunk(
  "auth/vip-level",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/vip-level`, {
        withCredentials: true,
      });
      return fulfillWithValue(data); // Return data directly
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);


export const userProblem = createAsyncThunk(
  "auth/user-problem",
  async (formData, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(`/webapi/userProblem`, formData, {
        withCredentials: true,
      });

      return fulfillWithValue(data); // Return data directly
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);
export const userProblemget = createAsyncThunk(
  "auth/user-problem-get",
  async (progressForm, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(`/webapi/userProblem-get`, progressForm, {
        withCredentials: true,
      });

      return fulfillWithValue(data); // Return data directly
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);


export const vipsectionData = createAsyncThunk(
  "auth/vipdata",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/vip-data`, {
        withCredentials: true,
      });
      //console.log("Fetched Data:", data); // Debug API response
      return fulfillWithValue(data);
    } catch (error) {
      console.error("Error in vipsection:", error); // Debug API error
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);
export const invitationData = createAsyncThunk(
  "auth/invitaion",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/get-invitation-bonus`, {
        withCredentials: true,
      });
      //console.log("invitation:", data); // Debug API response
      return fulfillWithValue(data);
    } catch (error) {
      console.error("Error in invitaion:", error); // Debug API error
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);
export const getSpinWheelData = createAsyncThunk(
  "auth/getspinwhile",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/get-spin-data`, {
        withCredentials: true,
      });
      // //console.log("Fetched Data:", data); // Debug API response
      return fulfillWithValue(data);
    } catch (error) {
      console.error("Error in spin wheel:", error); // Debug API error
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);
export const climeSpinWheelData = createAsyncThunk(
  "auth/climespinwhile",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(`/webapi/clime-spin-data`, {
        withCredentials: true,
      });
      //console.log("ddddddddddddddd", data);
      //console.log("Fetched Data:", data); // Debug API response
      return fulfillWithValue(data);
    } catch (error) {
      console.error("Error in spin wheel:", error); // Debug API error
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);
export const reddempinWheelSpin = createAsyncThunk(
  "auth/redeemspinwhile",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(`/webapi/getweeldetails`, {
        withCredentials: true,
      });
      //console.log("Fetched Data:", data); // Debug API response
      return fulfillWithValue(data);
    } catch (error) {
      console.error("Error in spin wheel:", error); // Debug API error
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred"
      );
    }
  }
);



export const activityReducer = createSlice({
  name: "activity",
  initialState: {
    loader: false,
    errorMessage: "",
    successMessage: "",
   
    notificationgetData: null,
    unseennotificationget: null,
    unseenmessageget: null,
    vipData: null,
    invitationBonusDatas: null,
    getSpinWheelDatas: null,
  notificationData:null,
    climeSpinData: null,
    redeemSpinData: null,
    invitationBonusData:null,
    // add userDetail to initialState
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    activity_reset: (state) => {
      state.vipData = "";
      state.climeSpinData = "";
      state.notificationData=""

    },
  },
  extraReducers: (builder) => {
    builder
     
      .addCase(RedeemGiftCode.pending, (state) => {
        state.loader = true;
      })
      .addCase(RedeemGiftCode.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(RedeemGiftCode.fulfilled, (state, { payload }) => {
        const redeemData = payload.datas;
        state.successMessage = payload.message;
        state.loader = false;
        state.redeemData = redeemData;
      })
      .addCase(getRedeemGift.pending, (state) => {
        state.loader = true;
      })
      .addCase(getRedeemGift.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(getRedeemGift.fulfilled, (state, { payload }) => {
        const redeemData = payload.datas;
        state.successMessage = payload.message;
        state.loader = false;
        state.redeemData = redeemData;
      })
      
      .addCase(notification.pending, (state) => {
        state.loader = true;
      })
      .addCase(notification.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(notification.fulfilled, (state, { payload }) => {
        const notificationData = payload.data;
        state.successMessage = payload.message;
        state.loader = false;
        state.notificationData = notificationData;
      })
      .addCase(notificationDelete.pending, (state) => {
        state.loader = true;
      })
      .addCase(notificationDelete.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(notificationDelete.fulfilled, (state, { payload }) => {
        const notificationData = payload.data;
        state.successMessage = payload.message;
        state.loader = false;
        state.notificationData = notificationData;
      })
      .addCase(attendance.pending, (state) => {
        state.loader = true;
      })
      .addCase(attendance.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(attendance.fulfilled, (state, { payload }) => {
        const attendanceData = payload?.datas;
        state.successMessage = payload.message;
        state.loader = false;
        state.attendanceData = attendanceData;
        const attendance_history = payload?.data;
        state.attendance_history = attendance_history;
      })
      .addCase(newSubordinate.pending, (state) => {
        state.loader = true;
      })
      .addCase(newSubordinate.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(newSubordinate.fulfilled, (state, { payload }) => {
        const newSubordinateData = payload?.datas;
        state.successMessage = payload.message;
        state.loader = false;
        state.newSubordinateData = newSubordinateData;
      })
      .addCase(invitationBonus.pending, (state) => {
        state.loader = true;
      })
      .addCase(invitationBonus.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(invitationBonus.fulfilled, (state, { payload }) => {
        const invitationBonusData = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.invitationBonusData = invitationBonusData;
      })
      .addCase(rebateCreate.pending, (state) => {
        state.loader = true;
      })
      .addCase(rebateCreate.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(rebateCreate.fulfilled, (state, { payload }) => {
           state.successMessage = payload.message;
        state.loader = false;
      })
      .addCase(rebateget.pending, (state) => {
        state.loader = true;
      })
      .addCase(rebateget.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })

      
      .addCase(rebateget.fulfilled, (state, { payload }) => {
        const rebateData = payload.data;
        state.successMessage = payload.message;
        state.loader = false;
        state.rebateData = rebateData;
      })
      .addCase(notificationgets.pending, (state) => {
        state.loader = true;
      })
      .addCase(notificationgets.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(notificationgets.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.notificationgetData = payload.data || [];
        state.loader = false;
      })
      .addCase(unseenmessage.pending, (state) => {
        state.loader = true;
      })
      .addCase(unseenmessage.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(unseenmessage.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.unseenmessageget = payload.data || 0;
        state.loader = false;
      })
      .addCase(vipLevel.pending, (state) => {
        state.loader = true;
      })
      .addCase(vipLevel.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(vipLevel.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.vipLevelData = payload.data || [];
        state.loader = false;
      })


      .addCase(commissiondatas.pending, (state) => {
        state.loader = true;
      })
      .addCase(commissiondatas.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(commissiondatas.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.commissiondatasData = payload.datas || [];
        state.loader = false;
      })
      .addCase(userProblem.pending, (state) => {
        state.loader = true;
      })
      .addCase(userProblem.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(userProblem.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        // state.userProblemData = payload.data || [];
        state.loader = false;
      })
      .addCase(userProblemget.pending, (state) => {
        state.loader = true;
      })
      .addCase(userProblemget.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(userProblemget.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.userProblemData = payload.data || [];
        state.loader = false;
      })
       
      .addCase(vipsectionData.pending, (state) => {
        state.loader = true;
      })
      .addCase(vipsectionData.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(vipsectionData.fulfilled, (state, { payload }) => {
        // //console.log("Fulfilled payload:", payload);
        state.successMessage = payload.message || "";
        state.vipData = payload?.data || [];
        state.loader = false;
      })
      .addCase(invitationData.pending, (state) => {
        state.loader = true;
      })
      .addCase(invitationData.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(invitationData.fulfilled, (state, { payload }) => {
           state.successMessage = payload.message || "";
        state.invitationBonusDatas = payload?.data || [];
        state.loader = false;
      })
      .addCase(getSpinWheelData.pending, (state) => {
        state.loader = true;
      })
      .addCase(getSpinWheelData.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(getSpinWheelData.fulfilled, (state, { payload }) => {
        // //console.log("Fulfilled payload:", payload);
        state.successMessage = payload.message || "";
        state.getSpinWheelDatas = payload?.data || [];
        state.loader = false;
      })
    
      .addCase(reddempinWheelSpin.pending, (state) => {
        state.loader = true;
      })
      .addCase(reddempinWheelSpin.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(reddempinWheelSpin.fulfilled, (state, { payload }) => {
        // //console.log("Fulfilled payload:", payload);
        state.successMessage = payload.message || "";
        state.redeemSpinData = payload?.data || [];
        state.loader = false;
      })
      .addCase(climeSpinWheelData.pending, (state) => {
        state.loader = true;
      })
      .addCase(climeSpinWheelData.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(climeSpinWheelData.fulfilled, (state, { payload }) => {
         state.successMessage = payload.message || "";
        state.climeSpinData = payload?.data || [];
        state.loader = false;
      });
  },
});

export const { messageClear, activity_reset } = activityReducer.actions;
export default activityReducer.reducer;
