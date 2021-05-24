import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { useState } from "react"

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Search = ({ resultsList, query }: Props) => {
  const [genre, setGenre] = useState(query['genres.label'] ? query['genres.label'] : '')
  const [subject, setSubject] = useState(query['subjects.label'] ? query['subjects.label'] : '')
  const [license, setLicense] = useState(query['items.locations.license'] ? query['items.locations.license'] : '')
  const [from, setFrom] = useState(query['production.dates.from'] ? query['production.dates.from'] : '')
  const [to, setTo] = useState(query['production.dates.to'] ? query['production.dates.to'] : '')
  const [q, setQ] = useState(query['query'] ? query['query'] : '')

  return (
    <>
      <form>
        <input type="text" placeholder="query" onChange={(event) => {
          setQ(event.currentTarget.value)
        }} value={q} name="query" />        

        <input type="text" placeholder="genre" onChange={(event) => {
          setGenre(event.currentTarget.value)
        }} value={genre} name="genres.label" />

        <input type="text" placeholder="subject" onChange={(event) => {
          setSubject(event.currentTarget.value)
        }} value={subject} name="subjects.label" />

        <input type="text" placeholder="license" onChange={(event) => {
          setLicense(event.currentTarget.value)
        }} value={license} name="items.locations.license" />

        <input type="text" placeholder="from" onChange={(event) => {
          setFrom(event.currentTarget.value)
        }} value={from} name="production.dates.from" />

        <input type="text" placeholder="to" onChange={(event) => {
          setTo(event.currentTarget.value)
        }} value={to} name="production.dates.to" />

        <button type="submit">search</button>
      </form>

      <p>
        {resultsList.prevPage && <a href={resultsList.prevPage.replace('https://api.wellcomecollection.org/catalogue/v2/works', '/search').replace('&include=genres,subjects,items', '').replace('&pageSize=100', '')}>prev</a>}
        |
        {resultsList.nextPage && <a href={resultsList.nextPage.replace('https://api.wellcomecollection.org/catalogue/v2/works', '/search').replace('&include=genres,subjects,items', '').replace('&pageSize=100', '')}>next</a>}
      </p>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        {resultsList.results.map(result =>
          <li key={result.id} style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 10px 0',
            borderBottom: '3px solid pink'
          }}>
            <p><a href={`https://wellcomecollection.org/works/${result.id}`}>{result.title}</a></p>
            <p>genres: {result.genres.map(genre => <a href={`/search?genres.label=${genre.label}`} style={{ marginRight: '10px' }}>{genre.label}</a>)}</p>
            <p>subjects: {result.subjects.map(subject => <a href={`/search?subjects.label=${subject.label}`} style={{ marginRight: '10px' }}>{subject.label}</a>)}</p>
            {result.thumbnail && <img src={result.thumbnail.url} />}
          </li>
        )}
      </ul>
      <p>
        {resultsList.prevPage && <a href={resultsList.prevPage.replace('https://api.wellcomecollection.org/catalogue/v2/works', '/search').replace('&include=genres,subjects,items', '').replace('&pageSize=100', '')}>prev</a>}
        |
        {resultsList.nextPage && <a href={resultsList.nextPage.replace('https://api.wellcomecollection.org/catalogue/v2/works', '/search').replace('&include=genres,subjects,items', '').replace('&pageSize=100', '')}>next</a>}
      </p>

    </>
  )
}

function getParam(param: string | string[] | undefined): string | undefined {
  return Array.isArray(param) ? param.join(',') : typeof param === 'string' ? param : undefined
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const genre = getParam(context.query['genres.label'])
  const subject = getParam(context.query['subjects.label'])
  const license = getParam(context.query['items.locations.license'])
  const from = getParam(context.query['production.dates.from'])
  const to = getParam(context.query['production.dates.to'])
  const page = getParam(context.query['page'])
  const query = getParam(context.query['query'])
  const params = new URLSearchParams();

  // Boo
  genre && params.set('genres.label', genre)
  subject && params.set('subjects.label', subject)
  license && params.set('items.locations.license', license)
  from && params.set('production.dates.from', from)
  to && params.set('production.dates.to', to)
  license && params.set('items.locations.license', license)
  page && params.set('page', page)
  query && params.set('query', query)
  params.set('pageSize', '100')
  params.set('include', 'genres,subjects,items')

  const res = await fetch(`https://api.wellcomecollection.org/catalogue/v2/works?${params.toString()}`)
  const json = await res.json()

  return {
    props: { resultsList: json, query: context.query }
  }
}

export default Search