import { handleAdminLogin } from '../_lib/http.ts'

export const POST = handleAdminLogin

export default {
  fetch: handleAdminLogin,
}
