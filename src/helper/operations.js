import { gql } from "@apollo/client";

export class Operations {
    static QUERY_GetAll = () =>
        `
  query MyQuery {
    todo_pinkpanther(order_by: {id: asc}) {
      id
      deadline
      done
      noteBody
      noteTitle
    }
  }
`;
    static MUTATUION_Insert = (title, body, deadline) => `
  mutation MyMutation($deadline: timestamptz = "") {
    insert_todo_pinkpanther(objects: {noteBody: "${body}", noteTitle: "${title}", done: false, deadline: "${deadline}"}) {
      returning {
        id
        noteBody
        noteTitle
        done
        deadline
      }
    }
  }
`;
    static MUTATUION_Delete = (id) => `
 mutation MyMutation {
   delete_todo_pinkpanther_by_pk(id: ${id})
 }  
`;
    //static SUBSCTIPTION_AllTodos = ;
}
