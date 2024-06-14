import express, { Request, Response } from 'express'
import { Userclient } from './grpc/client/userClient'
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
                res.cookie('token', token,{httpOnly:true, maxAge: 3600000})
                res.clearCookie('otp');
                return res.json(result)
            })
            }else{
                res.status(400).json({error:"Invalid otp"});
            }
        } catch (error) {
            console.log("Error in otp verifying", error);
            
        }
    }
}