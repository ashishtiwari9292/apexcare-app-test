import { useContext, createContext, FC, useEffect, useReducer } from 'react';
import jwt_decode from 'jwt-decode';
import API from 'services/AxiosConfig';
import { userReducer, UserStateI, UserActionTypes, userInitialState } from 'store';
import { useCompany } from 'hooks';
import { isAdmin } from 'lib';
import { toast } from 'react-toastify';

const STATE_LS_KEY = 'user';

interface AuthInput {
  email: string;
  password: string;
}

type AuthFn<T = void> = ({ email, password }: AuthInput) => Promise<T>;

interface decoded {
  id: string;
  fullName: string;
  email: string;
  userRole: [string];
  location: string;
}

export interface Context extends UserStateI {
  signInWithEmail: AuthFn;
  logout: () => void;
}

const LSinitialState = JSON.parse(localStorage.getItem(STATE_LS_KEY) as string) || userInitialState;

export const AuthContext = createContext({} as Context);

export const AuthContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, LSinitialState);
  const { setLocations, setUsers, resetCompany, setClients, setCarePartners, setCareManagerActivities } = useCompany();

  const logout: Context['logout'] = () => {
    dispatch({ type: UserActionTypes.LOGOUT });
    resetCompany();
    localStorage.removeItem('apexcare-token');
  };

  const signInWithEmail: Context['signInWithEmail'] = async ({ email, password }) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      localStorage.setItem('apexcare-token', response.data.token);
      const decoded: decoded = jwt_decode(response.data.token);
      const { firstName, lastName, _id, roles } = response.data.user;
      const userData = {
        _id,
        decodedId: decoded.id,
        firstName,
        lastName,
        email: decoded.email,
        location: response.data.user.location,
        roles
      };
      dispatch({ type: UserActionTypes.LOGIN, payload: userData });
      const locationFilter: any[] = []
      let locationsData: any = {};

      if (!isAdmin(roles)) {
        let locationPermissions: any = await API.get(`permissions/${_id}`)
        locationPermissions.data.data.map((permObj: any) => {
          locationFilter.push(permObj.location._id)
        })
        let queryString = locationFilter.join(',')
        if (queryString) {
          locationsData = await API.get(`location?locations=${queryString}`);
        } else {
          locationsData = { data: { data: [] } }
        }
      } else {
        locationsData = await API.get(`location/all?type=Active`)
      }
      setLocations(locationsData.data.data);
      const usersData = await API.get('user/Active');
      setUsers(usersData.data.data);
      const clientsData = await API.get('client');
      setClients(clientsData.data.data);
      const carePartnersData = await API.get('care-partner');
      setCarePartners(carePartnersData.data.data);
      const careManagerActivitiesData = await API.get('care-manager-activity');
      setCareManagerActivities(careManagerActivitiesData.data.data);
      localStorage.setItem('openActivities', JSON.stringify([]))
    } catch (error: any) {
     toast.error(error?.response?.data.error || error)
    }
  };

  useEffect(() => {
    localStorage.setItem(STATE_LS_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AuthContext.Provider
      value={{
        signInWithEmail,
        logout,
        ...state,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  const context = useContext(AuthContext);

  return context;
}
