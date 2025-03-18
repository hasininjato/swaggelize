<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <h2 class="card-header">Login</h2>
          <div class="card-body">
            <Form
              @submit="onSubmit"
              :validation-schema="schema"
              v-slot="{ errors, isSubmitting }"
            >
              <div class="form-group">
                <Field
                  name="email"
                  type="email"
                  class="form-control"
                  placeholder="Email"
                  :class="{ 'is-invalid': errors.email }"
                />
                <div class="invalid-feedback">{{ errors.email }}</div>
              </div>

              <br />
              <div class="form-group">
                <Field
                  name="password"
                  type="password"
                  placeholder="Password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                />
                <div class="invalid-feedback">{{ errors.password }}</div>
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
                  Login
                </button>
              </div>
            </Form>
            <br />
            <RouterLink :to="{ name: 'register' }"
              >Don't have an account ? Create one</RouterLink
            >
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
import { useAuthStore } from "../../store/auth.store";
import { useRouter } from "vue-router";

const router = useRouter();
const errorServer = ref("");
const schema = Yup.object().shape({
  email: Yup.string().email("Email is not valid").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

async function onSubmit(values) {
  const authStore = useAuthStore();

  const { email, password } = values;
  try {
    await authStore.login(email, password);
    router.push("/");
  } catch (error) {
    errorServer.value = error.response.data.message || "An excpeted error occurred";
  }
}
</script>
