import { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { clearUser } from '../store/reducers/userReducer';

function Logout() {
    const dispatch = useDispatch();
    const logout = () => {
        localStorage.removeItem("authToken");
        dispatch(clearUser());
        window.location.href = "/";
    }
    useEffect(() => {
        logout();
    })
  return (
    <div>Logout</div>
  )
}

export default Logout