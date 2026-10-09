const jwt = require("jsonwebtoken");
    
function verifyToken (req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return errorResponse(
            res,
            401,
            "Access denied. Token missing."
        );
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRETKEY
        );

        req.user = decoded;

        next();

    } catch (err) {

        return errorResponse(
            res,
            403,
            "Invalid or Expired Token"
        );

    }

};

module.exports = verifyToken;