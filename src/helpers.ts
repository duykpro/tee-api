export const ensureENV = (env) => {
  if (process.env[env] === 'undefined') {
    throw new Error(`${env} environment variable not set.`);
  }

  return process.env[env];
};
