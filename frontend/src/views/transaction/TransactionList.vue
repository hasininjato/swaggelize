<template>
  <h1>My transactions</h1>
  <RouterLink :to="{ name: 'TransactionCreate' }">Create a new transaction</RouterLink>
  <br/>
  <div v-if="totalItems == 0 && !loading">
    <span>There are no transactions yet for you</span>
  </div>
  <div v-if="loading">
    <VueSpinner size="100" color="bluecyan" />
  </div>
  <!-- basic card list with vue -->
  <div class="card-transaction-list center" v-if="!loading">
    <div v-for="item in items.Transactions" class="card-transaction">
      <small>{{ dateComputed(item) }}</small>
      <p>{{ item.description }}</p>
      <span>{{ item.amount }} $</span>
    </div>
  </div>
</template>

<script setup>
import { useTransactionStore } from "../../store/transaction.store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { VueSpinner } from "vue3-spinners";

const transactionStore = useTransactionStore();

const { items, totalItems } = storeToRefs(transactionStore);

const loading = ref(true); // default: show the loading

async function fetchTransactions() {
  await transactionStore.getItems();
  loading.value = false; // hide it after fetching results
}

const dateComputed = (item) => {
  const date = new Date(item.date);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC", // I chose to use UTC
  };
  return date.toLocaleString("en-US", options);
};

onMounted(async () => {
  await fetchTransactions();
});
</script>

<style>
.card-transaction-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.center {
  margin: auto;
  width: 50%;
  border: 3px solid none;
  padding: 10px;
}

.card-transaction {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-transaction p,
span {
  margin: 0 0 8px;
  font-size: 0.9em;
  color: #555;
}

.card-transaction p {
  background-color: rgba(222, 201, 110, 0.2);
}

.card-transaction small {
  font-size: 0.8em;
  color: #888;
}
</style>
