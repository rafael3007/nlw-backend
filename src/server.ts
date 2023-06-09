import 'dotenv/config'

import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastify from 'fastify'

import { authRoutes } from './routes/auth'
import { memoriesRoutes } from './routes/memories'


const app = fastify()

app.register(memoriesRoutes)

app.register(authRoutes)

app.register(cors, {
  origin: true, // [url de produção]// todas as URLs de front-end podem acessar
})

app.register(jwt, {
  secret: 'spacetime',
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log(`🚀HTTP server running on http://localhost:3333`)
  })
