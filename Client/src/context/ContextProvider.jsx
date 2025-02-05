import { useEffect } from "react";
import { createContext, useState } from "react";
import { fetchData2 } from "../helpers/axiosHelper";


export const AgoraContext = createContext();

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [token, setToken] = useState();
  const [projects, setProjects] = useState();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {  
        const res = await fetchData2('user/findUserById', 'get', null,  { Authorization: `Bearer ${token}` });
        
        if (res.length > 0) {
          setUser(res[0]);
        }
      } catch (error) {
        console.log(error);
      }
  
    };

    

    const tokenLocal = localStorage.getItem('agoraToken');
    if (tokenLocal && !token) {
      setToken(tokenLocal);
    }

    if (token && !user) {
      fetchUser();
    }

  }, [token, user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !token) return;

      try {
        const res = await fetchData2(`notification/userNotifications/${user.user_id}`, 'get', {}, { Authorization: `Bearer ${token}` });
        setNotifications(res);
      } catch (error) {
        console.log(error);
      }
    };

    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 1000);
    return () => clearInterval(interval);
  }, [user, token]);

  const markNotificationAsRead = async (id) => {
    try {
      await fetchData2(`notification/markAsRead/${id}`, 'put', {}, { Authorization: `Bearer ${token}` });
      
      setNotifications((prev) => prev.filter((notif) => notif.notification_id !== id));
      
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <AgoraContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        projects,
        setProjects,
        notifications,
        setNotifications,
        markNotificationAsRead,
      }}
    >
      {children}
    </AgoraContext.Provider>
  );
};