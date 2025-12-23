import { sendEmail } from "../utils/sendEmail.js";
import { createUser } from "../utils/createUserId.js";

export const loginHandler = async (req,res) => {
   try {
     const {email} = req.body
 
     
     const userId = createUser(6)
     const password = 123456
     const emailSend = await sendEmail(email,userId,password)

 
     res.status(200).json({
         message:"Email has been sent"
     })
   } catch (error) {
    console.error(error)
    return res.json(error)
   }
}