import { UserActionTypes } from './types';
import { UserStateI, userInitialState } from './state';

export const userReducer = (state = userInitialState, action: any): UserStateI => {
  switch (action.type) {
    case UserActionTypes.LOGIN:
      return {
        user: action.payload,
        isLoggedIn: true,
      };
    case UserActionTypes.LOGOUT:
      return {
        user: null,
        isLoggedIn: false,
      };
    default:
      return { ...state };
  }
};
