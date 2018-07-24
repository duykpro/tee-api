import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import semver from 'semver';

dotenv.config();

import { default as v1Routes } from './v1';

// Create Express server
const app = express();
const latestAPIVersion = '1.0.0';

app.disable('x-powered-by');
app.set('port', process.env.PORT || 1995);

const whitelist = (process.env.WHITE_LIST_ORIGINS || '').split(' ');
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

app.use(cors(corsOptions));
app.use((_, res, next) => {
  res.locals.version = latestAPIVersion;
  next();
});
app.param('_version', (req, res, next) => {
  res.locals.version = semver.valid(semver.coerce(req.params._version));
  next();
});
app.use(['/:_version(v1(?:(?:\.[0-9]{1,2})?))', '/'], v1Routes);

export default app;
