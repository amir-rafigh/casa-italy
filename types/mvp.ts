import type {CasaProduct} from '@/data/pizza/cavasaitaly/products';
export type CategoryData={id:string;name:string;sort_order:number;active:boolean};
export type Settings={address:string;phone:string;hours:string;instagram:string;capacity:number;max_guests:number;horizon_days:number;slot_times:string[];slot_minutes:number};
export type MenuData={products:CasaProduct[];categories:CategoryData[];settings:Settings};
export type Booking={id:string;name:string;guests:number;status:'pending'|'confirmed'|'rejected'|'cancelled';starts_at:string;can_cancel:boolean};
export type Slot={id:string;starts_at:string;ends_at:string;capacity:number;remaining:number;closed:boolean};
export const statusLabels={pending:'در انتظار بررسی',confirmed:'تأیید شده',rejected:'رد شده',cancelled:'لغو شده'};
