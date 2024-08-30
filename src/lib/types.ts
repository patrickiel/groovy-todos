
type TodoItem = {
    id: string;
    created: number;
    text: string;
    completed: boolean;
};

type TodoList = {
    id: string;
    todos: TodoItem[];
};