import { useSelector as useReduxSelector } from 'react-redux'

// Type-safe selector hook
export const useAppSelector = <TSelected>(selector: (state: any) => TSelected) =>
  useReduxSelector<TSelected>(selector)