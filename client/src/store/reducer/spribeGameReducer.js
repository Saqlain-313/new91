// propertySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// wingo  game

export const checkBalance = createAsyncThunk(
  "spribe/checkBalance",
  async (playerid, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/spribeapi/checkBalance",
        { playerid: playerid },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const transferBalance = createAsyncThunk(
  "spribe/transferBalance",
  async (playerid, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/spribeapi/transferBalance",
        { playerid: playerid },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const launchGame = createAsyncThunk(
  "spribe/launchGame",
  async ({ playerid, gameId }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/spribeapi/launchGame",
        { playerid: playerid, gameId: gameId },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const gameListByGameType = createAsyncThunk(
  "spribe/gameListByGameType",
  async ({ game_type, page, size }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(
        `/spribeapi/gameListByGameType?game_type=${game_type}&page=${page}&size=${size}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const gameListByProvider = createAsyncThunk(
  "spribe/gameListByProvider",
  async ({ provider, page, size }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(
        `/spribeapi/gameListByProvider?provider=${provider}&page=${page}&size=${size}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const gameListByGameTypeAndProvider = createAsyncThunk(
  "spribe/gameListByGameTypeAndProvider",
  async (
    { provider, game_type, page, size },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/spribeapi/gameListByGameTypeAndProvider?provider=${provider}&game_type=${game_type}&page=${page}&size=${size}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const gameList = createAsyncThunk(
  "spribe/gamelist",
  async ({ page, size }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(
        `/spribeapi/gamelist?page=${page}&size=${size}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const gameHistory = createAsyncThunk(
  "spribe/gamehistory",
  async ({ phone, page, size }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        `/spribeapi/gameHistory/${phone}`,
        { page: page, size: size },
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const spribeGameReducer = createSlice({
  name: "spribeGame",
  initialState: {
    loader: false,
    errorMessage: "",
    successMessage: "",
    checkBalanceData: null,
    listTypeData: [],
    // add userDetail to initialState
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    spribegames_reset: (state) => {
      state.checkBalanceData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkBalance.pending, (state) => {
        state.loader = true;
      })
      .addCase(checkBalance.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(checkBalance.fulfilled, (state, { payload }) => {
        state.checkBalanceData = payload.data;
        state.successMessage = payload.message;
        state.loader = false;
      })

      .addCase(transferBalance.pending, (state) => {
        state.loader = true;
      })
      .addCase(transferBalance.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(transferBalance.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
      })

      .addCase(launchGame.pending, (state) => {
        state.loader = true;
      })
      .addCase(launchGame.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(launchGame.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
      })

      .addCase(gameListByGameType.pending, (state) => {
        state.loader = true;
      })
      .addCase(gameListByGameType.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(gameListByGameType.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
        state.listTypeData = payload.data.data;
      })
      .addCase(gameListByProvider.pending, (state) => {
        state.loader = true;
      })
      .addCase(gameListByProvider.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(gameListByProvider.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
        state.listProviderData = payload.data.data;
      })
      .addCase(gameListByGameTypeAndProvider.pending, (state) => {
        state.loader = true;
      })
      .addCase(gameListByGameTypeAndProvider.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(
        gameListByGameTypeAndProvider.fulfilled,
        (state, { payload }) => {
          state.successMessage = payload.message;
          state.loader = false;
        }
      )

      .addCase(gameHistory.pending, (state) => {
        state.loader = true;
      })
      .addCase(gameHistory.rejected, (state, { payload }) => {
        state.errorMessage = payload?.errorMessage || "An error occurred";
        state.loader = false;
      })
      .addCase(gameHistory.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
        state.gameHistoryData = payload.data.data;
      });
  },
});

export const { messageClear, spribegames_reset } = spribeGameReducer.actions;
export default spribeGameReducer.reducer;
