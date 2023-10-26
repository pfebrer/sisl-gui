import { configureStore, combineReducers } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import { persistStore, persistReducer} from 'redux-persist'

import session from '../reducers/session'

var reducer = combineReducers({session})

reducer = persistReducer({
    key: 'root',
    storage
}, reducer)

const getStoreAndPersistor = () => {
  const store = configureStore({reducer})

  document.store = store
  const persistor = persistStore(store)
  //persistor.purge()
  return { store, persistor }
}

export default getStoreAndPersistor