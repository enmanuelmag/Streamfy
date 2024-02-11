import type { CreationUserType, LoginUserType } from '@global/types/src/user'

import DataDS from '@api/domain/ds/DataDS'
import DataRepo from '@src/api/domain/repo/DataRepo'

export default class DataRepoImpl extends DataRepo {
  private ds: DataDS

  constructor(ds: DataDS) {
    super()
    this.ds = ds
  }

  loginUserByEmailAndPassword(data: LoginUserType) {
    return this.ds.loginUserByEmailAndPassword(data)
  }

  createUserByEmailAndPassword(data: CreationUserType) {
    return this.ds.createUserByEmailAndPassword(data)
  }

  loginUserWithGoogle() {
    return this.ds.loginUserWithGoogle()
  }

  logoutUser() {
    return this.ds.logoutUser()
  }

  getUser() {
    return this.ds.getUser()
  }
}
