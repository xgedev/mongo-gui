<script>
 import IconText from "$lib/logos/IconText.svelte";
 import { goto } from "$app/navigation";
 import { page } from "$app/stores";
 import { onMount } from "svelte";

 let username = $state("");
 let password = $state("");
 let loggingIn = $state(true);

 onMount(() => handleSubmit());

 async function handleSubmit(event) {
  if (event) {
   event.preventDefault();
  }
  loggingIn = true;
  let response = await fetch("/api/v1/login", {
   method: "POST",
   headers: {
    "Content-Type": "application/json"
   },
   body: JSON.stringify({
    username,
    password
   })
  });
  loggingIn = false;
  if (response.ok) {
   let data = await response.json();
   if (data.token !== true) {
    // token is actually given and not just a boolean
    localStorage.setItem("token", data.token);
   }
   goto($page.url.searchParams.get("redirect") || "/");
  } else {
   if (username) {
    alert("Invalid username or password");
   }
  }
 }
</script>

<div class="container">
 <div class="logo">
  <IconText />
 </div>
 <form onsubmit={handleSubmit}>
  <div class="inputs">
   <input type="text" placeholder="Username" bind:value={username} disabled={loggingIn} />
   <input type="password" placeholder="Password" bind:value={password} disabled={loggingIn} />
  </div>
  <button type="submit" class="default submit" disabled={loggingIn}>
   {#if loggingIn}
    • • •
   {:else}
    Log in
   {/if}
  </button>
 </form>
</div>

<style>
 div.container {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 20px);
  width: 30em;
  align-items: center;
  gap: 2em;
 }

 div.logo {
  font-size: 2em;
 }

 div.inputs {
  display: flex;
  flex-direction: column;
  gap: .3em;
  width: 100%;
 }
</style>