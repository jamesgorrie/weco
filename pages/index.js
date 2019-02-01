import fetch from 'isomorphic-unfetch'
import { useState, useEffect } from 'react'
import Router from 'next/router'
import styled, { createGlobalStyle } from 'styled-components'
import useDebounce from '../hooks/useDebounce'

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=VT323');

  body {
    padding: 0;
    margin: 0;
    font-size: 24px;
    font-family: 'VT323', monospace;
  }
`

const Flex = styled.div`
  display: flex;
`

const FlexGrow = styled.div`
  flex-grow: ${props => props.flexGrow || 1};
`

const SearchTextInput = styled.input`
  width: 100%;
  border: 1px solid blue;
  box-sizing: border-box;
  padding: 10px;
  font-size: 32px;
  font-family: 'VT323', monospace;
`

// Empty is anything that doesn't pass JS's `is`
function removeEmptyValuesFromObject(obj) {
  return Object.keys(obj).reduce((newObj, key) => {
    if (obj[key]) {
      return {
        ...newObj,
        [key]: obj[key]
      }
    } else {
      return newObj
    }
  }, {})
}

const Index = ({
  resultsList,
  initialQuery,
  initialHasVisualRepresentation
}) => {
  const [query, setQuery] = useState(initialQuery)
  const [hasVisualRepresentation, setHasVisualRepresentation] = useState(
    initialHasVisualRepresentation
  )
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    const link = {
      pathname: '/',
      query: removeEmptyValuesFromObject({
        query,
        hasVisualRepresentation
      })
    }

    Router.push(link, link)
  }, [debouncedQuery, hasVisualRepresentation])

  return (
    <div>
      <GlobalStyle />
      <form
        onSubmit={event => {
          event.preventDefault()
          const link = {
            pathname: '/',
            query: removeEmptyValuesFromObject({
              query,
              hasVisualRepresentation
            })
          }

          Router.push(link, link)
        }}
      >
        <SearchTextInput
          type="text"
          name="query"
          value={query}
          onChange={event => setQuery(event.currentTarget.value)}
        />

        <Flex>
          <FlexGrow>
            <label>
              <input
                type="checkbox"
                name="hasVisualRepresentation"
                value={true}
                onChange={event => {
                  setHasVisualRepresentation(event.currentTarget.checked)
                }}
              />
              Gotz viz
            </label>
          </FlexGrow>
          <div>{resultsList && `${resultsList.totalResults} results`}</div>
        </Flex>
      </form>

      {resultsList && resultsList.results.length > 0 && (
        <ul>
          {resultsList.results.map(result => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

Index.getInitialProps = async ctx => {
  const { query, hasVisualRepresentation } = ctx.query
  const itemsLocationsLocationType = hasVisualRepresentation
    ? ['iiif-image', 'iiif-presentation']
    : null

  const url =
    'https://api.wellcomecollection.org/catalogue/v2/works?pageSize=100&' +
    [
      query ? `query=${query}` : null,
      itemsLocationsLocationType
        ? `items.locations.locationType=${itemsLocationsLocationType.join(',')}`
        : null
    ]
      .filter(Boolean)
      .join('&')

  const resultsList = query ? await fetch(url).then(resp => resp.json()) : null

  return {
    resultsList,
    initialQuery: query,
    initialHasVisualRepresentation: Boolean(hasVisualRepresentation)
  }
}

export default Index
