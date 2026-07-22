import {create} from 'zustand'

const initialState = {
    messages: [],
    isLoading: false,
    error: null
}

const useAI = create((set) => ({
    ...initialState,
// TODO: route -> crow then ollama
    // allow streaming or not?
    // https://docs.ollama.com/api/streaming


}))
