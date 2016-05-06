# redux-signals
The Cerebral signals running on Redux

### What are these signals conceptually?
With Redux you typically think of actions. Actions are like commands, they tell your app what to do. For example when your application mounts you would trigger an action saying: "getInitialData". With signals you think a bit differently. A good analogy is how your body works. If you burn your finger the finger does not command your arm to pull away. Your finger just sends a signal about being burned to your brain and the brain changes your "state of mind", which the arm will react to. With this analogy you would name your signal "appMounted", because that is what happened. Your signal then defines what is actually going to happen.

The way a signal defines what is going to happen is using an `action-tree`. Think of this as a behaviour tree, like for games. It makes you able to declaretively describe what is going to happen in your app when a signal triggers.

### How do I create a signal?
```js
import {signal, dispatch} from 'redux-signals';
import {APP_LOADING} from 'constants';

export default signal([
  dispatch(APP_LOADING)
]);
```

You use the `signal` factory to define your signal. A signal is an array which executes one action at a time. In the example above we use the `dispatch` factory to create an action that dispatches the type `"APP_LOADING"`. That means you do not create traditional redux actions, you create signals composed with actions.

```js
import appMounted from 'signals/appMounted';
...
connect(state => state.app, {appMounted})(App);
```
You connect signals the same way as actions though.

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
Let us first look at the signature:

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
Typically you want more than one thing to happen when a signal triggers, which means that you can:

```js
import {signal, dispatch} from 'redux-signals';
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
      dispatch(SET_USER)
    ],
    error: [
      dispatch(SET_ERROR)
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
myAction.outputs = ['success', 'error'];
```

At this point you might be thinking: "Why define all these things?". The reason is that you are not writing this code for your own sake, you are writing it for "the next developer". With signals and your actions you create a vocabulary for your application which anyone reading it can understand. You do not even have to be a programmer. It makes it very easy to fit in complex logic into your head, which is needed to handle the complexity. Lets look at an example:

```js
export default signal([
  withUserRole, {
    admin: [
      [
        getUsers, {
          success: [
            dispatch(USERS_LOADED)
          ],
          error: [
            dispatch(USERS_LOADED_ERROR),
            showSnackbarError('Could not load users')
          ]
        },
        getPosts, {
          success: [
            dispatch(POSTS_LOADED)
          ],
          error: [
            dispatch(POSTS_LOADED_ERROR),
            showSnackbarError('Could not load posts')  
          ]
        }
      ],
      showSnackbar('Data fetching done!')
    ]
    superuser: [
      getPosts, {
        success: [
          dispatch(POSTS_LOADED),
          showSnackbar('Posts loaded!')
        ],
        error: [
          dispatch(POSTS_LOADED_ERROR),
          showSnackbarError('Could not load posts')
        ]
      }
    ],
    user: [
      showSnackbarError('You have to login to access this thingy')
    ],
    other: [
      showSnackbarError('Sorry, no access')
    ]
  }
]);
```
The point of this structure is for "the next developer", which is often yourself, to understand this very complex logic for handling different scenarios without looking at any implementation code. You might say that you could easily implement this in an action creator and make it readable, and yes you could, but there is not set structure of how you would do that. With signals there is a set way of doing it encouraging isolating logic into reusable actions.... which we will look more into :-)



