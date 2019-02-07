import fetch from 'isomorphic-unfetch'
import { Fragment, useState, useEffect, useRef } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import styled, { createGlobalStyle } from 'styled-components'
import useDebounce from '../hooks/useDebounce'
import Result from '../components/Result'

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

const UiText = styled.span`
  color: hotpink;
`

const Token = styled.div`
  border-border-bottom-right-radius: 2px;
  border-border-top-right-radius: 2px;
  background: hotpink;
  padding: 2px 5px;
  margin-right: 1px;
  color: white;
`

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  margin-left: 15px;
  padding-left: 5px;
  font-size: 16px;
  cursor: pointer;
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
  id,
  resultsList,
  initialQuery = '',
  initialHasVisualRepresentation
}) => {
  const [isQueryBuilder, setIsQueryBuilder] = useState(true)
  const [searchTokens, setSearchTokens] = useState(
    new Set(
      initialQuery
        .split('+')
        .filter(token => token !== '')
        .map(token => token.replace(/"/g, ''))
    )
  )
  const [currentToken, setCurrentToken] = useState('')
  const [query, setQuery] = useState(initialQuery)
  const [hasVisualRepresentation, setHasVisualRepresentation] = useState(
    initialHasVisualRepresentation
  )
  const debouncedQuery = useDebounce(query, 250)

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

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
        {!isQueryBuilder && (
          <SearchTextInput
            type="text"
            name="query"
            value={query}
            onChange={event => setQuery(event.currentTarget.value)}
          />
        )}
        {isQueryBuilder && (
          <Fragment>
            <SearchTextInput
              type="text"
              placeholder="↵ to 🔎"
              name="tokens"
              value={currentToken}
              onChange={event => {
                const val = event.currentTarget.value
                setCurrentToken(val)
              }}
              onKeyDown={event => {
                if (event.which === 13) {
                  event.preventDefault()
                  if (currentToken !== '') {
                    const tokens = searchTokens.add(currentToken)
                    setSearchTokens(tokens)
                    setCurrentToken('')
                  } else {
                    const q = [...searchTokens]
                      .map(token => {
                        return `"${token.replace(/"/g, '')}"`
                      })
                      .join('+')

                    setQuery(q)
                  }
                }
              }}
            />
            {searchTokens.size > 0 && (
              <Flex>
                {[...searchTokens].map((token, i) => {
                  return (
                    <Token key={i}>
                      {token}
                      <IconButton
                        onClick={event => {
                          searchTokens.delete(token)
                          setSearchTokens(searchTokens)
                        }}
                      >
                        🔨
                      </IconButton>
                    </Token>
                  )
                })}
              </Flex>
            )}
          </Fragment>
        )}

        <Flex>
          <FlexGrow>
            <label>
              <input
                type="checkbox"
                name="hasVisualRepresentation"
                value={hasVisualRepresentation}
                onChange={event => {
                  setHasVisualRepresentation(event.currentTarget.checked)
                }}
              />
              Gotz viz
            </label>
            <label style={{ marginLeft: '20px' }}>
              <input
                type="checkbox"
                name="useQueryBuilder"
                value={isQueryBuilder}
                checked={isQueryBuilder}
                onChange={event => {
                  setIsQueryBuilder(event.currentTarget.checked)
                }}
              />
              Yooz tokenz search
            </label>
          </FlexGrow>
          <div>{resultsList && `${resultsList.totalResults} results`}</div>
        </Flex>
      </form>

      {!id && resultsList && resultsList.results.length > 0 && (
        <div>
          {resultsList.results.length > 0 && (
            <ul>
              {resultsList.results.map(result => (
                <li key={result.id}>
                  <Link
                    href={{
                      pathname: '/',
                      query: removeEmptyValuesFromObject({
                        id: result.id,
                        query,
                        hasVisualRepresentation
                      })
                    }}
                  >
                    <a>
                      <UiText>{result.workType.label} /</UiText> {result.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {id && (
        <Result result={resultsList.results.find(result => result.id === id)} />
      )}
    </div>
  )
}

Index.getInitialProps = async ctx => {
  const { query, hasVisualRepresentation, id } = ctx.query
  const itemsLocationsLocationType = hasVisualRepresentation
    ? ['iiif-image', 'iiif-presentation']
    : null

  const url =
    'https://api.wellcomecollection.org/catalogue/v2/works?pageSize=100&' +
    [
      query ? `query=${encodeURIComponent(query)}` : null,
      itemsLocationsLocationType
        ? `items.locations.locationType=${itemsLocationsLocationType.join(',')}`
        : null
    ]
      .filter(Boolean)
      .join('&')

  const resultsList = query ? await fetch(url).then(resp => resp.json()) : null

  return {
    id,
    resultsList,
    initialQuery: query,
    initialHasVisualRepresentation: Boolean(hasVisualRepresentation)
  }
}

export default Index
