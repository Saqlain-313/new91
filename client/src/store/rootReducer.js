import  activityReducer  from "./reducer/activityReducer";
import authReducer from "./reducer/authReducer";
import betReducer from "./reducer/betReducer";
import gameReducer from "./reducer/gameReducer";
import  promotionReducer  from "./reducer/promotionReducer";
import spribeGameReducer from "./reducer/spribeGameReducer";
import  userReducer  from "./reducer/userReducer";

const rootReducer = {
  auth: authReducer,
  game: gameReducer,
  bet: betReducer,
  user:userReducer,
  activity:activityReducer,
  promotion:promotionReducer,
  spribeGame: spribeGameReducer,
};

export default rootReducer;
