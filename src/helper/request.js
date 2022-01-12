import { errorArr } from '../store';

class Request {
  // eslint-disable-next-line
  async fetchGraphQL(operationsDoc, operationName, variables) {
    try {
      // eslint-disable-next-line
      const result = await fetch('https://' + domainenv, {
        method: 'POST',
        body: JSON.stringify({
          query: operationsDoc,
          variables,
          operationName,
        }),
      });
      return await result.json(); // eslint-disable-line
    } catch (e) {
      errorArr.update((n) => [...n, e.message]);
    }
  }
  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, 'MyQuery', {});
  }

  async startFetchMyQuery(operationsDoc) {
    const { errors, data } = await this.fetchMyQuery(operationsDoc);

    if (errors) {
      console.error(errors);
      throw new Error(errors.message.join('\n'));
    }

    console.log(data);
    return data;
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, 'MyMutation', {});
  }

  async startExecuteMyMutation(operationsDoc) {
    const { errors, data } = await this.executeMyMutation(operationsDoc);

    if (errors) {
      console.error(errors);
      throw new Error(errors.message.join('\n'));
    }
    console.log(data);
    return data;
  }
}
export default new Request();
