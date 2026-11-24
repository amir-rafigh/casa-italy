"use client";
import {useEffect,useState} from 'react';
import type {MenuData} from '@/types/mvp';
import {api} from './api';
export function useLiveMenu(initial:MenuData){
  const [data,setData]=useState(initial),[error,setError]=useState('');
  useEffect(()=>{let active=true;const refresh=async()=>{if(document.visibilityState!=='visible')return;try{const next=await api<MenuData>('/api/menu');if(active){setData(next);setError('');}}catch{if(active)setError('به‌روزرسانی منو ممکن نشد؛ اطلاعات آخرین دریافت نمایش داده می‌شود.');}};const timer=setInterval(refresh,30000);window.addEventListener('focus',refresh);return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',refresh);};},[]);
  return {data,error};
}
