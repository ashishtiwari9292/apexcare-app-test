import { isAdmin } from 'lib';
import { Navigate } from 'react-router-dom';
import {useAuth} from 'hooks'


interface ReactComponent {
  children: JSX.Element | JSX.Element[];
}

const AdminRoute = ({ children }: ReactComponent) => {
  const {user} = useAuth()
  return isAdmin(user?.roles) ? <>{children}</> : <Navigate to="/login" />;
};
export default AdminRoute;

