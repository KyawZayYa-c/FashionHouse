import React, { useState } from 'react'
import { Container, SectionHeader } from '../../styles/global.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      // TODO: Implement actual admin authentication
      // const response = await apiClient.post('/admin/auth/login', { email, password })
      // if (response.token) {
      //   localStorage.setItem('admin_token', response.token)
      //   window.location.href = '/admin/dashboard'
      // }
      setError('Admin authentication endpoint - to be implemented')
    } catch (err) {
      setError('Login failed. Please try again.')
      console.error(err)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100">
      <Container className="bg-white p-8 rounded-lg shadow-md w-full max-md:w-400">
        <SectionHeader>
          <h2>Admin Login</h2>
        </SectionHeader>
        <form onSubmit={handleLogin} className="mt-6">
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-transition transition-colors">
            Login
          </button>
        </form>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </Container>
    </section>
  )
}

export default Login