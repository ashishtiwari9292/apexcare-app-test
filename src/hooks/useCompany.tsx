import React, { useContext, createContext, FC, useEffect, useReducer } from 'react';
import { CompanyStateI, CompanyActionTypes, companyInitialState } from 'store';
import { companyReducer } from 'store/company/reducers';

const STATE_LS_KEY = 'company';

export interface Context extends CompanyStateI {
  setLocations: (locations: any[]) => void;
  setUsers: (users: any[]) => void;
  setClients: (clients: any[]) => void;
  setCarePartners: (carePartners: any[]) => void;
  resetCompany: () => void;
  setCareManagerActivities: (activities: any[]) => void;
}

const LSinitialState = JSON.parse(localStorage.getItem(STATE_LS_KEY) as string) || companyInitialState;

export const CompanyContext = createContext({} as Context);

export const CompanyContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(companyReducer, LSinitialState);

  const setLocations: Context['setLocations'] = (locations: any[]) => {
    dispatch({ type: CompanyActionTypes.SET_LOCATIONS, payload: locations });
  };

  const setUsers: Context['setUsers'] = (users: any[]) => {
    dispatch({ type: CompanyActionTypes.SET_USERS, payload: users });
  };

  const setClients: Context['setClients'] = (clients: any[]) => {
    dispatch({ type: CompanyActionTypes.SET_CLIENTS, payload: clients });
  };

  const setCarePartners: Context['setCarePartners'] = (carePartners: any[]) => {
    dispatch({ type: CompanyActionTypes.SET_CAREPARTNERS, payload: carePartners });
  };

  const resetCompany: Context['resetCompany'] = () => {
    dispatch({ type: CompanyActionTypes.RESET });
  };

  const setCareManagerActivities: Context['setCareManagerActivities'] = (activities: any[]) => {
    dispatch({ type: CompanyActionTypes.SET_CARE_MANAGER_ACTIVITIES, payload: activities });
  };

  useEffect(() => {
    localStorage.setItem(STATE_LS_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <CompanyContext.Provider
      value={{
        setLocations,
        setUsers,
        setClients,
        setCarePartners,
        resetCompany,
        setCareManagerActivities,
        ...state,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export default function useAuth() {
  const context = useContext(CompanyContext);

  return context;
}
