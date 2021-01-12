import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { useState } from "react"

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Search = ({ resultsList, query }: Props) => {
  const [genre, setGenre] = useState(query['genres.label'] ? query['genres.label'] : '')
  const [subject, setSubject] = useState(query['subjects.label'] ? query['subjects.label'] : '')

  return (
    <>
      <form>
        <input type="text" placeholder="genre" onChange={(event) => {
          setGenre(event.currentTarget.value)
        }} value={genre} name="genres.label" />

        <input type="text" placeholder="subject" onChange={(event) => {
          setSubject(event.currentTarget.value)
        }} value={subject} name="subjects.label" />

        <button type="submit">search</button>
      </form>

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
          </li>
        )}
      </ul>
    </>
  )
}

function getParam(param: string | string[] | undefined): string | undefined {
  return Array.isArray(param) ? param.join(',') : typeof param === 'string' ? param : undefined
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const genre = getParam(context.query['genres.label'])
  const subject = getParam(context.query['subjects.label'])
  const params = new URLSearchParams();

  // Boo
  genre && params.set('genres.label', genre)
  subject && params.set('subjects.label', subject)
  params.set('size', '100')
  params.set('include', 'genres,subjects')

  const res = await fetch(`https://api.wellcomecollection.org/catalogue/v2/works?${params.toString()}`)
  const json = await res.json()

  console.info(`https://api.wellcomecollection.org/catalogue/v2/works?${params.toString()}`)

  return {
    props: { resultsList: json, query: context.query }
  }
}

export default Search