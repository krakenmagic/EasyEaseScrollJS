document.addEventListener("DOMContentLoaded", () => {
  const sectionA = document.getElementById("toppage_onetimeview");
  const sectionB = document.getElementById("toppage_main");

  let isAnimating = false; // アニメーション中フラグ
  const scrollDuration = 1400; // スクロール速度を1400msに設定
  const bounceThreshold = 0.01; // 1vh

  // Aの状態を確認する関数
  const isInSectionA = () => window.scrollY < window.innerHeight / 2;

  const disableUserScroll = () => {
    document.body.style.overflow = "hidden";
    console.log("User scroll disabled");
  };

  const enableUserScroll = () => {
    document.body.style.overflow = ""; // 元の状態に戻す
    console.log("User scroll enabled");
  };

  const smoothScrollTo = (targetY) => {
    console.log(`smoothScrollTo called with targetY: ${targetY}`);
    isAnimating = true;
    disableUserScroll(); // スクロールを無効化
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / scrollDuration, 1); // 0から1までの進捗率
      const newPosition = startY + distance * progress;
      window.scrollTo(0, newPosition);

      // フェードエフェクトをリアルタイムで更新
      updateOpacity(newPosition);

      console.log(`Animating... progress: ${progress}, newPosition: ${newPosition}`);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        console.log("Animation complete");
        finalizeOpacity(targetY);
        isAnimating = false; // アニメーション完了
        enableUserScroll(); // スクロールを再び有効化
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const updateOpacity = (scrollY) => {
    const viewportHeight = window.innerHeight;
    const opacityA = Math.max(1 - (scrollY / viewportHeight) * 8, 0); // 4倍速でフェードアウト Aの透明度
    const opacityB = Math.min(scrollY / viewportHeight, 1); // Bの透明度
    sectionA.style.opacity = opacityA;
    sectionB.style.opacity = opacityB;
    console.log(`Updated opacity: A = ${opacityA}, B = ${opacityB}`);
  };

  const finalizeOpacity = (targetY) => {
    const viewportHeight = window.innerHeight;
    if (targetY === 0) {
      sectionA.style.opacity = 1;
      sectionB.style.opacity = 0;
    } else if (targetY === viewportHeight) {
      sectionA.style.opacity = 0;
      sectionB.style.opacity = 1;
    }
    console.log(`Finalized opacity: A = ${sectionA.style.opacity}, B = ${sectionB.style.opacity}`);
  };

  const handleScroll = () => {
    if (isAnimating) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const threshold = viewportHeight * bounceThreshold; // 閾値を1vhに設定

    console.log(`handleScroll called: scrollY = ${scrollY}, viewportHeight = ${viewportHeight}, threshold = ${threshold}`);

    // スナップ処理
    if (scrollY > threshold && scrollY < viewportHeight - threshold) {
      console.log("Snapping to B");
      smoothScrollTo(viewportHeight);
    } else if (scrollY < threshold) {
      console.log("Snapping to A");
      smoothScrollTo(0);
    }

    // フェード効果をリアルタイムで更新
    updateOpacity(scrollY);
  };

  // 初期化処理（リロード時にAを表示）
  window.addEventListener("load", () => {
    console.log("Page loaded. Resetting scroll position to 0.");
    sectionA.style.opacity = 1;
    sectionB.style.opacity = 0;
    setTimeout(() => {
      window.scrollTo(0, 0); // Aセクションのトップにスクロール
      console.log("Scroll position reset to 0.");
    }, 50); // レイアウトが安定するまで少し遅延を入れる
  });

  // スクロールイベント
  window.addEventListener("scroll", handleScroll);

  // キーボード操作のサポート
  window.addEventListener("keydown", (event) => {
    if (isAnimating) return;

    if (event.key === "ArrowDown") {
      if (isInSectionA()) {
        console.log("ArrowDown pressed: Navigating to B");
        smoothScrollTo(window.innerHeight); // Bに遷移
      }
    } else if (event.key === "ArrowUp") {
      console.log("ArrowUp pressed: Navigating to A");
      smoothScrollTo(0); // Aに遷移
    }
  });

  // タップ操作（A状態でタップするとBへ遷移）
  document.body.addEventListener("click", () => {
    if (isAnimating) return;

    if (isInSectionA()) {
      console.log("Tap detected in A: Navigating to B");
      smoothScrollTo(window.innerHeight); // Bに遷移
    }
  });
});
