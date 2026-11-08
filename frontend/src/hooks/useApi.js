import { useAppDispatch } from '../hooks/useAppSelector'
import {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
  // Product hooks
  useListQuery,
  useDetailQuery,
  useFeaturedQuery,
  useSearchQuery,
  // Category hooks
  useCategoryListQuery,
  useCategoryDetailQuery,
  // Cart hooks
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  // Wishlist hooks
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  // Order hooks
  useCreateOrderMutation,
  useOrderListQuery,
  useOrderDetailQuery,
  // Payment hooks
  useInitializeMutation,
  useVerifyMutation,
  usePaymentListQuery,
  // Shipment hooks
  useCreateMutation: useShipmentCreateMutation,
  useGetByOrderQuery,
  useShipmentListQuery,
  useTrackQuery,
  // Review hooks
  useCreateMutation: useReviewCreateMutation,
  useListByProductQuery,
  useReviewListQuery,
  useReviewUpdateMutation,
  useReviewDeleteMutation,
  // Admin hooks
  useStatsQuery,
  useUsersQuery,
  useOrdersQuery,
  usePaymentsQuery,
  useShipmentsQuery,
  // Theme and language helpers
  useTheme,
  useLanguage,
} from '../services/baseApi'

// Hook for login
export const useAuthLogin = () => {
  const dispatch = useAppDispatch()
  const [result, setResult] = React.useState({ success: false, error: null })

  const login = async (credentials) => {
    const { initiate, endpoint } = useLoginMutation()
    const { execute } = initiate(credentials)

    try {
      const resultData = await execute()
      setResult({ success: true })
      dispatch(loginThunk(credentials))
      return { success: true }
    } catch (error) {
      setResult({ success: false, error: error.message || 'Login failed' })
      return { success: false, error: error.message }
    }
  }

  return { login, ...result }
}

// Hook for get current user
export const useAuthMe = () => {
  const dispatch = useAppDispatch()
  const { data, isLoading } = useGetMeQuery()

  useEffect(() => {
    if (data) {
      dispatch(setAuthState({ user: data, accessToken: null, isAuthenticated: true, isInitializing: false }))
    }
  }, [data, dispatch])

  return { data, isLoading }
}

// Hook for logout
export const useAuthLogout = () => {
  const dispatch = useAppDispatch()
  const [result, setResult] = React.useState({ success: false })

  const logout = async () => {
    const { initiate } = useLogoutMutation()
    try {
      const execute = initiate()
      setResult({ success: true })
      dispatch(logoutThunk())
      return { success: true }
    } catch (error) {
      setResult({ success: false, error: error.message })
      return { success: false, error: error.message }
    }
  }

  return { logout, ...result }
}

// Hook for products list
export const useProducts = (params = {}) => {
  const dispatch = useAppDispatch()
  const { data, isLoading, isError } = useListQuery({ params })

  return { products: data, isLoading, isError }
}

// Hook for product detail
export const useProductDetail = (id) => {
  const dispatch = useAppDispatch()
  const { data, isLoading, isError } = useDetailQuery({ id })

  return { product: data, isLoading, isError }
}

// Hook for categories
export const useCategories = () => {
  const dispatch = useAppDispatch()
  const { data, isLoading, isError } = useCategoryListQuery()

  return { categories: data, isLoading, isError }
}

// Hook for cart
export const useCart = () => {
  const dispatch = useAppDispatch()
  const { data, isLoading, isError } = useGetCartQuery()

  return { cartItems: data || [], isLoading, isError, totalItems: data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0 }
}

// Hook for adding to cart
export const useAddToCart = () => {
  const dispatch = useAppDispatch()
  const [mutate, result] = useAddToCartMutation()

  const addToCart = async (cartData) => {
    const { execute } = mutate(cartData)
    try {
      await execute()
      dispatch(addToCartThunk(cartData))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return { addToCart, ...result }
}

// Hook for wishlist
export const useWishlist = () => {
  const dispatch = useAppDispatch()
  const { data, isLoading, isError } = useGetWishlistQuery()

  return { wishlistItems: data || [], isLoading, isError }
}

// Hook for adding to wishlist
export const useAddToWishlist = () => {
  const dispatch = useAppDispatch()
  const [mutate, result] = useAddToWishlistMutation()

  const addToWishlist = async (productId) => {
    const { execute } = mutate(productId)
    try {
      await execute()
      dispatch(addToWishlistMutation(productId))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return { addToWishlist, ...result }
}