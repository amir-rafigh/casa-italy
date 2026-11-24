import QRCode from 'qrcode';
import {currentAdmin} from '@/server/auth';
import {AppError} from '@/server/core/security.mjs';
import {safely} from '@/server/http';
export async function GET(){return safely(async()=>{
  if(!await currentAdmin())throw new AppError('ابتدا وارد حساب مدیریت شوید.',401);
  const svg=await QRCode.toString(new URL('/',process.env.APP_ORIGIN!).toString(),{type:'svg',errorCorrectionLevel:'M',margin:3,width:450});
  return new Response(svg,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'no-store','Content-Disposition':'attachment; filename="casa-menu-qr.svg"'}});
});}
