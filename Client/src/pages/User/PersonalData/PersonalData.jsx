import React, { useContext } from 'react'
import './PersonalData.css'
import { useNavigate } from 'react-router-dom'
import avatarDefault from '../../../assets/imgs/defaultIMG.png'
const urlImg = import.meta.env.VITE_IMAGEPROVIDER_URL;
import { AgoraContext } from '../../../context/ContextProvider'
import { PersonalDataCard } from '../../../components/usersComp/PersonalDataCard/PersonalDataCard';

export const PersonalData = () => {

  const navigate = useNavigate();
  const { user } = useContext(AgoraContext)
  return (
    <section className='containerPpal personalDataPage'>
                <img 
                className='profileAvatar'
                  src={user?.user_avatar? `${urlImg}/useravatar/${user.user_avatar}` : avatarDefault} 
                  alt="profile picture" 
                />
              <PersonalDataCard />
      <button onClick={() => navigate('/editProfile')}>Edit</button>
    </section>
  )
}
