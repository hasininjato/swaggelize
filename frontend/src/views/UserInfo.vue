<template>
  <h1>My information</h1>
  <br />
  <div>
    <p>Fullname: {{ user.fullname }}</p>
    <p>Email: {{ user.email }}</p>
  </div>
</template>

<script setup>
import { useUserStore } from "../store/user.store";
import { storeToRefs } from "pinia";
import { onMounted, } from "vue";

const userStore = useUserStore();

const { user } = storeToRefs(userStore);

async function fetchUser() {
  await userStore.getUser();
}


onMounted(async () => {
  await fetchUser();
});
</script>
