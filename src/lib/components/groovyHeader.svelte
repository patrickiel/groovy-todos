<script lang="ts">
	import PeaceSign from '$lib/components/peaceSign.svelte';

	let { text }: { text: string } = $props();
	let shift = $state(0);
	const updateInterval = 40;

	$effect(() => {
		const interval = setInterval(() => {
			shift = (shift + 1) % 360;
		}, updateInterval);
		return () => clearInterval(interval);
	});

	const hues = $derived(Array.from(text).map((_, index) => (shift + index * text.length) % 360));
</script>

<div class="flex items-center justify-center gap-2">
	<span>
		{#each text.split('') as char, index}
			<span class="groovyHeader text-4xl font-bold" style="color: hsl({hues[index]}, 100%, 50%)"
				>{char}</span
			>
		{/each}
	</span>
	<PeaceSign size={160} color={`hsl(${shift}, 100%, 50%)`} />
</div>

<style>
	.groovyHeader {
		font-family: 'Spicy Rice';
		line-height: 5.5rem;
		font-size: 6rem;
	}
</style>
