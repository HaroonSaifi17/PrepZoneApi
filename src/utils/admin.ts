import passport from "passport";

export const authenticateAdminJWT = passport.authenticate("adminJwt", { session: false });
