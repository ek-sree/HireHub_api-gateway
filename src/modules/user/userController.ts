import express, { Request, Response } from 'express'
import { Userclient } from './grpc/client/grpcClient'
import { genenrateToken } from '../../jwt/jwtCreate'
import userRabbitMqClient from './rabbitMQ/client';


export const userController = {
    register:(req: Request, res: Response)=>{
        try {
            

            Userclient.RegisterUser(req.body, (err:Error | null, result: any)=>{
                if(err){
                    return res.status(500).json({error:"Internal server error"});
                }
                const isRecruiter = false;
                res.cookie("isRecruiter", isRecruiter);
                res.cookie("otp", result.otp, {httpOnly:true});
                res.cookie("user", JSON.stringify(result.user_data), { httpOnly: true });
                return res.json(result)
            })
        } catch (error) {
            console.log("error in register", error);
            return res.status(500).json({error:"Internal server error"});
        }
    },

    otp:(req: Request, res: Response)=>{
        console.log("Is otp comming");
        
        try {
            const cookieOtp = req.cookies.otp
           
            const enteredOtp = req.body.otp
          
            if(cookieOtp=== enteredOtp){
                const userData = JSON.parse(req.cookies.user);
             console.log("This is cookies iuser dataaaaaaaa",userData);
             
            Userclient.VerifyOtp({user_data: userData},(err:Error | null, result: any)=>{
                
                if(err){
                    return res.status(500).json({error: "Internal server error"});
                } 
                const token = genenrateToken({id:result.user_data._id,email:result.user_data.email});
                let role ='user'
                res.cookie('role',role, {maxAge: 3600000})
                res.cookie('token', token,{httpOnly:true, maxAge: 3600000})
                res.clearCookie('otp');
                console.log("This is otpp result", result);
                result.isRecruiter=false
                result.token = token;
                return res.json(result)
            })
            }else{
                res.status(400).json({error:"Invalid otp"});
            }
        } catch (error) {
            console.log("Error in otp verifying", error);
            
        }
    },

    resendOtp:(req: Request, res: Response)=>{
        try {
            console.log("Resend req get here");
            
            const userData = JSON.parse(req.cookies.user);
            const email = userData.email;
            console.log("Eml", email);
            
            res.clearCookie('otp')
            console.log("cleared old otp");
            
            Userclient.ResendOtp({email:email}, (err: Error | null, result: any)=>{
                if(err){
                    console.log("error resend otp req to gprc", err);
                    
                    return res.status(500).json({error:"Internal server error"});
                }
                res.cookie("otp", result.newOtp, {httpOnly:true});
                console.log("sssssss",result);
                return res.json({success:true, message:"Otp resent successfully"});
            })
        } catch (error) {
            console.log("Error sending new otp", error);
            return res.status(500).json({error:"Internal server error"});
        }
    },

    login:(req:Request, res:Response)=>{
        try {
            console.log("Reached logginf");
            
            Userclient.Login(req.body, (err: Error | null, result: any)=>{
                if(err){
                    console.log("error while loging user", err);
                    return res.status(500).json({error:"Internal server error"});
                }
                console.log(result,"sdsd");
                if(!result.success){
                    return res.json(result);
                }
                const token = genenrateToken({id:result.user_data._id,email:result.user_data.email});
                let role ='user'
                res.cookie('role',role, {maxAge: 3600000})
                res.cookie('token', token,{httpOnly:true, maxAge: 3600000})
                const isRecruiter =false;
                res.cookie('isRecruiter', isRecruiter);
                console.log("result in userControllerrr for loginnnn", result);
                result.isRecruiter = false;
                result.token = token;
                return res.json(result)
            })
        } catch (error) {
            console.log("Error loging in", error);
            return res.status(500).json({error: "Internal server error"});
        }
    },

    loginWithGoogle: (req: Request, res: Response) => {
        try {
            console.log("google auth");

            Userclient.LoginWithGoogle(req.body, (err: Error | null, result: any) => {
                if (err) {
                    res.status(500).json({ error: "Internal server error" });
                }
                if (!result || !result.user_data) {
                    return res.status(500).json({ error: "Invalid response from Google login service" });
                }
                const token = genenrateToken({ id: result.user_data._id, email: result.user_data.email });
                let role = 'user'
                res.cookie('role', role, { maxAge: 3600000 })
                res.cookie('token', token, { httpOnly: true, maxAge: 3600000 })
                const isRecruiter = false;
                res.cookie('isRecruiter', isRecruiter);
                console.log("result in userControllerrr for loginnnn", result);
                console.log(result);
                result.isRecruiter = false;
                result.token = token;
                return res.json(result)
            })
        } catch (error) {
            console.log("Error during login with google auth", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    logout: (req: Request, res: Response) => {
        try {
            console.log("User logout reaching here");
            res.clearCookie('role');
            res.clearCookie('isRecruiter');
            res.clearCookie('token');
            res.clearCookie('user')
            
            return res.json({success: true})
        } catch (error) {
            console.log("Error during login with google auth", error);
            return res.status(500).json({success: false, error: "Internal server error" });
        }
    },

    addTitleProfile: async(req: Request, res: Response) =>{
        console.log("reached here", req.body);
        console.log("reached here query", req.query.email);
        
        try {
            const email = req.query.email;
            const title = req.body;
            if(!email || ! title){
                throw new Error("email or title are missing!")
            }
            const data = {email, title}
            console.log("daa of email and title",data);
            
            const operation = 'profile-title-add'
            const result = await userRabbitMqClient.produce({data}, operation);
            return res.json(result);
        } catch (error) {
            console.log("Error while adding title to user profile");
            return res.status(500).json("Error occured in gateway during title saving");
        }
    },

    editDetails: async(req: Request, res: Response) => {
        console.log("got here", req.body);
        console.log("got here query", req.query.email);
        
        try {
            const operation = 'edit-details';
            const{name, title} = req.body.data;
            console.log("body data", name, title);
            
            const email = req.query.email;
            if(!name || !email){
                throw new Error("Email, name or title are missing !!");
            }
            const data = {name, email, title}
            const response = await userRabbitMqClient.produce({data}, operation)
            console.log("response editdetails", response);
            return res.json(response);
        } catch (error) {
            console.log("Error occured while editing user details",error);
            return res.status(500).json("Error occured in gateway while editing user details");
        }
    },

    viewDetails: async(req: Request, res: Response)=>{
        try {
            const operation = 'view-details';
            const email = req.query.email
            const response = await userRabbitMqClient.produce({email}, operation)
            console.log("ressss",response);
            
            return res.json(response);
        } catch (error) {
            console.log("Error occured while fetching details",error);
            return res.status(500).json("Error occured in gateway while fetching user details");
        }
    },

    userInfo: async(req: Request, res: Response)=> {
        try {
            console.log("info apigateway",req.query.email);
            
            const email = req.query.email;
            const operation = 'user-info';
            const response = await userRabbitMqClient.produce({email}, operation);
            res.json(response);
        } catch (error) {
            console.log("Error occured while fetching user infos",error);
            return res.status(500).json("Error occured in gateway while fetching user info");
        }
    },

    userEditInfo: async(req:Request, res: Response)=>{
        try {
            console.log("sfsdfsdfsdfs......");
            console.log("dadad", req.body);
            
            const {email, phone, Education, Place} = req.body.data;
            console.log("data reached", email, phone,Education, Place);
            if(!phone || !email){
                throw new Error("Email or phone missing")
            }
            const education = Education;
            const place = Place;
            const operation = 'user-info-edit'
            const data = {email, phone, education, place};
            const response = await userRabbitMqClient.produce({data}, operation);
            return res.json(response)
        } catch (error) {
            console.log("Error occured while editing user infos",error);
            return res.status(500).json("Error occured in gateway while editing user info");
        }
    },

    userSkillsAdd: async(req: Request, res: Response)=>{
        try {
            console.log("body skills",req.body);
            const email = req.query.email;
            if(!email){
                throw new Error("Email is missing");
            }
            const operation = 'add-user-skills'
            const response = await userRabbitMqClient.produce({email,...req.body}, operation);
            return res.json(response);
        } catch (error) {
            console.log("Error occured while adding user skills",error);
            return res.status(500).json("Error occured in gateway while adding user skills");
        }
    },

    usersSkills: async (req: Request, res: Response) => {
        try {
            const email = req.query.email as string; 
            const operation = 'fetch-skills';
            
            const response = await userRabbitMqClient.produce({ email }, operation);
            return res.json(response);
        } catch (error) {
            console.log("Error occurred while fetching user skills", error);
            return res.status(500).json("Error occurred in gateway while fetching user skills");
        }
    },

    userSkillsEdit: async(req:Request, res:Response) =>{
        try {
            console.log("iussinf.....//");
            
            const email = req.query.email;
            if(!email){
                throw new Error("Email not found");
            }
            const skills = req.body;
            const operation = 'user-skills-edit';
            console.log("edit skills",skills);
            const response = await userRabbitMqClient.produce({email,skills}, operation)
            return res.json(response);
        } catch (error) {
            console.log("Error occurred while editing user skills", error);
            return res.status(500).json("Error occurred in gateway while editing user skills");
        }
    }
    
}
