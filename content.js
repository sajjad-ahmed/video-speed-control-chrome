(function () {
  let currentSpeed = 1.0;

  function getMatchingSpeed(hostname, globalSpeed, siteOverrides) {
    if (siteOverrides && siteOverrides.length > 0) {
      for (const entry of siteOverrides) {
        if (hostname === entry.domain || hostname.endsWith('.' + entry.domain)) {
          return entry.speed;
        }
      }
    }
    return globalSpeed;
  }

  function applySpeedToVideos(speed) {
    currentSpeed = speed;
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      if (video.playbackRate !== speed) {
        video.playbackRate = speed;
      }
    });
  }

  function loadAndApply() {
    chrome.storage.sync.get({ globalSpeed: 1.0, siteOverrides: [] }, (data) => {
      const hostname = window.location.hostname;
      const speed = getMatchingSpeed(hostname, data.globalSpeed, data.siteOverrides);
      applySpeedToVideos(speed);
    });
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === 'VIDEO') {
          node.playbackRate = currentSpeed;
        }
        if (node.querySelectorAll) {
          node.querySelectorAll('video').forEach((v) => {
            v.playbackRate = currentSpeed;
          });
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.globalSpeed || changes.siteOverrides) {
      loadAndApply();
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'applySpeed') {
      loadAndApply();
    }
  });

  loadAndApply();
})();
