import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { openai } from '../lib/openai'
import { app } from '../lib/supabase'

interface Result {
  id: number;
  content: string;
  file_name: string;
  similarity: number;
}

async function query(input: string) {
  const { data } = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input,
  })
  const { data: inputEmb } = data;
  const res = await app.rpc("search_docs", {
    match_count: 10,
    similarity_threshold: 0.5,
    query_embedding: inputEmb[0].embedding,
  })
  return res.data;
}

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false)

  return (
    <div>
      <Head>
        <title>Project Author</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='font-mono flex flex-col justify-center items-center'>
        <h1 className='text-center font-bold text-2xl mt-10 mb-5'>Project Author</h1>
        <form className='border border-black' onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          if (input !== "") {
            const res = await query(input);
            setResult(res)
          }
          setLoading(false)

        }}>
          <input className='px-2 mx-2' type="text" onChange={(e) => setInput(e.target.value)} />
          <input className='border-l hover:bg-black hover:text-white transition-colors font-bold cursor-pointer border-black px-5 py-1' disabled={loading} type='submit' value={loading ? "loading" : "submit"} />
        </form>

        <div className='mt-20 mx-10'>
          {
            result.map(res => (
              <div key={res.id} className='my-10 border-2 border-black p-5'>
                <h1 className='font-bold text-xl'>{res.file_name} - ({Math.round(res.similarity * 100000) / 1000}%)</h1>
                <p>{res.content}</p>
              </div>
            ))
          }
        </div>
      </main>
    </div>
  )
}

export default Home
