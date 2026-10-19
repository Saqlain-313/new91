// propertySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// promotion
export const promotions = createAsyncThunk(
  "auth/promotions",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/promotion", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const totalCommission = createAsyncThunk(
  "auth/totalcommission",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/totalcommission", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const myTeamReport = createAsyncThunk(
  "auth/myteam",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/downlinerecharge/list", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const myTeamReportSubordinate = createAsyncThunk(
  "auth/myteam-subordinate",
  async (date, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/webapi/downlinerecharge-data/list-data",
        { date: date },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const subordinates = createAsyncThunk(
  "auth/subordinate",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/subordinatedata", {
        withCredentials: true,
      });
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

export const transactionHistory = createAsyncThunk(
  "auth/transaction-history",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/webapi/transactionhistory", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const randompromotion = createAsyncThunk(
  "auth/randomp-romotion",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/webapi/random-promotion`, {
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

export const getfetchPromotionDataUser = createAsyncThunk(
  "auth/tchPromotionDataUser",
  async (date, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(`/webapi/fetchPromotionDataUser`, { date: date }, {
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




export const promotionReducer = createSlice({
  name: "promotion",
  initialState: {
    loader: false,
    errorMessage: "",
    successMessage: "",
  
    // add userDetail to initialState
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    
  },
  extraReducers: (builder) => {
    builder         
      .addCase(promotions.pending, (state) => {
        state.loader = true;
      })
      .addCase(promotions.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(promotions.fulfilled, (state, { payload }) => {
        const promotionsData = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.promotionsData = promotionsData;
      })
      .addCase(totalCommission.pending, (state) => {
        state.loader = true;
      })
      .addCase(totalCommission.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(totalCommission.fulfilled, (state, { payload }) => {
        const totalCommissionData = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.totalCommissionData = totalCommissionData;
      })
      .addCase(myTeamReport.pending, (state) => {
        state.loader = true;
      })
      .addCase(myTeamReport.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(myTeamReport.fulfilled, (state, { payload }) => {
        const myTeamReportData = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.myTeamReportData = myTeamReportData;
      })

      .addCase(myTeamReportSubordinate.pending, (state) => {
        state.loader = true;
      })
      .addCase(myTeamReportSubordinate.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(myTeamReportSubordinate.fulfilled, (state, { payload }) => {
        const mySubordinateData = payload;
        state.successMessage = payload.message;
        state.loader = false;
        state.mySubordinateData = mySubordinateData;
      })
      .addCase(subordinates.pending, (state) => {
        state.loader = true;
      })
      .addCase(subordinates.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(subordinates.fulfilled, (state, { payload }) => {
        const subordinatesData = payload.datas;
        state.successMessage = payload.message;
        state.loader = false;
        state.subordinatesData = subordinatesData;
      })
      .addCase(transactionHistory.pending, (state) => {
        state.loader = true;
      })
      .addCase(transactionHistory.rejected, (state, { payload }) => {
        // console.log('register rejected payload:', payload); // Log payload
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(transactionHistory.fulfilled, (state, { payload }) => {
        const transactionHistoryData = payload.data;
        state.successMessage = payload.message;
        state.loader = false;
        state.transactionHistoryData = transactionHistoryData;
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
      .addCase(newSubordinate.pending, (state) => {
        state.loader = true;
      })
      .addCase(newSubordinate.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(newSubordinate.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.newSubordinateData = payload.datas || [];
        state.loader = false;
      })
         .addCase(randompromotion.pending, (state) => {
              state.loader = true;
            })
            .addCase(randompromotion.rejected, (state, { payload }) => {
              state.errorMessage = payload?.errorMessage || "An error occurred";
              state.loader = false;
            })
            .addCase(randompromotion.fulfilled, (state, { payload }) => {
              state.successMessage = payload.message || "";
              state.randompromotionData = payload.data || [];
              state.loader = false;
            })
                 .addCase(getfetchPromotionDataUser.pending, (state) => {
        state.loader = true;
      })
      .addCase(getfetchPromotionDataUser.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(getfetchPromotionDataUser.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "";
        state.subordinateData = payload?.data || [];
        state.levelData = payload?.levelData || [];
        state.userData = payload?.userData || [];
        state.loader = false;
      })
  },
});

export const { messageClear } = promotionReducer.actions;
export default promotionReducer.reducer;
