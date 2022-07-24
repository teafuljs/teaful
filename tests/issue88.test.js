import {render} from '@testing-library/react';
import {useEffect, useState} from 'react';

import '@babel/polyfill';

import createStore from '../package/index';

describe('Issue 88', () => {
  it('should subscribe even if initially not rendered', () => {
    const track = jest.fn();

    const initialStore = {
      number: 0,
    };
    const {useStore} = createStore(initialStore);

    const AA = () => {
      const [number] = useStore.number();
      track(`AA number: ${number}`);

      return number;
    };

    const CC = () => {
      const [number, setNumber] = useStore.number();
      track(`CC number: ${number}`);
      if (!number) {
        setNumber((prev) => prev + 1);
      }

      return 'c';
    };

    function App() {
      const [show, setShow] = useState(false);
      track(`App show: ${show}`);
      useEffect(() => {
        setShow(true);
      }, []);

      return (
        <div>
          {show && (
            <>
              <AA />
              <CC />
            </>
          )}
        </div>
      );
    }

    render(<App />);

    console.log(track.mock.calls);
    expect(track.mock.calls).toContain([
        [ 'App show: false' ],
        [ 'App show: true' ],
        [ 'AA number: 0' ],
        [ 'CC number: 0' ],
        [ 'AA number: 1' ],
        [ 'CC number: 1' ],
    ]);
  });
});
