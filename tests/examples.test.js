import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@babel/polyfill";

import createStore from "../package/index";

describe("Examples", () => {
  test("should work with a counter", async () => {
    const { useStore, Provider } = createStore({ count: 0 });

    function Counter() {
      const [count, setCount, resetCount] = useStore.count();
      return (
        <div>
          <h1>{count}</h1>
          <button onClick={() => setCount((v) => v + 1)}>+</button>
          <button onClick={() => setCount((v) => v - 1)}>-</button>
          <button onClick={resetCount}>reset</button>
        </div>
      );
    }

    function DisplayCounter() {
      const [count] = useStore.count();
      return <p data-testid="number">{count}</p>;
    }

    render(
      <Provider>
        <Counter />
        <DisplayCounter />
      </Provider>
    );

    expect(screen.getByRole("heading").textContent).toBe("0");

    // Inc
    fireEvent.click(screen.getByText("+"));
    await waitFor(() => screen.getByRole("heading"));
    expect(screen.getByRole("heading").textContent).toBe("1");
    expect(screen.getByTestId("number").textContent).toContain("1");

    // Inc again
    fireEvent.click(screen.getByText("+"));
    await waitFor(() => screen.getByRole("heading"));
    expect(screen.getByRole("heading").textContent).toBe("2");
    expect(screen.getByTestId("number").textContent).toContain("2");

    // Dec
    fireEvent.click(screen.getByText("-"));
    await waitFor(() => screen.getByRole("heading"));
    expect(screen.getByRole("heading").textContent).toBe("1");
    expect(screen.getByTestId("number").textContent).toContain("1");

    // Inc again
    fireEvent.click(screen.getByText("+"));
    await waitFor(() => screen.getByRole("heading"));
    expect(screen.getByRole("heading").textContent).toBe("2");
    expect(screen.getByTestId("number").textContent).toContain("2");

    // Reset
    fireEvent.click(screen.getByText("reset"));
    await waitFor(() => screen.getByRole("heading"));
    expect(screen.getByRole("heading").textContent).toBe("0");
    expect(screen.getByTestId("number").textContent).toContain("0");
  });
});
