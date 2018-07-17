import Sequelize from 'sequelize';
import { teeDatabse, storeDatabse } from '../../config/database';

export const teeDB = new Sequelize(teeDatabse.database, teeDatabse.user, teeDatabse.password, {
  dialect: 'mysql',
  host: teeDatabse.host,
  port: teeDatabse.port
});

export const storeDB = new Sequelize(storeDatabse.database, storeDatabse.user, storeDatabse.password, {
  dialect: 'mysql',
  host: storeDatabse.host,
  port: storeDatabse.port
});
