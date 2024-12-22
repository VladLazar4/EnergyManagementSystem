const jwt = require('jsonwebtoken');

const secretKey = "your-super-secret-key-the-best-in-the-world-1234567";


function verifyJwt(token) {
    try {
        // Verify the JWT
        const decoded = jwt.verify(token, secretKey);

        console.log("Token is valid!");
        console.log("Payload:", decoded);

        return decoded;
    } catch (err) {
        console.error("JWT verification failed:", err.message);
    }
    return false;
}

export{
    verifyJwt,
}