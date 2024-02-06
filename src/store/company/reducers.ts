import { CompanyActionTypes } from './types';
import { CompanyStateI, companyInitialState } from './state';

export const companyReducer = (state = companyInitialState, action: any): CompanyStateI => {
  switch (action.type) {
    case CompanyActionTypes.SET_LOCATIONS:
      return {
        ...state,
        locations: action.payload,
      };
    case CompanyActionTypes.SET_USERS:
      return {
        ...state,
        users: action.payload,
      };
    case CompanyActionTypes.SET_CLIENTS:
      return {
        ...state,
        clients: action.payload,
      };
    case CompanyActionTypes.SET_CAREPARTNERS:
      return {
        ...state,
        carePartners: action.payload,
      };
    case CompanyActionTypes.SET_CARE_MANAGER_ACTIVITIES:
      return {
        ...state,
        careManagerActivities: action.payload,
      };
    
    case CompanyActionTypes.RESET:
      return { ...companyInitialState };
    default:
      return { ...state };
  }
};
