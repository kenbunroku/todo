// DOM要素
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

// 状態
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// ローカルストレージに保存
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// ユニークIDを生成
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// TODOを追加
function addTodo(text) {
    const todo = {
        id: generateId(),
        text: text.trim(),
        completed: false,
        createdAt: Date.now()
    };
    todos.unshift(todo);
    saveTodos();
    renderTodos();
}

// TODOの完了状態を切り替え
function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

// TODOを削除
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// 完了済みTODOを削除
function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

// フィルター適用
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// TODOアイテムのHTML作成
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item${todo.completed ? ' completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
        <div class="todo-checkbox" role="checkbox" aria-checked="${todo.completed}" tabindex="0"></div>
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="todo-delete" aria-label="削除">×</button>
    `;

    // チェックボックスのクリックイベント
    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('click', () => toggleTodo(todo.id));
    checkbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTodo(todo.id);
        }
    });

    // 削除ボタンのクリックイベント
    const deleteBtn = li.querySelector('.todo-delete');
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    return li;
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// カウント更新
function updateCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    const suffix = activeCount === 1 ? '件の未完了タスク' : '件の未完了タスク';
    todoCount.textContent = `${activeCount} ${suffix}`;
}

// TODOリストを描画
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = currentFilter === 'all'
            ? 'タスクがありません'
            : currentFilter === 'active'
            ? '未完了のタスクがありません'
            : '完了したタスクがありません';
        todoList.appendChild(emptyMessage);
    } else {
        filteredTodos.forEach(todo => {
            todoList.appendChild(createTodoElement(todo));
        });
    }

    updateCount();
}

// フォーム送信イベント
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        addTodo(text);
        todoInput.value = '';
        todoInput.focus();
    }
});

// フィルターボタンのイベント
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// 完了済み削除ボタンのイベント
clearCompletedBtn.addEventListener('click', clearCompleted);

// 初期描画
renderTodos();
