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
    <div></div>
    <div class="flex flex-col items-center justify-center bg-gray-400">
      <form class="bg-white p-8 rounded-lg shadow-md w-1/2" @submit="onSubmit">
        <h1 class="text-4xl mb-8">mfu</h1>
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" id="username" class="mt-1 block w-full px-3 py-2 sm:text-sm" v-model="username">
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" class="mt-1 block w-full px-3 py-2 sm:text-sm" v-model="password">
        </div>
        <button type="submit" class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 mb-4">Login</button>
        <p class="text-sm text-red-600">* This system internal university users the same username and password as the REG system but external university users use log-in by google account</p>
      </form>
    </div>
  </div>
</template>