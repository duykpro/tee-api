import elasticsearch from 'elasticsearch';
import config from '../../config/elasticsearch';

export default new elasticsearch.Client({
  host: config.host,
  log: 'trace'
});
