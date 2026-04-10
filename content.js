(function () {
  let currentSpeed = 1.0;
  let speedReady = false;

  function getMatchingSpeed(hostname, globalSpeed, siteOverrides) {
    if (siteOverrides && siteOverrides.length > 0) {
      for (const entry of siteOverrides) {
        if (hostname === entry.domain) {
          return entry.speed;
        }
      }
    }
    return globalSpeed;
  }

  function enforceSpeed(video) {
    if (video.__vscEnforced) {
      video.playbackRate = currentSpeed;
      return;
    }
    video.__vscEnforced = true;

    video.addEventListener('ratechange', () => {
      if (video.playbackRate !== currentSpeed) {
        video.playbackRate = currentSpeed;
      }
    });

    video.addEventListener('play', () => {
      if (video.playbackRate !== currentSpeed) {
        video.playbackRate = currentSpeed;
      }
    });

    video.addEventListener('loadeddata', () => {
      if (video.playbackRate !== currentSpeed) {
        video.playbackRate = currentSpeed;
      }
    });

    video.playbackRate = currentSpeed;
  }

  function applySpeedToVideos(speed) {
    currentSpeed = speed;
    speedReady = true;
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      enforceSpeed(video);
    });
  }

  function loadAndApply() {
    chrome.storage.sync.get({ globalSpeed: 1.0, siteOverrides: [] }, (data) => {
      const hostname = window.location.hostname.replace(/^www\./, '');
      const speed = getMatchingSpeed(hostname, data.globalSpeed, data.siteOverrides);
      applySpeedToVideos(speed);
    });
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === 'VIDEO') {
          if (speedReady) {
            enforceSpeed(node);
          } else {
            chrome.storage.sync.get({ globalSpeed: 1.0, siteOverrides: [] }, (data) => {
              const hostname = window.location.hostname.replace(/^www\./, '');
              currentSpeed = getMatchingSpeed(hostname, data.globalSpeed, data.siteOverrides);
              speedReady = true;
              enforceSpeed(node);
            });
          }
        }
        if (node.querySelectorAll) {
          const videos = node.querySelectorAll('video');
          if (videos.length > 0) {
            if (speedReady) {
              videos.forEach((v) => enforceSpeed(v));
            } else {
              chrome.storage.sync.get({ globalSpeed: 1.0, siteOverrides: [] }, (data) => {
                const hostname = window.location.hostname.replace(/^www\./, '');
                currentSpeed = getMatchingSpeed(hostname, data.globalSpeed, data.siteOverrides);
                speedReady = true;
                videos.forEach((v) => enforceSpeed(v));
              });
            }
          }
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

  let pollCount = 0;
  const pollInterval = setInterval(() => {
    pollCount++;
    const videos = document.querySelectorAll('video');
    if (videos.length > 0) {
      videos.forEach((v) => enforceSpeed(v));
    }
    if (pollCount >= 5) {
      clearInterval(pollInterval);
    }
  }, 2000);
})();
