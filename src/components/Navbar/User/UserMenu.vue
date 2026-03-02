<template>
  <v-card class="avatar-menu" flat>
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        location="right"
        class="userMenu"
        temporary
        width="270"
      >
        <div class="close-parent">
          <v-btn
            size="x-small"
            icon
            class="dialogClose"
            @click="drawer = false"
            variant="text"
            color="white"
          >
            <v-icon icon="mdi-arrow-right" size="large"></v-icon>
          </v-btn>
        </div>

        <v-list-item
          class="list-item-avatar"
          :prepend-avatar="authStore.getUserAvatar"
          :prepend-icon="
            authStore.getUserAvatar === 'default' ? 'mdi-account-circle-outline' : undefined
          "
          :title="authStore.getUsername"
          lines="two"
          color="white"
        ></v-list-item>

        <v-list-item>
          <v-select
            :items="availableLocale"
            label="Locale"
            v-model="locale"
            density="compact"
            variant="outlined"
            hide-details
            single-line
            color="white"
            bg-color="rgba(255, 255, 255, 0.1)"
          ></v-select>
        </v-list-item>

        <v-divider class="my-2 bg-white"></v-divider>

        <!-- Authentication Section -->
        <template v-if="!authStore.getIsLoggedIn">
          <v-list density="compact" nav>
            <v-list-item
              @click.stop="handleSignIn"
              prepend-icon="mdi-login"
              title="Sign In"
              value="sign_in"
              variant="text"
              color="white"
            ></v-list-item>
            <v-list-item
              @click.stop="showAuthModal(false)"
              prepend-icon="mdi-account-plus"
              title="Register"
              value="register"
              variant="text"
              color="white"
            ></v-list-item>
          </v-list>

          <!-- Tauri: show waiting message while browser auth is in progress -->
          <div v-if="isTauriEnv && tauriAuthPending" class="tauri-auth-pending">
            <v-progress-circular indeterminate color="white" size="18" width="2" class="mr-2" />
            <span>Waiting for browser login...</span>
          </div>
        </template>

        <!-- User Menu Section -->
        <template v-else>
          <v-list density="compact" nav>
            <v-list-item
              @click.stop="dashboard"
              prepend-icon="mdi-view-dashboard-outline"
              title="Dashboard"
              value="dashboard"
              variant="text"
              color="white"
            ></v-list-item>
            <v-list-item
              @click.stop="my_groups"
              prepend-icon="mdi-account-group-outline"
              title="My Groups"
              value="my_groups"
              variant="text"
              color="white"
            ></v-list-item>
            <v-list-item
              @click.stop="notifications"
              prepend-icon="mdi-bell-outline"
              title="Notifications"
              value="notifications"
              variant="text"
              color="white"
            >
              <template v-if="unreadCount > 0" v-slot:append>
                <v-badge :content="unreadCount" color="error"></v-badge>
              </template>
            </v-list-item>
          </v-list>

          <v-divider class="my-2 bg-white"></v-divider>

          <v-list-item
            @click.stop="handleSignOut"
            prepend-icon="mdi-logout"
            title="Logout"
            value="logout"
            variant="text"
            color="white"
          ></v-list-item>
        </template>
      </v-navigation-drawer>

      <v-main>
        <v-btn
          class="avatar-btn"
          variant="text"
          @click.stop="drawer = !drawer"
          rounded="xl"
          color="white"
        >
          <v-avatar
            v-if="authStore.getUserAvatar !== 'default'"
            size="32"
            :image="authStore.getUserAvatar"
            color="white"
          ></v-avatar>
          <v-icon
            v-else
            icon="mdi-account"
            size="large"
            color="white"
          ></v-icon>
          <span class="ml-2 text-white" style="font-size: 1.2rem">{{ authStore.getUsername }}</span>
        </v-btn>
      </v-main>
    </v-layout>

    <!-- Authentication Dialog (web only — hidden in Tauri) -->
    <v-dialog v-if="!isTauriEnv" v-model="authModal" max-width="500" persistent>
      <v-card class="auth-modal" style="background-color: white">
        <v-toolbar color="#43b984">
          <v-toolbar-title class="text-white">
            {{ isLoginMode ? 'Sign In' : 'Register' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="authModal = false" color="white">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form @submit.prevent="handleAuthSubmit" ref="authForm">
            <v-text-field
              v-if="!isLoginMode"
              v-model="name"
              label="Name"
              type="text"
              :rules="[requiredRule]"
              variant="outlined"
              class="mb-0"
              bg-color="#f0eee6"
            ></v-text-field>

            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              :rules="[requiredRule, emailRule]"
              variant="outlined"
              class="mb-0"
              bg-color="#f0eee6"
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              :rules="[requiredRule, passwordRule]"
              variant="outlined"
              class="mb-0"
              bg-color="#f0eee6"
            ></v-text-field>

            <div class="d-flex flex-column">
              <v-btn
                color="#43b984"
                type="submit"
                :loading="isLoading"
                :disabled="isLoading"
                size="large"
                block
                class="mb-2"
              >
                {{ isLoginMode ? 'Sign In' : 'Register' }}
              </v-btn>

              <v-btn
                variant="text"
                @click="toggleAuthMode"
                size="small"
                color="#43b984"
              >
                {{ isLoginMode ? 'Need an account? Register' : 'Already have an account? Sign In' }}
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar Notification -->
    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.visible = false"
          :icon="mdiClose"
          color="white"
        ></v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { availableLocale } from '#/locales/i18n'
import { useAuthStore } from '#/store/authStore'
import { mdiClose } from '@mdi/js'
import './User.scss'

const authStore = useAuthStore()
const drawer = ref(false)
const authModal = ref(false)
const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const name = ref('')
const { locale } = useI18n()
const isLoading = ref(false)
const authForm = ref()
const unreadCount = ref(0)
const tauriAuthPending = ref(false)

// ── Tauri detection ───────────────────────────────────────────────────────────
const isTauriEnv = '__TAURI_INTERNALS__' in window
const TOKEN_STORAGE_KEY = 'cv_tauri_jwt'

// ── Form validation rules ─────────────────────────────────────────────────────
const requiredRule = (v: string) => !!v || 'This field is required'
const emailRule = (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
const passwordRule = (v: string) => v.length >= 6 || 'Password must be at least 6 characters'

// Snackbar state
const snackbar = ref({
  visible: false,
  message: '',
  color: '#43b984'
})

// ── Sign In — branches on Tauri vs web ───────────────────────────────────────
async function handleSignIn() {
  if (isTauriEnv) {
    await startTauriLogin()
  } else {
    showAuthModal(true)
  }
}

// ── Tauri Auth Flow ───────────────────────────────────────────────────────────
async function startTauriLogin() {
  drawer.value = false
  tauriAuthPending.value = true

  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const { listen } = await import('@tauri-apps/api/event')

    // Open system browser → circuitverse.org/users/sign_in?tauri=1
    await invoke('open_login_browser')

    // One-shot listener — lib.rs emits this after intercepting the deep link
    const unlisten = await listen<string>('tauri://cv-auth-token', async (event) => {
      unlisten()
      tauriAuthPending.value = false
      await verifyAndStoreToken(event.payload)
    })
  } catch (e) {
    tauriAuthPending.value = false
    showSnackbar(`Login failed: ${e}`, 'error')
  }
}

async function verifyAndStoreToken(token: string) {
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const userData = await invoke<{ data: any }>('verify_cv_token', { token })

    // Persist for next app launch
    localStorage.setItem(TOKEN_STORAGE_KEY, token)

    // Populate auth store — same path as web login
    authStore.setUserInfo(userData.data)
    authStore.setToken(token)
    ;(window as any).isUserLoggedIn = true

    showSnackbar(`Welcome, ${authStore.getUsername}!`, 'success')
  } catch (e) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    showSnackbar(`Token verification failed: ${e}`, 'error')
  }
}

// ── Restore saved Tauri session on mount ─────────────────────────────────────
onMounted(async () => {
  if (!isTauriEnv) return
  if (authStore.getIsLoggedIn) return // already restored by simulatorHandler

  const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (stored) {
    await verifyAndStoreToken(stored)
  }
})

// ── Web Auth Flow (unchanged) ─────────────────────────────────────────────────
function showAuthModal(login: boolean) {
  isLoginMode.value = login
  authModal.value = true
  drawer.value = false
  email.value = ''
  password.value = ''
  name.value = ''
}

function toggleAuthMode() {
  isLoginMode.value = !isLoginMode.value
}

async function handleAuthSubmit() {
  const { valid } = await authForm.value.validate()
  if (!valid) return

  isLoading.value = true

  try {
    const url = isLoginMode.value
      ? 'http://localhost:4000/api/v1/auth/login'
      : 'http://localhost:4000/api/v1/auth/signup'

    const body = isLoginMode.value
      ? { email: email.value, password: password.value }
      : { email: email.value, password: password.value, name: name.value }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      let errorData
      try { errorData = await response.json() }
      catch (e) { errorData = { message: 'An error occurred' } }
      handleLoginError(response.status, errorData)
      return
    }

    const data = await response.json()
    if (!data.token) throw new Error('No token received from server')

    authStore.setToken(data.token)
    showSnackbar(
      isLoginMode.value ? 'Login successful!' : 'Registration successful!',
      'success'
    )
    authModal.value = false
  } catch (error) {
    showSnackbar(`Authentication failed: ${error.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

function handleLoginError(status: number, errorData: any) {
  const messages: Record<number, string> = {
    401: 'Invalid credentials',
    404: 'User not found',
    409: 'User already exists',
    422: 'Invalid input data',
  }
  showSnackbar(messages[status] || errorData.message || 'Authentication failed', 'error')
}

function showSnackbar(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  snackbar.value = { visible: true, message, color: type }
}

// ── Navigation helpers ────────────────────────────────────────────────────────
function dashboard() {
  window.location.href = `/users/${authStore.getUserId}`
}

function my_groups() {
  window.location.href = `/users/${authStore.getUserId}/groups`
}

function notifications() {
  window.location.href = `/users/${authStore.getUserId}/notifications`
}

function handleSignOut() {
  if (isTauriEnv) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
  authStore.signOut()
  ;(window as any).isUserLoggedIn = false
  showSnackbar('You have been logged out', 'info')
}
</script>

<style scoped>
.tauri-auth-pending {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}
</style>