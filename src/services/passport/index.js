import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import db from '../../db/models';

import { jwtSecret } from '../../config';

export const password = () => (req, res, next) =>
  passport.authenticate('password', { session: false }, (err, user, info) => {
    if (err && err.param) {
      return res.status(400).json(err);
    } else if (err || !user) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, (error) => {
      if (error) return res.status(401).end();
      next();
    });
  })(req, res, next);

export const token = ({ required } = {}) => (req, res, next) =>
  passport.authenticate('token', { session: false }, (err, user, info) => {
    if (err || (required && !user)) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

passport.use('password', new BasicStrategy((name, password, done) => {
  return db.User.findOne({ where: { name } }).then((user) => {
    if (!user) {
      done(true);
      return null;
    }
    return user.authenticate(password).then((user) => {
      done(null, user.view());
      return null;
    }).catch(done);
  });
}));

passport.use('token', new JwtStrategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromUrlQueryParameter('access_token'),
    ExtractJwt.fromBodyField('access_token'),
    ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  ]),
}, ({ id }, done) => {
  db.User.findById(id)
    .then((user) => {
      done(null, user);
      return null;
    })
    .catch(done);
}));
