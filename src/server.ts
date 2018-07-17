import errorHandler from 'errorhandler';
import app from './app';

if (app.get('env') !== 'production') {
  app.use(errorHandler());
}

const server = app.listen(app.get('port'), () => {
  console.log(`API Server running at 0.0.0.0:${app.get('port')}`);
  console.log(`Press Ctrl+C to stop.`);
});

export default server;
