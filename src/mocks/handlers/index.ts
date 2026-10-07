import { authHandlers } from './auth'
import { catalogHandlers } from './catalog'
import { cartHandlers } from './cart'
import { orderHandlers } from './orders'
import { accountHandlers } from './account'

export const handlers = [...authHandlers, ...catalogHandlers, ...cartHandlers, ...orderHandlers, ...accountHandlers]
