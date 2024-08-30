import { Peer, type DataConnection } from 'peerjs';

import { nanoid } from 'nanoid';
import { LocalStore, type ErrorHandler } from './local-store.svelte';

export class PeerStore extends LocalStore<TodoList> {
    private peer: Peer;
    private connections: DataConnection[] = [];

    constructor(key: string, onError?: ErrorHandler<TodoList>) {
        const initialValue: TodoList = { id: nanoid(), todos: [] };
        super(key, initialValue, onError);

        this.peer = new Peer(this.value.id);

        this.peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
        });

        this.peer.on('connection', (conn) => {
            this.setupConnection(conn);
        });
    }

    private setupConnection(conn: DataConnection) {
        this.connections.push(conn);

        conn.on('open', () => {
            conn.send(JSON.stringify(this.value));
        });

        conn.on('data', (data) => {
            const receivedValue = JSON.parse(data as string) as TodoList;
            this.mergeValues(receivedValue);
        });
    }

    public connectToPeer(peerId: string) {
        const conn = this.peer.connect(peerId);
        this.setupConnection(conn);
    }

    private mergeValues(receivedValue: TodoList) {
        const mergedTodos = [...this.value.todos];
        receivedValue.todos.forEach(receivedTodo => {
            const existingTodoIndex = mergedTodos.findIndex(todo => todo.id === receivedTodo.id);
            if (existingTodoIndex === -1) {
                mergedTodos.push(receivedTodo);
            } else {
                const existingTodo = mergedTodos[existingTodoIndex];
                if (new Date(receivedTodo.created) > new Date(existingTodo.created)) {
                    mergedTodos[existingTodoIndex] = receivedTodo;
                }
            }
        });
        this.value = { ...this.value, todos: mergedTodos };
    }

    public set value(value: TodoList) {
        super.value = value;
        this.sync();
    }

    private sync() {
        const valueJson = JSON.stringify(this.value);
        this.connections.forEach(conn => conn.send(valueJson));
    }

    private getReliableTimestamp(): number {
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            return performance.now();
        }
        return new Date().getTime();
    }

    public addTodo(text: string) {
        const newTodo: TodoItem = {
            id: nanoid(),
            created: this.getReliableTimestamp(),
            text,
            completed: false
        };
        this.value = {
            ...this.value,
            todos: [...this.value.todos, newTodo]
        };
    }

    public toggleTodo(id: string) {
        this.value = {
            ...this.value,
            todos: this.value.todos.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        };
    }

    public destroy() {
        if (this.peer) {
            this.peer.destroy();
        }
    }

    public getSyncId(): string {
        return this.peer.id;
    }
}