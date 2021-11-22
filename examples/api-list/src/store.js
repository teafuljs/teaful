import createStore from "teaful";

export const { useStore } = createStore({
  images: [],
  loading: true,
  error: false,
});
