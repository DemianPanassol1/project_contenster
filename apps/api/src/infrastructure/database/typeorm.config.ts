import { DataSource } from 'typeorm';

import { createDataSourceOptions } from './database.config';

const appDataSource = new DataSource(createDataSourceOptions());

export default appDataSource;
