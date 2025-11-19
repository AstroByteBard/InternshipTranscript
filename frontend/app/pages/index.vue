<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref('');
const password = ref('');

function onSubmit(event) {
  event.preventDefault();
  console.log('Username:', username.value);
  console.log('Password:', password.value);
  router.push('/admin/dashboard');
}
</script>

<template>
  <div class="w-full min-h-screen grid grid-cols-2 ">
    <div class="flex justify-center items-center">
      <img src="/loginpic.png" alt="Login Image" />
    </div>
    <div class="flex flex-col items-center justify-center ">
      <form class="bg-white border border-gray-100 p-8 rounded-lg shadow-md w-[60%]" @submit="onSubmit">
        <img src="/logo.png" alt="Logo" class="w-[75%] mb-6" />
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" id="username" class="mt-1 block w-full px-3 py-2 sm:text-sm" v-model="username">
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" class="mt-1 block w-full px-3 py-2 sm:text-sm" v-model="password">
        </div>
        <button type="submit"
          class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 mb-4">Login</button>
        <p class="text-sm text-red-600">* This system internal university users the same username and password as the
          REG system but external university users use log-in by google account</p>
        <UButton class="mt-4" color="neutral" label="Continue with Google" icon="logos:google-icon" :ui="{ 'base': 'w-full items-center justify-center border border-gray-300 py-4 ' }" />
      </form>
    </div>
  </div>
</template>