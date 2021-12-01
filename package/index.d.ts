declare module "teaful" {

  import React from "react";
  
  type HookReturn<T> = [T, (value: T | ((value: T) => T | undefined | null) ) => void, () => void];
  type initialStoreType = Record<string, any>;

  type Hook<S> = (
    initial?: S,
    onAfterUpdate?: afterCallbackType<S>
  ) => HookReturn<S>;

  type HookDry<S> = (initial?: S) => HookReturn<S>;

  export type Hoc<S> = { store: HookReturn<S> };

  type HocFunc<S, R extends React.ComponentClass = React.ComponentClass> = (
    component: R,
    initial?: S
  ) => R;

  type afterCallbackType<S extends initialStoreType> = (param: {
    store: S;
    prevStore: S;
  }) => void;

  type getStoreType<S extends initialStoreType> = {
    [key in keyof S]: S[key] extends initialStoreType
      ? useStoreType<S[key]> & HookDry<S[key]> : HookDry<S[key]>;
  };

  type useStoreType<S extends initialStoreType> = {
    [key in keyof S]: S[key] extends initialStoreType
      ? useStoreType<S[key]> & Hook<S[key]> : Hook<S[key]>;
  };

  type withStoreType<S extends initialStoreType> = {
    [key in keyof S]: S[key] extends initialStoreType
      ? withStoreType<S[key]> & HocFunc<S>
      : HocFunc<S>;
  };

  function createStore<S extends initialStoreType>(
    initial?: S,
    afterCallback?: afterCallbackType<S>
  ): {
    getStore: HookDry<S> & getStoreType<S>;
    useStore: Hook<S> & useStoreType<S>;
    withStore: HocFunc<S> & withStoreType<S>;
  };

  export default createStore;
}
