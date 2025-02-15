import { randomBytes, pbkdf2Sync } from 'crypto'

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { salt, hash }
}

export function verifyPassword({
  candidatePassword,
  salt,
  hash,
}: {
  candidatePassword: string
  salt: string
  hash: string
}) {
  const candidateHash = pbkdf2Sync(
    candidatePassword,
    salt,
    1000,
    64,
    'sha512',
  ).toString('hex')
  return candidateHash === hash
}
