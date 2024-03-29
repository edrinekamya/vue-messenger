import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useGlobalStore } from '@/stores/global'
import AuthView from '@/views/AuthView.vue'
import ChatView from '@/views/ChatView.vue'
import EmptyChat from '@/views/EmptyChatView.vue'
import HomeView from '@/views/HomeView.vue'
import RootView from '@/views/RootView.vue'
import SettingsView from '@/views/SettingsView.vue'
import SignInView from '@/views/SignInView.vue'
import SignUpView from '@/views/SignUpView.vue'
import WelcomeView from '@/views/WelcomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: `/`,
      component: RootView,
      children: [
        {
          path: ``,
          component: HomeView,
          children: [
            {
              path: ``,
              component: EmptyChat,
              name: 'home',
              meta: {
                isRoot: true
              }
            },
            { path: `chat/:id`, component: ChatView, name: 'chats' }
          ],
          meta: {
            isNested: true,
            key: 'home'
          }
        },

        {
          path: `/settings`,
          component: SettingsView,
          name: 'friends'
        }
      ],
      meta: {
        requiresAuth: true
      }
    },
    {
      path: `/auth`,
      component: AuthView,
      name: 'auth',
      children: [
        { path: ``, component: WelcomeView, name: 'welcome' },
        {
          path: `sign-in`,
          component: SignInView,
          name: 'sign-in'
        },
        {
          path: `sign-up`,
          component: SignUpView,
          name: 'sign-up'
        }
      ]
    }
  ]
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()
  const navigation = useGlobalStore()
  const chats = useChatStore()

  // navigation guards
  if (to.meta.requiresAuth && !auth.token) {
    return `/auth/sign-in`
  }
  if (to.name === 'chats' && !chats.entities[parseInt(to.params.id as string)]) {
    return from
  }
  if (from.meta.isNested && !from.meta.isRoot) {
    navigation.persistNavigation(from.meta.key as string, from.fullPath)
  }
  if (to.meta.isNested && to.meta.isRoot) {
    const next = navigation.navigation[to.meta.key as string]
    if (next && next !== to.fullPath) {
      return next
    }
  }
})

export default router
