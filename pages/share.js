// pages/share.js
import Head from "next/head";
import { airtableFindByToken } from "../lib/airtable";

export default function Share({ title, desc, image }) {
  return (
    <>
      <Head>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={image} />
        <meta property="og:type" content="website" />
      </Head>

      <h1>{title}</h1>
      <img src={image} width="300" />
      <p>{desc}</p>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const token = query.token || null;
  let result = "panda";
  if (token) {
    const record = await airtableFindByToken(token);
    if (record?.fields?.Result) result = record.fields.Result;
  }
  const base = process.env.NEXT_PUBLIC_APP_URL;
  return {
    props: {
      title: `Your Result: ${result}`,
      desc: `I tried the Paisa Personality Quiz — my result: ${result}`,
      image: `${base}/ogs/${result}.png`,
    },
  };
}
