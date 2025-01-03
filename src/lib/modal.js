import { writable } from "svelte/store";

export let modalData = writable(null);

export function openModal(data, cb) {
 modalData.set({
  ...data,
  _cb: cb,
 });
}

export async function closeModal(code = 0) {
 let data;
 modalData.update((_) => {
  data = _;
  return _;
 });
 if (data && data._cb) {
  let result = await data._cb(code);
  if (result) {
   modalData.set(null);
   return true;
  } else {
   return false;
  }
 }
}