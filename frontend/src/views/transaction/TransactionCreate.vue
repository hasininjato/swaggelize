<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <h2 class="card-header">Transaction</h2>
          <div class="card-body">
            <Form
              @submit="onSubmit"
              :validation-schema="schema"
              v-slot="{ errors, isSubmitting }"
            >
              <div class="form-group">
                <Field
                  name="description"
                  type="text"
                  class="form-control"
                  placeholder="Description of your transaction"
                  :class="{ 'is-invalid': errors.description }"
                />
                <div class="invalid-feedback">{{ errors.description }}</div>
              </div>
              <br />
              <div class="form-group">
                <Field
                  name="amount"
                  type="number"
                  class="form-control"
                  placeholder="Amount"
                  :class="{ 'is-invalid': errors.amount }"
                />
                <div class="invalid-feedback">{{ errors.amount }}</div>
              </div>
              <br />
              <!-- error from server when login failed -->
              <div v-if="errorServer" class="alert alert-danger mt-3">
                {{ errorServer }}
              </div>
              <div class="form-group">
                <button class="btn btn-primary w-100" :disabled="isSubmitting">
                  <span
                    v-show="isSubmitting"
                    class="spinner-border spinner-border-sm mr-1"
                  ></span>
                  Create
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useTransactionStore } from "../../store/transaction.store";
import { useRouter } from "vue-router";

const router = useRouter();
const errorServer = ref("");
const schema = Yup.object().shape({
  description: Yup.string().required("Description is required"),
  amount: Yup.number().required("Amount is required and must be a number"),
});

const transactionStore = useTransactionStore();
async function onSubmit(values) {
  const { description, amount } = values;
  try {
    await transactionStore.createItem(description, amount);
    router.push("/transaction/list")
  } catch (error) {
    errorServer.value = error.response.data.message || "An excpeted error occurred";
  }
}
</script>
