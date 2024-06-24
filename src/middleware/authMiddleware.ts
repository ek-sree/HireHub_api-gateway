import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import config from "../config";

interface DecodedToken {
    id: string;
    email: string;
    iat: number; //this is issued date
    exp: number; //expired date
}

const authencticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({error: "Access denied . Token not found"});
    }

    jwt.verify(token, config.jwt_key as string, (err, decoded) => {
        if(err){
            return res.status(403).json({error: "Invalid token."});
        }
        next();
    })
}

export default authencticateToken;