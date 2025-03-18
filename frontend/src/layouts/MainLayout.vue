<template>
  <!-- a simple fixed top navbar -->
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item active">
          <RouterLink class="nav-link" :to="{ name: 'TransactionList' }"
            >My transactions</RouterLink
          >
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" :to="{ name: 'UserInfo' }">My information</RouterLink>
        </li>
        <li class="nav-item">
          <a class="nav-link" @click="logout()">Logout</a>
        </li>
      </ul>
    </div>
  </nav>
  <main>
    <!-- This is where the routed content will be rendered -->
    <router-view />
  </main>
</template>

<script setup>
import { useAuthStore } from "../store/auth.store";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
function logout() {
  authStore.logout();
  router.push("/login");
}
</script>
