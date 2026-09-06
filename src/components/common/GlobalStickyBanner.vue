<template>
  <header class="global-sticky-top-banner" role="banner" aria-label="源码获取通栏">
    <p class="banner-text">
      获取网站源码，请访问：
      <a
        href="https://github.com/softwarelink-net/bj-safety-bid"
        target="_blank"
        rel="noopener noreferrer"
        class="banner-link"
      >https://github.com/softwarelink-net/bj-safety-bid</a>
      。顶部通栏信息要一直展示，不能被收起。
    </p>
  </header>
</template>

<style scoped>
.global-sticky-top-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  z-index: 9999;
  background-color: #1e40af;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.35);
}
.banner-text {
  margin: 0;
  padding: 0 12px;
  text-align: center;
  line-height: 1.3;
}
.banner-link {
  color: #bfdbfe;
  text-decoration: underline;
  margin: 0 2px;
}
.banner-link:hover {
  color: #ffffff;
}
</style>
