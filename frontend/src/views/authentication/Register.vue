<template>
  <div class="container">
    <div class="row justify-content-center">
      <div v-if="success">
        <h3 style="color: green">User successfully created.</h3>
        <h3 style="color: green">Use your credentials to log in to the app</h3>
        <RouterLink :to="{ name: 'login' }">Click here to log in</RouterLink>
      </div>
      <div class="col-md-6" v-if="!success">
        <div class="card">
          <h2 class="card-header">Register</h2>
          <div class="card-body">
            <Form
              @submit="onSubmit"
              :validation-schema="schema"
              v-slot="{ errors, isSubmitting }"
            >
              <div class="form-group">
                <Field
                  name="fullname"
                  type="text"
                  class="form-control"
                  placeholder="Full name"
                  :class="{ 'is-invalid': errors.fullname }"
                />
                <div class="invalid-feedback">{{ errors.fullname }}</div>
              </div>
              <br />
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
                  Register
                </button>
              </div>
            </Form>
            <br />
            <RouterLink :to="{ name: 'login' }"
              >Have an account ? Log in</RouterLink
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

const success = ref(false);
const errorServer = ref("");
const schema = Yup.object().shape({
  fullname: Yup.string().required("Full name is required"),
  email: Yup.string().email("Email is not valid").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

async function onSubmit(values) {
  const authStore = useAuthStore();

  const { fullname, email, password } = values;
  try {
    await authStore.register(fullname, email, password);
    success.value = true;
  } catch (error) {
    errorServer.value = error.response.data.message || "An excpeted error occurred";
  }
}
</script>
