<script lang="ts">
	import { Square, SquareCheck } from 'lucide-svelte';

	let {
		size = 24,
		color = 'black',
		isChecked = $bindable(false)
	}: { size?: number; color?: string; isChecked: boolean } = $props();
</script>

<div>
	{#if isChecked}
		<SquareCheck {size} {color} />
	{:else}
		<Square {size} {color} />
	{/if}
</div>
