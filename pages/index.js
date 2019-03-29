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

const MegaSelect = styled.select`
  font-size: 24px;
  border-radius: 0;
  border: 1px solid black;
  background: limegreen;
  -webkit-appearance: none;
  padding-left: 15px;
  padding-right: 15px;
  color: white;
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
  initialHasVisualRepresentation,
  initial_queryType
}) => {
  const [searchTokens, setSearchTokens] = useState(
    new Set(
      (initialQuery.match(/([|+-]".*?")/g) || []).filter(token => token !== '')
    )
  )
  const [currentToken, setCurrentToken] = useState('')
  const [currentTokenCombiner, setCurrentTokenCombiner] = useState('+')
  const [query, setQuery] = useState(initialQuery)
  const [hasVisualRepresentation, setHasVisualRepresentation] = useState(
    initialHasVisualRepresentation
  )
  const debouncedQuery = useDebounce(query, 250)

  const firstRender = useRef(true)
  const [_queryType, set_queryType] = useState(initial_queryType)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    const link = {
      pathname: '/',
      query: removeEmptyValuesFromObject({
        query,
        hasVisualRepresentation,
        _queryType
      })
    }

    Router.push(link, link)
  }, [debouncedQuery, hasVisualRepresentation, _queryType])

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
        <Fragment>
          <Flex>
            <MegaSelect
              onChange={event => {
                setCurrentTokenCombiner(event.currentTarget.value)
              }}
            >
              <option value="+">+ (andz)</option>
              <option value="|">| (orz)</option>
              <option value="-">- (notz)</option>
            </MegaSelect>
            <SearchTextInput
              type="text"
              placeholder="🔎"
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
                    const tokens = searchTokens.add(
                      `${currentTokenCombiner}"${currentToken}"`
                    )
                    setSearchTokens(tokens)
                    setCurrentToken('')
                    const q = [...searchTokens].join('')

                    setQuery(q)
                  }
                }
              }}
            />
          </Flex>
          {searchTokens.size > 0 && (
            <Flex>
              {[...searchTokens].map((token, i) => {
                return (
                  <Token key={i}>
                    <span
                      style={{
                        background: 'limegreen',
                        display: 'inline-block',
                        padding: '0 5px',
                        margin: '0 5px 0 0'
                      }}
                    >
                      {token.split(/(\+|\||\-)(.*)/)[1]}
                    </span>
                    <span>{token.split(/(\+|\||\-)(.*)/)[2]}</span>
                    <IconButton
                      onClick={event => {
                        searchTokens.delete(token)
                        setSearchTokens(searchTokens)
                        const q = [...searchTokens].join('')
                        setQuery(q)
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
            {' | '}
            <label>
              🥁 all go rhythm 🎺
              <select
                value={_queryType}
                onChange={event => set_queryType(event.currentTarget.value)}
              >
                <option value={''}>nuffink</option>
                <option value="justboost">justboost</option>
                <option value="broaderboost">broaderboost</option>
                <option value="slop">slop</option>
                <option value="minimummatch">minimummatch</option>
              </select>
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
  const { query, hasVisualRepresentation, id, _queryType } = ctx.query
  const itemsLocationsLocationType = hasVisualRepresentation
    ? ['iiif-image', 'iiif-presentation']
    : null

  const url =
    'https://api.wellcomecollection.org/catalogue/v2/works?pageSize=100&' +
    [
      query ? `query=${encodeURIComponent(query)}` : null,
      _queryType ? `_queryType=${encodeURIComponent(_queryType)}` : null,
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
    initial_queryType: _queryType,
    initialHasVisualRepresentation: Boolean(hasVisualRepresentation)
  }
}

export default Index
