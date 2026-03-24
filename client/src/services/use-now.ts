import { ref, onMounted, onUnmounted } from 'vue';

export function useNow(interval = 60000) { // По умолчанию обновляем раз в минуту
  const now = ref(Date.now());
  let timer: number = 0;

  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now();
    }, interval);
  });

  onUnmounted(() => clearInterval(timer));

  return now;
}