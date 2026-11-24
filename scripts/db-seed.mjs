import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {transaction,closeDB} from '../server/core/db.mjs';
export async function seed() {
  const products=JSON.parse(await readFile(new URL('../data/seed-menu.json',import.meta.url),'utf8'));
  await transaction(async c=>{
    await c.query('SELECT pg_advisory_xact_lock(86422)');
    for(const [order,[id,name]] of [['meat','گوشت'],['poultry','مرغ و بوقلمون'],['vegetarian','گیاهی']].entries()) await c.query('INSERT INTO categories(id,name,sort_order) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[id,name,order]);
    for(const [order,p] of products.entries()) {
      const price=350000+(createHash('sha256').update(p.id).digest().readUInt32BE(0)%35)*10000;
      await c.query(`INSERT INTO menu_items(id,category_id,name,english_name,description,ingredients,image_path,image_alt,price_toman,sort_order)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`,[p.id,p.category,p.name,p.englishName,p.description,JSON.stringify(p.ingredients),p.image,p.imageAlt,price,order]);
    }
    await c.query(`INSERT INTO restaurant_settings(id,address,hours,instagram,capacity,max_guests,horizon_days,slot_times,slot_minutes)
      VALUES(1,'اردبیل، سعدی — محیط آزمایشی','ساعات آزمایشی: ۱۸ تا ۲۴','casaitaly.restaurant',20,8,30,'["18:00","19:30","21:00","22:30"]',90) ON CONFLICT DO NOTHING`);
  });
  console.log('Synthetic catalog inserted; existing edits preserved.');
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {try{await seed();}finally{await closeDB();}}
