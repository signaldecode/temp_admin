<script setup>
/**
 * Layout Sidebar
 * 데스크탑용 사이드바 네비게이션
 * - 접힘/펼침 상태 지원
 * - 다단계 메뉴 지원
 * - 권한 기반 메뉴 필터링
 */
import { useUiStore } from '~/stores/ui'
import { navigationItems } from '~/data/navigation'

const uiStore = useUiStore()
const route = useRoute()

// 사이드바 접힘 상태
const isCollapsed = computed(() => uiStore.sidebar.isCollapsed)

// 현재 활성 메뉴 체크
const isActive = (path) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

// 열린 서브메뉴 관리
const openSubmenus = ref([])

const toggleSubmenu = (menuId) => {
  const index = openSubmenus.value.indexOf(menuId)
  if (index > -1) {
    openSubmenus.value.splice(index, 1)
  } else {
    openSubmenus.value.push(menuId)
  }
}

const isSubmenuOpen = (menuId) => {
  return openSubmenus.value.includes(menuId)
}

// 접힘 토글
const toggleCollapse = () => {
  uiStore.toggleSidebarCollapse()
}
</script>

<template>
  <aside
    :class="[
      'fixed top-header left-0 bottom-0 bg-white border-r border-neutral-200 z-sticky',
      'transition-all duration-300 overflow-hidden',
      isCollapsed ? 'w-[4.5rem]' : 'w-sidebar',
    ]"
  >
    <nav
      class="h-full flex flex-col"
      aria-label="메인 네비게이션"
    >
      <!-- Navigation Items -->
      <ul class="flex-1 py-4 overflow-y-auto scrollbar-hidden">
        <li
          v-for="item in navigationItems"
          :key="item.id"
        >
          <!-- Menu Item with Children -->
          <template v-if="item.children?.length">
            <button
              type="button"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 text-left',
                'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                'transition-colors',
                { 'justify-center': isCollapsed },
              ]"
              :aria-expanded="isSubmenuOpen(item.id)"
              @click="toggleSubmenu(item.id)"
            >
              <!-- Icon -->
              <span
                class="w-5 h-5 flex-shrink-0"
                v-html="item.icon"
              />

              <!-- Label & Arrow (펼침 상태만) -->
              <template v-if="!isCollapsed">
                <span class="flex-1 text-sm font-medium">{{ item.label }}</span>
                <svg
                  :class="[
                    'w-4 h-4 transition-transform',
                    { 'rotate-180': isSubmenuOpen(item.id) },
                  ]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </template>
            </button>

            <!-- Submenu -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0"
            >
              <ul
                v-if="isSubmenuOpen(item.id) && !isCollapsed"
                class="overflow-hidden"
              >
                <li
                  v-for="child in item.children"
                  :key="child.id"
                >
                  <NuxtLink
                    :to="child.to"
                    :class="[
                      'flex items-center gap-3 pl-12 pr-4 py-2',
                      'text-sm transition-colors',
                      isActive(child.to)
                        ? 'text-primary-700 bg-primary-50 font-medium'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50',
                    ]"
                  >
                    {{ child.label }}
                  </NuxtLink>
                </li>
              </ul>
            </Transition>
          </template>

          <!-- Menu Item without Children -->
          <template v-else>
            <NuxtLink
              :to="item.to"
              :class="[
                'flex items-center gap-3 px-4 py-3',
                'transition-colors',
                { 'justify-center': isCollapsed },
                isActive(item.to)
                  ? 'text-primary-700 bg-primary-50 font-medium border-r-2 border-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              ]"
              :title="isCollapsed ? item.label : undefined"
            >
              <!-- Icon -->
              <span
                class="w-5 h-5 flex-shrink-0"
                v-html="item.icon"
              />

              <!-- Label (펼침 상태만) -->
              <span
                v-if="!isCollapsed"
                class="text-sm font-medium"
              >
                {{ item.label }}
              </span>
            </NuxtLink>
          </template>
        </li>
      </ul>

      <!-- Collapse Toggle Button -->
      <div class="border-t border-neutral-200 p-2">
        <button
          type="button"
          :class="[
            'w-full flex items-center gap-2 p-2 rounded-lg',
            'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700',
            'transition-colors',
            { 'justify-center': isCollapsed },
          ]"
          :aria-label="isCollapsed ? '사이드바 펼치기' : '사이드바 접기'"
          @click="toggleCollapse"
        >
          <svg
            :class="[
              'w-5 h-5 transition-transform',
              { 'rotate-180': isCollapsed },
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          <span
            v-if="!isCollapsed"
            class="text-sm"
          >접기</span>
        </button>
      </div>
    </nav>
  </aside>
</template>
