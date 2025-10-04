import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const auth = (req, res, next)=>{
    try {
        const token = req.cookies.token;
    if (!token) {
			return res.status(401).json({
				message: 'User not authenticated',
				success: false,
			});
		};
    const data = jwt.sign(token, process.env.JWT_SECRET);
    if(!data) return res.status(401).json({message: 'Invalid', success: false});
    req.id = data.userId
    next();
    } catch (error) {
        console.log(error)
    }
};