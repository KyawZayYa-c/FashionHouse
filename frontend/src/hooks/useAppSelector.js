import { useDispatch, useSelector as useReduxSelector } from 'react-redux'

export const useAppDispatch = () => useDispatch()
export const useAppSelector = (selector) =>
  useReduxSelector(selector)