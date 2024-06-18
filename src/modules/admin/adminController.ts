import { Request, Response } from "express";
import { genenrateToken } from "../../jwt/jwtCreate";
import { Adminclient } from "./grpc/client/adminClient"

export const adminController = {

    login:(req: Request, res: Response) => {
    try {
        console.log("reachedddd");
        
        Adminclient.Login(req.body, (err: Error, result: any) => {
            if(err){
                console.log("error while loging in admin", err);
                return res.status(500).json({error:"Internal server error"});
            }
            if(!result.success){
                return res.json(result);
            }
            const token = genenrateToken({id: result.adminData._id, email: result.adminData.email});
            let role = 'admin'
            res.cookie('role',role, { maxAge: 3600000 });
            res.cookie('token',token, {httpOnly:true, maxAge: 3600000 });
            
            result.isRecruiter = null
            return res.json(result);
        })
    } catch (error) {
        console.log("Error loging in", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

}