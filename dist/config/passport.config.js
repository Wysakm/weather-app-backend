"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_jwt_1 = require("passport-jwt");
const client_1 = require("@prisma/client");
const auth_service_1 = require("../services/auth.service");
const prisma = new client_1.PrismaClient();
// Local Strategy for login
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        const result = await auth_service_1.AuthService.login(username, password);
        return done(null, result);
    }
    catch (error) {
        return done(error, false);
    }
}));
// JWT Strategy for protected routes
passport_1.default.use(new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
    try {
        // ตรวจสอบว่า payload มี id_user หรือไม่
        if (!payload.id_user) {
            return done(null, false);
        }
        const user = await prisma.user.findUnique({
            where: {
                id_user: payload.id_user
            },
            include: {
                role: true
            }
        });
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    }
    catch (error) {
        return done(error, false);
    }
}));
exports.default = passport_1.default;
