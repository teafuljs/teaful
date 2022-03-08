
import {ComponentClass} from 'react';

export type Setter<T> = (
  value?: T | ((value: T) => T | undefined | null) 
) => void;

export type HookReturn<T> = [T, Setter<T>];
export type Store = Record<string, any>;

export type ReducerFn = (
  a: Store, 
  c: string, 
  index?: number, 
  arr?: string[]
) => any

export type Params<S extends Store> = {
  store: S, 
  prevStore: S
};

export type ListenersObj<S extends Store> = { 
  [key: string]: Set<Listener<S>> 
}

export type Subscription<S extends Store> = {
  _subscribe(path: string, listener?: Listener<S>): void;
  _unsubscribe(path: string, listener?: Listener<S>): void;
  _notify(path: string, params: Params<S>): void;
}

export type ExtraFn = (
  res: Result<any>, 
  subscription: Subscription<any>
) => Extra;

export type Extra = {
  [key: string]: any;
}
export type ValueOf<T> = T[keyof T];

export type Validator<S> = ProxyHandler<ValueOf<Result<S>>> & Extra

export type Hook<S> = (
  initial?: S,
  onAfterUpdate?: Listener<S>
) => HookReturn<S>;

export type HookDry<S> = (initial?: S) => HookReturn<S>;

export type Hoc<S> = { store: HookReturn<S> };

export type HocFunc<S, R extends ComponentClass = ComponentClass> = (
  component: R,
  initial?: S,
  onAfterUpdate?: Listener<S>
) => R & { store: useStoreType<S> };

export type Listener<S extends Store> = (param: Params<S>) => void;

export type getStoreType<S extends Store> = {
  [key in keyof S]: S[key] extends Store
    ? useStoreType<S[key]> & HookDry<S[key]> : HookDry<S[key]>;
};

export type setStoreType<S extends Store> = {
  [key in keyof S]: S[key] extends Store
    ? setStoreType<S[key]> & Setter<S[key]> : Setter<S[key]>;
};

export type useStoreType<S extends Store> = {
  [key in keyof S]: S[key] extends Store
    ? useStoreType<S[key]> & Hook<S[key]> : Hook<S[key]>;
};

export type withStoreType<S extends Store> = {
  [key in keyof S]: S[key] extends Store
    ? withStoreType<S[key]> & HocFunc<S[key]>
    : HocFunc<S[key]>;
};

type Complete<T> = {
  [P in keyof Required<T>]: 
  Pick<T, P> extends Required<Pick<T, P>> ? T[P] : (T[P] | undefined);
}

export type Result<S extends Store> = {
  getStore: HookDry<Complete<S>> & getStoreType<Complete<S>>;
  useStore: Hook<Complete<S>> & useStoreType<Complete<S>>;
  withStore: HocFunc<Complete<S>> & withStoreType<Complete<S>>;
  setStore: Setter<Complete<S>> & setStoreType<Complete<S>>;
} & Extra
