import { NextPageContext, NextPage } from 'next'
import styled from '@emotion/styled'
import { getRootCollections, getCollection } from '../services/collections'
import { asString } from '../services/urls'
import Link from 'next/link'
import { sort } from '../arrays'
import { ResultList } from '../models/ResultList'

type Props = {
  resultList: ResultList
  collectionList: ResultList
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  align-items: stretch;
`

const Results = styled.div`
  background: #e60073;
  color: white;
  flex: 1;
  overflow: scroll;

  a {
    color: white;
  }

  li {
    padding: 0;
    margin: 0;
    margin-bottom: 10px;
  }
`

const Result = styled.div`
  background: white;
  color: #e60073;
  flex: 1;
  overflow: scroll;

  a {
    color: #e60073;
  }

  li {
    padding: 0;
    margin: 0;
    margin-bottom: 10px;
  }
`

const Index: NextPage<Props> = ({ resultList, collectionList }) => {
  return (
    <Wrapper>
      <Results>
        <ul>
          {resultList.results.map(result => (
            <li key={result.id}>
              <Link href={`/collections?collection=${result.collection.path}`}>
                <a>{result.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </Results>
      <Result>
        <ul>
          {collectionList &&
            sort(collectionList.results, (a, b) =>
              a.collection.path > b.collection.path ? 1 : -1
            ).map(result => (
              <li key={result.id}>
                <Link
                  href={`https://wellcomecollection.org/works/${result.id}`}
                >
                  <a target="_blank">
                    {result.collection.path} ⇒ {result.title}
                  </a>
                </Link>
              </li>
            ))}
        </ul>
      </Result>
    </Wrapper>
  )
}

Index.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  const { collection } = ctx.query
  const resultList = await getRootCollections({})
  const collectionList = collection
    ? await getCollection({ collection: asString(collection) })
    : null

  return { resultList, collectionList }
}

export default Index
