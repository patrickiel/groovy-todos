<script lang="ts">
	import { LocalStore } from '$lib/local-store.svelte';
	import '../app.css';
	import { nanoid } from 'nanoid';
	import { fade, slide } from 'svelte/transition';
	import { Trash2, GripVertical, X, CirclePlus, ChevronDown } from 'lucide-svelte';
	import GroovyHeader from '$lib/components/groovyHeader.svelte';
	import Checkbox from '$lib/components/checkbox.svelte';

	type Todo = {
		id: string;
		text: string;
		completed: boolean;
	};

	let input = $state(new LocalStore('input', ''));
	let focusedTodo = $state<Todo>();
	let isAdminToolVisible = $state(false);
	let all = $state(new LocalStore<Todo[]>('todos', []));
	let active = $derived<Todo[]>(all.value.filter((todo) => !todo.completed));
	let completed = $derived<Todo[]>(all.value.filter((todo) => todo.completed));

	let inputElement: HTMLInputElement;

	let collapsed = new LocalStore('collapsed', false);

	async function addTodo(event: Event) {
		event.preventDefault();

		if (input.value.trim()) {
			let newTodo = { id: nanoid(), text: input.value, completed: false };
			all.value = [newTodo, ...all.value];
			input.value = '';
			inputElement?.focus();
		}
	}

	function deleteTodo(id: string) {
		all.value = all.value.filter((todo) => todo.id !== id);
	}

	function toggleTodo(id: string) {
		const todoIndex = all.value.findIndex((todo) => todo.id === id);
		if (todoIndex !== -1) {
			const updatedTodo = { ...all.value[todoIndex], completed: !all.value[todoIndex].completed };
			all.value = [
				updatedTodo,
				...all.value.slice(0, todoIndex),
				...all.value.slice(todoIndex + 1)
			];
		}
	}

	function addTodos(numberOfItems: number) {
		const todos = Array.from({ length: numberOfItems }, (_, i) => ({
			id: nanoid(),
			text: `Todo ${i + 1}`,
			completed: false
		}));
		all.value = [...todos, ...all.value];
	}

	function onKeyDown(e: KeyboardEvent) {
		console.log(e.key);
		if (e.key === 'a' && e.ctrlKey && e.altKey) {
			isAdminToolVisible = !isAdminToolVisible;
		}
	}
</script>

<div class="hippie-bg min-h-screen">
	<main class="container mx-auto flex max-w-md flex-col">
		{#if isAdminToolVisible}
			<div class="mb-4 flex flex-row gap-2" onsubmit={addTodo}>
				<input id="numberOfItems" class="w-full border border-gray-300 p-2" type="text" />
				<button
					class="bg-gray-200 p-2"
					onclick={() =>
						addTodos(
							parseInt((document.getElementById('numberOfItems') as HTMLInputElement).value, 10)
						)}
				>
					populate
				</button>
				<button class="bg-gray-200 p-2" onclick={() => (all.value = [])}> clear </button>
			</div>
		{/if}

		<div class="py-8">
			<GroovyHeader text="Groovy TODOs" />
		</div>
		<form
			class="mb-4 flex h-[60px] w-full rounded-2xl border-4 border-fuchsia-400 bg-black bg-opacity-30 px-4 text-white outline-none transition-colors duration-300 hover:border-yellow-300 hover:bg-opacity-40 {input.value.trim()
				? 'border-yellow-300'
				: ''}"
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

		{#if all.value.length === 0}
			<div
				class="border-10 font-boldtext-white flex flex-col gap-2 bg-opacity-10 text-5xl opacity-10"
			>
				<p class="h-12 rounded-md bg-white p-2 text-2xl">NO</p>
				<p class="h-12 rounded-md bg-white p-2 text-center text-2xl">TODOs</p>
				<p class="h-12 rounded-md bg-white p-2 text-right text-2xl">YET!</p>
			</div>
		{/if}
		<ul>
			{#each active as todo (todo.id)}
				<li
					class="mb-2 flex h-12 items-center justify-between rounded-md bg-white bg-opacity-50 hover:bg-opacity-60"
					onmouseenter={() => (focusedTodo = todo)}
					onmouseleave={() => {
						all.saveToLocalStorage();
						focusedTodo = undefined;
					}}
				>
					<div class="flex h-full w-5 flex-shrink-0 items-center justify-center">
						{#if focusedTodo === todo}
							<button>
								<GripVertical size={24} />
							</button>
						{/if}
					</div>

					<button onclick={() => toggleTodo(todo.id)} class="mr-2 opacity-80">
						<Checkbox isChecked={todo.completed} />
					</button>

					<input
						class="w-full flex-grow bg-transparent outline-none"
						type="text"
						bind:value={todo.text}
					/>
					{#if focusedTodo === todo}
						<button onclick={() => deleteTodo(todo.id)} class="ml-auto pr-3 text-sm text-white">
							<X class="text-white opacity-40 invert" size={24} />
						</button>
					{/if}
				</li>
			{/each}
		</ul>
		{#if completed.length !== 0}
			<div in:fade={{ duration: 300 }}>
				<div class="flex">
					<button
						class="my-2 flex w-full items-center"
						onclick={() => (collapsed.value = !collapsed.value)}
					>
						<div
							class="{collapsed.value
								? 'rotate-180 '
								: 'rotate-0'} transition-transform duration-300 text-white"
						>
							<ChevronDown size={30} />
						</div>
						<span class="text-white"
							>{completed.length} completed item{#if completed.length > 1}s{/if}</span
						>
					</button>
					{#if !collapsed.value}
						<button
							onclick={() => (all.value = all.value.filter((todo) => todo.completed === false))}
							class="p-1 text-sm text-white"
						>
							<Trash2 class="ml-auto mr-2 text-white" size={24} />
						</button>
					{/if}
				</div>
				{#if !collapsed.value}
					<ul transition:slide={{ duration: 300 }} class="opacity-50">
						{#each completed as todo (todo.id)}
							<li
								class="mb-2 flex h-12 items-center justify-between rounded-md bg-white bg-opacity-50 hover:bg-opacity-60"
								onmouseenter={() => (focusedTodo = todo)}
								onmouseleave={() => {
									all.saveToLocalStorage();
									focusedTodo = undefined;
								}}
							>
								<div class="flex w-5 flex-shrink-0 items-center justify-center">
									{#if focusedTodo === todo}
										<button>
											<GripVertical size={24} />
										</button>
									{/if}
								</div>

								<button onclick={() => toggleTodo(todo.id)} class="mr-2 opacity-80">
									<Checkbox isChecked={todo.completed} />
								</button>

								<span class="flex-grow">{todo.text}</span>
								{#if focusedTodo === todo}
									<button
										onclick={() => deleteTodo(todo.id)}
										class="ml-auto pr-3 text-sm text-white"
									>
										<X class="text-white opacity-40 invert" size={24} />
									</button>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</main>
</div>

<svelte:window onkeydown={onKeyDown} />

<style>
	.hippie-bg {
		color: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
		background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
		background-size: 400% 400%;
		animation: gradient 10s ease infinite;
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
