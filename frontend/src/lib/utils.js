export function cn(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  
  export function formatDate(date) {
    return new Date(date).toLocaleDateString()
  }
  
  export function formatError(error) {
    if (typeof error === 'string') return error
    if (error?.response?.data?.error) return error.response.data.error
    if (error?.message) return error.message
    return 'An unexpected error occurred'
  }
  
  export function validateIPAddress(ip) {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }