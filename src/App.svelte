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
  let dateValue = '';

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
    await request.startExecuteMyMutation(
      Operations.mutationInsert(titleValue, bodyValue, dateValue),
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
    <h1>loading</h1>
  {:else if $Tasks.error}
    <h1>error</h1>
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
          body="date"
          placeholder="date"
          on:input={(event) => (dateValue = event.target.value)}
        />
      </div>
    </form>
    <button on:click={addTask}>Add task</button>
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
          <td><button on:click={() => deleteTask(task.id)}>Delete</button></td>
        </tr>
      {/each}
    </table>
  {/if}
</main>

<style>
</style>
