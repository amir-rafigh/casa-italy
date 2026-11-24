import {query,closeDB} from '../server/core/db.mjs';
try{const {rows:[server]}=await query('SELECT version() version');const {rows}=await query('SELECT version,applied_at FROM schema_migrations ORDER BY version');console.log(server.version);console.table(rows);}finally{await closeDB();}
