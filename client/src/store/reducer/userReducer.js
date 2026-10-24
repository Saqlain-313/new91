// propertySlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";

// ============================================
// Helper: extract readable error message
// ============================================
const getErrorMessage = (payload, fallback = "An error occurred") => {
  if (!payload) return fallback;
  return (
    payload.message ||
    payload.errorMessage ||
    payload.error ||
    (typeof payload === "string" ? payload : fallback)
  );
};

// ============================================
// EXISTING THUNKS
// ============================================
export const recharge = createAsyncThunk(
  "auth/recharge",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/recharge", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

export const upi = createAsyncThunk(
  "auth/addUPI",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/addUPI", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
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
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
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
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
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
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

// ============================================
// NEW: KwikPay Payment
// ============================================
export const kwikpayRecharge = createAsyncThunk(
  "auth/kwikpay-recharge",
  async ({ money }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/wallet/paynow/kwikpay",
        { money: Number(money) },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

// ============================================
// NEW: Get Manual UPI payment details
// GET /wallet/paynow/manual_upi?am=<amount>
// Backend must return JSON for React requests (not rendered EJS HTML).
// ============================================
export const getManualUPIDetails = createAsyncThunk(
  "auth/get-manual-upi-details",
  async ({ amount }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/wallet/paynow/manual_upi", {
        params: { am: Number(amount) },
        headers: { Accept: "application/json" },
        withCredentials: true,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Unable to load UPI details" }
      );
    }
  }
);

// ============================================
// NEW: Manual UPI Payment
// ============================================
export const manualUPIRecharge = createAsyncThunk(
  "auth/manual-upi-recharge",
  async ({ money, utr }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/wallet/paynow/manual_upi_request",
        { money: Number(money), utr: String(utr).trim() },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

// ============================================
// NEW: Check KwikPay status (optional)
// ============================================
export const kwikpayStatus = createAsyncThunk(
  "auth/kwikpay-status",
  async ({ orderId }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/wallet/check/kwikpay", {
        params: { orderId },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

// ============================================
// EXISTING: Bank / USDT / Withdrawal
// ============================================
export const addBank = createAsyncThunk(
  "auth/addbank",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/webapi/addBank", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
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
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
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
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

export const withdrawal = createAsyncThunk(
  "auth/withdraw",
  async ({ type, money, password }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/withdrawal",
        { type, money, password },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
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
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

// ============================================
// EXISTING: Trexo / Banner / Bonus / ZilPay / recharge3
// ============================================
export const TrexoPayment = createAsyncThunk(
  "auth/TrexoPayment",
  async ({ amount, type }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/initiateTrexoPayPayment",
        { amount, type },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

export const bannerGet = createAsyncThunk(
  "auth/bannerss",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/banner`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "An unknown error occurred" }
      );
    }
  }
);

export const recharheBonus = createAsyncThunk(
  "auth/recharge-bonus",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/getrecharge-bonus`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "An unknown error occurred" }
      );
    }
  }
);

export const zilpayRecharge = createAsyncThunk(
  "auth/zilpay",
  async ({ amount, type }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/zilpay",
        { amount, type },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

export const recharge3 = createAsyncThunk(
  "auth/recharge3",
  async ({ amount, type }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/rechargepay",
        { amount, type },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

// ============================================
// SLICE
// ============================================
export const userReducer = createSlice({
  name: "user",
  initialState: {
    loader: false,
    errorMessage: "",
    successMessage: "",

    // Existing
    rechargeData: null,
    rechargegetData: null,
    rechargelistData: null,
    rechargeBonusData: null,
    bannergetData: null,
    upiData: null,
    addBankData: null,
    withdrawData: null,
    withdrawHistoryData: null,

    // NEW: payment gateways
    kwikpayData: null,       // { payment_url, recharge, ... }
    manualUpiData: null,     // { recharge, ... }
    manualUpiDetailsData: null, // { upi_id, bank_name, username, amount }
    manualUpiDetailsLoading: false,
    kwikpayStatusData: null, // { status, message }
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    user_reset: (state) => {
      state.rechargeData = null;
      state.rechargegetData = null;
      state.rechargelistData = null;
      state.rechargeBonusData = null;
      state.bannergetData = null;
      state.upiData = null;
      state.addBankData = null;
      state.withdrawData = null;
      state.withdrawHistoryData = null;
      state.kwikpayData = null;
      state.manualUpiData = null;
      state.manualUpiDetailsData = null;
      state.manualUpiDetailsLoading = false;
      state.kwikpayStatusData = null;
      state.errorMessage = "";
      state.successMessage = "";
      state.loader = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================
      // recharge
      // ============================================
      .addCase(recharge.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(recharge.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(recharge.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "Recharge successful";
        state.loader = false;
        state.rechargeData = payload?.orderid || null;
      })

      // ============================================
      // upi (add UPI)
      // ============================================
      .addCase(upi.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(upi.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(upi.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
        state.upiData = payload;
      })

      // ============================================
      // rechargeGet
      // ============================================
      .addCase(rechargeGet.pending, (state) => {
        state.loader = true;
      })
      .addCase(rechargeGet.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(rechargeGet.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
        state.rechargegetData = payload?.datas || null;
      })

      // ============================================
      // rechargeList
      // ============================================
      .addCase(rechargeList.pending, (state) => {
        state.loader = true;
      })
      .addCase(rechargeList.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(rechargeList.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
        state.rechargelistData = payload?.datas || null;
      })

      // ============================================
      // rechargeList2
      // ============================================
      .addCase(rechargeList2.pending, (state) => {
        state.loader = true;
      })
      .addCase(rechargeList2.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(rechargeList2.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
      })

      // ============================================
      // KwikPay
      // ============================================
      .addCase(kwikpayRecharge.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(kwikpayRecharge.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload, "KwikPay payment failed");
        state.loader = false;
      })
      .addCase(kwikpayRecharge.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
        state.kwikpayData = payload; // { payment_url, recharge, status, ... }
      })

      // ============================================
      // Fetch Manual UPI payment details
      // ============================================
      .addCase(getManualUPIDetails.pending, (state) => {
        state.manualUpiDetailsLoading = true;
        state.errorMessage = "";
      })
      .addCase(getManualUPIDetails.rejected, (state, { payload }) => {
        state.manualUpiDetailsLoading = false;
        state.errorMessage = getErrorMessage(payload, "Unable to load UPI details");
      })
      .addCase(getManualUPIDetails.fulfilled, (state, { payload }) => {
        state.manualUpiDetailsLoading = false;
        state.manualUpiDetailsData = payload?.data || payload || null;
      })

      // ============================================
      // Manual UPI
      // ============================================
      .addCase(manualUPIRecharge.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(manualUPIRecharge.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload, "Manual UPI request failed");
        state.loader = false;
      })
      .addCase(manualUPIRecharge.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.manualUpiData = payload; // { recharge, status, ... }
        if (payload?.status) {
          state.successMessage =
            payload?.message || "Payment request submitted successfully";
        } else {
          state.errorMessage =
            payload?.message || "Manual UPI request failed";
        }
      })

      // ============================================
      // KwikPay status check
      // ============================================
      .addCase(kwikpayStatus.pending, (state) => {
        state.loader = true;
      })
      .addCase(kwikpayStatus.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload, "Status check failed");
        state.loader = false;
      })
      .addCase(kwikpayStatus.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.kwikpayStatusData = payload;
        state.successMessage = payload?.message || "";
      })

      // ============================================
      // addBank
      // ============================================
      .addCase(addBank.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(addBank.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(addBank.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
        state.addBankData = payload;
      })

      // ============================================
      // addusdt
      // ============================================
      .addCase(addusdt.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(addusdt.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(addusdt.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
      })

      // ============================================
      // getBank
      // ============================================
      .addCase(getBank.pending, (state) => {
        state.loader = true;
      })
      .addCase(getBank.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(getBank.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
        state.addBankData = payload?.datas?.[0] || null;
      })

      // ============================================
      // withdrawal
      // ============================================
      .addCase(withdrawal.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(withdrawal.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(withdrawal.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
        state.withdrawData = payload;
      })

      // ============================================
      // withdrawalHistory
      // ============================================
      .addCase(withdrawalHistory.pending, (state) => {
        state.loader = true;
      })
      .addCase(withdrawalHistory.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(withdrawalHistory.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
        state.withdrawHistoryData = payload?.datas || null;
      })

      // ============================================
      // bannerGet
      // ============================================
      .addCase(bannerGet.pending, (state) => {
        state.loader = true;
      })
      .addCase(bannerGet.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(bannerGet.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.bannergetData = payload || [];
        state.loader = false;
      })

      // ============================================
      // recharheBonus
      // ============================================
      .addCase(recharheBonus.pending, (state) => {
        state.loader = true;
      })
      .addCase(recharheBonus.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(recharheBonus.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.rechargeBonusData = payload?.data || [];
        state.loader = false;
      })

      // ============================================
      // zilpayRecharge
      // ============================================
      .addCase(zilpayRecharge.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(zilpayRecharge.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(zilpayRecharge.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
      })

      // ============================================
      // TrexoPayment
      // ============================================
      .addCase(TrexoPayment.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(TrexoPayment.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(TrexoPayment.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
      })

      // ============================================
      // recharge3
      // ============================================
      .addCase(recharge3.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(recharge3.rejected, (state, { payload }) => {
        console.log("register rejected payload:", payload);
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(recharge3.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
      });
  },
});

export const { messageClear, user_reset } = userReducer.actions;
export default userReducer.reducer;