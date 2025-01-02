import { writable } from 'svelte/store';

export let databases = writable([/*{
 database: "botdev2",
 state: 0, // 1 = connecting, 2 = connected
 collections: []
 }*/]);