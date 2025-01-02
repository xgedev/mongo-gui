<script>
 import Sidebar from "$lib/Sidebar.svelte";

	let { children } = $props();
</script>

<main>
 <Sidebar />
 {@render children()}
</main>