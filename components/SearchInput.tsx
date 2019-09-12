import { useState } from 'react'
import styled from 'styled-components'

const StyledInput = styled.input`
  width: 100%;
  border: 1px solid blue;
  box-sizing: border-box;
  padding: 10px;
  font-size: 32px;
  font-family: Courier New, monospace, serif;
`

type Props = {
  value: string
  name: string
}
const SearchInput = ({ value, name }: Props) => {
  const [localValue, setLocalValue] = useState(value)
  return (
    <StyledInput
      type="text"
      placeholder="🔎"
      value={localValue}
      name={name}
      onChange={event => setLocalValue(event.currentTarget.value)}
    />
  )
}

export default SearchInput
