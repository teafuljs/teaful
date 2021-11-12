# Teaful TodoList Example

## How to start :gear:

### Available Scripts

In the project directory, you can run:

    npm start

Runs the app in the development mode.
Open http://localhost:3000 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

    npm run build

Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

## Principles :trophy:

This app is about guide about Teaful and not on create the most impressive todo list app in the world :earth_africa:
With this app, we're going to check how to manage object literals on Teaful:

- Create a store
- Add elements to store from one component, and manage them from another component
- Add new elements to object literal
- remove elements from object literal
- reset store element

To create a store to use it on several components, we can create a new file on src, we are going to call it `store.js`

    import  createStore  from  "teaful";
    export  const { useStore } =  createStore({ todo:  {}, done:  {}  });

Then, we can import this useStore from other components:

    import  {  useStore  }  from  "./store";

_Note: if you export as default the use store from `store.js`, then you can avoid the destructure on import as usual._

## AddTodoTask :black_nib:

To start to work with tasks, we have to import `useStore`. Then, we can get the todo and his setter

    const  [todo, setTodo] =  useStore.todo();

Now, we need a method to add a new todo on the list, we are going to need an unique id for each task, so we can use the useState from react hooks to help us

    const  [counter, setCounter] =  useState(0);

Finally, let's create a function to add a new task on store's todo

    const  addTask  =  (e)  =>  {
        e.preventDefault();
        setTodo({
    	    ...todo,
    		[counter]:  { text:  e.target.children[0].value, id:  counter  }
    	});
    	e.target.children[0].value  =  "";
    	setCounter(counter  +  1);
    };

Here, we are **not mutating** the original todo but creating a new one and passing it to setTodo.

## TodoList :clipboard:

This component list the todo and the done list, so we need both of them from store (and of course, import useStore from our `store.js`)

    const  [todo, setTodo] =  useStore.todo();
    const  [done, setDone] =  useStore.done();

### Reset lists

This is the easiest point. To reset one element from store, we could use setter again (in this case an empty object for each). Having this in mind, the button to reset lists is clear

    <button onClick={() =>  {
        setDone({});
        setTodo({});
    }}>
        Reset tasks
    </button>

So far so good

### Adding and deleting elements

We can mutate the original element from store, then we need to create a new object literal with todo or done, but adding the new element. As we have two lists (todo and done), to resolve and unresolve a task, we have to create the task on one list and remove it from the other one (remember we have an unique id for each task)

#### Resolve method

    const  resolve  =  (task)  =>  {
        const  newTodoList  =  {  ...todo  };
        delete  newTodoList[task.id];
        setTodo(newTodoList);
        setDone({  ...done,  [task.id]:  {  ...task  }  });
    };

First, we create a new object literal, cloning our todo list, then we remove the task from it. With this, now we can call the `setTodo` with the filtered list, and add the task to done list, creating a new object with all tasks on done (spread) and creating the new one.

#### Unresolve method

Same here, but swapping lists

    const  unresolve  =  (task)  =>  {
        const  newDoneList  =  {  ...done  };
        delete  newDoneList[task.id];
        setDone(newDoneList);
        setTodo({  ...todo,  [task.id]:  {  ...task  }  });
    };

Easy right? with this example, we provide the basics to use Teaful with object literals or arrays.

## Extend the TodoList example :bulb:

Try to create a new functionality to edit todo tasks

## Codesandbox example

Try it on [this codesandbox](https://codesandbox.io/s/Teaful-todolist-x3xv9?file=/src/TodoList.js:390-570)
