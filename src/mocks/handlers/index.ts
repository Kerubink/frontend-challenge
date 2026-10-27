import { authHandlers } from './auth'
import { catalogHandlers } from './catalog'
import { cartHandlers } from './cart'
import { orderHandlers } from './orders'
import { accountHandlers } from './account'
import { adminHandlers } from './admin'
import { socketHandlers } from '../socket/server'

export const handlers = [...authHandlers, ...catalogHandlers, ...cartHandlers, ...orderHandlers, ...accountHandlers, ...adminHandlers, ...socketHandlers]
