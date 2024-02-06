import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from 'services/AxiosConfig';
import { useAuth, useCompany } from 'hooks'
import { isAdmin } from 'lib';
import jwt_decode from 'jwt-decode';
import { decode } from 'punycode';

interface ReactComponent {
  children: JSX.Element | JSX.Element[];
}

const isTokenExpired = async (auth:any) => {
  const decoded:any = jwt_decode(auth);
  

  const currentTime = Math.floor(Date.now() / 1000);  // Convert current time to UNIX timestamp (in seconds)
  

  if (decoded.exp < currentTime) {
      console.log('The token is expired');
      const reset = await API.get(`/auth/refresh-token/${decoded.id}`)
      if(reset.data.token){
        localStorage.setItem('apexcare-token', reset.data.token)
        window.location.reload()
      }
  } else {
      console.log('The token is not expired');
     
  }
}

const PrivateRoute = ({ children }: ReactComponent) => {
  const { setLocations, } = useCompany();
  const [permissions, setPermissions] = useState<any>(undefined)
  const { user } = useAuth()
  useEffect(() => {
    const fetch = async () => {
      let locationPermissions: any = await API.get(`permissions/${user._id}`)
      let locationArr: any[] = [];
      locationPermissions.data.data.map((permObj: any) => {
        locationArr.push(permObj.location._id)
        setPermissions(locationArr)
      })
      let queryString = locationArr.join(',')
      if (!isAdmin(user.roles)) {
        if (queryString) {
          let locationDetails = await API.get(`location?locations=${queryString}`);
          setLocations(locationDetails.data.data)
        } else {
          setLocations([])
        }
      }
    }
    fetch()
  }, [])
  const auth = localStorage.getItem('apexcare-token');
  if(auth){
    isTokenExpired(auth)
  }
  return auth ? <>{children}</> : <Navigate to="/login" />;
};
export default PrivateRoute;

