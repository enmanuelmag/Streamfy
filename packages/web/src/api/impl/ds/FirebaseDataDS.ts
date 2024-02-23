/* eslint-disable no-useless-catch */
import {
  type Auth,
  initializeAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  browserPopupRedirectResolver,
} from 'firebase/auth'

// import {
//   type Firestore,
//   getFirestore,
// } from 'firebase/firestore'

import { type FirebaseApp, initializeApp } from 'firebase/app'

import { CreationUserType, LoginUserType, UserType } from '@global/types/src/user'

import DataDS from '@api/domain/ds/DataDS'
import { Logger } from '@global/utils'

const ConfigCredentials = {
  firebaseConfig: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  firebaseProviders: {
    webClientId: import.meta.env.VITE_FIREBASE_WEB_CLIENT_ID,
    clientSecret: import.meta.env.VITE_FIREBASE_CLIENT_SECRET,
  },
}

export default class FirebaseDS extends DataDS {
  private auth: Auth
  //private db: Firestore
  private app: FirebaseApp
  private provider: GoogleAuthProvider

  constructor() {
    super()
    this.app = initializeApp(ConfigCredentials.firebaseConfig)
    //this.db = getFirestore(this.app)
    this.auth = initializeAuth(this.app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    })
    this.provider = new GoogleAuthProvider()
    this.provider.setCustomParameters(ConfigCredentials.firebaseProviders)
  }

  async createUserByEmailAndPassword(data: CreationUserType) {
    const { email, password } = data
    try {
      this.auth.setPersistence(browserLocalPersistence)
      const { user } = await createUserWithEmailAndPassword(this.auth, email, password)
      return {
        id: user.uid,
        email: user.email,
      } as UserType
    } catch (error) {
      Logger.error(error as Error)
      throw error
    }
  }

  async loginUserByEmailAndPassword(data: LoginUserType) {
    const { email, password } = data
    try {
      this.auth.setPersistence(browserLocalPersistence)
      const { user } = await signInWithEmailAndPassword(this.auth, email, password)

      return {
        id: user.uid,
        email: user.email,
      } as UserType
    } catch (error) {
      Logger.error(error as Error)
      throw error
    }
  }

  async loginUserWithGoogle() {
    try {
      this.auth.setPersistence(browserLocalPersistence)
      const { user } = await signInWithPopup(this.auth, this.provider)

      return {
        id: user.uid,
        email: user.email,
      } as UserType
    } catch (error) {
      Logger.error(error as Error)
      throw error
    }
  }

  logoutUser() {
    this.auth.signOut()
  }

  async getLoggedInUser() {
    try {
      const firebaseUser = this.auth.currentUser

      if (firebaseUser) {
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          password: '', // TODO: Remove this field from the UserType
        } as UserType
      }

      const currentUser = await new Promise<UserType | null>((resolve, reject) =>
        onAuthStateChanged(
          this.auth,
          (user) => {
            resolve(
              user
                ? ({
                    id: user.uid,
                    email: user.email,
                  } as UserType)
                : null,
            )
          },
          (error) => {
            reject(error)
          },
        ),
      )
      return currentUser
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async getUser() {
    const currentUser = await this.getLoggedInUser()
    return currentUser
  }
}
