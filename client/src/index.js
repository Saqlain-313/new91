import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import store from "./store/store.js";
import { Provider } from "react-redux";
import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
// Create a client


// Create Apollo Client
const client = new ApolloClient({
  uri: '/',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache', // Always fetch fresh data
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache', // Ensure no cache is used for queries
      errorPolicy: 'all',
    },
  },
});


// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//     <Provider store={store}>
//     <App />
// </Provider>
// );


// Create a root container for React 18
// const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(
//   <ApolloProvider client={client}>
//     <Provider store={store}>
//       <App />
//     </Provider>
//   </ApolloProvider>
// );

const RootComponent = () => {
  useEffect(() => {
    // Clear Apollo cache on page load
    client.cache.reset();
  }, []);

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <App />
      </Provider>
    </ApolloProvider>
  );
};

// Create a root container for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<RootComponent />);