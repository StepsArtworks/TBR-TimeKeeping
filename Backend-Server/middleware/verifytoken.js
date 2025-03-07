// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const JWT_SECRET = 'dinosaur';
    console.log(req.headers);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 401,
            message: 'No token provided'
        });
    }

    const token = authHeader.split(' ')[1];
    //try {
    //    const decoded = jwt.verify(token, JWT_SECRET);
    //    req.user = decoded;
    //    next();
    //} catch (err) {
    //    return res.status(401).json({
    //        status: 401,
    //        message: 'Invalid token'
    //    });
    // }
    console.log("Remember to add back the token");
    next();
};
module.exports = verifyToken;