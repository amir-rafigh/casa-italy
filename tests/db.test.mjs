import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {migrate} from '../scripts/db-migrate.mjs';
import {seed} from '../scripts/db-seed.mjs';
import {query,closeDB} from '../server/core/db.mjs';
import {createReservation,changeReservation,changeSlot,availability,addDays,tehranDay,mine,mayCancel} from '../server/core/reservations.mjs';
import {adminWrite,adminRead,actor} from '../server/core/admin.mjs';
import {hashPassword,verifyPassword,hash,limit} from '../server/core/security.mjs';

test('database integration in a disposable local database',async t=>{
 const base=new URL(process.env.DATABASE_URL);
 assert.ok(['127.0.0.1','localhost'].includes(base.hostname),'Database tests only run on loopback');
 assert.ok(['/casa_local','/casa_compat'].includes(base.pathname),'Use the dedicated Casa local database');
 const name=`casa_test_${Date.now()}`,client=new pg.Client({connectionString:base.toString()});await client.connect();
 await client.query(`CREATE DATABASE ${name}`);base.pathname=`/${name}`;process.env.DATABASE_URL=base.toString();
 try{
  await migrate();await seed();
  const {rows:[version]}=await query('SHOW server_version');console.log('Tested PostgreSQL:',version.server_version);
  const day=addDays(tehranDay(),1),owner=hash(randomUUID());
  const schedule=await availability(day),slot=schedule.slots[0];
  const make=(overrides={})=>({name:'مهمان آزمایشی',phone:'۰۹۱۲۳۴۵۶۷۸۹',guests:1,slotId:slot.id,key:randomUUID(),...overrides});
  await t.test('migrate and seed are repeatable and preserve edits',async()=>{
   await query("UPDATE menu_items SET price_toman=123000 WHERE id='meatball'");await migrate();await seed();
   assert.equal((await query("SELECT price_toman FROM menu_items WHERE id='meatball'")).rows[0].price_toman,123000);
   assert.equal((await query('SELECT count(*)::int n FROM menu_items')).rows[0].n,7);
  });
  await t.test('thirty parallel requests cannot oversell twenty seats',async()=>{
   const results=await Promise.allSettled(Array.from({length:30},()=>createReservation(make(),owner)));
   assert.equal(results.filter(r=>r.status==='fulfilled').length,20);
   assert.ok(results.filter(r=>r.status==='rejected').every(r=>r.reason.status===409));
   assert.equal((await query("SELECT SUM(guests)::int n FROM reservations WHERE slot_id=$1 AND status='pending'",[slot.id])).rows[0].n,20);
  });
  await t.test('parallel retries consume capacity once and different payload conflicts',async()=>{
   const input=make({slotId:schedule.slots[1].id,guests:2});
   const results=await Promise.all(Array.from({length:10},()=>createReservation(input,owner)));
   assert.equal(new Set(results.map(r=>r.id)).size,1);
   await assert.rejects(createReservation({...input,guests:3},owner),e=>e.status===409);
  });
  await t.test('ownership and terminal transitions survive confirm/cancel race',async()=>{
   const input=make({slotId:schedule.slots[2].id});const booking=await createReservation(input,owner);
   await assert.rejects(changeReservation(booking.id,'cancelled','guest',hash('other')),e=>e.status===404);
   await Promise.allSettled([changeReservation(booking.id,'confirmed','admin'),changeReservation(booking.id,'cancelled','guest',owner)]);
   assert.equal((await query('SELECT status FROM reservations WHERE id=$1',[booking.id])).rows[0].status,'cancelled');
   await assert.rejects(changeReservation(booking.id,'confirmed','admin'),e=>e.status===409);
  });
  await t.test('capacity reduction and closed slots are enforced',async()=>{
   await assert.rejects(changeSlot({id:slot.id,capacity:19,closed:false}),e=>e.status===409);
   await changeSlot({id:schedule.slots[3].id,capacity:20,closed:true});
   await assert.rejects(createReservation(make({slotId:schedule.slots[3].id}),owner),e=>e.status===409);
  });
  await t.test('cancellation cutoff is checked by server time',async()=>{
   const now=new Date();assert.equal(mayCancel(new Date(now.getTime()+1800000),now),true);assert.equal(mayCancel(new Date(now.getTime()+1799999),now),false);
   const id=randomUUID(),start=new Date(Date.now()+29*60000);
   await query('INSERT INTO reservation_slots(id,starts_at,ends_at,capacity) VALUES($1,$2,$3,20)',[id,start,new Date(start.getTime()+5400000)]);
   const booking=await createReservation(make({slotId:id}),owner);
   await assert.rejects(changeReservation(booking.id,'cancelled','guest',owner),e=>e.status===409);
   await changeReservation(booking.id,'cancelled','admin');
  });
  const id=randomUUID(),password=await hashPassword('local-test-password-123');
  await query("INSERT INTO admin_users(id,username,password_hash,role) VALUES($1,'tester',$2,'admin')",[id,password]);
  const admin=await actor(id,1);
  await t.test('roles, password hashes, revocation and category references',async()=>{
   assert.ok(await verifyPassword('local-test-password-123',password));assert.equal(await verifyPassword('wrong',password),false);
   await assert.rejects(adminWrite('settings',{}, {...admin,role:'staff'}),e=>e.status===403);
   await assert.rejects(adminWrite('categories',{id:'meat',remove:true},admin),e=>e.status===409);
   await query('UPDATE admin_users SET session_version=2 WHERE id=$1',[id]);await assert.rejects(actor(id,1),e=>e.status===401);
  });
  await t.test('settings reject overlapping slots and availability does not reopen closures',async()=>{
   const s=await adminRead('settings',admin,new URLSearchParams());
   await assert.rejects(adminWrite('settings',{...s,slot_times:'18:00,18:30'},admin));
   assert.equal((await availability(day)).slots.find(s=>s.id===schedule.slots[3].id).closed,true);
  });
  await t.test('public booking DTOs and persistent rate limits',async()=>{
   const list=await mine(owner);assert.ok(list.length>0);assert.equal(list[0].owner_token_hash,undefined);assert.equal(list[0].phone,undefined);
   await limit('test-limit',1,60);await assert.rejects(limit('test-limit',1,60),e=>e.status===429);
  });
 }finally{await closeDB();await client.query(`DROP DATABASE ${name}`);await client.end();}
});
