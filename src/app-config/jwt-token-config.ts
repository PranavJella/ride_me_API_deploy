import jwt from "jsonwebtoken";

class TokenManagement {
  create_new_token = (payload: {}) => {
    const token = jwt.sign(payload, process.env.JWT_TOKEN_KEY ?? "", {
      expiresIn: "1h",
    });

    const invalidate_before = new Date();
    // setting 1 hour of expiry
    invalidate_before.setUTCHours(invalidate_before.getUTCHours() + 1);

    return { token: token, token_invalidate_before: invalidate_before };
  };
}

export default new TokenManagement();
