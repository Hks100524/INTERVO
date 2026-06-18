/**
 * Demo questions for testing when API quota is exceeded
 */

export const demoQuestions: Record<string, Array<{ question: string; answer: string }>> = {
  javascript: [
    {
      question: "What is the difference between let, const, and var in JavaScript?",
      answer: "var is function-scoped and can be re-declared. let is block-scoped and cannot be re-declared. const is also block-scoped but cannot be reassigned after initialization."
    },
    {
      question: "Explain closures in JavaScript.",
      answer: "A closure is a function that has access to variables in its outer (enclosing) function's scope, even after the outer function has returned. Closures are created every time a function is created."
    },
    {
      question: "What is the event loop in JavaScript?",
      answer: "The event loop is a mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It continuously checks the call stack and callback queue, executing callbacks when the stack is empty."
    },
    {
      question: "What are Promises in JavaScript?",
      answer: "Promises are objects representing the eventual completion or failure of an asynchronous operation. They have three states: pending, fulfilled, or rejected, and can be chained using .then() and .catch()."
    },
    {
      question: "Explain async/await in JavaScript.",
      answer: "async/await is syntactic sugar built on top of Promises. The async keyword makes a function return a Promise, while await pauses execution until the Promise resolves, making asynchronous code look synchronous."
    },
    {
      question: "What is the difference between == and === in JavaScript?",
      answer: "== performs type coercion before comparison, while === (strict equality) checks both value and type without coercion. For example, '5' == 5 is true, but '5' === 5 is false."
    },
    {
      question: "What is hoisting in JavaScript?",
      answer: "Hoisting is JavaScript's behavior of moving declarations to the top of their scope before code execution. Variables declared with var and function declarations are hoisted, but not their initializations."
    },
    {
      question: "Explain the this keyword in JavaScript.",
      answer: "this refers to the object that is executing the current function. Its value depends on how the function is called: in methods it refers to the owner object, in regular functions to the global object, and in arrow functions it's lexically bound."
    },
    {
      question: "What are arrow functions and how do they differ from regular functions?",
      answer: "Arrow functions are a concise syntax for writing functions. They don't have their own this binding, cannot be used as constructors, and don't have arguments object."
    },
    {
      question: "What is prototypal inheritance in JavaScript?",
      answer: "JavaScript objects inherit properties and methods from a prototype object. When accessing a property, JavaScript first looks on the object itself, then walks up the prototype chain until it finds it or reaches null."
    }
  ],
  react: [
    {
      question: "What is React and why is it used?",
      answer: "React is a JavaScript library for building user interfaces, particularly single-page applications. It uses a component-based architecture and virtual DOM for efficient updates."
    },
    {
      question: "Explain the virtual DOM in React.",
      answer: "The virtual DOM is a lightweight copy of the actual DOM. React uses it to calculate the minimal set of changes needed and batch updates, making UI updates more efficient."
    },
    {
      question: "What are React Hooks?",
      answer: "Hooks are functions that let you use state and other React features in functional components. Common hooks include useState, useEffect, useContext, and useRef."
    },
    {
      question: "What is the difference between props and state?",
      answer: "Props are read-only data passed from parent to child components. State is mutable data managed within a component that can trigger re-renders when changed."
    },
    {
      question: "Explain useEffect hook.",
      answer: "useEffect lets you perform side effects in functional components. It runs after render and can be configured to run on component mount, update, or unmount using dependencies."
    },
    {
      question: "What is Context API in React?",
      answer: "Context API provides a way to pass data through the component tree without manually passing props at every level. It's useful for global state like themes, user info, or language."
    },
    {
      question: "What are controlled vs uncontrolled components?",
      answer: "Controlled components have their state controlled by React through props and callbacks. Uncontrolled components manage their own state internally using refs."
    },
    {
      question: "Explain React component lifecycle.",
      answer: "Component lifecycle includes mounting (componentDidMount), updating (componentDidUpdate), and unmounting (componentWillUnmount). In functional components, useEffect handles all lifecycle phases."
    },
    {
      question: "What is prop drilling and how to avoid it?",
      answer: "Prop drilling is passing props through multiple component levels. It can be avoided using Context API, state management libraries like Redux, or component composition."
    },
    {
      question: "What is the difference between useMemo and useCallback?",
      answer: "useMemo memoizes the result of a computation and returns a value. useCallback memoizes the function itself. Both are optimization hooks to prevent unnecessary recalculations/re-renders."
    }
  ],
  python: [
    {
      question: "What are the differences between lists and tuples in Python?",
      answer: "Lists are mutable (can be modified after creation) and use square brackets. Tuples are immutable (cannot be modified) and use parentheses. Tuples are generally faster and use less memory."
    },
    {
      question: "Explain list comprehension in Python.",
      answer: "List comprehension is a concise way to create lists. Syntax: [expression for item in iterable if condition]. Example: [x**2 for x in range(10) if x % 2 == 0]"
    },
    {
      question: "What are decorators in Python?",
      answer: "Decorators are functions that modify the behavior of other functions or classes. They use the @decorator syntax and are commonly used for logging, timing, authentication, and caching."
    },
    {
      question: "Explain generators in Python.",
      answer: "Generators are functions that use yield instead of return to produce a sequence of values lazily. They maintain state between calls and are memory-efficient for large datasets."
    },
    {
      question: "What is the difference between __str__ and __repr__?",
      answer: "__str__ returns a readable string representation for end users. __repr__ returns an unambiguous representation for developers/debugging. __str__ falls back to __repr__ if not defined."
    },
    {
      question: "Explain the Global Interpreter Lock (GIL) in Python.",
      answer: "GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode simultaneously. It limits multi-core CPU utilization in CPU-bound multi-threaded programs."
    },
    {
      question: "What are Python's *args and **kwargs?",
      answer: "*args allows a function to accept any number of positional arguments as a tuple. **kwargs allows any number of keyword arguments as a dictionary. Both enable flexible function signatures."
    },
    {
      question: "Explain context managers and the with statement.",
      answer: "Context managers handle setup and cleanup operations automatically. The with statement ensures __enter__ is called before the block and __exit__ after, even if exceptions occur. Common use: file handling."
    },
    {
      question: "What is the difference between shallow copy and deep copy?",
      answer: "Shallow copy creates a new object but references nested objects. Deep copy creates completely independent copies of nested objects. Use copy.copy() for shallow and copy.deepcopy() for deep."
    },
    {
      question: "Explain lambda functions in Python.",
      answer: "Lambda functions are anonymous, single-expression functions defined using the lambda keyword. Syntax: lambda arguments: expression. They're often used with map(), filter(), and sorted()."
    }
  ]
};

/**
 * Get demo questions for a topic
 */
export function getDemoQuestions(topic: string): Array<{ question: string; answer: string }> {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Try exact match first
  if (demoQuestions[normalizedTopic]) {
    return demoQuestions[normalizedTopic];
  }
  
  // Try partial match
  for (const [key, questions] of Object.entries(demoQuestions)) {
    if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
      return questions;
    }
  }
  
  // Default to JavaScript questions if no match
  return demoQuestions.javascript;
}
