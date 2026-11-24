import 'server-only';
import {connection} from 'next/server';
import {getServerSession, type NextAuthOptions} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {query} from './core/db.mjs';
import {verifyPassword,limit} from './core/security.mjs';
import {actor} from './core/admin.mjs';

export const authOptions: NextAuthOptions = {
  secret:process.env.NEXTAUTH_SECRET,
  session:{strategy:'jwt',maxAge:8*60*60},
  pages:{signIn:'/admin/login'},
  providers:[Credentials({name:'مدیریت کازا',credentials:{username:{label:'نام کاربری',type:'text'},password:{label:'گذرواژه',type:'password'}},
    async authorize(credentials) {
      const username=credentials?.username?.trim().toLowerCase();
      if(!username || username.length>60 || !credentials?.password || credentials.password.length>128) return null;
      await limit('login-global',300,900);
      await limit(`login:${username}`,10,900);
      const {rows:[u]}=await query('SELECT * FROM admin_users WHERE username=$1 AND active',[username]);
      if(!u || !await verifyPassword(credentials.password,u.password_hash)) return null;
      return {id:u.id,name:u.username,version:u.session_version};
    }
  })],
  callbacks:{
    async jwt({token,user}) {if(user){token.version=user.version;}return token;},
    async session({session,token}) {session.user={...session.user,id:token.sub!,version:token.version as number};return session;}
  }
};
export async function currentAdmin() {
  await connection();
  const session=await getServerSession(authOptions);
  if(!session?.user?.id) return null;
  try{return await actor(session.user.id,session.user.version);}catch{return null;}
}
