import jwt from "jsonwebtoken";
let cachedSecret;
let cachedAccessTokenTtl;
let warnedAboutFallback = false;
const getJwtSecret = () => {
    if (cachedSecret) {
        return cachedSecret;
    }
    const fromEnv = process.env.JWT_SECRET;
    if (fromEnv && fromEnv.trim().length > 0) {
        cachedSecret = fromEnv;
        return cachedSecret;
    }
    if (process.env.NODE_ENV === "production") {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    if (!warnedAboutFallback) {
        console.warn("JWT_SECRET not set, using fallback development secret.");
        warnedAboutFallback = true;
    }
    cachedSecret = "esportz-dev-secret";
    return cachedSecret;
};
const isDurationLiteral = (value) => {
    return /^[0-9]+(?:\s*[a-zA-Z]+)?$/.test(value);
};
const getJwtAccessTokenTtl = () => {
    if (cachedAccessTokenTtl) {
        return cachedAccessTokenTtl;
    }
    const fromEnv = process.env.JWT_ACCESS_TOKEN_TTL;
    if (fromEnv && fromEnv.trim().length > 0) {
        const trimmed = fromEnv.trim();
        const asNumber = Number(trimmed);
        if (Number.isFinite(asNumber) && trimmed === String(asNumber)) {
            cachedAccessTokenTtl = asNumber;
            return cachedAccessTokenTtl;
        }
        if (isDurationLiteral(trimmed)) {
            cachedAccessTokenTtl = trimmed;
            return cachedAccessTokenTtl;
        }
        console.warn(`Invalid JWT_ACCESS_TOKEN_TTL value "${trimmed}". Falling back to default of 1h.`);
        cachedAccessTokenTtl = "1h";
        return cachedAccessTokenTtl;
    }
    cachedAccessTokenTtl = "1h";
    return cachedAccessTokenTtl;
};
export const generateJwtToken = (payload, options) => {
    // Allow callers or environment configuration to control the token lifetime.
    const defaultOptions = {
        expiresIn: getJwtAccessTokenTtl()
    };
    return jwt.sign(payload, getJwtSecret(), {
        ...defaultOptions,
        ...options
    });
};
export const verifyJwtToken = (token) => {
    try {
        return jwt.verify(token, getJwtSecret());
    }
    catch (error) {
        console.warn("Failed to verify JWT token", error);
        return null;
    }
};
//# sourceMappingURL=jwt-service.js.map