import fetch from 'isomorphic-unfetch'
import { serializeQs } from './urls'
import { ResultList } from '../models/ResultList'

type QueryParams = {}
async function getRootCollections({  }: QueryParams): Promise<ResultList> {
  const resultsUrl = `https://api.wellcomecollection.org/catalogue/v2/works?${serializeQs(
    {
      'collection.depth': 1,
      include: 'collection',
      pageSize: 100
    }
  )}`
  const results = await fetch(resultsUrl).then(resp => resp.json())

  return results
}

type GetCollectionProps = {
  collection: string
}
async function getCollection({
  collection
}: GetCollectionProps): Promise<ResultList> {
  const resultsUrl = `https://api.wellcomecollection.org/catalogue/v2/works?${serializeQs(
    {
      collection,
      include: 'collection',
      pageSize: 100
    }
  )}`
  const results = await fetch(resultsUrl).then(resp => resp.json())

  return results
}

export { getRootCollections, getCollection }
