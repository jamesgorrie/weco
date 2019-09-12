import fetch from 'isomorphic-unfetch'
import { NextPageContext, NextPage } from 'next'
import { ParsedUrlQuery } from 'querystring'
import Router from 'next/router'
import Link from 'next/link'
import styled, { css } from 'styled-components'
import SearchInput from '../components/SearchInput'

const UiText = styled.span`
  color: hotpink;
`

const Token = styled.div`
  border-border-bottom-right-radius: 2px;
  border-border-top-right-radius: 2px;

  padding: 2px 5px;
  margin-right: 1px;
  color: white;
  font-size: 16px;
  background: hotpink;
  a {
    color: white;
  }
  ${props =>
    props.selected &&
    css`
      font-weight: bold;
      background: limegreen;
    `}
`

const Flex = styled.div`
  display: flex;
`

type Props = {
  results: any
  aggregations: any
  params: UrlParams
}
const Index: NextPage = ({ results, aggregations, params }: Props) => {
  return (
    <>
      <form
        onSubmit={event => {
          const newParams: Partial<UrlParams> = Object.keys(params).reduce(
            (acc, key) => {
              const element = event.currentTarget.elements[key]
              const value = element && element.value

              return value
                ? {
                    ...acc,
                    [key]: value
                  }
                : acc
            },
            {}
          )

          Router.push({
            pathname: '/new',
            query: newParams
          })
          event.preventDefault()
          return false
        }}
      >
        <SearchInput value={params.query} name="query" />
      </form>

      {aggregations &&
        aggregations.aggregations &&
        aggregations.aggregations.workType && (
          <Flex>
            {aggregations.aggregations.workType.buckets.map((bucket, i) => {
              const workTypeSet: Set<string> = params.workType
                ? new Set(params.workType.split(','))
                : new Set()
              const selected = workTypeSet.has(bucket.data.id)

              if (selected) {
                workTypeSet.delete(bucket.data.id)
              } else {
                workTypeSet.add(bucket.data.id)
              }

              return (
                <Token key={i} selected={selected}>
                  <Link
                    href={{
                      pathname: '/new',
                      query: {
                        query: params.query,
                        workType: Array.from(workTypeSet.values())
                          .sort()
                          .join(',')
                      }
                    }}
                  >
                    <a>
                      <span>
                        {bucket.data.label} ({bucket.count})
                      </span>
                    </a>
                  </Link>
                </Token>
              )
            })}
          </Flex>
        )}

      {results && results.results.length > 0 && (
        <div>
          {results.results.length > 0 && (
            <ul>
              {results.results.map(result => (
                <li key={result.id}>
                  <a
                    href={`https://wellcomecollection.org/works/${result.id}`}
                    target="_blank"
                  >
                    <UiText>{result.workType.label} /</UiText> {result.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  )
}

type AggregationKey = 'workType' | 'genre'
const UrlParams = {
  query: '',
  workType: null,
  aggregations: null,
  id: null,
  _dateFrom: null,
  _dateTo: null
}
type UrlParams = typeof UrlParams

function getParams(query: ParsedUrlQuery): UrlParams {
  return {
    ...UrlParams,
    ...query
  }
}
Index.getInitialProps = async ({ query }: NextPageContext): Promise<Props> => {
  const params: UrlParams = getParams(query)
  const qs = Object.keys(params)
    .filter(key => params[key])
    .map(key => key + '=' + params[key])
    .join('&')

  const resultsUrl = `https://api.wellcomecollection.org/catalogue/v2/works?pageSize=100&${qs}`
  const aggregationsUrl = `https://api.wellcomecollection.org/catalogue/v2/works?_aggregations=workType&query=${params.query}`

  const results = await fetch(resultsUrl).then(resp => resp.json())
  const aggregations = await fetch(aggregationsUrl).then(resp => resp.json())

  return { results, aggregations, params }
}

export default Index
