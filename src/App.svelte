<script>
import request from './helper/request';
import {Operations} from './helper/operations';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setClient } from "svelte-apollo";
import { WebSocketLink } from "@apollo/client/link/ws";
import { subscribe, mutation } from "svelte-apollo";
import { gql } from "@apollo/client";



function createApolloClient() {
const wslink = new WebSocketLink({

  uri: "wss://todoweblabs.herokuapp.com/v1/graphql",
	options: {
		reconnect: true,
	},
});

const cache = new InMemoryCache();

const client = new ApolloClient({

  link: wslink,

  cache,

});

return client;
}

const client = createApolloClient();
setClient(client);

const Tasks = subscribe(gql`
        subscription MySubscription {
            todo_pinkpanther {
                deadline
                done
                id
                noteBody
                noteTitle
            }
        }
    `);


	const addTask = async () => {
		const title = prompt("Task title: ")
		const body = prompt("Task body: ")
		const deadline = prompt("Task deadline: ")
		if(title == "") return;
		await request.startExecuteMyMutation(Operations.MUTATUION_Insert(title, body, deadline));
	}

	const deleteTask = async () => {
		const id = prompt("Task id: ")
		await request.startExecuteMyMutation(Operations.MUTATUION_delete(id));

	}
</script>

<main>
	<!--{JSON.stringify($Tasks)}!-->
	{#if $Tasks.loading}
	<h1>loading</h1>
	{:else if $Tasks.error}
	<h1>error</h1>
	{:else if $Tasks.data}
	<button on:click={addTask}>Add task</button>
	<button on:click={deleteTask}>Delete task</button>
	<table border="1">
		<caption>ToDo</caption>
			<tr>
				<th>id</th>
				<th>Title</th>
				<th>Body</th>
				<th>Deadline</th>
				<th>Done</th>
			</tr>
	{#each $Tasks.data.todo_pinkpanther as task (task.id)}
		<tr>
			<td>{task.id}</td>
			<td>{task.noteTitle}</td>
			<td>{task.noteBody}</td>
			<td>{task.deadline}</td>
			<td>{task.done}</td>
		</tr>
	{/each}
	</table>
	{/if}
</main>

<style>
</style>