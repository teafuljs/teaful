import * as React from 'react'
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

describe("Examples", () => {
  it("test", () => {
    render(<App />);

    const todo = screen.getByTestId("todo");
    const done = screen.getByTestId("done");

    //create a task
    userEvent.type(screen.getByTestId("textbox"), "Add more tests");
    userEvent.click(screen.getByText("Add"));

    //task should be on todo
    expect(todo).toHaveTextContent(/add more tests/i)
    expect(done).not.toHaveTextContent(/add more tests/i)

    //resolve task, then task should be on done
    userEvent.click(screen.getByTestId("check-0"));
    expect(todo).not.toHaveTextContent(/add more tests/i)
    expect(done).toHaveTextContent(/add more tests/i)

    //unresolve task, then task should be on todo
    userEvent.click(screen.getByTestId("check-0"));
    expect(todo).toHaveTextContent(/add more tests/i)
    expect(done).not.toHaveTextContent(/add more tests/i)

    //add a second task and resolve it
    userEvent.type(screen.getByTestId("textbox"), "Improve docs");
    userEvent.click(screen.getByText("Add"));
    userEvent.click(screen.getByTestId("check-1"));

    expect(todo).toHaveTextContent(/add more tests/i)
    expect(done).toHaveTextContent(/improve docs/i)

    //delete one task from each case
    const deleteTodo = screen.getByTestId('delete-0');
    const deleteDone = screen.getByTestId('delete-1');

    userEvent.click(deleteTodo);
    expect(todo).not.toHaveTextContent(/add more tests/i)

    userEvent.click(deleteDone);
    expect(todo).not.toHaveTextContent(/improve docs/i)

    //reset all tasks
    userEvent.type(screen.getByTestId("textbox"), "Add more tests");
    userEvent.click(screen.getByText("Add"));
    userEvent.type(screen.getByTestId("textbox"), "Improve docs");
    userEvent.click(screen.getByText("Add"));
    userEvent.click(screen.getByTestId("check-2"));
    userEvent.click(screen.getByText(/reset all/i))

    expect(todo).not.toHaveTextContent(/add more tests/i)
    expect(todo).not.toHaveTextContent(/improve docs/i)

    //error adding empty task
    userEvent.click(screen.getByText("Add"));
    expect(screen.getByText(/Can\'t add empty tasks/i)).toBeInTheDocument();

  });
});
