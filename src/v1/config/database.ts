export const teeDatabse = {
  host: process.env.DB_TEE_HOST || 'localhost',
  port: +process.env.DB_TEE_PORT || 3306,
  user: process.env.DB_TEE_USER || 'root',
  password: process.env.DB_TEE_PASSWORD || 'secret',
  database: process.env.DB_TEE_DATABASE || 'tee'
};

export const storeDatabse = {
  host: process.env.DB_STORE_HOST || 'localhost',
  port: +process.env.DB_STORE_PORT || 3306,
  user: process.env.DB_STORE_USER || 'root',
  password: process.env.DB_STORE_PASSWORD || 'secret',
  database: process.env.DB_STORE_DATABASE || 'store'
};
