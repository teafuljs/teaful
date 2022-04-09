import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import * as React from "react";
import createStore from "teaful";

interface InitStore {
  name: string;
  count: number;
}

export const { useStore } = createStore<InitStore>();

async function fakeFetcher(): Promise<any> {
  return new Promise(function (resolve, reject) {
    let success = true;

    if (success) {
      resolve({
        name: "Hello Teaful.js",
      });
    } else {
      reject({
        error: true,
        name: "Something Error",
      });
    }
  });
}

export default function ServerSideRenderPage({
  name: initialName,
  count: initialCount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // set initial value
  const [name] = useStore.name(initialName);
  const [count, setCount] = useStore.count(initialCount);
  const router = useRouter();

  const addCount = React.useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    router.push(`?count=${newCount}`);
  }, [count]);

  return (
    <main>
      <h3>{name}</h3>
      <div>This page is server side rendered.</div>
      <div style={{ display: "flex", marginTop: 16 }}>
        <div>
          <b>Count:</b> {count}
        </div>
        <button onClick={addCount} style={{ marginLeft: 12 }}>
          Add Count
        </button>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const data = await fakeFetcher();
  const { count } = query;

  const regPos = /^[0-9]+.?[0-9]*/; // isNumber

  return {
    props: Object.assign(data, {
      count:
        count && !Array.isArray(count) && regPos.test(count)
          ? parseInt(count)
          : 0,
    }),
  };
};
