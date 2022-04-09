import '@babel/polyfill';

import createStore from '../package/index';

describe('Extras', () => {
  it('should be possible to register a library extra',
      async () => {
        createStore.ext(({getStore}, subscription) => {
          const [, setTest2] = getStore.test2();
          // Renamed to "subscription.s()" after build to minify code
          subscription._subscribe('.', ({store}) => {
            if (store.test === 3 && !store.test2) {
              setTest2(4);
            }
          });
          return {getStoreFromPath: (path: string) => getStore[path]()};
        });

        const {getStoreFromPath} = createStore({test: 0, test2: 0});
        const [, setTest] = getStoreFromPath('test');
        setTest(1);
        expect(getStoreFromPath('test')[0]).toBe(1);
        expect(getStoreFromPath('test2')[0]).toBe(0);

        setTest(2);
        expect(getStoreFromPath('test')[0]).toBe(2);
        expect(getStoreFromPath('test2')[0]).toBe(0);

        setTest(3);
        expect(getStoreFromPath('test')[0]).toBe(3);
        expect(getStoreFromPath('test2')[0]).toBe(4);
      });
});
