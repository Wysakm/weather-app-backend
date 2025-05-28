"use strict";
exports.__esModule = true;
exports.authenticateToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
exports.authenticateToken = function (req, res, next) {
    var authHeader = req.headers['authorization'];
    var token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token required'
        });
        return;
    }
    jsonwebtoken_1["default"].verify(token, process.env.JWT_SECRET || 'fallback-secret', function (err, user) {
        if (err) {
            res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }
        req.user = user;
        next();
    });
};
