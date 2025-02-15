import userRoutes from './modules/user/user.route'
import { userSchemas } from './modules/user/user.schema'
import fastifyJwt from '@fastify/jwt'
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import swagger from 'fastify-swagger'
import { withRefResolver } from 'fastify-zod'
import * as fs from 'fs'

const server = Fastify()

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any
  }
}

server.decorate(
  'authenticate',
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (e) {
      return reply.send(e)
    }
  },
)
server.register(fastifyJwt, {
  secret: 'secret',
})

server.get('/healthcheck', async (request, reply) => {
  return { status: 'OK' }
})

async function main() {
  for (const schema of userSchemas) {
    server.addSchema(schema)
  }
  server.register(
    swagger,
    withRefResolver({
      routePrefix: '/docs',
      exposeRoute: true,
      staticCSP: true,
      openapi: {
        info: {
          title: 'Fastify API',
          description: 'API for some products',
          version: '1.0.0',
        },
      },
    }),
  )
  server.register(userRoutes, { prefix: 'api/users' })
  try {
    await server.listen(5051, '0.0.0.0')
    console.log('Server is running on port 5051')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
  await server.ready()
  writeSwagger(server)
}

main()

function writeSwagger(server: FastifyInstance) {
  const swagger = server.swagger()
  fs.writeFileSync('./openapi.json', JSON.stringify(swagger, null, 2))
}
