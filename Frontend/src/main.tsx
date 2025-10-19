import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
    <ToastContainer
      position="bottom-right"  // ✅ bottom right
      autoClose={3000}         // 3s auto close
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"          // optional, or "light"/"dark"
    />
  </Provider>
);
