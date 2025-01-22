import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

import Student, { IStudent } from "./../models/student";

interface AuthenticationError extends Error {
  code?: string;
  statusCode?: number;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.CALLBACK_URL as string,
      passReqToCallback: true,
    },
    async (
      _req,
      _accessToken,
      _refreshToken,
      profile,
      done: (error: AuthenticationError | null, user?: IStudent) => void,
    ) => {
      try {
        const student = await Student.findOne({ email: profile._json.email });

        if (student) {
          return done(null, student);
        }

        const newStudent = new Student({
          name: profile.displayName,
          email: profile._json.email,
          profileImg: profile._json.picture,
        });

        const savedStudent = await newStudent.save();
        done(null, savedStudent);
      } catch (err) {
        console.error("Authentication error:", err);
        const authError: AuthenticationError =
          err instanceof Error
            ? err
            : new Error("Unknown authentication error");
        authError.statusCode = 500;
        done(authError, undefined);
      }
    },
  ),
);

export interface JwtPayload {
  id: string;
  email: string;
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
  "jwt",
  new JWTStrategy(jwtOptions, (payload: JwtPayload, done) => {
    return done(null, payload);
  }),
);

const adminJwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ADMIN_SECRET as string,
};

passport.use(
  "adminJwt",
  new JWTStrategy(adminJwtOptions, (payload: { username: string }, done) => {
    return done(null, payload);
  }),
);

passport.use(
  new LocalStrategy((username: string, password: string, done) => {
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return done(null, { username: process.env.ADMIN_USERNAME });
    }
    return done(null, false);
  }),
);

export default passport;
