import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { createOpenAiClient } from '../lib/openai'
import { OpenAIApi } from 'openai'
import { SupabaseClient, createClient } from '@supabase/supabase-js'

interface ServerSideProps {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  OPENAI_KEY: string;
}

interface Result {
  id: number;
  content: string;
  file_name: string;
  similarity: number;
}

async function query(openai: OpenAIApi, app: SupabaseClient, input: string) {
  const { data } = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input,
  })
  const { data: inputEmb } = data;
  const res = await app.rpc("search_docs", {
    match_count: 10,
    similarity_threshold: 0.8,
    query_embedding: inputEmb[0].embedding,
  })
  return res.data;
}

const Home: NextPage<ServerSideProps> = ({ OPENAI_KEY, SUPABASE_KEY, SUPABASE_URL }) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false)
  const openAiClient = createOpenAiClient(OPENAI_KEY);
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

  return (
    <div>
      <Head>
        <title>Project Author</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='flex flex-col items-center justify-center font-mono'>
        <h1 className='mt-10 mb-5 text-2xl font-bold text-center'>Project Author</h1>
        <form className='border border-black' onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          if (input !== "") {
            const res = await query(openAiClient, supabaseClient, input);
            setResult(res)
          }
          setLoading(false)

        }}>
          <input className='px-2 mx-2' type="text" onChange={(e) => setInput(e.target.value)} />
          <input className='px-5 py-1 font-bold transition-colors border-l border-black cursor-pointer hover:bg-black hover:text-white' disabled={loading} type='submit' value={loading ? "loading" : "submit"} />
        </form>

        <div className='mx-10 mt-20'>
          {
            result.map(res => (
              <div key={res.id} className='p-5 my-10 border-2 border-black'>
                <h1 className='text-xl font-bold'>{res.file_name} - ({Math.round(res.similarity * 100000) / 1000}%)</h1>
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
export const getServerSideProps: GetServerSideProps<ServerSideProps> = async (context) => {
  return {
    props: {
      OPENAI_KEY: process.env.OPENAI_KEY!,
      SUPABASE_KEY: process.env.SUPABASE_KEY!,
      SUPABASE_URL: process.env.SUPABASE_URL!,
    }
  }
}