<script>
  import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
  import { setClient } from 'svelte-apollo';
  import { WebSocketLink } from '@apollo/client/link/ws';
  import { subscribe, mutation } from 'svelte-apollo';
  import { gql } from '@apollo/client';
  import { errorArr, loader } from './store';
  import { Fetches } from './helper/api';

  let titleValue = '';
  let bodyValue = '';
  let deadlineValue = '';
  let modalText = '';
  let offline = false;

  function createApolloClient() {
    const wslink = new WebSocketLink({
      uri: 'wss://' + domainenv, // eslint-disable-line
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

  const addTask = () => {
    console.log(errorArr.length);
    Fetches.addTask(titleValue, bodyValue, deadlineValue);
    openModal();
  };
  const deleteTask = (id) => {
    Fetches.deleteTask(id);
    openModal();
  };
  const updateChecked = (id, checked) => {
    Fetches.updateChecked(id, checked);
    openModal();
  };

  const openModal = () => {
    if ($errorArr.length != 0) {
      modalText = $errorArr.pop();
    }
  };

  const closeModal = () => {
    if ($errorArr.length != 0) {
      modalText = $errorArr.pop();
    } else {
      modalText = '';
    }
  };

  window.onoffline = () => {
    offline = true;
    $errorArr.push('You are currently offline!');
    openModal();
  };
  window.ononline = () => {
    offline = false;
  };
</script>

<main>
  <div>
    {#if modalText}
      <div class="modal-container">
        <div class="modal">
          <h1>Error</h1>
          <p>{modalText}</p>
          <button class="modal_button" id="close" on:click={closeModal}>
            Close
          </button>
        </div>
      </div>
    {/if}
    {#if $Tasks.loading}
      <div class="loader" />
    {:else if $Tasks.error}
      <h1 class="message">error</h1>
    {:else if offline}
      <h1 class="message">Check your internet connection</h1>
    {:else if $Tasks.data}
      {#if $loader != 0}
        <div class="loader" />
      {/if}
      <form class="form" on:submit|preventDefault={addTask}>
        <div class="form__section">
          <input
            type="text"
            name="Title"
            placeholder="Title"
            bind:value={titleValue}
          />
          <input
            type="text"
            body="body"
            placeholder="body"
            bind:value={bodyValue}
          />
          <input
            type="date"
            body="deadline"
            placeholder="deadline"
            bind:value={deadlineValue}
          />
        </div>
        <button>Add task</button>
      </form>
      {#if $Tasks.data.todo_pinkpanther.length != 0}
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
      {:else}
        <h1 class="message">You can add some todos using form above</h1>
      {/if}
    {/if}
  </div>
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
  }
  .form {
    background-color: var(--form-background-color);
    border-radius: 3px;
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
  .form button:hover {
    background-color: var(--button-hover);
  }

  .message {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateX(-50%);
  }

  table {
    border-collapse: collapse;
    margin: auto;
    width: 90%;
    border-left: 3px solid var(--table-color);
    border-right: 3px solid var(--table-color);
    border-bottom: 3px solid var(--table-color);
  }
  button {
    cursor: pointer;
  }

  .modal-container {
    background: rgba(0, 0, 0, 0.3);
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 1;
  }

  .modal {
    background-color: var(--light-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    width: 600px;
    border-radius: 5px;
    padding: 30px 50px;
    max-width: 100%;
    text-align: center;
  }

  .modal h1 {
    font-size: 20px;
    margin: 0;
  }
  .modal p {
    font-size: 14px;
    opacity: 0.9;
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
    position: fixed;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 80px;
    z-index: 2;
  }
  .loader:after {
    background: rgba(0, 0, 0, 0.7);
    content: ' ';
    display: block;
    width: 64px;
    height: 64px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid;
    border-color: var(--button-hover-color) transparent;
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
