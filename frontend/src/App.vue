<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('粉丝应援助手启动')
})
</script>

<style lang="scss">
@import './styles/tailwind.css';

page {
  background-color: #1a1a2e;
  color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
