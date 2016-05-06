# redux-action-tree
The Cerebral signals running on Redux

### What are these signals conceptually?
With Redux you typically think of actions. Actions are like commands, they tell your app what to do. For example when your application mounts you would trigger an action saying: "getInitialData". With signals you think a bit differently. A good analogy is how your body works. If you burn your finger the finger does not command your arm to pull away. Your finger just sends a signal about being burned to your brain and the brain changes your "state of mind", which the arm will react to. With this analogy you would name your signal "appMounted", because that is what happened. Your signal then defines what is actually going to happen.

### How do I create a signal?
```js
import {signal, dispatch} from 'redux-signals';
```
