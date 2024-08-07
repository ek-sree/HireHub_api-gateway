import { RecruiterClient } from "./grpc/client/recruiterClient";
import { genenrateToken } from "../../jwt/jwtCreate";
import { Request, Response } from "express";

export const recruiterController = {
    register: (req: Request, res: Response) => {
        try {            
            RecruiterClient.RegisterRecruiter(req.body, (err: Error | null, result: any) => {
                if(err) {
                    return res.status(500).json({error: "Internal server error during recruiter registering"});
                }
                const isRecruiter = true;
                res.cookie("isRecruiter", isRecruiter);
                res.cookie("otp", result.otp, { httpOnly:true });
                res.cookie("recruiter", JSON.stringify(result.recruiter_data), { httpOnly: true });
                return res.json(result);
            })
        } catch (error) {
            console.log("error in register", error);
            return res.status(500).json({error:"Internal server error"});
        }
    },

    otp :(req: Request, res: Response) => {
        try {
            const cookieOtp = req.cookies.otp;

            const enteredOtp = req.body.otp;

            if(enteredOtp === cookieOtp) {
                const RecruiterData = JSON.parse(req.cookies.recruiter)                
                RecruiterClient.VerifyOtp({recruiter_data: RecruiterData}, (err: Error | null, result: any) => {
                    if(err){
                        return res.status(500).json({error: "Internal server errro during recruiter verifying otp"});
                    }

                    const token = genenrateToken({id: result.recruiter_data.id, email:result.recruiter_data.email});
                    let role = 'recruiter';
                    res.cookie('role', role, { maxAge: 3600000 });
                    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 })
                    res.clearCookie('otp');
                    result.isRecruiter=true                    
                    return res.json(result);
                })
            }else{
                res.status(400).json({error: "Invalid otp"});
            }
        } catch (error) {
            console.log("Error in otp verifying", error);
            return res.status(500).json({error:"Internal server error verifying otp"});
        }
    },

    resendOtp: (req: Request, res: Response) => {
        try {            
            const RecruiterData = JSON.parse(req.cookies.recruiter);
            const email = RecruiterData.companyEmail;
            res.clearCookie('otp');

            RecruiterClient.ResendOtp({email:email}, (err: Error | null, result: any) => {
                if(err) {
                    console.log("Error resending otp", err);
                    return res.status(500).json({error:"Internal server error during resending otp"});
                }
                res.cookie("otp", result.newOtp, { httpOnly:true });
                return res.json({ success: true, message:"Otp resend successfully"});
            })
        } catch (error) {
            console.log("Error sending new otp", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    login: (req: Request, res: Response) => {
        try {            
            RecruiterClient.Login( req.body, (err: Error | null, result: any) => {
                if(err){
                    console.log("error while loging user", err);
                    return res.status(500).json({error:"Internal server error"});
                }
                if(!result.success){
                    return res.json(result);
                }
                const token = genenrateToken({ id: result.recruiter_data._id, email: result.recruiter_data.email });
                let role = 'recruiter';
                res.cookie('role', role, { maxAge: 3600000 });
                res.cookie('token', token, { httpOnly: true, maxAge: 3600000 })
                const isRecruiter = true;
                res.cookie('isRecruiter', isRecruiter)
                result.isRecruiter = true;
                result.token = token;
                return res.json(result);
            })
        } catch (error) {
            console.log("Error loging in", error);
            return res.status(500).json({error: "Internal server error"});
        }
    },

    logout: (req: Request, res: Response) => {
        try {
            console.log("Recruiter logout reaching here");
            res.clearCookie('role');
            res.clearCookie('isRecruiter');
            res.clearCookie('token');
            
            return res.json({success: true})
        } catch (error) {
            console.log("Error during logout", error);
            return res.status(500).json({success: false, error: "Internal server error" });
        }
    },

    getrecruiters: (req :Request, res: Response) => {
        try {
            RecruiterClient.GetRecruiters(req.body, (err: Error | null, result: any) => {
                if(err){
                    console.log("error whilefetching recruiter datas", err);
                    return res.status(500).json({error:"Internal server error while fetching recruiter data"});
                }
                console.log("res fetching recruiter here", result);
                
                return res.json(result);
            })
        } catch (error) {
            console.log("Error communicating recruiter service", error);
            return res.status(500).json({error: "Internal server error"});
        }
    }
}