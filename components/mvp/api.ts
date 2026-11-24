export async function api<T>(url:string, data?:unknown):Promise<T> {
  const response=await fetch(url,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),cache:'no-store'});
  let result;try{result=await response.json();}catch{throw new Error('پاسخ سامانه دریافت نشد. دوباره تلاش کنید.');}
  if(!response.ok)throw new Error(result.error||'انجام درخواست ممکن نشد.');return result;
}
