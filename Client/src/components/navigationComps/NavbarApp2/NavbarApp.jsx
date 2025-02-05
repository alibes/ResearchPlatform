import React, { useContext, useRef, useState } from 'react'
import logo from '../../../../src/assets/logo/Logo_short_WhiteBlue.png'
import './NavbarApp.css'
import { NavLink, useNavigate } from 'react-router-dom'
import avatarDefault from '../../../assets/imgs/defaultIMG.png'
import bell from '../../../assets/icons/bell.svg'
import { AgoraContext } from '../../../context/ContextProvider'
import { ScrollToTop } from '../ScrollToTop/ScrollToTop'
const urlImg = import.meta.env.VITE_IMAGEPROVIDER_URL;


export const NavbarApp = () => {

  const scrollGoUp = useRef();
  
  const navigate = useNavigate()
  const { user, setToken, notifications, markNotificationAsRead } = useContext(AgoraContext);
  

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  const [dropdownMenu, setDropdownMenu] = useState('');

  const closeDropdown = () => {setDropdownMenu('')}

  const handleNotificationClick = (notif) => {
    
    switch (notif.type) {
      case 1: 
        navigate(`/chat/${notif.user_id}`); 
        break;
      case 2:
      case 3: 
      case 4:
        navigate(`/profile`);
        break;
      case 5: 
        navigate(`/allprojects`); 
        break;
      case 6:
        navigate('/profile');
        break;
      default:
        console.log("Unknown notification type:", notif.type);
    }
  
    markNotificationAsRead(notif.notification_id);
    closeDropdown();
  };

  const logOut = () => {
    localStorage.removeItem('agoraToken')
    setUser();
    setToken();
  }

  hamburger?.addEventListener('click', () => {
      navLinks.classList.toggle('active');
  });
  

  return (

    <header ref={scrollGoUp}  >
      <ScrollToTop scrollGoUp={scrollGoUp} />
      <nav className='navbarApp'>
        <div className='bar'>
        <img 
          onClick={()=>navigate('/')}
          onMouseEnter={closeDropdown}
          src={logo} 
          className="logoNavbar" 
          alt="Agora logo" 
        />

        <ul className='navLinks'>
        <li>
            <NavLink
              to={'/'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
              onMouseEnter={closeDropdown}
            >Home</NavLink>
        </li>
        <li>
            <NavLink
              to={'/infolayout/about'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
              onMouseEnter={()=>setDropdownMenu('about')}
            >About</NavLink>
        </li>
       
        { user &&
          <li>
            <NavLink
              to={'/researchers'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
              onMouseEnter={()=>setDropdownMenu('research')}
            >Research</NavLink>
        </li>}
        <li className='loginRegisterButtons'>
            {!user && <button
              onClick={()=>navigate('/register')}
            >Sign Up</button>}
        </li>
        <li className='loginRegisterButtons'>
            {!user && <button
              onClick={()=>navigate('/login')}
            >Log In</button>}
        </li>
        <li>
        { user &&
              <div className='userNav'>
              <img 
                className={`avatarNav ${notifications.length > 0 ? 'avatarNav--withNotif' : ''}`}
                onClick={() => navigate('/profile')}
                onMouseOver={() => setDropdownMenu('userMenu')}
                src={user?.user_avatar ? `${urlImg}/useravatar/${user.user_avatar}` : avatarDefault} 
                alt="Your profile picture" 
              />
          <div>
          </div>

        {dropdownMenu === 'userMenu' && 
         <div 
          className='menuDropdown menuUser' 
          id='menuUser'
          onMouseLeave={closeDropdown}
         >
          <div className='separator' />
            <NavLink
                to={'/profile'}
                className={({ isActive })=>(isActive? 'active':'inactive')}
              >Profile</NavLink>
            <div className='separator' />
            <NavLink
                to={'/personalData'}
                className={({ isActive })=>(isActive? 'active':'inactive')}
              >Personal Data</NavLink>
            <div className='separator' />
            <NavLink
                to={'/editProfile'}
                className={({ isActive })=>(isActive? 'active':'inactive')}
              >Settings</NavLink>
            <div className='separator' />
            <NavLink
                to={'/'}
                className={({ isActive })=>(isActive? 'active':'inactive')}
                onClick={logOut}
              >Log Out</NavLink>
            <div className='separator' />
               <div className='notifications'
                onClick={() => setDropdownMenu(dropdownMenu === 'notifications' ? '' : 'notifications')}
               >
                {notifications?.length > 0 && <span className="badge">{notifications?.length}</span>}
                <img 
                className='bellIcon' 
                src={bell} 
                alt="notifications icon" 
                 />
              </div>
            <div className='separator' />
          </div>}

        {dropdownMenu === 'notifications' && (
                  <div
                    className='menuDropdown menuNotifications'
                    onMouseLeave={closeDropdown}
                  >
                    <div className='separator' />

                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.notification_id}
                          className={`notificationItem ${notif.is_read ? 'read' : 'unread'}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <p>{notif.content}</p>
                          <div className='separator' />
                        </div>
                      ))
                    ) : (
                      <div className='notificationItem'>No notifications</div>
                    )}

                  </div>
                )}
              
        {dropdownMenu === 'about' && 
         <div 
          className='menuDropdown menuAbout' 
          id='menuAbout'
          onMouseLeave={closeDropdown}
         >
            <div className='separator' />
          <NavLink
              to={'/infolayout/about'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
            >About</NavLink>
            <div className='separator' />
          <NavLink
              to={'/infolayout/Metrics'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
            >Metrics</NavLink>
            <div className='separator' />
          <NavLink
              to={'/infolayout/Partnership'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
            >Partnership</NavLink>
            <div className='separator' />
          <NavLink
              to={'/infolayout/Contact'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
            >Contact</NavLink>
         </div>}

        {dropdownMenu === 'research' && 
         <div 
          className='menuDropdown menuResearch' 
          id='menuProject'
          onMouseLeave={closeDropdown}
         >
            <div className='separator' />
            <NavLink
              to={'/researchers'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
            >Researchers</NavLink>
            <div className='separator' />
          <NavLink
              to={'/allprojects'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
            >Projects</NavLink>
            <div className='separator' />
          <NavLink
              to={'/alloffer'}
              className={({ isActive })=>(isActive? 'active':'inactive')}
            >Collaboration Board</NavLink>
            <div className='separator' />
         
         </div>}
        </div>}
        </li>
        </ul>
        </div>
      </nav>
      
      
        

         
       
    </header>
  )
}
