import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 401, 'Unauthorized access');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return sendError(res, 401, 'Invalid token');
    }
};
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(res, 403, 'Forbidden: Insufficient permissions');
        }
        next();
    };
};
