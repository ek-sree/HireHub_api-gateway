import express, { Request, Response } from 'express'
import { Userclient } from './grpc/client/grpcClient'
import { genenrateToken } from '../../jwt/jwtCreate'

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
    }
}
