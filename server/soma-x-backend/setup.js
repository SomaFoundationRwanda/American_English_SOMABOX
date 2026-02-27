import { initSchemas } from './src/helpers/db-manager.js';

initSchemas()
    .then(() => {
        console.log('Database setup complete.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Database setup failed:', err);
        process.exit(1);
    });
