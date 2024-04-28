const CONTEXT_MENU_ID = 'STAR_SEED_COUPON_CONTEXT_MENU';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: '스타시드 쿠폰 사용',
    type: 'normal',
    contexts: ['selection'],
  });
});

const pattern = /'Page-Key':\s*'([a-zA-Z0-9]*)'/i;

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }
  const coupons = info.selectionText.replace(/\([^\)]*\)/gi,'').trim().split(/\s+/);
  const csCodeList = (await chrome.storage.sync.get('csCode'))['csCode'];
  const pageKey = await fetch('https://coupon.withhive.com/1614')
      .then(async (response) => {
        const text = await response.text();
        return text.match(pattern)[1];
      });
  for (const csCode of csCodeList) {
    const ADDITIONAL_INFO = await fetch('https://coupon.withhive.com/tp/coupon/server_list', {
      method: 'POST',
      headers: {
        'Page-Key': pageKey
      },
      body: JSON.stringify({
        language: 'ko',
        server: '1614|KR|KR',
        cs_code: csCode,
      })
    }).then(async (response) => {
      return (await response.json())['serverList']['0']['additionalinfo'];
    });
    //console.log(coupons, csCode);
    const promises = coupons.map(async (coupon) => {
      await fetch('https://coupon.withhive.com/tp/coupon/use', {
        method: 'POST',
        headers: {
          'Page-Key': pageKey
        },
        body: JSON.stringify({
          language: 'ko',
          server: '1614|KR|KR',
          cs_code: csCode,
          coupon: coupon,
          additional_info:ADDITIONAL_INFO
        })
      }).then(async (response) => {
        const result = (await response.json())['msg'];
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '/images/alarm.jpeg',
          title: `스타시드 쿠폰 사용 - CS코드 : ${csCode}`,
          message: `${coupon} : ${result}`,
          priority: 2
        });
        return result;
      });
    });
    await Promise.all(promises);
  }
});
