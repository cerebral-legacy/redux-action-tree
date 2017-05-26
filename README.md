# redux-action-tree (BETA)
Inspired by the [Cerebral 1.x](http://cerebral-website.herokuapp.com) signals, a behaviour tree like implementation of actions for complex state changes.

### Note about Cerebral 2
In Cerebral 2 action-tree has evolved into
[function-tree](https://github.com/cerebral/cerebral/tree/master/packages/node_modules/function-tree#readme)
which contains now a Redux Provider.
For more information take a look at the article
[The case for function-tree](http://www.christianalfoni.com/articles/2016_09_11_The-case-for-function-tree).

### What are these Cerebral signals conceptually?
With [Redux](https://github.com/reactjs/redux) you typically think of actions and action creators. Action creators are like commands, they tell your app what to do. For example when your application mounts you would trigger an action creator saying: "getInitialData". With signals you do not let your UI (or other events) command your application logic, they only tell your application what happened. This also aligns with the concept of keeping your UI as dumb as possible.

A good analogy for signals is how your body works. If you burn your finger the finger does not command your arm to pull away. Your finger just sends a signal to your brain about it being burned and the brain changes your "state of mind", which the arm will react to. With this analogy you would not name your signal "getInitialData", but "appMounted", because that is what happened. Your signal then defines what is actually going to happen... which in this case is getting the initial data.

A signal uses an [action-tree](https://github.com/cerebral-legacy/action-tree) tree to define its behaviour. Think of this as a behaviour tree, like in games. It makes you able to declaratively describe what is going to happen in your app when a signal triggers.

### How do I create a signal?
```js
import {signal, dispatch} from 'redux-action-tree';
import {APP_LOADING} from 'constants';

export default signal([
  dispatch(APP_LOADING)
]);
```

You use the `signal` factory to define your signal. A signal is an array which executes one action at a time. In the example above we use the `dispatch` factory to create an action that dispatches the type `"APP_LOADING"`. That means you do not create traditional redux actions, you create signals composing actions... and even other signals.

To use a signal you `connect` it just like you connect traditional actions:

```js
import appMounted from 'signals/appMounted';
import buttonClicked from 'signals/buttonClicked';
...
connect(state => state.app, {appMounted, buttonClicked})(App);
```

### Passing a payload to a signal
When you trigger a signal you can pass it a payload:

```js
class App extends React.Component {
  render() {
    return (
      <div>
        <button onClick={() => this.props.buttonClicked({foo: 'bar'})}>Click me</button>
      </div>
    );
  }
}
```

This payload has to be an object and it will be passed into your signal. This payload is available to the actions in the signal.

### How do I create actions?
Let us first look at the signature. An action is just a function that receives a `context` holding some properties. Think of the action as the `thunk` middleware function, but it is part of a flow:

```js
function myAction({input, output, getState, dispatch}) {
  input // The current payload
  output // Update the payload and/or choose paths
  getState // Get current state
  dispatch // Dispatch to the reducers
}
```

#### Passing a payload
So lets take this step by step. When you trigger a signal, passing a payload, that will be available on the `input`.

```js
this.props.somethingHappened({foo: 'bar'});
```
```js
function myAction({input, output, getState, dispatch}) {
  input // {foo: "bar"}
}
```
#### Adding to the payload
Typically you want more than one thing to happen when a signal triggers. You can add multiple actions to the action tree:

```js
import {signal, dispatch} from 'redux-action-tree';
import myAction from 'actions/myAction';
import myOtherAction from 'actions/myOtherAction';

export default signal([
  myAction,
  myOtherAction
]);
```
This signal will first trigger `myAction` and then `myOtherAction`. We can make `myAction` output some new data to the payload:
```js
function myAction({input, output, getState, dispatch}) {
  output({some: 'data'});
}
```
Which means that `myOtherAction` will now look like this:
```js
function myOtherAction({input, output, getState, dispatch}) {
  input // {foo: "bar", some: "data"}
}
```

#### Outputting to paths
Much like a behaviour tree you can output to paths. Lets look at an example:

```js
export default signal([
  getUser, {
    success: [
      dispatch(USER_LOADED)
    ],
    error: [
      dispatch(USER_LOADED_ERROR)
    ]
  }
]);
```
Typically you use paths to handle async actions, which we will look at shortly, but you can use them for anything:

```js
export default signal([
  withUserRole, {
    admin: [],
    superuser: [],
    user: [],
    other: []
  }
]);
```

To define what outputs an action can make you give it a property `outputs`:
```js
function myAction({input, output, getState, dispatch}) {
  if (someCondition) {
    output.success();
  } else {
    output.error();
  }
}
myAction.outputs = ['success', 'error']; // Defines paths the action can take
```

### Going async
So signals are pretty powerful when it comes to asynchronicity. To define an asynchronous action you simply:

```js
function myAction({input, output, getState}) {
  setTimeout(() => output(), 1000); // An async action must output something
}
myAction.async = true; // An async property

// When native to browsers at a later point you will be able to
async function myAction({input, output, getState}) {
  setTimeout(() => output(), 1000); // An async action must output something
}
```

When this action is put into the signal:

```js
export default signal([
  someAsyncAction, // Holds for one second
  someSyncAction
]);
```

it will wait for one second before the next action runs. It is also possible to group async actions using an array, making them run in parallel:

```js
export default signal([
  [
    someAsyncAction,
    someAsyncAction2
  ],
  someSyncAction // Runs after both async actions are done
]);
```

You can even add paths to each of these async actions:

```js
export default signal([
  [
    someAsyncAction, {
      success: [],
      error: []
    },
    someAsyncAction2, {
      success: [],
      error: []
    }
  ],
  someSyncAction // Runs after both async actions and their paths are done
]);
```

This structure of parallel and nested actions can go as deep as you want.

### Grabbing state inside an action
Any action can grab the existing state of the app:

```js
function myAction({input, output, getState}) {
  getState() // {reducerA: {}, reducerB: {}}
}
```

### Dispatching to the reducers
Only synchronous actions can dispatch to the reducers. Technically it does not have to be like this, but it is a forced convention for two reasons:

1. An asynchronous action will most surely have some work to do not related to dispatching. By not allowing dispatching we ensure that the action does its ONE thing and offputs any state changes to the next action. For example the action `getUser` should only get the user, not also set it
2. Not allowing async actions to make changes to the state also makes it easier to implement debugging tools

To dispatch you do it the same way as you are used to:
```js
function myAction({input, output, getState, dispatch}) {
  dispatch({type: SOME_TYPE, foo: 'bar'})
}
```

### Factories
I have mentioned factories a couple of times. A factory is general term, but in this context it is "a function that returns an action". Lets look at how the included `dispatch` factory works:

```js
function dispatch(actionType) {
  function action({input, dispatch}) {
    dispatch({type: actionType, payload: input});
  }
  return action;
}
```
That is it! A function returning an action.

Factories can be used for many different things. For example creating an HTTP service for your app:

```js
export default signal([
  get('/api/items'), {
    success: [],
    error: []
  }
])
```
Which would look something like:

```js
import axios from 'axios';

function get(url) {
  function action({input, output}) {
    axios.get(url)
      .then(response => output.success({result: response.result}))
      .catch(error => output.error({error: error.message}));
  }
  action.async = true;
  action.outputs = ['success', 'error'];

  return action;
}
```

### Composing chains
There is a new awesome feature in ES2015 called the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator). It is a great tool for composing signals with each other. One example could be that you want to grab some todos when you fire up the app, but you also want to grab them when the user clicks an "update" button or whatever.

```js
export default signal([
  dispatch(APP_LOADING),
  getUser, {
    success: [
      dispatch(USER_LOADED),
      ...getTodos // [getTodos, {success: [dispatch(TODOS_LOADED)], error: []}]
    ],
    error: []
  },
  dispatch(APP_LOADED)
]);
```
```js
export default signal([
  dispatch(TODOS_LOADING),
  ...getTodos
  dispatch(TODOS_LOADED)
]);
```

### Summary
Signals is at the core of the [Cerebral](http://www.cerebraljs.com) framework and has proven itself a powerful concept to build complex applications as it helps you keep a mental image of the complex flows in your app.
