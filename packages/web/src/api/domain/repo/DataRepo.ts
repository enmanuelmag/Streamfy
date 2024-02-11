import type { CreationUserType, LoginUserType, UserType } from '@global/types/src/user'

export default abstract class DataRepo {
  abstract loginUserByEmailAndPassword(data: LoginUserType): Promise<UserType>

  abstract createUserByEmailAndPassword(data: CreationUserType): Promise<UserType>

  abstract loginUserWithGoogle(): Promise<UserType>

  abstract logoutUser(): void

  abstract getUser(): Promise<UserType | null>
}
