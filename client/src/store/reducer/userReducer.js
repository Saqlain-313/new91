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
    payload?.error?.message ||
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
    }
  }
);

// ============================================
// DEMO USER BALANCE REFILL
// ============================================
export const refillDemoBalance = createAsyncThunk(
  "auth/refill-demo-balance",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/demo/refill-balance",
        {},
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
    }
  }
);

export const checkDemoBalance = createAsyncThunk(
  "auth/check-demo-balance",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/demo/check-balance", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
    }
  }
);

// ============================================
// QUROPAY PAYMENT
// POST /api/wallet/paynow/quropay  → { payment_url, recharge, ... }
// ============================================
export const quropayRecharge = createAsyncThunk(
  "auth/quropay-recharge",
  async ({ money, email }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const body = { money: Number(money) };
      if (email) body.email = String(email).trim();
      const { data } = await api.post("/wallet/paynow/quropay", body, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
    }
  }
);

// ============================================
// QUROPAY STATUS CHECK
// GET /wallet/check/quropay?orderId=...
// ============================================
export const quropayStatus = createAsyncThunk(
  "auth/quropay-status",
  async ({ orderId }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/wallet/check/quropay", {
        params: { orderId },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
    }
  }
);

// ============================================
// GET MANUAL UPI PAYMENT DETAILS
// GET /wallet/paynow/manual_upi
// ============================================
export const getManualUPIDetails = createAsyncThunk(
  "auth/get-manual-upi-details",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/wallet/paynow/manual_upi", {
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
// MANUAL UPI PAYMENT REQUEST
// POST /wallet/paynow/manual_upi_request  → { money, utr }
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
      return rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
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
    demoRefillData: null,
    demoCheckData: null,
    demoRefillLoading: false,

    // QuroPay
    quropayData: null,
    quropayStatusData: null,

    // Manual UPI
    manualUpiData: null,
    manualUpiDetailsData: null,
    manualUpiDetailsLoading: false,
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
      state.demoRefillData = null;
      state.demoCheckData = null;
      state.demoRefillLoading = false;

      state.quropayData = null;
      state.quropayStatusData = null;

      state.manualUpiData = null;
      state.manualUpiDetailsData = null;
      state.manualUpiDetailsLoading = false;

      state.errorMessage = "";
      state.successMessage = "";
      state.loader = false;
    },
  },
  extraReducers: (builder) => {
    builder
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
      // QuroPay
      // ============================================
      .addCase(quropayRecharge.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(quropayRecharge.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(
          payload,
          "QuroPay payment failed"
        );
        state.loader = false;
      })
      .addCase(quropayRecharge.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
        state.quropayData = payload;
      })

      // ============================================
      // QuroPay status
      // ============================================
      .addCase(quropayStatus.pending, (state) => {
        state.loader = true;
      })
      .addCase(quropayStatus.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload, "Status check failed");
        state.loader = false;
      })
      .addCase(quropayStatus.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.quropayStatusData = payload;
        state.successMessage = payload?.message || "";
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
        state.errorMessage = getErrorMessage(
          payload,
          "Unable to load UPI details"
        );
      })
      .addCase(getManualUPIDetails.fulfilled, (state, { payload }) => {
        state.manualUpiDetailsLoading = false;
        state.manualUpiDetailsData = payload?.data || payload || null;
      })

      // ============================================
      // Manual UPI submit
      // ============================================
      .addCase(manualUPIRecharge.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(manualUPIRecharge.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(
          payload,
          "Manual UPI request failed"
        );
        state.loader = false;
      })
      .addCase(manualUPIRecharge.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.manualUpiData = payload;
        if (payload?.status) {
          state.successMessage =
            payload?.message || "Payment request submitted successfully";
        } else {
          state.errorMessage = payload?.message || "Manual UPI request failed";
        }
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

      .addCase(recharge3.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(recharge3.rejected, (state, { payload }) => {
        state.errorMessage = getErrorMessage(payload);
        state.loader = false;
      })
      .addCase(recharge3.fulfilled, (state, { payload }) => {
        state.successMessage = payload?.message || "";
        state.loader = false;
      })// ============================================
      // DEMO BALANCE REFILL
      // ============================================
      .addCase(refillDemoBalance.pending, (state) => {
        state.demoRefillLoading = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(refillDemoBalance.rejected, (state, { payload }) => {
        state.demoRefillLoading = false;
        state.errorMessage = getErrorMessage(payload, "Demo refill failed");
      })
      .addCase(refillDemoBalance.fulfilled, (state, { payload }) => {
        state.demoRefillLoading = false;
        state.demoRefillData = payload;
        if (payload?.refilled) {
          state.successMessage = payload?.message || "Demo balance refilled";
        } else {
          // refilled=false is a valid non-error case (balance already enough)
          state.successMessage = payload?.message || "";
        }
      })

      .addCase(checkDemoBalance.pending, (state) => {
        state.loader = true;
      })
      .addCase(checkDemoBalance.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = getErrorMessage(payload, "Demo check failed");
      })
      .addCase(checkDemoBalance.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.demoCheckData = payload;
      });
  },
});

export const { messageClear, user_reset } = userReducer.actions;
export default userReducer.reducer;