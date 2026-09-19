import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (payload: JwtPayload, secret: string, options?: SignOptions) => {
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
