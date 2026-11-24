import {query} from './db.mjs';
export async function menu() {
  const [items,categories,settings]=await Promise.all([
    query(`SELECT m.* FROM menu_items m JOIN categories c ON c.id=m.category_id WHERE m.active AND c.active ORDER BY c.sort_order,m.sort_order,m.id`),
    query('SELECT * FROM categories WHERE active ORDER BY sort_order,id'),
    query('SELECT * FROM restaurant_settings WHERE id=1')
  ]);
  return { products:items.rows.map(row=>({id:row.id,name:row.name,englishName:row.english_name,description:row.description,ingredients:row.ingredients,image:row.image_path,imageAlt:row.image_alt,imageWidth:900,imageHeight:900,price:row.price_toman,category:row.category_id,available:row.available})), categories:categories.rows, settings:settings.rows[0] };
}
