import { dbPool, executeQuery } from "../../config/db.js";
import { hashPassword } from "../../utils/hashUtils.js";

class UserDal {
  register = async (values) => {
    try {
      let sql = "INSERT INTO user (user_email, user_password) VALUES (?, ?)";
      const result = await executeQuery(sql, values);
      return result;
    } catch (error) {
      throw error;
    }
  };

  findUserbyEmail = async (email) => {
    try {
      let sql =
        "SELECT * FROM user WHERE user_email = ? AND user_is_disabled = 0 AND user_is_verified = 1";
      const result = await executeQuery(sql, [email]);
      return result;
    } catch (error) {
      throw error;
    }
  };

  verifyUser = async (user_id) => {
    try {
      let sql = "UPDATE user SET user_is_verified = 1 WHERE user_id = ?";
      const result = await executeQuery(sql, [user_id]);
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  resetPassword = async (user_id, newPassword) => {
    const hashedPassword = await hashPassword(newPassword);
    let sql = "UPDATE user SET user_password = ? WHERE user_id = ?";
    const result = await executeQuery(sql, [hashedPassword, user_id]);
    return result;
  };

  editUser = async (values, file) => {
    
    let sql =
      "UPDATE user SET user_name = ?, user_lastname = ?, user_country = ?, user_city = ?, user_description = ?, user_proficiency = ?, user_current_lab = ?, user_current_boss = ? WHERE user_id = ?";

    if (file) {
      sql =
        "UPDATE user SET user_name = ?, user_lastname = ?, user_country = ?, user_city = ?, user_description = ?, user_proficiency = ?, user_current_lab = ?, user_current_boss = ?, user_avatar = ? WHERE user_id = ?";
      values.splice(8, 0, file.filename);
    }
    try {
      const result = await executeQuery(sql, values);
      return result;
    } catch (error) {
      throw error;
      
    }
  };

  saveTags = async (type, name, user_id, id, finalArrayData) => {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      let sql = `INSERT INTO ${type} (${name}, ${id}) VALUES (?, ?)`;
      let finalId = 1;
      for (const elem of finalArrayData) {
        if (elem != "") {
          let sqlId = `SELECT max(${id}) AS id FROM ${type}`;
          try {
            let [result] = await connection.execute(sqlId);
            if (result[0].id != null) {
              finalId = result[0].id + 1;
            }
            await connection.execute(sql, [elem, finalId]);
          } catch (error) {
            if (error.errno != 1062) {
              throw error;
            }
          }
        }
      }
      let dataString = finalArrayData.join();
      let sql2 = `SELECT ${id} FROM ${type} WHERE find_in_set(${name}, ?)`;
      let [result] = await connection.execute(sql2, [dataString]);
      let sql3 = `DELETE FROM user_${type} WHERE user_id = ?`;
      await connection.execute(sql3, [user_id]);
      let sql4 = `INSERT INTO user_${type} (user_id, ${id}) VALUES (?, ?)`;
      for (const elem of result) {
        await connection.execute(sql4, [user_id, elem[id]]);
      }
      await connection.commit();
      return "ok";
    } catch (error) {
      await connection.rollback()
      throw error;
    } finally {
     connection.release();
    }
  }


  allUsers = async () => {
    try {
      let sql = `SELECT 
          u.user_id, 
          u.user_name, 
          u.user_lastname, 
          u.user_email, 
          u.user_country, 
          u.user_city, 
          u.user_description, 
          u.user_proficiency, 
          u.user_avatar,
          IFNULL(GROUP_CONCAT(DISTINCT s.skill_name), '') AS skills, 
          IFNULL(GROUP_CONCAT(DISTINCT f.field_name), '') AS fields
            FROM user u
            LEFT JOIN user_skill us ON u.user_id = us.user_id 
            LEFT JOIN skill s ON us.skill_id = s.skill_id 
            LEFT JOIN user_field uf ON u.user_id = uf.user_id 
            LEFT JOIN field f ON uf.field_id = f.field_id 
            WHERE u.user_type = 2 AND u.user_is_disabled = 0 AND u.user_is_verified = 1
            GROUP BY u.user_id, u.user_name, u.user_lastname, u.user_email, u.user_country, u.user_city, u.user_description, u.user_proficiency;
`;

      const result = await executeQuery(sql)
      return result;
    } catch (error) {
      throw error;
    }
  }

  GetResearcherById = async (user_id) => {
    try {
      let sql = 'SELECT * FROM user WHERE user_id = ?'
      const result = await executeQuery(sql, [user_id]);
      let sqlReview = 'SELECT r.*, u.user_name AS reviewer_name, u.user_lastname AS reviewer_lastname, u.user_avatar as img FROM review r LEFT JOIN user u ON r.user_id = u.user_id WHERE r.reviewed_user_id = ?;'
      const review = await executeQuery(sqlReview,[user_id])
      let finalResult = {...result,review}
      
  
      return finalResult;
      
    } catch (error) {
      throw error;
    }
  }


  deleteUser = async (user_id) => {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      let sqlUser = "UPDATE user SET user_is_disabled = 1 WHERE user_id = ?";
      await connection.execute(sqlUser, [user_id]);

      let sqlSkill = "UPDATE user_skill SET user_skill_is_disabled = 1 WHERE user_id = ?";
      await connection.execute(sqlSkill, [user_id]);

      let sqlField = "UPDATE user_field SET user_field_is_disabled = 1 WHERE user_id = ?";
      await connection.execute(sqlField, [user_id]);

      let sqlProject = "UPDATE project SET project_is_disabled = 1 WHERE creator_user_id = ?";
        await connection.execute(sqlProject, [user_id]);

      let sqlOffer = "UPDATE offer SET is_deleted = 1 WHERE project_id IN (SELECT project_id FROM project WHERE creator_user_id = ?)";
        await connection.execute(sqlOffer, [user_id]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  getUserById = async (id) => {
    try {
      let sql =
        "SELECT * FROM USER WHERE user_id = ? AND user_is_disabled = 0 AND user_is_verified = 1";
      const result = await executeQuery(sql, [id]);
      return result;
    } catch (error) {
      throw error;
    }
  };

  getskillsfields = async (id) => {
    try {
      let sql = `
        SELECT uf.user_id,
        GROUP_CONCAT(DISTINCT s.skill_name ORDER BY s.skill_name) AS skills,
        GROUP_CONCAT(DISTINCT f.field_name ORDER BY f.field_name) AS fields
        FROM user_field uf
        LEFT JOIN user_skill us ON uf.user_id = us.user_id
        LEFT JOIN skill s ON us.skill_id = s.skill_id
        LEFT JOIN field f ON uf.field_id = f.field_id
        WHERE uf.user_id = ?
        GROUP BY uf.user_id;`;
      const res = await executeQuery(sql, [id]);
      return res;
    } catch (error) {
      throw error;
    }
  };


  requestResponse = async (values) => {
    const connection = await dbPool.getConnection();
    const [user_id, project_id, offer_id] = values;

    try {
      await connection.beginTransaction();

      let sql = "SELECT number_of_position FROM offer WHERE offer_id = ?";
      const [offer] = await connection.execute(sql, [offer_id]);

      if (offer.length === 0) {
        throw new Error("Offer not found.");
      }

      let sqlUserProject =
        "INSERT INTO user_project(user_id, project_id) VALUES (?, ?)";
      await connection.execute(sqlUserProject, [user_id, project_id]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  updateRequestStatus = async (values, request_status,choose) => {
    const connection = await dbPool.getConnection();
    const [user_id, project_id, offer_id] = values;

    try {
      await connection.beginTransaction();

      let sql = "SELECT number_of_position FROM offer WHERE offer_id = ?";
      const [offer] = await connection.execute(sql, [offer_id]);

      if (offer.length === 0) {
        throw new Error("Offer not found.");
      }

      let currentNumberOfPositions = offer[0].number_of_position;

      if (currentNumberOfPositions <= 0) {
        throw new Error("No positions available in the offer.");
      }

      
      let sqlUserProject =
      "INSERT INTO user_project(user_id, project_id,status) VALUES (?, ?, ?)";
      await connection.execute(sqlUserProject, [user_id, project_id, choose]);
      if (choose === 2) {
        let updatedNumberOfPositions = currentNumberOfPositions - 1;
        
        let sqlOffer =
        "UPDATE offer SET number_of_position = ? WHERE offer_id = ?";
        await connection.execute(sqlOffer, [updatedNumberOfPositions, offer_id]);
      }
      
      let sqlRequest =
        "UPDATE request SET request_status = ? WHERE offer_id = ? AND user_id = ?";
      await connection.execute(sqlRequest, [request_status, offer_id, user_id]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };


  findUsersBySkills = async (skills, name) => {
    const skillArray = skills
      ? skills
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((skill) => skill.trim()).filter((skill) => skill.length > 0)
      : [];
  
    const hasSkills = skillArray.length > 0;
    const hasName = name && name.trim().length > 0;
    if (!hasSkills && !hasName) {
      return [];
    }
  
    const placeholders = hasSkills ? skillArray.map(() => "?").join(",") : null;
    const connection = await dbPool.getConnection();
  
    try {
      const usersSql = `
        SELECT DISTINCT u.*
        FROM user u
        LEFT JOIN user_skill us ON u.user_id = us.user_id
        LEFT JOIN skill s ON us.skill_id = s.skill_id
        WHERE u.user_is_disabled = 0
        ${hasSkills ? `AND s.skill_name IN (${placeholders})` : ""}
        ${hasName ? `AND u.user_name LIKE CONCAT('%', ?, '%')` : ""}
        GROUP BY u.user_id
        ${hasSkills ? "HAVING COUNT(DISTINCT s.skill_id) = ?" : ""};
      `;
  
      const queryParams = [
        ...(hasSkills ? skillArray : []),
        ...(hasName ? [name] : []),
        ...(hasSkills ? [skillArray.length] : [])
      ];
  
      const [users] = await connection.execute(usersSql, queryParams);
      if (users.length === 0) {
        return [];
      }
  
      const usersIds = users.map((u) => u.user_id);
      if (usersIds.length === 0) return users;
  
      const skillPlaceholders = usersIds.map(() => "?").join(",");
      const skillsSql = `
        SELECT us.user_id, s.skill_name
        FROM user_skill us
        JOIN skill s ON us.skill_id = s.skill_id
        WHERE us.user_id IN (${skillPlaceholders})
        AND us.user_skill_is_disabled = 0;
      `;
  
      const [skillResult] = await connection.execute(skillsSql, usersIds);
  
      const usersMap = users.map((user) => ({
        ...user,
        skills: skillResult
          .filter((s) => s.user_id === user.user_id)
          .map((s) => s.skill_name)
          .join(", "),
      }));
  
      return usersMap;
  
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };
  

  invite = async (values) => {
    const {sender_id, receiver_id, project_id, offer_id, project_title, offer_title} = values;
    const message_content = `This is an invitation for joining ${project_title} related to this ${offer_title}`
    
    const connection = await dbPool.getConnection();

     try {
       await connection.beginTransaction();
       let sqlInvitation = 'INSERT INTO invitation (sender_id, receiver_id, project_id, offer_id) VALUES (?, ?, ?, ?)'
       await connection.execute(sqlInvitation, [sender_id, receiver_id, project_id, offer_id])

       let sqlMessage = 'INSERT INTO message (sender_id, message_content, receiver_id) VALUES (?, ?, ?)'
       await connection.execute(sqlMessage, [sender_id, message_content, receiver_id]);

        await connection.commit();
     } catch (error) {
       await connection.rollback();
       throw error;
     }finally {
       connection.release();
     }
  }
 
  invitationResponse = async (values, invitation_status) => {
    const connection = await dbPool.getConnection();
    const { invitation_id, user_id, project_id, offer_id } = values;

    try {
        await connection.beginTransaction();

        // Update invitation status
        let sqlUpdateInvitation = "UPDATE invitation SET invitation_status = ? WHERE invitation_id = ?";
        await connection.execute(sqlUpdateInvitation, [invitation_status, invitation_id]);

        if (invitation_status === 1) { // If the invitation is accepted
            // Insert insert user into project with status 2 (project member)
            let sqlInsertUserProject = `
                INSERT INTO user_project (user_id, project_id, status)
                VALUES (?, ?, 2)
                ON DUPLICATE KEY UPDATE status = 2; 
            `;
            await connection.execute(sqlInsertUserProject, [user_id, project_id]);

            // Update number of disponible positions on related offer
            if (offer_id) {
                let sqlGetOffer = "SELECT number_of_position FROM offer WHERE offer_id = ?";
                const [offer] = await connection.execute(sqlGetOffer, [offer_id]);

                if (offer.length > 0 && offer[0].number_of_position > 0) {
                    let updatedPositions = offer[0].number_of_position - 1;
                    let sqlUpdateOffer = "UPDATE offer SET number_of_position = ? WHERE offer_id = ?";
                    await connection.execute(sqlUpdateOffer, [updatedPositions, offer_id]);
                }
            }
        }

        await connection.commit();
    } catch (error) {      
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


  allrequests = async(user_id) => {
    try {
      let sql = ``;
      const result = await executeQuery(sql,[user_id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
  pendingrequeststatus = async(user_id,project_id) => {
    try {
      let sql = `SELECT 
  u.user_name AS user_name,
  u.user_id AS user_id,
  p.project_title AS project_name, 
  o.offer_title AS offer_title, 
  r.request_status AS status,
  u.user_avatar AS user_image,
  p.project_id AS project_id,
  o.offer_id AS offer_id 
FROM request r
JOIN user u ON r.user_id = u.user_id
JOIN project p ON r.project_id = p.project_id
JOIN offer o ON r.offer_id = o.offer_id
WHERE p.creator_user_id = ? 
  AND r.request_status = 0
  AND p.project_id = ?;


`;
const result = await executeQuery(sql, [user_id,project_id]);
return result;
    } catch (error) {
      throw error;
    }
  }

  allinvites = async(user_id) => {
    try {
      let sql = `SELECT 
    MIN(i.invitation_id) AS invitation_id,
    i.receiver_id,
    i.sender_id,
    u.user_name AS sender_name,  
    i.project_id,
    i.offer_id,
    p.project_title,
    o.offer_title
FROM invitation i
JOIN project p ON i.project_id = p.project_id
JOIN offer o ON i.offer_id = o.offer_id
JOIN user u ON i.sender_id = u.user_id  -- Relacionamos con la tabla de usuarios
WHERE i.receiver_id = ? 
AND i.invitation_status = 0
GROUP BY i.receiver_id, i.sender_id, u.user_name, i.project_id, i.offer_id, p.project_title, o.offer_title;
`;
      const result = await executeQuery(sql, [user_id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserDal();
