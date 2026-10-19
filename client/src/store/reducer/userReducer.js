// propertySlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

export const recharge = createAsyncThunk(
  "auth/recharge",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/recharge", info, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
// For UPI
export const upi = createAsyncThunk(
  "auth/addUPI",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/addUPI", info, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const rechargeGet = createAsyncThunk(
  "auth/rechargeget",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/recharge/check", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const rechargeList = createAsyncThunk(
  "auth/recharge-list",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/recharge/list", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const rechargeList2 = createAsyncThunk(
  "auth/recharge-list2",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/recharge/list2", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const addBank = createAsyncThunk(
  "auth/addbank",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/addBank", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const addusdt = createAsyncThunk(
  "auth/usdt",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/addusdt", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
export const getBank = createAsyncThunk(
  "auth/getbank",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/check/Info", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
export const withdrawal = createAsyncThunk(
  "auth/withdraw",
  async ({ type, money, password }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/withdrawal",
        { type, money, password },
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
export const withdrawalHistory = createAsyncThunk(
  "auth/withdraw-history",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/withdraw/list", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const TrexoPayment = createAsyncThunk(
  "auth/TrexoPayment",
  async ({ amount, type }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/initiateTrexoPayPayment",
        { amount: amount, type: type },
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const bannerGet = createAsyncThunk(
  "auth/bannerss",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/banner`);
      return fulfillWithValue(data); // Return data directly
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred",
      );
    }
  },
);

export const recharheBonus = createAsyncThunk(
  "auth/recharge-bonus",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/getrecharge-bonus`, {
        withCredentials: true,
      });
      //console.log("recharge bonus:", data); // Debug API response
      return fulfillWithValue(data);
    } catch (error) {
      // console.error("Error rechatge:", error); // Debug API error
      return rejectWithValue(
        error.response ? error.response.data : "An unknown error occurred",
      );
    }
  },
);

export const zilpayRecharge = createAsyncThunk(
  "auth/zilpay",
  async ({ amount, type }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/zilpay",
        { amount: amount, type: type },
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const recharge3 = createAsyncThunk(
  "auth/recharge3",
  async ({ amount, type }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/rechargepay",
        { amount: amount, type: type },
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const userReducer = createSlice({
  name: "user",
  initialState: {
    loader: false,
    errorMessage: "",
    successMessage: "",
    rechargeData: null,
    rechargegetData: null,
    rechargelistData: null,
    rechargeBonusData: null,
    // add userDetail to initialState
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    user_reset: (state) => {
      state.rechargeData = "";
      state.rechargegetData = "";
      state.rechargelistData = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(recharge.pending, (state) => {
        state.loader = true;
      })
      .addCase(recharge.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(recharge.fulfilled, (state, { payload }) => {
        const rechargeData = payload.orderid;
        state.successMessage = payload.message;
        state.loader = false;
        state.rechargeData = rechargeData;
      })

      .addCase(upi.pending, (state) => {
        state.loader = true;
      })
      .addCase(upi.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(upi.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
        state.upiData = payload; // ✅ important to store API response
      })

      .addCase(rechargeGet.pending, (state) => {
        state.loader = true;
      })
      .addCase(rechargeGet.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(rechargeGet.fulfilled, (state, { payload }) => {
        const rechargegetData = payload.datas;
        state.successMessage = payload.message;
        state.loader = false;
        state.rechargegetData = rechargegetData;
      })
      .addCase(rechargeList.pending, (state) => {
        state.loader = true;
      })
      .addCase(rechargeList.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(rechargeList.fulfilled, (state, { payload }) => {
        const rechargelistData = payload.datas;
        state.successMessage = payload.message;
        state.loader = false;
        state.rechargelistData = rechargelistData;
      })
      .addCase(rechargeList2.pending, (state) => {
        state.loader = true;
      })
      .addCase(rechargeList2.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(rechargeList2.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
      })

      .addCase(addBank.pending, (state) => {
        state.loader = true;
      })
      .addCase(addBank.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(addBank.fulfilled, (state, { payload }) => {
        const addBankData = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.addBankData = addBankData;
      })
      .addCase(addusdt.pending, (state) => {
        state.loader = true;
      })
      .addCase(addusdt.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(addusdt.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
      })

      .addCase(getBank.pending, (state) => {
        state.loader = true;
      })
      .addCase(getBank.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(getBank.fulfilled, (state, { payload }) => {
        const addBankData = payload?.datas[0];
        state.successMessage = payload.message;
        state.loader = false;
        state.addBankData = addBankData;
      })
      .addCase(withdrawal.pending, (state) => {
        state.loader = true;
      })
      .addCase(withdrawal.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(withdrawal.fulfilled, (state, { payload }) => {
        const withdrawData = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.withdrawData = withdrawData;
      })
      .addCase(withdrawalHistory.pending, (state) => {
        state.loader = true;
      })
      .addCase(withdrawalHistory.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(withdrawalHistory.fulfilled, (state, { payload }) => {
        const withdrawHistoryData = payload.datas;
        state.successMessage = payload.message;
        state.loader = false;
        state.withdrawHistoryData = withdrawHistoryData;
      })

      .addCase(bannerGet.pending, (state) => {
        state.loader = true;
      })
      .addCase(bannerGet.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(bannerGet.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.bannergetData = payload || [];
        state.loader = false;
      })
      .addCase(recharheBonus.pending, (state) => {
        state.loader = true;
      })
      .addCase(recharheBonus.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(recharheBonus.fulfilled, (state, { payload }) => {
        // //console.log("Fulfilled payload:", payload);
        state.successMessage = payload.message || "";
        state.rechargeBonusData = payload?.data || [];
        state.loader = false;
      })
      .addCase(zilpayRecharge.pending, (state) => {
        state.loader = true;
      })
      .addCase(zilpayRecharge.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(zilpayRecharge.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
      })
      .addCase(TrexoPayment.pending, (state) => {
        state.loader = true;
      })
      .addCase(TrexoPayment.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(TrexoPayment.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
      })
      .addCase(recharge3.pending, (state) => {
        state.loader = true;
      })
      .addCase(recharge3.rejected, (state, { payload }) => {
        console.log("register rejected payload:", payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(recharge3.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
      });
  },
});

export const { messageClear, user_reset } = userReducer.actions;
export default userReducer.reducer;
