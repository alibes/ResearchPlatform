
import React, { useContext } from 'react'
import './ProjectInfoCard.css'
const urlImg = import.meta.env.VITE_IMAGEPROVIDER_URL;
import projectDefaultIMG from '../../../assets/imgs/defaultIMG.png'
import { AgoraContext } from '../../../context/ContextProvider';
import { useNavigate } from 'react-router-dom';
import { ProjectMainCard } from '../ProjectMainCard';
import { fetchData2 } from '../../../helpers/axiosHelper';



export const ProjectInfoCard = ({project, members, showDeleteProjectModal}) => {

  const {user, token } = useContext(AgoraContext)
  const navigate = useNavigate()
 
  

  return (
    <section className='projectInfoCard'>
      <h2>{project?.project_title}</h2>
      <div>
         
        <div className="statusState">

          <div>
            <p className='public'>{project?.project_type === 0 && 'Public'}</p>
            <p className='private'>{project?.project_type === 1 && 'Private'}</p>
          </div>
          
          <div>
            <p className='active'>{project?.project_status === 1 && 'Active'}</p>
            <p className='closed'>{project?.project_status === 2 && 'Completed'}</p>
            <p className='paused'>{project?.project_status === 3 && 'Paused'}</p>
          </div>
        </div>
        <div className="separatorThick" />
      </div>
      
      <div className="projectData" >
        <div className='presentation'>
          <img 
            className='projectImg'
            src={project?.project_image? `
              ${urlImg}/projectImage/${project.project_image}` 
              : projectDefaultIMG} 
              alt="project image" 
          />
        </div>
      </div>

        <div className="data">
          <ProjectMainCard  
            project={project} 
            members={members}
          />
          <div className='info'>
              <p>{project?.project_city}, {project?.project_country}</p>
              <p></p>
              <p>{project?.project_description}</p>
          </div>
          
      </div>
          {user?.user_id === project?.creator_user_id && 
            <div className='buttons'>
            <button 
              onClick={() => navigate(`/editproject/${project?.project_id}`)}
              className='editButton'
            >EDIT</button>
            <button 
              onClick={() => showDeleteProjectModal()}
              className='cancel'
            >Delete</button>
            </div>
          }
    </section>
  )
}
