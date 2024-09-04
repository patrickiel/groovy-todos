<script lang="ts">
	import { LocalStore } from '$lib/local-store.svelte';
	import { Trash2, ChevronDown } from 'lucide-svelte';

	let {
		all,
		completed,
		dividerIsCollapsed
	}: { all: LocalStore<Todo[]>; completed: Todo[]; dividerIsCollapsed: LocalStore<boolean> } =
		$props();
</script>

<div class="flex text-white">
	<button
		class="my-2 flex w-full items-center"
		onclick={() => (dividerIsCollapsed.value = !dividerIsCollapsed.value)}
	>
		<div class="flex opacity-70 hover:opacity-90">
			<div
				class="{dividerIsCollapsed.value
					? 'rotate-180 '
					: 'rotate-0'} transition-transform duration-300"
			>
				<ChevronDown size={30} />
			</div>
			<span
				>{completed.length} completed item{#if completed.length > 1}s{/if}</span
			>
		</div>
	</button>

	{#if !dividerIsCollapsed.value}
		<button
			onclick={() => (all.value = all.value.filter((todo) => todo.completed === false))}
			class="p-1 text-sm opacity-70 hover:opacity-90"
		>
			<Trash2 class="ml-auto mr-2" size={24} />
		</button>
	{/if}
</div>
