<script>
import request from './helper/request';
import {Operations} from './helper/operations';
let Tasks = {}
window.onload = async () =>{
	const {todo_pinkpanther} = await request.startFetchMyQuery(Operations.QUERY_GetAll());
	Tasks = todo_pinkpanther;
	
	renderTable()
}
console.log(Operations.QUERY_GetAll());

const renderTable = () => {
	const table = document.querySelector('table')
	table.innerHTML = `
	<caption>ToDo</caption>
		<th>id</th>
		<th>Title</th>
		<th>Body</th>
		<th>Deadline</th>
		<th>Done</th>
		</tr>
	`
	Tasks.forEach(task => {
		table.innerHTML+= `
		<tr>
			<td>${task.id}</td>
			<td>${task.noteTitle}</td>
			<td>${task.noteBody}</td>
			<td>${task.deadline}</td>
			<td>${task.done}</td>
		</tr>
	`
	});
}
	const addTask = async () => {
		const title = prompt("Task title: ")
		const body = prompt("Task body: ")
		const deadline = prompt("Task deadline: ")
		if(title == "") return;
		const {insert_todo_pinkpanther} = await request.startExecuteMyMutation(Operations.MUTATUION_Insert(title, body, deadline));
		const {returning} = insert_todo_pinkpanther;
		Tasks.push(returning[0]);
		renderTable();
	}

	const deleteTask = async () => {
		const id = prompt("Task id: ")
		const {delete_todo_pinkpanther} = await request.startExecuteMyMutation(Operations.MUTATUION_delete(id));
		//const {returning} = delete_todo_pinkpanther;
		//Tasks.pop();
		const {todo_pinkpanther} = await request.startFetchMyQuery(Operations.QUERY_GetAll());
		Tasks = todo_pinkpanther
		renderTable();
	}
</script>

<main>
	<button on:click={addTask}>Add task</button>
	<button on:click={deleteTask}>Delete task</button>
	<table border="1">

	</table>

</main>

<style>
</style>