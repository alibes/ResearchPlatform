import { useNavigate, useParams } from "react-router-dom";
import { AgoraContext } from "../../../context/ContextProvider";
import { fetchData, fetchData2 } from "../../../helpers/axiosHelper";
import StatsRadarChart from "../../../components/usersComp/RadarGraph";
import { useContext, useEffect, useState } from "react";
import "./Researcher.css";
import { ResearcherDataCard } from "../../../components/researcherComp/ResearcherDataCard";
import { ProjectResearcherCard } from "../../../components/researcherComp/ProjectResearcherCard";
import { ReviewModal } from "../../../components/researcherComp/ReviewModal";
import { ResearcherReviewCard } from "../../../components/usersComp/ResearcherReviewCard";

export const Researcher = () => {
  const { user, token } = useContext(AgoraContext);
  const { id } = useParams();
  const [researcher, setResearcher] = useState();
 
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [requests, setrequests] = useState([]);
  const [invites, setInvites] = useState([]);
  const [show, setShow] = useState(false);
  const [review, setReview] = useState([]);


  const [latestReviewCount, setLatestReviewCount] = useState(0);

  useEffect(() => {
    if (review.length > latestReviewCount) {
      fetchResearcher();
      setLatestReviewCount(review.length);
    }
  }, [review.length]);

  const fetchResearcher = async () => {
    try {
      let data = { user_id: id };
      const result = await fetchData(`/getresearcherbyid`, "post", data);
      if (!result[0]) {
        throw new error("* user not found");
      }
      setResearcher(result[0]);
      setReview(result.review);
    } catch (error) {
      console.log(error);
      navigate("/errorpage");
    }
  };

  const fetchProjects = async () => {
    try {
      let data = { user_id: id };

      const result = await fetchData2(
        `project/oneresearcherprojects`,
        "post",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(result);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFn = async () => {
    await fetchResearcher();
    await fetchProjects();
  };

  useEffect(() => {
    fetchFn();
  }, []);

  
  return (
    <>
      <section>
        <div className="containerPpal">
          <ResearcherDataCard researcher={researcher} />
        </div>

        <div className="containerPpal">
          <StatsRadarChart />
        </div>
      </section>

      {projects.length > 0 && (
        <section className="containerPpal projectsSection">
          <div className="projectsGallery">
            <h3>Projects</h3>
            {projects?.map((elem, index) => {
              return (
                <div key={elem.project_id} className="projectsGallery">
                  <ProjectResearcherCard elem={elem} researcher={researcher} />
                  <div className="separatorProjects" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="reviewSect containerPpal">
        <button 
          className="reviewButton" 
          onClick={() => setShow(!show)}
        >Write a review</button>
        
        {show && (
          <ReviewModal
            show={show}
            setShow={setShow}
            researcher={researcher.user_id}
            user={user.user_id}
            setReview={setReview}
          />
        )}
      </section>
      <section className="containerPpal offersSection">
        <div className="reviewGallery">
          {review?.map((elem, index) => {
            return <ResearcherReviewCard key={index} elem={elem} />;
          })}
        </div>
      </section>
    </>
  );
};
