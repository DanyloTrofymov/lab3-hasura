export class Operations {
  static mutationInsert = (title, body, deadline) => `
  mutation MyMutation($deadline: timestamptz = "") {
    insert_todo_pinkpanther(objects: {noteBody: "${body}",
     noteTitle: "${title}", done: false, deadline: "${deadline}"}) {
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
  static mutationDelete = (id) => `
  mutation MyMutation {
    delete_todo_pinkpanther_by_pk(id: ${id}){
      id
    }
  }

`;
  static mutationChecked = (id, checked = true) =>
    `mutation MyMutation {
update_todo_pinkpanther_by_pk(pk_columns: {id: "${id}"}, _set: {done: ${checked}}) {
  id
  noteBody
  noteTitle
  done
  deadline
}
}`;
}
