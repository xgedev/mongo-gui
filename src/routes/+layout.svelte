<script>
	import "../app.css";
 import Modal from "$lib/Modal.svelte";
 import { modalData } from "$lib/modal.js";
 import { brandingName } from "$lib/stores";

	let { children, data } = $props();

 $brandingName = data.brandingName;
</script>

<svelte:head>
 <title>{$brandingName}</title>
</svelte:head>

{#if $modalData}
 <Modal />
{/if}
<main>
 {@render children()}
</main>

<a class="footer" target="_blank" href="https://github.com/xgedev/mongo-gui">
 MongoGUI • Made with ❤ by Xge
</a>

<style>
 a.footer {
  position: fixed;
  bottom: 5px;
  font-size: .65em;
  opacity: .3;
  left: 50%;
  transform: translateX(-50%);
  text-decoration: none;
 }

 a.footer:hover {
  text-decoration: underline;
 }
</style>