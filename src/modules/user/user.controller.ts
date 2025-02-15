import { CreateUserInput, LoginInput } from './user.schema'
import { createUser, findUserByEmail, findUsers } from './user.service'
import { verifyPassword } from '@/utils/hash'
import { FastifyRequest } from 'fastify'
import { FastifyReply } from 'fastify'

export async function registerUserHandler(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply,
) {
  console.log(request.body)
  try {
    const user = await createUser(request.body)
    return reply.code(201).send(user)
  } catch (error) {
    return reply.code(500).send(error)
  }
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply,
) {
  const user = await findUserByEmail(request.body.email)

  if (!user) {
    return reply.code(401).send({ message: 'Invalid email or password' })
  }
  const { password, salt, ...rest } = user
  const isPasswordValid = await verifyPassword({
    candidatePassword: request.body.password,
    salt: salt,
    hash: password,
  })
  if (!isPasswordValid) {
    return reply.code(401).send({ message: 'Invalid email or password' })
  }
  const token = request.server.jwt.sign({ ...rest })
  return { accessToken: token }
}

export async function getUsersHandler() {
  const users = await findUsers()
  return users
}
