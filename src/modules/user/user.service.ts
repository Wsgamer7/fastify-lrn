import { CreateUserInput } from './user.schema'
import { hashPassword } from '@/utils/hash'
import prisma from '@/utils/prisma'

export async function createUser(input: CreateUserInput) {
  const { password, email, name } = input
  const { salt, hash } = hashPassword(password)
  const user = await prisma.user.create({
    data: { email, name, salt, password: hash },
  })
  return user
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findUsers() {
  return prisma.user.findMany()
}
