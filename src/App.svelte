<script>
  import request from './helper/request';
  import { Operations } from './helper/operations';
  import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
  import { setClient } from 'svelte-apollo';
  import { WebSocketLink } from '@apollo/client/link/ws';
  import { subscribe, mutation } from 'svelte-apollo';
  import { gql } from '@apollo/client';

  let titleValue = '';
  let bodyValue = '';
  let deadlineValue = '';

  function createApolloClient() {
    const wslink = new WebSocketLink({
      uri: 'wss://todoweblabs.herokuapp.com/v1/graphql',
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
      todo_pinkpanther(order_by: { id: asc }) {
        deadline
        done
        id
        noteBody
        noteTitle
      }
    }
  `);

  const addTask = async () => {
    if (titleValue == '') {
      alert('Title can`t be empty!');
      return;
    }
    if (deadlineValue == '') {
      await request.startExecuteMyMutation(
        Operations.mutationInsertWithoutDeadline(titleValue, bodyValue),
      );
      return;
    }
    await request.startExecuteMyMutation(
      Operations.mutationInsert(titleValue, bodyValue, deadlineValue),
    );
  };

  const deleteTask = async (id) => {
    await request.startExecuteMyMutation(Operations.mutationDelete(id));
  };

  const updateChecked = async (id, checked) => {
    await request.startExecuteMyMutation(
      Operations.mutationChecked(id, checked),
    );
  };
</script>

<main>
  <!--{JSON.stringify($Tasks)}!-->
  {#if $Tasks.loading}
    <div class="loader" />
  {:else if $Tasks.error}
    <h1 class="message">error</h1>
  {:else if $Tasks.data}
    <form class="form" on:submit|preventDefault={addTask}>
      <div class="form__section">
        <input
          type="text"
          name="Title"
          placeholder="Title"
          on:input={(event) => (titleValue = event.target.value)}
        />
        <input
          type="text"
          body="body"
          placeholder="body"
          on:input={(event) => (bodyValue = event.target.value)}
        />
        <input
          type="date"
          body="deadline"
          placeholder="deadline"
          on:input={(event) => (deadlineValue = event.target.value)}
        />
      </div>
      <button>Add task</button>
    </form>
    <table border="1">
      <caption>ToDo</caption>
      <tr>
        <th>Done</th>
        <th>Id</th>
        <th>Title</th>
        <th>Body</th>
        <th>Deadline</th>
        <th>Delete</th>
      </tr>
      {#each $Tasks.data.todo_pinkpanther as task (task.id)}
        <tr>
          <td
            ><input
              type="checkbox"
              checked={task.done}
              on:click={() => updateChecked(task.id, !task.done)}
            /></td
          >
          <td>{task.id}</td>
          <td>{task.noteTitle}</td>
          <td>{task.noteBody}</td>
          <td>{task.deadline}</td>
          <td
            ><button class="delete" on:click={() => deleteTask(task.id)}
              >Delete</button
            ></td
          >
        </tr>
      {/each}
    </table>
  {/if}
</main>

<style>
  :root {
    --background-color: lightblue;
    --form-background-color: #fff;
    --light-color: #eee;
    --dark-color: #000;
    --button-hover-color: gray;
    --loader-color: gray;
    --delete-color: rgb(163, 13, 13);
    --table-color: #3e3cca;
  }
  main {
    margin: 0;
    max-width: 100%;
    height: 100%;
    background-color: var(--background-color);
  }
  .form {
    background-color: var(--form-background-color);
    border-radius: 5px;
    padding: 20px;
    width: 700px;
    margin: auto;
    display: flex;
    gap: 20px;
    position: relative;
    border: 1px solid var(--light-color);
  }
  .form input,
  .form button {
    background-color: var(--light-color);
    outline: none;
    border: 1px solid var(--light-color);
    border-radius: 3px;
    padding: 10px;
  }
  .message {
    position: absolute;
    top: 40%;
    left: 50%;
  }

  table {
    border-collapse: collapse;
    margin: auto;
    position: absolute;
    width: 99%;
    border-left: 3px solid var(--table-color);
    border-right: 3px solid var(--table-color);
    border-bottom: 3px solid var(--table-color);
  }
  caption {
    background: var(--table-color);
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    padding: 10px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    color: var(--light-color);
    font-family: 'Roboto Slab', serif;
    font-style: normal;
    font-size: 26px;
    text-align: center;
    margin: 0;
  }
  td,
  th {
    padding: 10px;
  }
  th {
    text-align: left;
    font-size: 18px;
  }
  tr:nth-child(2n) {
    background: var(--light-color);
  }
  tr:nth-child(2n-1) {
    background: var(--background-color);
  }
  td:last-of-type {
    text-align: center;
  }
  .delete {
    display: inline-block;
    padding: 5px 10px;
    background: var(--delete-color);
    color: var(--light-color);
    box-shadow: 2px 2px 0 0 var(--delete-color);
    position: relative;
  }
  .delete:hover {
    box-shadow: none;
    top: 2px;
    left: 2px;
  }

  .loader {
    position: absolute;
    top: 40%;
    left: 50%;
    width: 80px;
    height: 80px;
  }
  .loader:after {
    content: ' ';
    display: block;
    width: 64px;
    height: 64px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid;
    border-color: var(--button-hover-color) transparent
      var(--button-hover-color) transparent;
    animation: loader 1.2s linear infinite;
  }
  @keyframes loader {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
