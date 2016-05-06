# redux-action-tree
The Cerebral signals running on Redux

### What are these signals conceptually?
With Redux you typically think of actions. Actions are like commands, they tell your app what to do. For example when your application mounts you would trigger an action saying: "getInitialData". With signals you think a bit differently. A good analogy is how your body works. If you burn your finger the finger does not command your arm to pull away. Your finger just sends a signal about being burned to your brain and the brain changes your "state of mind", which the arm will react to. With this analogy you would name your signal "appMounted", because that is what happened. Your signal then defines what is actually going to happen.

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
render() {
  return (
    <div>
      <button onClick={() => this.props.buttonClicked({foo: 'bar'})}>Click me</button>
    </div>
  );
}
```

This payload has to be an object and it will be passed into your signal. This payload is available to the actions in the signal.

### How do I create actions?
Let us first
