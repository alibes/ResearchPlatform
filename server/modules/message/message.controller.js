import notificationDal from "../notification/notification.dal.js";
import messageDal from "./message.dal.js";

class MessageController {
  sendMessage = async(req,res) => {
    try {
      const {message_content,receiver_id,sender_id} = req.body;
      
      const values = [message_content,receiver_id,sender_id]
      const result = await messageDal.sendMessage(values);

      const sender = await messageDal.getSenderDetails(sender_id);
      
      const { user_name, user_lastname } = sender;
      
      const notificationValues = [
        receiver_id, 
      1, 
      `You have a new message from ${user_name} ${user_lastname}`, 
      0 
      ];
      await notificationDal.addNotification(notificationValues);
    


      res.status(200).json(result)
    } catch (error) {
        res.status(500).json(error)  
    }
  }
  deleteMessage = async(req,res) => {
    try {
      const {message_id} = req.body;
      
      const result = await messageDal.deleteMessage(message_id);
      res.status(200).json(result)
    } catch (error) {
        res.status(500).json(error)  
    }
  }

  getMessages = async(req, res) => {
    try {
      const { sender_id, reciever_id } = req.params;
      const result = await messageDal.getMessages(sender_id, reciever_id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  }

   getChatUsers = async (req, res) => {
    try {
        const { user_id } = req.params;
        const users = await messageDal.getChatUsers(user_id);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve chat users" });
    }
}
  
}

export default new MessageController();