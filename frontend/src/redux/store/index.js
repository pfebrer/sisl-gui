import { createStore } from 'redux'
import {responsiveStoreEnhancer} from 'redux-responsive'
import { persistStore} from 'redux-persist'

import rootReducer from '../reducers'

const getStoreAndPersistor = () => {
  let store = createStore(rootReducer, responsiveStoreEnhancer)
  let persistor = persistStore(store)
  //persistor.purge()
  return { store, persistor }
}

export default getStoreAndPersistor