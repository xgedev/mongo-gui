import { writable } from 'svelte/store';

export let sidebarWidth = writable(250);
export let showModal = writable(false);
export let modalValue = writable("");

export let databases = writable([/*{
 database: "botdev2",
 state: 0, // 1 = connecting, 2 = connected
 collections: []
 }*/]);
export let openCollections = writable([/*{
 id: "randomid"
 database: "botdev2",
 collection: "test",
 query: "{}",
 projection: "{}",
 limit: 1,
 documents: []   
}*/]);
export let selectedOpenCollectionId = writable(null);
export let queryRunning = writable(false);