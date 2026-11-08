import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Base API with VITE_API_BASE_URL
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Add auth token from Redux state
      const token = (getState() as any).auth.accessToken
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
    credentials: 'include', // for cookies if needed
  }),
  tagTypes: ['Auth', 'Product', 'Category', 'Cart', 'Wishlist', 'Order', 'Review', 'AdminDashboard'],
  refetchOnReconnect: true,
  refetchOnMount: 'always',
})

// ============= AUTH API =============
export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Auth'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Login user
    login: builder.initiate({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch, getState }) {
        // Handle login state
        const result = await queryFulfilled
        // Optionally update local state here
      },
    }),

    // Register user
    register: builder.initiate({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch, getState }) {
        const result = await queryFulfilled
      },
    }),

    // Get current user
    getMe: builder.query({
      query: () => '/api/auth/me',
      providesTags: ['Auth'],
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch, getState }) {
        // Clear auth state on logout
        dispatch(authSlice.actions.logout())
      },
    }),

    // Refresh token (if backend supports it)
    refreshToken: builder.query({
      query: () => '/api/auth/refresh-token',
    }),
  }),
})

// ============= CART API =============
export const cartApi = createApi({
  reducerPath: 'cartApi',
  tagTypes: ['Cart'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Get user's cart
    getCart: builder.query({
      query: () => '/api/cart',
      providesTags: ['Cart'],
    }),

    // Add item to cart
    addToCart: builder.mutation({
      query: (itemData) => ({
        url: '/api/cart',
        method: 'POST',
        body: itemData,
      }),
      invalidatesTags: ['Cart'],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation({
      query: (itemId) => ({
        url: `/api/cart/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Clear cart
    clearCart: builder.mutation({
      query: () => ({
        url: '/api/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Update cart item quantity
    updateCartQuantity: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `/api/cart/update-quantity`,
        method: 'PATCH',
        body: { productId, quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
})

// ============= WISHLIST API =============
export const wishlistApi = createApi({
  reducerPath: 'wishlistApi',
  tagTypes: ['Wishlist'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Get user's wishlist
    getWishlist: builder.query({
      query: () => '/api/wishlist',
      providesTags: ['Wishlist'],
    }),

    // Add product to wishlist
    addToWishlist: builder.mutation({
      query: (productId) => ({
        url: `/api/wishlist/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    // Remove product from wishlist
    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: `/api/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    // Clear wishlist
    clearWishlist: builder.mutation({
      query: () => ({
        url: '/api/wishlist/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
})

// ============= PRODUCTS API =============
export const productApi = createApi({
  reducerPath: 'productApi',
  tagTypes: ['Product'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Get all products with pagination
    list: builder.query({
      query: ({ page = 1, limit = 10, category, search }) => ({
        url: '/api/products',
        method: 'GET',
        params: { page, limit, category, search },
      }),
      providesTags: ['Product'],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName
      },
      mergeEqualQueryArgs: (current, new) => {
        return new
      },
    }),

    // Get product by ID
    detail: builder.query({
      query: (id) => `/api/products/${id}`,
      providesTags: ['Product', 'ProductDetail'],
    }),

    // Get product by slug
    bySlug: builder.query({
      query: (slug) => `/api/products/slug/${slug}`,
      providesTags: ['Product'],
    }),

    // Get featured products
    featured: builder.query({
      query: () => '/api/products/featured',
      providesTags: ['Product'],
    }),

    // Search products
    search: builder.query({
      query: (query) => ({
        url: '/api/products/search',
        method: 'GET',
        params: { query },
      }),
      providesTags: ['Product'],
    }),
  }),
})

// ============= CATEGORIES API =============
export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  tagTypes: ['Category'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Get all categories
    list: builder.query({
      query: () => '/api/categories',
      providesTags: ['Category'],
    }),

    // Get category by ID
    detail: builder.query({
      query: (id) => `/api/categories/${id}`,
      providesTags: ['Category'],
    }),
  }),
)

// ============= ORDERS API =============
export const orderApi = createApi({
  reducerPath: 'orderApi',
  tagTypes: ['Order'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Create new order
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/api/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Get user's orders
    list: builder.query({
      query: (status) => ({
        url: '/api/orders',
        method: 'GET',
        params: { status },
      }),
      providesTags: ['Order'],
    }),

    // Get order by ID
    detail: builder.query({
      query: (id) => `/api/orders/${id}`,
      providesTags: ['Order'],
    }),

    // Update order status (admin)
    updateStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

// ============= PAYMENTS API =============
export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  tagTypes: [],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Initialize payment
    initialize: builder.mutation({
      query: (paymentData) => ({
        url: '/api/payments',
        method: 'POST',
        body: paymentData,
      }),
    }),

    // Verify payment
    verify: builder.mutation({
      query: (paymentId) => ({
        url: `/api/payments/${paymentId}/verify`,
        method: 'PATCH',
      }),
    }),

    // Get payment history
    list: builder.query({
      query: (status) => ({
        url: '/api/payments',
        method: 'GET',
        params: { status },
      }),
    }),
  }),
})

// ============= SHIPMENTS API =============
export const shipmentApi = createApi({
  reducerPath: 'shipmentApi',
  tagTypes: ['Shipment'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Create shipment
    create: builder.mutation({
      query: (shipmentData) => ({
        url: '/api/shipments',
        method: 'POST',
        body: shipmentData,
      }),
      invalidatesTags: ['Shipment'],
    }),

    // Get shipment by order ID
    getByOrder: builder.query({
      query: (orderId) => `/api/shipments/order/${orderId}`,
      providesTags: ['Shipment'],
    }),

    // Get user's shipments
    list: builder.query({
      query: () => '/api/shipments/user',
      providesTags: ['Shipment'],
    }),

    // Track shipment
    track: builder.query({
      query: (trackingNumber) => `/api/shipments/tracking/${trackingNumber}`,
    }),
  }),
})

// ============= REVIEWS API =============
export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  tagTypes: ['Review'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Create review
    create: builder.mutation({
      query: (reviewData) => ({
        url: '/api/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review'],
    }),

    // Get product reviews
    listByProduct: builder.query({
      query: (productId) => `/api/reviews/product/${productId}`,
      providesTags: ['Review'],
    }),

    // Get all reviews (with filtering)
    list: builder.query({
      query: (status) => ({
        url: '/api/reviews',
        method: 'GET',
        params: { status },
      }),
      providesTags: ['Review'],
    }),

    // Update review
    update: builder.mutation({
      query: ({ id, rating, title, comment }) => ({
        url: `/api/reviews/${id}`,
        method: 'PATCH',
        body: { rating, title, comment },
      }),
      invalidatesTags: ['Review'],
    }),

    // Delete review
    delete: builder.mutation({
      query: (id) => ({
        url: `/api/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),
  }),
})

// ============= ADMIN DASHBOARD API =============
export const adminApi = createApi({
  reducerPath: 'adminApi',
  tagTypes: ['AdminDashboard'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // Get dashboard stats
    stats: builder.query({
      query: () => '/api/admin/dashboard/stats',
      providesTags: ['AdminDashboard'],
    }),

    // Get all users
    users: builder.query({
      query: (status) => ({
        url: '/api/admin/users',
        method: 'GET',
        params: { status },
      }),
      providesTags: ['AdminDashboard'],
    }),

    // Get all orders (admin)
    orders: builder.query({
      query: (status) => ({
        url: '/api/admin/orders',
        method: 'GET',
        params: { status },
      }),
      providesTags: ['AdminDashboard'],
    }),

    // Get all payments (admin)
    payments: builder.query({
      query: (status) => ({
        url: '/api/admin/payments',
        method: 'GET',
        params: { status },
      }),
      providesTags: ['AdminDashboard'],
    }),

    // Get all shipments (admin)
    shipments: builder.query({
      query: (status) => ({
        url: '/api/admin/shipments',
        method: 'GET',
        params: { status },
      }),
      providesTags: ['AdminDashboard'],
    }),
  }),
})

// ============= ADMIN PRODUCT MANAGEMENT API =============
export const adminProductApi = createApi({
  reducerPath: 'adminProductApi',
  tagTypes: ['AdminProduct'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // List products (admin)
    list: builder.query({
      query: (params) => ({
        url: '/api/admin/products',
        method: 'GET',
        params,
      }),
      providesTags: ['AdminProduct'],
    }),

    // Create product (admin)
    create: builder.mutation({
      query: (productData) => ({
        url: '/api/admin/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['AdminProduct'],
    }),

    // Update product (admin)
    update: builder.mutation({
      query: (id, productData) => ({
        url: `/api/admin/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: ['AdminProduct'],
    }),

    // Delete product (admin)
    delete: builder.mutation({
      query: (id) => ({
        url: `/api/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminProduct'],
    }),
  }),
})

// ============= ADMIN CATEGORY MANAGEMENT API =============
export const adminCategoryApi = createApi({
  reducerPath: 'adminCategoryApi',
  tagTypes: ['AdminCategory'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // List categories (admin)
    list: builder.query({
      query: (params) => ({
        url: '/api/admin/categories',
        method: 'GET',
        params,
      }),
      providesTags: ['AdminCategory'],
    }),

    // Create category (admin)
    create: builder.mutation({
      query: (categoryData) => ({
        url: '/api/admin/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['AdminCategory'],
    }),

    // Update category (admin)
    update: builder.mutation({
      query: (id, categoryData) => ({
        url: `/api/admin/categories/${id}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: ['AdminCategory'],
    }),

    // Delete category (admin)
    delete: builder.mutation({
      query: (id) => ({
        url: `/api/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminCategory'],
    }),
  }),
})

// ============= ADMIN ORDER MANAGEMENT API =============
export const adminOrderApi = createApi({
  reducerPath: 'adminOrderApi',
  tagTypes: ['AdminOrder'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // List orders (admin)
    list: builder.query({
      query: (status) => ({
        url: '/api/admin/orders',
        method: 'GET',
        params: { status },
      }),
      providesTags: ['AdminOrder'],
    }),

    // Update order status (admin)
    updateStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['AdminOrder'],
    }),
  }),
})

// ============= ADMIN CUSTOMER MANAGEMENT API =============
export const adminUserApi = createApi({
  reducerPath: 'adminUserApi',
  tagTypes: ['AdminUser'],
  baseQuery: baseApi.baseQuery,
  endpoints: (builder) => ({
    // List users (admin)
    list: builder.query({
      query: (role, status) => ({
        url: '/api/admin/users',
        method: 'GET',
        params: { role, status },
      }),
      providesTags: ['AdminUser'],
    }),

    // Get user by ID (admin)
    detail: builder.query({
      query: (id) => `/api/admin/users/${id}`,
      providesTags: ['AdminUser'],
    }),

    // Update user status (admin)
    updateStatus: builder.mutation({
      query: (id, status) => ({
        url: `/api/admin/users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
  useRefreshTokenQuery,
} = authApi

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useUpdateCartQuantityMutation,
} = cartApi

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
} = wishlistApi

export const {
  useListQuery,
  useDetailQuery,
  useBySlugQuery,
  useFeaturedQuery,
  useSearchQuery,
} = productApi

export const {
  useListQuery: useCategoryListQuery,
  useDetailQuery: useCategoryDetailQuery,
} = categoryApi

export const {
  useCreateOrderMutation,
  useListQuery: useOrderListQuery,
  useDetailQuery: useOrderDetailQuery,
  useUpdateStatusMutation,
} = orderApi

export const {
  useInitializeMutation,
  useVerifyMutation,
  useListQuery: usePaymentListQuery,
} = paymentApi

export const {
  useCreateMutation: useShipmentCreateMutation,
  useGetByOrderQuery,
  useListQuery: useShipmentListQuery,
  useTrackQuery,
} = shipmentApi

export const {
  useCreateMutation: useReviewCreateMutation,
  useListByProductQuery,
  useListQuery: useReviewListQuery,
  useUpdateMutation: useReviewUpdateMutation,
  useDeleteMutation: useReviewDeleteMutation,
} = reviewApi

export const {
  useStatsQuery,
  useUsersQuery,
  useOrdersQuery,
  usePaymentsQuery,
  useShipmentsQuery,
} = adminApi

export const {
  useListQuery: useAdminProductListQuery,
  useCreateMutation: useAdminProductCreateMutation,
  useUpdateMutation: useAdminProductUpdateMutation,
  useDeleteMutation: useAdminProductDeleteMutation,
} = adminProductApi

export const {
  useListQuery: useAdminCategoryListQuery,
  useCreateMutation: useAdminCategoryCreateMutation,
  useUpdateMutation: useAdminCategoryUpdateMutation,
  useDeleteMutation: useAdminCategoryDeleteMutation,
} = adminCategoryApi

export const {
  useListQuery: useAdminOrderListQuery,
  useUpdateStatusMutation: useAdminOrderUpdateStatus,
} = adminOrderApi

export const {
  useListQuery: useAdminUserListQuery,
  useDetailQuery: useAdminUserDetailQuery,
  useUpdateStatusMutation: useAdminUserUpdateStatus,
} = adminUserApi