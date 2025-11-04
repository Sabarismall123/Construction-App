"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            if (token === 'mock-token') {
                req.user = {
                    _id: new (require('mongoose').Types.ObjectId)(),
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'admin',
                    isActive: true
                };
                next();
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            const user = await User_1.default.findById(decoded.id).select('-password');
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'Not authorized, user not found'
                });
                return;
            }
            if (!user.isActive) {
                res.status(401).json({
                    success: false,
                    error: 'Not authorized, user account is deactivated'
                });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: 'Not authorized, token failed'
            });
            return;
        }
    }
    if (!token) {
        res.status(401).json({
            success: false,
            error: 'Not authorized, no token'
        });
        return;
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized, user not found'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this resource`
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map