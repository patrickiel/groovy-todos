<script lang="ts">
	import { nanoid } from 'nanoid';
	import { CirclePlus } from 'lucide-svelte';
	import { LocalStore } from '$lib/local-store.svelte';

	let { todos }: { todos: LocalStore<Todo[]> } = $props();

	let input = $state(new LocalStore('input', ''));
	let inputElement: HTMLInputElement;

	async function addTodo(event: Event) {
		event.preventDefault();

		if (input.value.trim()) {
			let newTodo = { id: nanoid(), text: input.value, completed: false };
			todos.value = [newTodo, ...todos.value];
			input.value = '';
			inputElement?.focus();
		}
	}
</script>

<form
	class="mb-4 flex h-[60px] w-full rounded-2xl border-4 border-fuchsia-400 bg-black bg-opacity-30 px-4 text-white outline-none transition-colors duration-300 hover:border-yellow-300 hover:bg-opacity-40
        {input.value.trim() ? 'border-yellow-300 ' : ''}"
	onsubmit={addTodo}
>
	<input
		class="w-full bg-transparent outline-none placeholder:text-white placeholder:opacity-80"
		bind:this={inputElement}
		bind:value={input.value}
		placeholder="Add a new todo..."
	/>
	{#if input.value.trim()}
		<button
			type="submit"
			disabled={!input.value.trim()}
			class="text-fuchsia-400 transition-colors duration-300 hover:text-yellow-300 {input.value.trim()
				? 'text-yellow-300'
				: ''}"
		>
			<CirclePlus size={30} />
		</button>
	{/if}
</form>
