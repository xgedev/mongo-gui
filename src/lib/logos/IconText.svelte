<script>
 import { brandingName } from "$lib/stores";
</script>

<div class="logo">
 <img src="/assets/branding/icon.svg" alt="icon">
 <div class="title">{$brandingName}</div>
</div>

<style>
 div.logo {
  display: flex;
  align-items: center;
  gap: .3em;
  font-weight: 700;
 }

 div.logo img {
  width: 1.5em;
 }
</style>